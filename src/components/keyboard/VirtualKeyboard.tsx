"use client";

import { useMemo } from "react";
import {
  KEYBOARD_ROWS,
  FINGER_COLOR,
  FINGER_COLOR_PASSIVE,
  HOME_ROW_KEYS,
  getFingerForChar,
  type Finger,
  type KeyDef,
} from "./keyboardData";
import HandGuide from "./HandGuide";

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

interface VirtualKeyboardProps {
  /**
   * The next character the user is expected to type.
   * Pass `null` when idle / finished.
   */
  nextExpectedChar: string | null;
  /** Show or hide the hand guide beneath the keyboard (default: true) */
  showHands?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Key Cap
// ─────────────────────────────────────────────────────────────────────────────

interface KeyCapProps {
  keyDef:   KeyDef;
  isActive: boolean;
}

function KeyCap({ keyDef, isActive }: KeyCapProps) {
  const finger = keyDef.finger.finger;
  const colors = FINGER_COLOR[finger];

  // Width: 1 unit = 2.75rem (44px) on desktop
  const widthRem = (keyDef.width ?? 1) * 2.75;
  const isHomeRow = keyDef.chars.some((c) => HOME_ROW_KEYS.has(c));

  return (
    <div
      style={{ minWidth: `${widthRem}rem`, maxWidth: `${widthRem}rem` }}
      className={[
        // Base key shape
        "relative h-11 rounded-lg flex items-center justify-center",
        "text-[11px] font-semibold select-none transition-all duration-150 cursor-default",
        "border-b-[3px]",

        isActive
          ? [
              colors.bg,
              "border-transparent text-white",
              `ring-2 ${colors.ring}`,
              "scale-105 shadow-lg -translate-y-0.5",
            ].join(" ")
          : [
              FINGER_COLOR_PASSIVE[finger],
              "border-slate-300/20 text-slate-500",
              "dark:text-slate-400",
            ].join(" "),
      ].join(" ")}
    >
      {keyDef.label}

      {/* Home-row tactile bump dot */}
      {isHomeRow && (
        <span
          className={[
            "absolute bottom-1.5 left-1/2 -translate-x-1/2",
            "w-1 h-1 rounded-full",
            isActive ? "bg-white/70" : "bg-slate-400/60",
          ].join(" ")}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function VirtualKeyboard({
  nextExpectedChar,
  showHands = true,
}: VirtualKeyboardProps) {
  // Resolve which key to highlight from the expected char
  const targetFinger = useMemo(
    () => (nextExpectedChar ? getFingerForChar(nextExpectedChar) : null),
    [nextExpectedChar]
  );

  // Find which key label is "active" (for exact key highlight)
  const activeKey = useMemo(() => {
    if (!nextExpectedChar) return null;
    for (const row of KEYBOARD_ROWS) {
      for (const key of row) {
        if (key.chars.includes(nextExpectedChar)) return key;
      }
    }
    return null;
  }, [nextExpectedChar]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* ── Keyboard ── */}
      <div
        className="rounded-2xl bg-slate-800 p-3 shadow-2xl border border-slate-700/60"
        role="img"
        aria-label="Virtual keyboard"
      >
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((key, keyIdx) => {
                const isActive = activeKey === key;
                return (
                  <KeyCap
                    key={`${rowIdx}-${keyIdx}`}
                    keyDef={key}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
          {(["pinky", "ring", "middle", "index", "thumb"] as Finger[]).map(
            (f) => (
              <span key={f} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${FINGER_COLOR[f].bg}`}
                />
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </span>
            )
          )}
        </div>
      </div>

      {/* ── Hand Guide ── */}
      {showHands && (
        <div className="flex items-end gap-8 mt-2">
          <HandGuide
            hand="left"
            activeFingerKey={
              targetFinger?.hand === "left" ? targetFinger.finger : null
            }
          />

          {/* Next-key hint bubble */}
          <div className="flex flex-col items-center gap-2 mb-2">
            {nextExpectedChar ? (
              <>
                <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                  Next key
                </div>
                <div
                  className={[
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    "text-xl font-bold shadow-lg",
                    targetFinger
                      ? `${FINGER_COLOR[targetFinger.finger].bg} text-white`
                      : "bg-slate-700 text-slate-300",
                  ].join(" ")}
                >
                  {nextExpectedChar === " " ? "⎵" : nextExpectedChar}
                </div>
                {targetFinger && (
                  <div
                    className={[
                      "text-[10px] font-semibold",
                      FINGER_COLOR[targetFinger.finger].text,
                    ].join(" ")}
                  >
                    {targetFinger.hand} {targetFinger.finger}
                  </div>
                )}
              </>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-700/40 flex items-center justify-center text-slate-600 text-lg">
                ✓
              </div>
            )}
          </div>

          <HandGuide
            hand="right"
            activeFingerKey={
              targetFinger?.hand === "right" ? targetFinger.finger : null
            }
          />
        </div>
      )}
    </div>
  );
}
