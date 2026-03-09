// ─────────────────────────────────────────────────────────────────────────────
//  TechHat Typing Master — Keyboard Layout & Finger-Mapping Data
// ─────────────────────────────────────────────────────────────────────────────

export type Hand   = "left" | "right";
export type Finger = "pinky" | "ring" | "middle" | "index" | "thumb";

export interface FingerTarget {
  hand:   Hand;
  finger: Finger;
}

export interface KeyDef {
  /** Primary label shown on the keycap */
  label:   string;
  /** All characters produced by this key (lower, upper / symbol) */
  chars:   string[];
  /** Which hand + finger owns this key */
  finger:  FingerTarget;
  /** Width multiplier relative to a standard key (default = 1) */
  width?:  number;
  /** If true, render as spacer only (e.g. gaps) */
  spacer?: boolean;
}

// ─── Colour palette ──────────────────────────────────────────────────────────
//  Same finger type shares a colour on both hands (classic tutor convention)

export const FINGER_COLOR: Record<Finger, { bg: string; ring: string; text: string }> = {
  pinky:  { bg: "bg-rose-500",    ring: "ring-rose-300",    text: "text-rose-500"   },
  ring:   { bg: "bg-amber-500",   ring: "ring-amber-300",   text: "text-amber-500"  },
  middle: { bg: "bg-emerald-500", ring: "ring-emerald-300", text: "text-emerald-500"},
  index:  { bg: "bg-blue-500",    ring: "ring-blue-300",    text: "text-blue-500"   },
  thumb:  { bg: "bg-purple-500",  ring: "ring-purple-300",  text: "text-purple-500" },
};

export const FINGER_COLOR_PASSIVE: Record<Finger, string> = {
  pinky:  "bg-rose-100   text-rose-700  border border-rose-200",
  ring:   "bg-amber-100  text-amber-700 border border-amber-200",
  middle: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  index:  "bg-blue-100   text-blue-700  border border-blue-200",
  thumb:  "bg-purple-100 text-purple-700 border border-purple-200",
};

// ─── Keyboard rows ────────────────────────────────────────────────────────────

type LP = FingerTarget; // alias helpers
const lp: LP = { hand: "left",  finger: "pinky"  };
const lr: LP = { hand: "left",  finger: "ring"   };
const lm: LP = { hand: "left",  finger: "middle" };
const li: LP = { hand: "left",  finger: "index"  };
const lt: LP = { hand: "left",  finger: "thumb"  };
const ri: LP = { hand: "right", finger: "index"  };
const rm: LP = { hand: "right", finger: "middle" };
const rr: LP = { hand: "right", finger: "ring"   };
const rp: LP = { hand: "right", finger: "pinky"  };
const rt: LP = { hand: "right", finger: "thumb"  };

