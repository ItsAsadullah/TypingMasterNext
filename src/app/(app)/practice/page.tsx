"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { RotateCcw, Shuffle } from "lucide-react";
import VirtualKeyboard from "@/components/keyboard/VirtualKeyboard";
import { useTypingEngine } from "@/hooks/useTypingEngine";

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
  "A wizard's job is to vex chumps quickly in fog. How quickly daft jumping zebras vex.",
  "Sphinx of black quartz, judge my vow. The five boxing wizards jump quickly.",
  "Bright vixens jump; dozy fowl quack. Jackdaws love my big sphinx of quartz.",
  "Two driven jocks help fax my big quiz. The jay, pig, fox, zebra and my wolves quack.",
  "Just keep examining every low bid quoted for zinc etchings. Foxy parsons quiz and cajole the lovably dim wiki-girl.",
  "Cozy lummox gives smart squid who asks for job pen. Fix problem quickly with galvanized jets.",
];

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  bg: string;
}

function StatCard({ label, value, sub, accent, bg }: StatCardProps) {
  return (
    <div className={`rounded-2xl ${bg} border border-gray-200 px-5 py-4 flex flex-col gap-0.5 min-w-[100px]`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      <span className={`text-3xl font-bold leading-tight ${accent}`}>{value}</span>
      {sub && <span className="text-[11px] text-gray-400 leading-tight">{sub}</span>}
    </div>
  );
}

function TextDisplay({
  chars, cursor, isFinished, onClick,
}: {
  chars: ReturnType<typeof useTypingEngine>["chars"];
  cursor: number;
  isFinished: boolean;
  onClick: () => void;
}) {
  const cursorRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [cursor]);

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl border border-gray-200 px-8 py-6 cursor-text font-mono text-[1.35rem] leading-[2.4rem] tracking-wide min-h-[9rem] select-none overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400/50"
    >
      {chars.map((c, i) => {
        const isCursor = i === cursor && !isFinished;
        let charClass = "text-gray-300";
        if (c.state === "correct") charClass = "text-emerald-600";
        if (c.state === "incorrect")
          charClass = c.char === " " ? "bg-red-200 text-red-500 rounded-sm" : "text-red-500 bg-red-50 rounded-sm";

        return (
          <span key={i} className="relative">
            {isCursor && (
              <span ref={cursorRef} className="absolute -left-px top-[2px] bottom-[2px] w-[2px] bg-emerald-500 rounded-full animate-pulse z-10" />
            )}
            <span className={`transition-colors duration-75 ${charClass}`}>
              {c.char === " " ? "\u00A0" : c.char}
            </span>
          </span>
        );
      })}
      {isFinished && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <p className="text-4xl mb-1">🎉</p>
            <p className="text-emerald-600 font-bold text-lg">Completed!</p>
            <p className="text-gray-400 text-sm mt-0.5">Press Restart to try again</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
      <div className="h-full bg-emerald-500 rounded-full transition-all duration-150" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PracticePage() {
  const [textIdx, setTextIdx] = useState(0);
  const [showKeys, setShowKeys] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetText = TEXTS[textIdx];
  const engine = useTypingEngine(targetText);
  const nextChar = engine.isFinished ? null : (targetText[engine.cursor] ?? null);
  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  useEffect(() => { focusInput(); }, [textIdx, focusInput]);

  const shuffle = useCallback(() => {
    const next = (textIdx + 1 + Math.floor(Math.random() * (TEXTS.length - 1))) % TEXTS.length;
    setTextIdx(next);
  }, [textIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab") { e.preventDefault(); engine.reset(); focusInput(); }
      if (e.key === "Escape") { shuffle(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [engine, focusInput, shuffle]);

  const typedValue = engine.chars.filter((c) => c.typed !== null).map((c) => c.typed).join("");
  const accColor = engine.accuracy >= 95 ? "text-emerald-600" : engine.accuracy >= 80 ? "text-amber-500" : "text-red-500";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-bold text-xl">Practice Mode</h2>
          <p className="text-gray-400 text-sm">Click the text area or start typing to begin</p>
        </div>
        <button
          onClick={() => setShowKeys((s) => !s)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {showKeys ? "Hide" : "Show"} Keyboard
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatCard label="WPM" value={engine.wpm} sub="gross" accent="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Net WPM" value={engine.netWpm} sub="−error penalty" accent="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Accuracy" value={`${engine.accuracy}%`} sub={`${engine.errorCount} error${engine.errorCount !== 1 ? "s" : ""}`} accent={accColor} bg="bg-white" />
        <StatCard label="Time" value={`${engine.elapsedSeconds}s`} sub={engine.isStarted ? "elapsed" : "waiting…"} accent="text-rose-500" bg="bg-rose-50" />
        <StatCard label="Progress" value={`${engine.cursor}/${targetText.length}`} sub="characters" accent="text-slate-700" bg="bg-white" />
      </div>

      <ProgressBar current={engine.cursor} total={targetText.length} />

      <TextDisplay chars={engine.chars} cursor={engine.cursor} isFinished={engine.isFinished} onClick={focusInput} />

      <input
        ref={inputRef}
        value={typedValue}
        onChange={(e) => engine.handleInput(e.target.value)}
        className="sr-only"
        aria-label="Type here"
        disabled={engine.isFinished}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => { engine.reset(); focusInput(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Restart
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-600 text-slate-300 text-[10px] font-mono">Tab</kbd>
          </button>
          <button
            onClick={shuffle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Shuffle className="w-4 h-4" /> New Text
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-mono">Esc</kbd>
          </button>
        </div>
        <div className="flex gap-1.5">
          {TEXTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setTextIdx(i)}
              className={`w-2 h-2 rounded-full transition-all duration-150 ${i === textIdx ? "bg-emerald-500 scale-125" : "bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Text ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {showKeys && (
        <div className="flex justify-center pb-4">
          <VirtualKeyboard nextExpectedChar={nextChar} showHands={true} />
        </div>
      )}
    </div>
  );
}
