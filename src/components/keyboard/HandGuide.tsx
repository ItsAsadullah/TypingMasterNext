"use client";

import { Finger, Hand, FINGER_COLOR } from "./keyboardData";

interface HandGuideProps {
  hand:            Hand;
  activeFingerKey: Finger | null;
}

// ─────────────────────────────────────────────────────────
//  Finger geometry (top-down view, palm facing keyboard)
//  Coordinates are for LEFT hand; right hand is mirrored.
// ─────────────────────────────────────────────────────────

/* Each finger segment: { cx, tip_y, base_y, width } */
const LEFT_FINGERS: Record<Finger, { cx: number; tipY: number; baseY: number; w: number; rx: number }> = {
  pinky:  { cx: 18,  tipY: 46,  baseY: 96,  w: 16, rx: 8  },
  ring:   { cx: 38,  tipY: 22,  baseY: 94,  w: 18, rx: 9  },
  middle: { cx: 60,  tipY: 10,  baseY: 94,  w: 20, rx: 10 },
  index:  { cx: 82,  tipY: 26,  baseY: 94,  w: 18, rx: 9  },
  thumb:  { cx: 108, tipY: 70,  baseY: 110, w: 16, rx: 8  },
};

const PALM = { x: 6, y: 88, width: 104, height: 52, rx: 18 };
const SVG_W = 124;
const SVG_H = 148;

function FingerPath({
  finger,
  geo,
  active,
  flipped,
}: {
  finger: Finger;
  geo: typeof LEFT_FINGERS[Finger];
  active: boolean;
  flipped: boolean;
}) {
  const colors = FINGER_COLOR[finger];
  const cx = flipped ? SVG_W - geo.cx : geo.cx;
  const x  = cx - geo.w / 2;

  const passiveClass =
    finger === "thumb"
      ? "fill-slate-300"
      : "fill-slate-200";

  return (
    <g className="transition-all duration-200">
      {/* Finger segment */}
      <rect
        x={x}
        y={geo.tipY}
        width={geo.w}
        height={geo.baseY - geo.tipY}
        rx={geo.rx}
        className={`transition-all duration-200 ${
          active
            ? `${colors.bg} drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]`
            : passiveClass
        }`}
      />

      {/* Fingernail highlight */}
      {active && (
        <rect
          x={x + 3}
          y={geo.tipY + 3}
          width={geo.w - 6}
          height={Math.min(10, geo.w - 6)}
          rx={geo.rx - 2}
          className="fill-white/25"
        />
      )}

      {/* Knuckle lines */}
      {finger !== "thumb" && (
        <>
          <line
            x1={x + 2} y1={geo.tipY + (geo.baseY - geo.tipY) * 0.38}
            x2={x + geo.w - 2} y2={geo.tipY + (geo.baseY - geo.tipY) * 0.38}
            className={`stroke-[1.5] ${active ? "stroke-white/40" : "stroke-slate-300"}`}
          />
          <line
            x1={x + 2} y1={geo.tipY + (geo.baseY - geo.tipY) * 0.65}
            x2={x + geo.w - 2} y2={geo.tipY + (geo.baseY - geo.tipY) * 0.65}
            className={`stroke-[1] ${active ? "stroke-white/25" : "stroke-slate-300"}`}
          />
        </>
      )}

      {/* Pulse ring when active */}
      {active && (
        <rect
          x={x - 3}
          y={geo.tipY - 3}
          width={geo.w + 6}
          height={geo.baseY - geo.tipY + 6}
          rx={geo.rx + 3}
          className="fill-none stroke-gray-700/50 stroke-[2] animate-pulse"
        />
      )}
    </g>
  );
}

export default function HandGuide({ hand, activeFingerKey }: HandGuideProps) {
  const flipped = hand === "right";

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {/* Label */}
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {hand === "left" ? "Left" : "Right"} Hand
      </span>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W * 1.15}
        height={SVG_H * 1.15}
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${hand} hand`}
      >
        {/* Palm */}
        <rect
          x={PALM.x}
          y={PALM.y}
          width={PALM.width}
          height={PALM.height}
          rx={PALM.rx}
          className="fill-slate-200"
        />
        {/* Wrist taper */}
        <rect
          x={PALM.x + 14}
          y={PALM.y + PALM.height - 4}
          width={PALM.width - 28}
          height={20}
          rx={8}
          className="fill-slate-200"
        />

        {/* Fingers */}
        {(["pinky", "ring", "middle", "index", "thumb"] as Finger[]).map(
          (finger) => (
            <FingerPath
              key={finger}
              finger={finger}
              geo={LEFT_FINGERS[finger]}
              active={activeFingerKey === finger}
              flipped={flipped}
            />
          )
        )}

        {/* F / J bump indicators on index fingers */}
        {hand === "left" && (
          <rect
            x={LEFT_FINGERS.index.cx - 3}
            y={LEFT_FINGERS.index.baseY - 10}
            width={6}
            height={4}
            rx={2}
            className="fill-white/40"
          />
        )}
        {hand === "right" && (
          <rect
            x={SVG_W - LEFT_FINGERS.index.cx - 3}
            y={LEFT_FINGERS.index.baseY - 10}
            width={6}
            height={4}
            rx={2}
            className="fill-white/40"
          />
        )}
      </svg>
    </div>
  );
}
