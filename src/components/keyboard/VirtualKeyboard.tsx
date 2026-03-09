"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  KEYBOARD_ROWS,
  FINGER_COLOR,
  FINGER_COLOR_PASSIVE,
  HOME_ROW_KEYS,
  getFingerForChar,
  type Finger,
  type KeyDef,
} from "./keyboardData";
import { getHandImages } from "./handImageData";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HandOffset { dx: number; dy: number }

interface VirtualKeyboardProps {
  nextExpectedChar: string | null;
  showHands?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  KeyCap
// ─────────────────────────────────────────────────────────────────────────────

interface KeyCapProps {
  keyDef:   KeyDef;
  isActive: boolean;
}

function KeyCap({ keyDef, isActive }: KeyCapProps) {
  const finger    = keyDef.finger.finger;
  const colors    = FINGER_COLOR[finger];
  const widthRem  = (keyDef.width ?? 1) * 3.0;
  const isHomeRow = keyDef.chars.some((c) => HOME_ROW_KEYS.has(c));

  return (
    <div
      style={{ minWidth: `${widthRem}rem`, maxWidth: `${widthRem}rem` }}
      className={[
        "relative h-11 rounded-lg flex items-center justify-center",
        "text-[11px] font-semibold select-none transition-all duration-150 cursor-default",
        "border-b-[3px]",
        isActive
          ? [
              colors.bg,
              "border-transparent text-white",
              `ring-2 ${colors.ring}`,
              "scale-105 shadow-md -translate-y-0.5",
            ].join(" ")
          : [
              FINGER_COLOR_PASSIVE[finger],
              "border-b-gray-300/60 shadow-sm",
            ].join(" "),
      ].join(" ")}
    >
      {keyDef.label}
      {isHomeRow && (
        <span
          className={[
            "absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full",
            isActive ? "bg-white/70" : "bg-gray-400/70",
          ].join(" ")}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  HandOverlay — PNG images from typing.com
//
//  Layout math (all in px, matching keyboard CSS):
//    key height  = h-11  = 44px
//    row gap     = gap-1.5 = 6px
//    kbd padding = p-3   = 12px
//    rows 0-4: numbers, QWERTY, home, ZXCV, space
//
//  Layout targets — pixel-perfect like typing.com:
//
//  The typing.com hand PNGs have natural dimensions:
//    left-*.png  = 594 × 652 px
//    right-*.png = 672 × 652 px
//  Together they span 1266 px at 100% scale.
//  Correct split:  left = 594/1266 = 46.92%   right = 672/1266 = 53.08%
//  We render each with width=% and height=auto → NO objectFit letterboxing.
//  The images scale uniformly with the keyboard so fingers stay on keys.
// ─────────────────────────────────────────────────────────────────────────────

const LEFT_W  = "46.92%";
const RIGHT_W = "53.08%";
const HAND_OVERLAY_TOP_PX = 0; // px — align hand image top to keyboard card top
const CROSSFADE_DURATION  = 120; // ms

interface HandOverlayProps {
  nextExpectedChar: string | null;
}

function HandOverlay({ nextExpectedChar }: HandOverlayProps) {
  // current = the pose we want to show RIGHT NOW
  const current = useMemo(() => getHandImages(nextExpectedChar), [nextExpectedChar]);

  // prev = the pose we're crossfading FROM
  const [prev, setPrev] = useState(() => current);
  // blending: true while CSS opacity transition is in-flight
  const [blending, setBlending] = useState(false);

  useEffect(() => {
    // Skip if pose didn't actually change
    if (current.left === prev.left && current.right === prev.right) return;
    // Start crossfade: current fades IN (opacity 0→1), prev fades OUT (opacity 1→0)
    setBlending(true);
    const t = setTimeout(() => {
      setPrev(current);   // prev catches up
      setBlending(false); // reset — only prev layer is visible again
    }, CROSSFADE_DURATION);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Natural-ratio helpers — NO objectFit, so there is zero letterbox gap.
  // height:auto scales proportionally with the percentage width above.
  const leftStyle:  React.CSSProperties = { width: LEFT_W,  height: "auto", display: "block", flexShrink: 0 };
  const rightStyle: React.CSSProperties = { width: RIGHT_W, height: "auto", display: "block", flexShrink: 0 };

  const layerStyle = (opacity: number): React.CSSProperties => ({
    position: "absolute",
    top: 0, left: 0, right: 0,
    display: "flex",
    alignItems: "flex-start",
    opacity,
    transition: `opacity ${CROSSFADE_DURATION}ms ease-in-out`,
    pointerEvents: "none",
  });

  const renderLayer = (data: ReturnType<typeof getHandImages>, opacity: number) => (
    <div style={layerStyle(opacity)}>
      {data.isSpace ? (
        /* space.png is 672×652 — show it centred over the space-bar area */
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/hands/space.png" alt="" style={{ width: "100%", height: "auto", display: "block" }} />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/hands/${data.left}.png`}  alt="left hand"  style={leftStyle}  />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/hands/${data.right}.png`} alt="right hand" style={rightStyle} />
        </>
      )}
    </div>
  );

  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-20"
      style={{ top: `${HAND_OVERLAY_TOP_PX}px` }}
    >
      {/* Layer A — previous pose (fades OUT when blending) */}
      {renderLayer(prev, blending ? 0 : 1)}
      {/* Layer B — incoming pose (fades IN when blending) */}
      {renderLayer(current, blending ? 1 : 0)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────────────────────

export default function VirtualKeyboard({
  nextExpectedChar,
  showHands = true,
}: VirtualKeyboardProps) {
  const targetFinger = useMemo(
    () => (nextExpectedChar ? getFingerForChar(nextExpectedChar) : null),
    [nextExpectedChar]
  );

  const activeKey = useMemo(() => {
    if (!nextExpectedChar) return null;
    for (const row of KEYBOARD_ROWS)
      for (const key of row)
        if (key.chars.includes(nextExpectedChar)) return key;
    return null;
  }, [nextExpectedChar]);

  return (
    <div className="flex flex-col items-center select-none">

      {/* ── Next-key badge ── */}
      {nextExpectedChar ? (
        <div className="mb-3 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] text-gray-400 font-medium tracking-wide">
            Next
          </span>
          <div
            className={[
              "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm",
              targetFinger ? FINGER_COLOR[targetFinger.finger].bg : "bg-gray-300",
            ].join(" ")}
          >
            {nextExpectedChar === " " ? "⎵" : nextExpectedChar.toUpperCase()}
          </div>
          {targetFinger && (
            <span
              className={`text-[11px] font-semibold capitalize ${FINGER_COLOR[targetFinger.finger].text}`}
            >
              {targetFinger.hand} {targetFinger.finger}
            </span>
          )}
        </div>
      ) : (
        <div className="mb-3 h-8" />
      )}

      {/* ── Keyboard + hand overlay wrapper ── */}
      {/*
        overflow-visible lets the hand wrists extend below the keyboard card.
        The wrapper has NO padding-bottom — instead, we add a spacer div
        below so the page content isn't hidden under the hands.
      */}
      <div className="relative" style={{ overflow: "visible" }}>
        {/* Keyboard */}
        <div
          className="relative z-10 rounded-2xl bg-white p-3 shadow-lg border border-gray-200"
          role="img"
          aria-label="Virtual keyboard"
        >
          <div className="flex flex-col gap-1.5">
            {KEYBOARD_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1">
                {row.map((key, keyIdx) => (
                  <KeyCap
                    key={`${rowIdx}-${keyIdx}`}
                    keyDef={key}
                    isActive={activeKey === key}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Finger-colour legend */}
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
            {(["pinky", "ring", "middle", "index", "thumb"] as Finger[]).map(
              (f) => (
                <span
                  key={f}
                  className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium"
                >
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${FINGER_COLOR[f].bg}`}
                  />
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </span>
              )
            )}
          </div>
        </div>

        {/* ── PNG hand overlay ── */}
        {showHands && <HandOverlay nextExpectedChar={nextExpectedChar} />}
      </div>

      {/* Spacer so content below the keyboard clears the overflowing hands */}
      {showHands && <div style={{ height: "200px" }} />}
    </div>
  );
}
