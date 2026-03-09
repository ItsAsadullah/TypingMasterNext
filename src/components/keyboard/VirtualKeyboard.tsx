"use client";

import { useMemo } from "react";
import {
  KEYBOARD_ROWS,
  FINGER_COLOR,
  FINGER_COLOR_PASSIVE,
  HOME_ROW_KEYS,
  getFingerForChar,
  type Finger,
  type Hand,
  type KeyDef,
} from "./keyboardData";
import HandGuide from "./HandGuide";

// ─────────────────────────────────────────────────────────────────────────────
//  Key position map (built once, static)
//  KEY_PX = h-11 (44px), KEY_GAP = gap-1 (4px), ROW_GAP = gap-1.5 (6px),
//  KB_PAD = p-3 (12px)
// ─────────────────────────────────────────────────────────────────────────────

const KEY_PX  = 44;   // key width/height unit (2.75rem)
const KEY_GAP = 4;    // flex gap-1
const ROW_GAP = 6;    // flex gap-1.5
const KB_PAD  = 12;   // p-3 keyboard padding

/** Pixel center {x, y} of every character key inside the keyboard container */
function buildKeyPosMap(): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  let y = KB_PAD + KEY_PX / 2;   // vertical center of first row
  for (const row of KEYBOARD_ROWS) {
    let x = KB_PAD;
    for (const key of row) {
      const w = (key.width ?? 1) * KEY_PX;
      const cx = x + w / 2;
      for (const ch of key.chars) map.set(ch, { x: cx, y });
      x += w + KEY_GAP;
    }
    y += KEY_PX + ROW_GAP;
  }
  return map;
}

const KEY_POS_MAP = buildKeyPosMap();

/**
 * "Home" key character for each finger.
 * Used to calculate how far the hand must travel from rest position.
 */
const FINGER_HOME_CHAR: Record<Hand, Record<Finger, string>> = {
  left:  { pinky: "a", ring: "s", middle: "d", index: "f", thumb: " " },
  right: { pinky: ";", ring:  "l", middle: "k", index: "j", thumb: " " },
};

/**
 * Damping  — the hand SVG shifts 65% of the actual key-distance so the
 * motion looks natural without flying off-screen.
 */
const DAMPING = 0.65;

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HandOffset { dx: number; dy: number }

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
              "scale-105 shadow-md -translate-y-0.5",
            ].join(" ")
          : [
              FINGER_COLOR_PASSIVE[finger],
              "border-b-gray-300/60 shadow-sm",
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
            isActive ? "bg-white/70" : "bg-gray-400/70",
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

  // ── Hand translation offsets (typing.com-style movement) ─────────────
  const { leftOffset, rightOffset } = useMemo<{
    leftOffset:  HandOffset;
    rightOffset: HandOffset;
  }>(() => {
    const zero: HandOffset = { dx: 0, dy: 0 };
    if (!nextExpectedChar || !targetFinger) return { leftOffset: zero, rightOffset: zero };

    // Look up target key center (try lowercase first)
    const targetPos =
      KEY_POS_MAP.get(nextExpectedChar) ??
      KEY_POS_MAP.get(nextExpectedChar.toLowerCase());
    if (!targetPos) return { leftOffset: zero, rightOffset: zero };

    // Home key for the responsible finger
    const homeChar = FINGER_HOME_CHAR[targetFinger.hand][targetFinger.finger];
    const homePos  = KEY_POS_MAP.get(homeChar);
    if (!homePos) return { leftOffset: zero, rightOffset: zero };

    const offset: HandOffset = {
      dx: (targetPos.x - homePos.x) * DAMPING,
      dy: (targetPos.y - homePos.y) * DAMPING,
    };

    return targetFinger.hand === "left"
      ? { leftOffset: offset,  rightOffset: zero }
      : { leftOffset: zero,    rightOffset: offset };
  }, [nextExpectedChar, targetFinger]);

  return (
    <div className="flex flex-col items-center select-none">

      {/* ── Next-key badge (above keyboard) ── */}
      {nextExpectedChar ? (
        <div className="mb-3 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] text-gray-400 font-medium tracking-wide">Next</span>
          <div
            className={[
              "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm",
              targetFinger ? FINGER_COLOR[targetFinger.finger].bg : "bg-gray-300",
            ].join(" ")}
          >
            {nextExpectedChar === " " ? "⎵" : nextExpectedChar.toUpperCase()}
          </div>
          {targetFinger && (
            <span className={`text-[11px] font-semibold capitalize ${FINGER_COLOR[targetFinger.finger].text}`}>
              {targetFinger.hand} {targetFinger.finger}
            </span>
          )}
        </div>
      ) : (
        <div className="mb-3 h-8" /> /* spacer */
      )}

      {/* ── Keyboard + overlay wrapper ── */}
      <div className="relative">

        {/* Keyboard (z-10 so hands render on top) */}
        <div
          className="relative z-10 rounded-2xl bg-white p-3 shadow-lg border border-gray-200"
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
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
            {(["pinky", "ring", "middle", "index", "thumb"] as Finger[]).map(
              (f) => (
                <span key={f} className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${FINGER_COLOR[f].bg}`} />
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </span>
              )
            )}
          </div>
        </div>

        {/* ── Hand overlay: negative margin pulls hands UP over keyboard bottom ── */}
        {showHands && (
          <div
            className="relative z-20 -mt-32 flex pointer-events-none"
            style={{ opacity: 0.70 }}
          >
            <HandGuide
              hand="left"
              activeFingerKey={targetFinger?.hand === "left" ? targetFinger.finger : null}
              translate={leftOffset}
            />
            <HandGuide
              hand="right"
              activeFingerKey={targetFinger?.hand === "right" ? targetFinger.finger : null}
              translate={rightOffset}
            />
          </div>
        )}
      </div>
    </div>
  );
}