export const KEYBOARD_ROWS: KeyDef[][] = [
  // ── Row 0: Numbers ──────────────────────────────────────────────────────────
  [
    { label: "`",  chars: ["`", "~"],  finger: lp },
    { label: "1",  chars: ["1", "!"],  finger: lp },
    { label: "2",  chars: ["2", "@"],  finger: lr },
    { label: "3",  chars: ["3", "#"],  finger: lm },
    { label: "4",  chars: ["4", "$"],  finger: li },
    { label: "5",  chars: ["5", "%"],  finger: li },
    { label: "6",  chars: ["6", "^"],  finger: ri },
    { label: "7",  chars: ["7", "&"],  finger: ri },
    { label: "8",  chars: ["8", "*"],  finger: rm },
    { label: "9",  chars: ["9", "("],  finger: rr },
    { label: "0",  chars: ["0", ")"],  finger: rp },
    { label: "-",  chars: ["-", "_"],  finger: rp },
    { label: "=",  chars: ["=", "+"],  finger: rp },
    { label: "⌫",  chars: [],          finger: rp, width: 2 },
  ],
  // ── Row 1: QWERTY ────────────────────────────────────────────────────────────
  [
    { label: "Tab",chars: [],          finger: lp, width: 1.5 },
    { label: "Q",  chars: ["q", "Q"],  finger: lp },
    { label: "W",  chars: ["w", "W"],  finger: lr },
    { label: "E",  chars: ["e", "E"],  finger: lm },
    { label: "R",  chars: ["r", "R"],  finger: li },
    { label: "T",  chars: ["t", "T"],  finger: li },
    { label: "Y",  chars: ["y", "Y"],  finger: ri },
    { label: "U",  chars: ["u", "U"],  finger: ri },
    { label: "I",  chars: ["i", "I"],  finger: rm },
    { label: "O",  chars: ["o", "O"],  finger: rr },
    { label: "P",  chars: ["p", "P"],  finger: rp },
    { label: "[",  chars: ["[", "{"],  finger: rp },
    { label: "]",  chars: ["]", "}"],  finger: rp },
    { label: "\\", chars: ["\\", "|"],finger: rp, width: 1.5 },
  ],
  // ── Row 2: Home Row (ASDF) ───────────────────────────────────────────────────
  [
    { label: "Caps", chars: [],         finger: lp, width: 1.75 },
    { label: "A",  chars: ["a", "A"],   finger: lp },
    { label: "S",  chars: ["s", "S"],   finger: lr },
    { label: "D",  chars: ["d", "D"],   finger: lm },
    { label: "F",  chars: ["f", "F"],   finger: li },
    { label: "G",  chars: ["g", "G"],   finger: li },
    { label: "H",  chars: ["h", "H"],   finger: ri },
    { label: "J",  chars: ["j", "J"],   finger: ri },
    { label: "K",  chars: ["k", "K"],   finger: rm },
    { label: "L",  chars: ["l", "L"],   finger: rr },
    { label: ";",  chars: [";", ":"],   finger: rp },
    { label: "'",  chars: ["'", "\""],  finger: rp },
    { label: "↵",  chars: ["\n", "\r"],finger: rp, width: 2.25 },
  ],
  // ── Row 3: ZXCV ──────────────────────────────────────────────────────────────
  [
    { label: "⇧",  chars: [],           finger: lp, width: 2.25 },
    { label: "Z",  chars: ["z", "Z"],   finger: lp },
    { label: "X",  chars: ["x", "X"],   finger: lr },
    { label: "C",  chars: ["c", "C"],   finger: lm },
    { label: "V",  chars: ["v", "V"],   finger: li },
    { label: "B",  chars: ["b", "B"],   finger: li },
    { label: "N",  chars: ["n", "N"],   finger: ri },
    { label: "M",  chars: ["m", "M"],   finger: ri },
    { label: ",",  chars: [",", "<"],   finger: rm },
    { label: ".",  chars: [".", ">"],   finger: rr },
    { label: "/",  chars: ["/", "?"],   finger: rp },
    { label: "⇧",  chars: [],           finger: rp, width: 2.75 },
  ],
  // ── Row 4: Space bar ─────────────────────────────────────────────────────────
  [
    { label: "Ctrl", chars: [],  finger: lp, width: 1.25 },
    { label: "⊞",    chars: [],  finger: lt, width: 1.25 },
    { label: "Alt",  chars: [],  finger: lt, width: 1.25 },
    { label: " ",    chars: [" "], finger: lt, width: 6.25 },
    { label: "Alt",  chars: [],  finger: rt, width: 1.25 },
    { label: "⊞",    chars: [],  finger: rt, width: 1.25 },
    { label: "≡",    chars: [],  finger: rp, width: 1.25 },
    { label: "Ctrl", chars: [],  finger: rp, width: 1.25 },
  ],
];

// ─── Fast char → finger lookup ───────────────────────────────────────────────

export const CHAR_TO_FINGER = new Map<string, FingerTarget>();

for (const row of KEYBOARD_ROWS) {
  for (const key of row) {
    for (const ch of key.chars) {
      CHAR_TO_FINGER.set(ch, key.finger);
    }
  }
}

export function getFingerForChar(char: string): FingerTarget | null {
  return CHAR_TO_FINGER.get(char) ?? null;
}

// Home-row guide keys (F and J have tactile bumps)
export const HOME_ROW_KEYS = new Set(["f", "j"]);
