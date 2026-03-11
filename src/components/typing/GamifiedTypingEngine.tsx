"use client";

// =============================================================================
//  GamifiedTypingEngine
//  Wraps the existing useTypingEngine hook with a Typing.com-style gamified UI.
//
//  Features:
//  • Animated progress bar with a moving rocket avatar
//  • Combo streak tracker with floating "🔥 Nx Combo!" text
//  • Per-word pulse/glow animation on correct completion
//  • Sound effects via useSoundManager
//  • Emits onComplete(stats) when the drill finishes
// =============================================================================

import { useRef, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX, Zap } from "lucide-react";
import { useTypingEngine } from "@/hooks/useTypingEngine";
import VirtualKeyboard from "@/components/keyboard/VirtualKeyboard";
import { useSoundManager } from "@/components/typing/SoundManager";
import type { Drill } from "@/data/englishCurriculum";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrillCompleteStats {
  wpm:      number;
  netWpm:   number;
  accuracy: number;
  errors:   number;
  elapsed:  number;
  maxCombo: number;
}

interface GamifiedTypingEngineProps {
  drill:       Drill;
  showKeyboard?: boolean;
  onComplete:  (stats: DrillCompleteStats) => void;
  onRetry?:    () => void;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressRocket({ pct }: { pct: number }) {
  return (
    <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
      {/* Track fill */}
      <motion.div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
        animate={{ width: `${Math.max(pct, 2)}%` }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      />
      {/* Checkpoint flags */}
      {[25, 50, 75].map((flag) => (
        <div
          key={flag}
          className="absolute top-0 h-full border-l-2 border-dashed border-white/60"
          style={{ left: `${flag}%` }}
        />
      ))}
      {/* Rocket avatar */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg select-none"
        animate={{ left: `${Math.min(Math.max(pct, 2), 97)}%` }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        🚀
      </motion.div>
      {/* Finish flag */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none">🏁</div>
    </div>
  );
}

// ─── Combo Badge ──────────────────────────────────────────────────────────────

function ComboBadge({ combo, milestone }: { combo: number; milestone: boolean }) {
  if (combo < 5) return null;
  const color =
    combo >= 40 ? "from-red-500 to-orange-500" :
    combo >= 20 ? "from-amber-500 to-yellow-400" :
                  "from-emerald-500 to-teal-400";
  return (
    <motion.div
      key={combo}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: milestone ? [1.3, 1.0] : 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400 }}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${color} text-white text-xs font-bold shadow-lg`}
    >
      <Zap className="w-3.5 h-3.5" />
      {combo}x Combo!
    </motion.div>
  );
}

// ─── Floating Milestone Toast ─────────────────────────────────────────────────

function MilestoneToast({ show, combo }: { show: boolean; combo: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={combo}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{ y: -60, opacity: 0, scale: 1.4 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-50
                     text-2xl font-black text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]
                     whitespace-nowrap"
        >
          🔥 {combo}x Combo!
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Text Display ─────────────────────────────────────────────────────────────

function GamifiedTextDisplay({
  chars, cursor, completedWords,
}: {
  chars: ReturnType<typeof useTypingEngine>["chars"];
  cursor: number;
  completedWords: Set<number>; // set of word-end char indices
}) {
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [cursor]);

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 px-8 py-6 font-mono text-[1.3rem] leading-[2.6rem] tracking-wide min-h-[9rem] select-none overflow-hidden">
      {chars.map((c, i) => {
        const isCursor = i === cursor;
        const isWordEnd = completedWords.has(i);

        let charClass = "text-gray-300";
        if (c.state === "correct")   charClass = "text-emerald-600";
        if (c.state === "incorrect") charClass = c.char === " " ? "bg-red-200 text-red-500 rounded-sm" : "text-red-500";

        return (
          <span key={i} className="relative">
            {isCursor && (
              <span
                ref={cursorRef}
                className="absolute -left-px top-[3px] bottom-[3px] w-[2.5px] bg-emerald-500 rounded-full animate-pulse z-10"
              />
            )}
            <motion.span
              className={`transition-colors duration-75 ${charClass}`}
              animate={isWordEnd ? { color: ["#059669", "#059669", "#374151"], scale: [1.15, 1.0] } : {}}
              transition={{ duration: 0.25 }}
            >
              {c.char === " " ? "\u00A0" : c.char}
            </motion.span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GamifiedTypingEngine({
  drill,
  showKeyboard = true,
  onComplete,
}: GamifiedTypingEngineProps) {
  const inputRef     = useRef<HTMLInputElement>(null);
  const inputVal     = useRef("");
  const prevCursor   = useRef(0);
  const prevCorrect  = useRef(0);

  const [combo,          setCombo]          = useState(0);
  const [maxCombo,       setMaxCombo]       = useState(0);
  const [showMilestone,  setShowMilestone]  = useState(false);
  const [milestoneCombo, setMilestoneCombo] = useState(0);
  const [soundEnabled,   setSoundEnabled]   = useState(true);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [emittedDone,    setEmittedDone]    = useState(false);

  const { play, setEnabled } = useSoundManager(true);
  const engine = useTypingEngine(drill.content);

  const pct = drill.content.length > 0
    ? Math.round((engine.cursor / drill.content.length) * 100)
    : 0;

  // ── Focus input on mount ──
  useEffect(() => { inputRef.current?.focus(); }, [drill.id]);
  useEffect(() => { engine.reset(); inputVal.current = ""; setCombo(0); setMaxCombo(0); setCompletedWords(new Set()); setEmittedDone(false); }, [drill.id]);

  // ── Sync sound toggle ──
  useEffect(() => { setEnabled(soundEnabled); }, [soundEnabled, setEnabled]);

  // ── Emit onComplete once ──
  useEffect(() => {
    if (engine.isFinished && !emittedDone) {
      setEmittedDone(true);
      onComplete({
        wpm:      engine.wpm,
        netWpm:   engine.netWpm,
        accuracy: engine.accuracy,
        errors:   engine.errorCount,
        elapsed:  engine.elapsedSeconds,
        maxCombo,
      });
    }
  }, [engine.isFinished, emittedDone, engine, maxCombo, onComplete]);

  // ── Input change: drive typing engine + combo + sounds ──
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    inputVal.current = val;
    engine.handleInput(val);

    const cursor     = val.length;
    const correct    = engine.correctCount;
    const typedChar  = drill.content[cursor - 1];
    const wasCorrect = cursor > prevCursor.current && typedChar === val[cursor - 1];
    const isSpace    = typedChar === " ";

    if (wasCorrect) {
      setCombo((c) => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        if (next % 20 === 0) {
          play("streak_milestone");
          setMilestoneCombo(next);
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 900);
        } else if (isSpace) {
          // Spacebar — deeper mechanical sound
          play("keystroke_space");
        } else {
          // Regular alphanumeric key click
          play("keystroke");
        }
        return next;
      });

      // Word completion chime (fires on the space that ends a word)
      if (isSpace) {
        play("word_complete");
        setCompletedWords((prev) => new Set(prev).add(cursor - 1));
      }
    } else if (cursor > prevCursor.current) {
      // Error — muted dull thud (no satisfying click)
      play("keystroke_error");
      setCombo(0);
    }

    prevCursor.current = cursor;
    prevCorrect.current = correct;
  }, [engine, drill.content, maxCombo, play]);

  const handleReset = () => {
    engine.reset();
    inputVal.current = "";
    if (inputRef.current) inputRef.current.value = "";
    setCombo(0);
    setMaxCombo(0);
    setCompletedWords(new Set());
    setEmittedDone(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden real input */}
      <input
        ref={inputRef}
        className="absolute opacity-0 h-0 w-0 pointer-events-none"
        onChange={handleChange}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        tabIndex={0}
      />

      {/* ── Header row ── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base leading-tight">{drill.title}</h3>
          <p className="text-slate-400 text-xs">{drill.hint ?? `Target: ${drill.targetWpm} WPM`}</p>
        </div>
        <div className="flex items-center gap-2">
          <ComboBadge combo={combo} milestone={showMilestone} />
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>
        </div>
      </div>

      {/* ── Progress rocket ── */}
      <div className="relative">
        <ProgressRocket pct={pct} />
        <MilestoneToast show={showMilestone} combo={milestoneCombo} />
      </div>

      {/* ── Stats bar ── */}
      <div className="flex gap-3">
        {[
          { label: "WPM", value: engine.wpm, color: "text-blue-600" },
          { label: "NET", value: engine.netWpm, color: "text-emerald-600" },
          { label: "ACC", value: `${engine.accuracy}%`, color: engine.accuracy >= 95 ? "text-emerald-600" : engine.accuracy >= 85 ? "text-amber-600" : "text-red-500" },
          { label: "ERR", value: engine.errorCount, color: "text-red-500" },
          { label: "TIME", value: `${engine.elapsedSeconds}s`, color: "text-slate-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center">
            <p className={`text-lg font-bold leading-none ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Text display ── */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="cursor-text"
      >
        <GamifiedTextDisplay
          chars={engine.chars}
          cursor={engine.cursor}
          completedWords={completedWords}
        />
      </div>

      {/* ── Progress bar (text %) ── */}
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.12 }}
        />
      </div>

      {/* ── Virtual Keyboard ── */}
      {showKeyboard && (
        <div className="mt-2">
          <VirtualKeyboard
            nextExpectedChar={engine.isFinished ? null : drill.content[engine.cursor] ?? null}
            showHands={true}
          />
        </div>
      )}
    </div>
  );
}
