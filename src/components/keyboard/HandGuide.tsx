"use client";

import { Finger, Hand } from "./keyboardData";

// ─── Active finger colours (raw hex – SVG fill) ───────────────────────────────
const ACTIVE_FILL: Record<Finger, string> = {
  pinky:  "#f43f5e",
  ring:   "#f59e0b",
  middle: "#10b981",
  index:  "#3b82f6",
  thumb:  "#a855f7",
};
const ACTIVE_RING: Record<Finger, string> = {
  pinky:  "#fda4af",
  ring:   "#fcd34d",
  middle: "#6ee7b7",
  index:  "#93c5fd",
  thumb:  "#d8b4fe",
};

// ─── Skin palette ─────────────────────────────────────────────────────────────
const SKIN   = "#f5c8a8";
const SKIN_S = "#e0a882";   // knuckle shadow lines
const NAIL   = "rgba(255,255,255,0.50)";

// ─── Geometry – LEFT hand (right = scaleX(-1) mirror) ─────────────────────────
//  Fingers point UPWARD (small tipY = near top of SVG).
//  Canvas: 370 × 200  (two hands side-by-side ≈ keyboard width)
// ─────────────────────────────────────────────────────────────────────────────
const SVG_W = 370;
const SVG_H = 200;

interface FingerGeo { cx: number; tipY: number; baseY: number; w: number; rx: number }

const FINGER_GEO: Record<Finger, FingerGeo> = {
  pinky:  { cx: 52,  tipY: 22,  baseY: 140, w: 44, rx: 18 },
  ring:   { cx: 112, tipY: 5,   baseY: 138, w: 48, rx: 19 },
  middle: { cx: 177, tipY: 0,   baseY: 138, w: 52, rx: 21 },
  index:  { cx: 243, tipY: 12,  baseY: 138, w: 48, rx: 19 },
  thumb:  { cx: 317, tipY: 95,  baseY: 164, w: 54, rx: 24 },
};

const PALM  = { x: 10,  y: 132, width: 306, height: 60, rx: 30 };
const WRIST = { x: 52,  y: 186, width: 222, height: 22, rx: 11 };

interface HandGuideProps {
  hand:            Hand;
  activeFingerKey: Finger | null;
}

export default function HandGuide({ hand, activeFingerKey }: HandGuideProps) {
  const flipped = hand === "right";
  const fingers: Finger[] = ["pinky", "ring", "middle", "index", "thumb"];

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${hand} hand`}
      style={{ transform: flipped ? "scaleX(-1)" : undefined, overflow: "visible" }}
    >
      {/* ── Palm ── */}
      <rect
        x={PALM.x} y={PALM.y}
        width={PALM.width} height={PALM.height}
        rx={PALM.rx} fill={SKIN}
      />

      {/* ── Wrist taper ── */}
      <rect
        x={WRIST.x} y={WRIST.y}
        width={WRIST.width} height={WRIST.height}
        rx={WRIST.rx} fill={SKIN}
      />

      {/* Palm subtle highlight */}
      <ellipse
        cx={SVG_W / 2} cy={PALM.y + 20}
        rx={PALM.width * 0.36} ry={9}
        fill="rgba(255,255,255,0.18)"
      />

      {/* ── Fingers ── */}
      {fingers.map((finger) => {
        const g = FINGER_GEO[finger];
        const active = activeFingerKey === finger;
        const x = g.cx - g.w / 2;
        const segH = g.baseY - g.tipY;
        const fillColor = active ? ACTIVE_FILL[finger] : SKIN;

        return (
          <g key={finger} style={{ transition: "fill 0.15s ease" }}>
            {/* Finger body */}
            <rect
              x={x} y={g.tipY}
              width={g.w} height={segH}
              rx={g.rx} fill={fillColor}
            />

            {/* Fingernail */}
            <rect
              x={x + 6} y={g.tipY + 5}
              width={g.w - 12} height={Math.min(g.w - 12, 13)}
              rx={g.rx - 4} fill={NAIL}
            />

            {/* Knuckle creases (skip thumb) */}
            {finger !== "thumb" && (
              <>
                <line
                  x1={x + 5} y1={g.tipY + segH * 0.40}
                  x2={x + g.w - 5} y2={g.tipY + segH * 0.40}
                  stroke={active ? "rgba(255,255,255,0.38)" : SKIN_S}
                  strokeWidth={1.5} strokeLinecap="round"
                />
                <line
                  x1={x + 5} y1={g.tipY + segH * 0.67}
                  x2={x + g.w - 5} y2={g.tipY + segH * 0.67}
                  stroke={active ? "rgba(255,255,255,0.24)" : SKIN_S}
                  strokeWidth={1} strokeLinecap="round"
                />
              </>
            )}

            {/* Pulse ring when active */}
            {active && (
              <rect
                x={x - 4} y={g.tipY - 4}
                width={g.w + 8} height={segH + 8}
                rx={g.rx + 4}
                fill="none"
                stroke={ACTIVE_RING[finger]}
                strokeWidth={3}
                strokeOpacity={0.75}
                className="animate-pulse"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
