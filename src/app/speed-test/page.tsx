"use client";

import { useRef, useEffect } from "react";
import VirtualKeyboard from "@/components/keyboard/VirtualKeyboard";
import { useTypingEngine } from "@/hooks/useTypingEngine";

const SAMPLE_TEXT =
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.";

export default function SpeedTestPage() {
  const engine  = useTypingEngine(SAMPLE_TEXT);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const nextChar = engine.isFinished
    ? null
    : SAMPLE_TEXT[engine.cursor] ?? null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "WPM",      value: engine.wpm,            color: "text-blue-600"    },
          { label: "Net WPM",  value: engine.netWpm,         color: "text-emerald-600" },
          { label: "Accuracy", value: `${engine.accuracy}%`, color: "text-amber-600"   },
          { label: "Time",     value: `${engine.elapsedSeconds}s`, color: "text-rose-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Text display */}
      <div
        className="bg-white rounded-2xl border border-gray-200 p-6 cursor-text font-mono text-lg leading-loose tracking-wide"
        onClick={() => inputRef.current?.focus()}
      >
        {engine.chars.map((c, i) => {
          const isCursor = i === engine.cursor;
          let cls = "text-gray-300"; // pending
          if (c.state === "correct")   cls = "text-gray-900";
          if (c.state === "incorrect") cls = "text-red-500 bg-red-50 rounded";

          return (
            <span key={i} className="relative">
              {isCursor && !engine.isFinished && (
                <span className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-emerald-500 animate-pulse rounded-full" />
              )}
              <span className={cls}>
                {c.char === " " ? "\u00A0" : c.char}
              </span>
            </span>
          );
        })}

        {engine.isFinished && (
          <span className="ml-2 text-emerald-500 font-semibold text-base">✓ Done!</span>
        )}
      </div>

      {/* Hidden input that captures keystrokes */}
      <input
        ref={inputRef}
        value={engine.chars
          .filter((c) => c.typed !== null)
          .map((c) => c.typed)
          .join("")}
        onChange={(e) => engine.handleInput(e.target.value)}
        className="sr-only"
        aria-label="Typing input"
        disabled={engine.isFinished}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Reset button */}
      <div className="flex justify-center">
        <button
          onClick={engine.reset}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          ↺ Restart
        </button>
      </div>

      {/* Virtual keyboard */}
      <VirtualKeyboard nextExpectedChar={nextChar} showHands={true} />
    </div>
  );
}
