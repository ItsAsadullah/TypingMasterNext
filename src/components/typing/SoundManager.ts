"use client";

// =============================================================================
//  SoundManager â€” Cherry MX Blue Mechanical Keyboard Synthesis
//  (typing.com quality â€” no external files, pure Web Audio API)
//
//  What makes it sound real:
//
//  1. DynamicsCompressor on the master bus â€” gives that satisfying "punch/snap"
//     that raw oscillators completely lack.
//
//  2. Pre-cached noise buffers â€” rendered once into cache on first keystroke,
//     then reused via BufferSourceNode on every subsequent press. Zero GC,
//     zero per-keystroke allocation latency.
//
//  3. Truly instantaneous attack â€” setValueAtTime(peak, t) with NO ramp.
//     Real switches hit full volume in under 1 ms.
//
//  4. Cherry MX Blue 3-layer model:
//     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
//     â”‚  TICK  â€” HP > 4500 Hz noise, 7ms   â†’ the click mechanism   â”‚
//     â”‚  BODY  â€” BP â‰ˆ 1200 Hz noise, 18ms  â†’ switch housing ring   â”‚
//     â”‚  THUD  â€” Sine 130â†’75 Hz, 24ms      â†’ keycap/PCB impact     â”‚
//     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
//
//  5. Spacebar: lower HP cutoff (2500Hz), deeper body (600Hz),
//     heavy bass (80â†’45Hz thud) + metal stabiliser ping.
//
//  6. Error: NO click. Low-pass muffled noise + dissonant detuned pair.
//     Deliberately unsatisfying.
// =============================================================================

import { useRef, useCallback, useEffect } from "react";

export type SoundName =
  | "keystroke"
  | "keystroke_space"
  | "keystroke_error"
  | "word_complete"
  | "streak_milestone"
  | "level_up"
  | "drill_complete";

interface SoundManager {
  play: (name: SoundName) => void;
  setEnabled: (enabled: boolean) => void;
}

// â”€â”€â”€ Noise buffer cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// We pre-render three durations: short (8ms), medium (25ms), long (70ms).
// BufferSourceNodes are one-shot but the *buffer* is reusable across many nodes.

const DURATIONS = { short: 0.008, medium: 0.025, long: 0.070 } as const;
type DurKey = keyof typeof DURATIONS;

function buildNoiseBuffer(ctx: AudioContext, dur: number): AudioBuffer {
  const len  = Math.ceil(ctx.sampleRate * dur);
  const buf  = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  // Flat-power white noise
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// â”€â”€â”€ Master compressor factory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// One per AudioContext. Threshold conservatively set so quiet sounds still snap.
function buildCompressor(ctx: AudioContext): DynamicsCompressorNode {
  const c = ctx.createDynamicsCompressor();
  // Acts as a LIMITER, not a squasher.
  // Slow attack (8ms) lets the transient snap punch through before limiting kicks in.
  c.threshold.value = -6;    // dB — only limit near clipping, not quiet sounds
  c.knee.value      =  1;    // dB — hard knee for brickwall limiting
  c.ratio.value     =  20;   // near-brickwall limit above threshold
  c.attack.value    =  0.008; // 8ms — click transient passes through!
  c.release.value   =  0.04; // 40ms — fast recovery between strokes
  c.connect(ctx.destination);
  return c;
}

// â”€â”€â”€ Low-level node helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Filtered noise burst connected to `out`.
 *  Attack is INSTANTANEOUS â€” the closest approximation to 1 sample. */
function noiseShot(
  ctx:       AudioContext,
  out:       AudioNode,
  buf:       AudioBuffer,
  filterType: BiquadFilterType,
  freq:      number,
  q:         number,
  peak:      number,
  decay:     number,
  t:         number,
  delayMs    = 0,
) {
  const start = t + delayMs / 1000;
  const src   = ctx.createBufferSource();
  src.buffer  = buf;

  const filt   = ctx.createBiquadFilter();
  filt.type    = filterType;
  filt.frequency.value = freq;
  filt.Q.value = q;

  const gain = ctx.createGain();
  // Instantaneous attack: silence â†’ peak in one setValueAtTime call
  gain.gain.setValueAtTime(0,    start - 0.0001);
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

  src.connect(filt);
  filt.connect(gain);
  gain.connect(out);
  src.start(start);
  src.stop(start + decay + 0.005);
}

/** Sine punch with downward pitch sweep (models a resonating body mass). */
function sinePunch(
  ctx:      AudioContext,
  out:      AudioNode,
  freqStart:number,
  freqEnd:  number,
  peak:     number,
  decay:    number,
  t:        number,
) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freqStart, t);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, t + decay);

  gain.gain.setValueAtTime(0,    t - 0.0001);
  gain.gain.setValueAtTime(peak, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + decay + 0.005);
}

// â”€â”€â”€ Cherry MX Blue layers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function playKeystroke(
  ctx:   AudioContext,
  out:   AudioNode,
  cache: Record<DurKey, AudioBuffer>,
) {
  const t = ctx.currentTime;
  // Real MX Blue clicks live at 1000-4000 Hz — almost ZERO bass.
  // The "tok tok" was caused by a 130 Hz sine at gain 0.65 — that is now gone.

  // SNAP  — leaf-spring click mechanism (the crisp top-end tick)
  noiseShot(ctx, out, cache.short, "bandpass", 3500, 1.5, 0.90, 0.005, t);
  // CLICK — switch body / keycap plastic resonance (the "clack" character)
  noiseShot(ctx, out, cache.short, "bandpass", 1600, 3.0, 0.70, 0.009, t, 0.5);
  // THWACK — plastic bottom-out. 700 Hz bandpass, NOT a bass sine.
  noiseShot(ctx, out, cache.short, "bandpass",  700, 2.0, 0.38, 0.006, t, 1);
}

