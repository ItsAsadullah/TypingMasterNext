"use client";

import React, { useMemo } from "react";
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
//  EXACT typing.com CSS (extracted from app.min.695.css):
//
//  .hands          { position:absolute; height:100%; left:0; top:3%; width:100% }
//  .hand           { position:absolute }   ← NO transition! instant src swap.
//  .hand--left     { left:-20.5%; top:-3%; width:74.3% }
//  .hand--right    { left:33.3%;  top:0;   width:84.2% }
//  .hand--single-center { left:50%; top:0; transform:translateX(-50%) }
//  .keyboard--hands{ margin-bottom:250px }
//
//  typing.com does INSTANT image swap — seamless look comes from the PNGs
//  sharing the same palm/wrist position, NOT from CSS transitions.
// ─────────────────────────────────────────────────────────────────────────────

interface HandOverlayProps {
  nextExpectedChar: string | null;
}

function HandOverlay({ nextExpectedChar }: HandOverlayProps) {
  const { left, right, isSpace } = useMemo(
    () => getHandImages(nextExpectedChar),
    [nextExpectedChar]
  );

  return (
    // .hands: position:absolute; height:100%; left:0; top:-8%; width:100%
    <div className="pointer-events-none z-20" style={{
      position: "absolute", left: 0, top: "-8%", width: "100%", height: "100%",
    }}>
      {isSpace ? (
        // space — same position as right hand
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/hands/space.png" alt=""
          style={{ position: "absolute", left: "33.3%", top: 0, width: "84.2%", height: "auto" }} />
      ) : (
        <>
          {/* .hand--left: left:-20.5%; top:-3%; width:74.3% */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/hands/${left}.png`}  alt="left hand"
            style={{ position: "absolute", left: "-20.5%", top: "-3%", width: "74.3%", height: "auto" }} />
          {/* .hand--right: left:33.3%; top:0; width:84.2% */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/hands/${right}.png`} alt="right hand"
            style={{ position: "absolute", left: "33.3%",  top: 0, width: "84.2%", height: "auto" }} />
        </>
      )}
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
        overflow:visible lets hands bleed past all 4 edges like typing.com.
        .keyboard--hands adds 250px bottom margin for wrist space.
      */}
      <div className="relative" style={{ overflow: "visible", marginBottom: showHands ? "250px" : undefined }}>
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

      {/* margin-bottom on wrapper handles spacing — no extra spacer needed */}
    </div>
  );
}
