// ─────────────────────────────────────────────────────────────────────────────
//  Hand-image lookup table — maps every typeable char to a pair of PNG names
//  (no .png extension) that live in /public/hands/
//
//  Naming convention  (from typing.com/dist/student/images/hands/app_v1/):
//    {hand}-{row}-row-{n}.png
//    hand  : "left" | "right"
//    row   : "num" | "top" | "home" | "bottom"
//    n     : 1-7  (1 = index-stretch, 5/6 = pinky, 7 = extra-pinky / Enter)
//
//  Column → n:
//    Left  hand  n = 7 - colIdx (colIdx 1-based)
//    Right hand  n = colIdx - 6
// ─────────────────────────────────────────────────────────────────────────────

import { KEYBOARD_ROWS } from "./keyboardData";

export interface HandImagePair {
  left:    string;   // filename without .png
  right:   string;
  isSpace: boolean;
}

const RESTING_LEFT  = "left-resting-hand";
const RESTING_RIGHT = "right-resting-hand";

// Row index → image row label
const ROW_LABEL: Record<number, string> = {
  0: "num",
  1: "top",
  2: "home",
  3: "bottom",
};

// Build the map ---------------------------------------------------------------
const MAP = new Map<string, HandImagePair>();

for (let rowIdx = 0; rowIdx < KEYBOARD_ROWS.length; rowIdx++) {
  const rowLabel = ROW_LABEL[rowIdx];
  if (!rowLabel) continue;          // row 4 = space row → handled separately

  const row = KEYBOARD_ROWS[rowIdx];

  for (let ki = 0; ki < row.length; ki++) {
    const key  = row[ki];
    const col  = ki + 1;            // 1-based column
    const left = col <= 6;          // left hand cols 1-6, right cols 7+

    let n = left ? 7 - col : col - 6;

    // Clamp to available images (left-num-row-1 doesn't exist → use 2)
    if (rowLabel === "num" && left && n < 2) n = 2;
    n = Math.max(1, Math.min(7, n));

    const activeImg    = `${left ? "left" : "right"}-${rowLabel}-row-${n}`;
    const companionImg = left ? RESTING_RIGHT : RESTING_LEFT;

    const pair: HandImagePair = {
      left:    left ? activeImg : companionImg,
      right:   left ? companionImg : activeImg,
      isSpace: false,
    };

    for (const ch of key.chars) {
      MAP.set(ch, pair);
    }
  }
}

// Space -----------------------------------------------------------------------
const SPACE_PAIR: HandImagePair = {
  left:    "space",
  right:   "space",
  isSpace: true,
};
MAP.set(" ", SPACE_PAIR);

// Default (idle / finished) ---------------------------------------------------
const IDLE_PAIR: HandImagePair = {
  left:    RESTING_LEFT,
  right:   RESTING_RIGHT,
  isSpace: false,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

export function getHandImages(char: string | null): HandImagePair {
  if (!char) return IDLE_PAIR;
  return (
    MAP.get(char) ??
    MAP.get(char.toLowerCase()) ??
    IDLE_PAIR
  );
}