function playKeystrokeSpace(
  ctx:   AudioContext,
  out:   AudioNode,
  cache: Record<DurKey, AudioBuffer>,
) {
  const t = ctx.currentTime;
  // Spacebar is larger → each band ~30% lower, slightly longer decay.
  // Removed 82 Hz sine (0.78 gain) — that was the deep hollow tok-tok.

  // SNAP
  noiseShot(ctx, out, cache.short,  "bandpass", 2400, 1.5, 0.80, 0.008, t);
  // CLICK
  noiseShot(ctx, out, cache.medium, "bandpass", 1100, 3.0, 0.65, 0.016, t, 0.5);
  // THWACK — deeper bottom-out for spacebar (480 Hz, not 82 Hz)
  noiseShot(ctx, out, cache.medium, "bandpass",  480, 2.5, 0.52, 0.020, t, 1);
  // Stabiliser rattle — tiny high-mid ring unique to wide keys
  noiseShot(ctx, out, cache.short,  "bandpass", 4200, 6.0, 0.18, 0.005, t, 2);
}

function playKeystrokeError(
  ctx:   AudioContext,
  out:   AudioNode,
  cache: Record<DurKey, AudioBuffer>,
) {
  const t = ctx.currentTime;
  // Muffled dull thud — NO click snap. Intentionally unsatisfying.
  // Low-pass noise so it sounds dead, plus a mid-low bandpass for body.
  noiseShot(ctx, out, cache.medium, "lowpass",  480, 1.0, 0.55, 0.050, t);
  noiseShot(ctx, out, cache.medium, "bandpass", 280, 2.0, 0.30, 0.040, t, 3);
}

// â”€â”€â”€ Musical reward sounds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These connect directly to `out` (already includes compressor).

function playWordComplete(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime;
  for (const [freq, delay] of [[700, 0], [950, 0.060]] as [number, number][]) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.06, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.08);
    osc.connect(gain); gain.connect(out);
    osc.start(t + delay); osc.stop(t + delay + 0.09);
  }
}

function playStreakMilestone(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime;
  for (const [freq, i] of [[440,0],[554,1],[659,2],[880,3]] as [number,number][]) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = t + i * 0.09;
    gain.gain.setValueAtTime(0.10, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
    osc.connect(gain); gain.connect(out);
    osc.start(start); osc.stop(start + 0.14);
  }
}

function playLevelUp(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime;
  for (const [freq, i] of [[523,0],[659,1],[784,2],[1047,3]] as [number,number][]) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = t + i * 0.11;
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.20);
    osc.connect(gain); gain.connect(out);
    osc.start(start); osc.stop(start + 0.22);
  }
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle"; osc.frequency.value = 1047;
  gain.gain.setValueAtTime(0.14, t + 0.44);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.44 + 0.32);
  osc.connect(gain); gain.connect(out);
  osc.start(t + 0.44); osc.stop(t + 0.78);
}

function playDrillComplete(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime;
  for (const [freq, delay] of [[523, 0], [659, 0.12]] as [number, number][]) {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.09, t + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.18);
    osc.connect(gain); gain.connect(out);
    osc.start(t + delay); osc.stop(t + delay + 0.20);
  }
}

// â”€â”€â”€ Context state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface CtxState {
  ctx:        AudioContext;
  compressor: DynamicsCompressorNode;
  cache:      Record<DurKey, AudioBuffer>;
}

// â”€â”€â”€ Hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function useSoundManager(initialEnabled = true): SoundManager {
  const stateRef   = useRef<CtxState | null>(null);
  const enabledRef = useRef(initialEnabled);

  useEffect(() => () => { stateRef.current?.ctx.close(); }, []);

  /** Lazily init AudioContext + compressor + noise cache on first gesture. */
  const getState = useCallback((): CtxState | null => {
    if (!enabledRef.current) return null;
    if (typeof window === "undefined") return null;

    const existing = stateRef.current;
    if (existing && existing.ctx.state !== "closed") {
      if (existing.ctx.state === "suspended") existing.ctx.resume();
      return existing;
    }

    const AC  = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx  = new AC();
    const comp = buildCompressor(ctx);

    // Build and cache noise buffers for the three durations
    const cache = {
      short:  buildNoiseBuffer(ctx, DURATIONS.short),
      medium: buildNoiseBuffer(ctx, DURATIONS.medium),
      long:   buildNoiseBuffer(ctx, DURATIONS.long),
    };

    stateRef.current = { ctx, compressor: comp, cache };
    return stateRef.current;
  }, []);

  const play = useCallback((name: SoundName) => {
    const s = getState();
    if (!s) return;
    const { ctx, compressor: out, cache } = s;
    try {
      switch (name) {
        case "keystroke":        playKeystroke(ctx, out, cache);       break;
        case "keystroke_space":  playKeystrokeSpace(ctx, out, cache);  break;
        case "keystroke_error":  playKeystrokeError(ctx, out, cache);  break;
        case "word_complete":    playWordComplete(ctx, out);           break;
        case "streak_milestone": playStreakMilestone(ctx, out);        break;
        case "level_up":         playLevelUp(ctx, out);                break;
        case "drill_complete":   playDrillComplete(ctx, out);          break;
      }
    } catch { /* AudioContext not ready on first render */ }
  }, [getState]);

  const setEnabled = useCallback((v: boolean) => {
    enabledRef.current = v;
  }, []);

  return { play, setEnabled };
}

