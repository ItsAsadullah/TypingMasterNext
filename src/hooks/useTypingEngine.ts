"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

export type CharState = "pending" | "correct" | "incorrect" | "extra";

export interface CharResult {
  char: string;       // the target character
  state: CharState;
  typed: string | null; // what the user actually typed (null if not yet reached)
}

export interface TypingEngineState {
  /** Per-character breakdown of the target text */
  chars: CharResult[];

  /** Index of the character the cursor is currently at */
  cursor: number;

  /** Current raw (gross) words per minute */
  wpm: number;

  /** Net WPM: gross WPM − (errors per minute) */
  netWpm: number;

  /** Accuracy as a percentage (0–100) */
  accuracy: number;

  /** Total correctly typed characters */
  correctCount: number;

  /** Total incorrectly typed characters */
  errorCount: number;

  /** Elapsed time in seconds since first keystroke */
  elapsedSeconds: number;

  /** True once the user has typed through the entire targetText */
  isFinished: boolean;

  /** True once the user has pressed the first key */
  isStarted: boolean;

  /** Imperative reset — restarts the engine for the same targetText */
  reset: () => void;

  /** Feed a full input string (e.g. from an <input> onChange value) */
  handleInput: (value: string) => void;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/** Count "words" as every 5 characters (standard WPM definition) */
const charsToWords = (chars: number) => chars / 5;

function calcWpm(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(charsToWords(correctChars) / minutes);
}

function calcNetWpm(
  correctChars: number,
  errorCount: number,
  elapsedSeconds: number
): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  const gross = charsToWords(correctChars) / minutes;
  const errorPenalty = errorCount / minutes;
  return Math.max(0, Math.round(gross - errorPenalty));
}

function calcAccuracy(correctChars: number, totalTyped: number): number {
  if (totalTyped === 0) return 100;
  return Math.round((correctChars / totalTyped) * 100);
}

function buildInitialChars(text: string): CharResult[] {
  return text.split("").map((char) => ({
    char,
    state: "pending",
    typed: null,
  }));
}

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────

export function useTypingEngine(targetText: string): TypingEngineState {
  const [chars, setChars] = useState<CharResult[]>(() =>
    buildInitialChars(targetText)
  );
  const [cursor, setCursor] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Mutable refs to avoid stale-closure issues inside the interval
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charsRef = useRef(chars);
  charsRef.current = chars;

  // ── Re-initialise when targetText changes ──
  useEffect(() => {
    resetState(targetText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetText]);

  // ── Cleanup interval on unmount ──
  useEffect(() => {
    return () => stopTimer();
  }, []);

  // ─────────────────────────────────────────
  //  Timer
  // ─────────────────────────────────────────

  function startTimer() {
    if (intervalRef.current) return; // already running
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(
        Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000)
      );
    }, 500); // update twice per second for smooth display
  }

  function stopTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // ─────────────────────────────────────────
  //  Reset
  // ─────────────────────────────────────────

  function resetState(text: string) {
    stopTimer();
    startTimeRef.current = null;
    setChars(buildInitialChars(text));
    setCursor(0);
    setIsStarted(false);
    setIsFinished(false);
    setElapsedSeconds(0);
  }

  const reset = useCallback(() => resetState(targetText), [targetText]);

  // ─────────────────────────────────────────
  //  Core input handler
  // ─────────────────────────────────────────

  /**
   * Call this with the full current value of the controlled input.
   *
   * Works with both:
   *   – A plain <input> or <textarea> (pass e.target.value)
   *   – Programmatic keystroke accumulation
   */
  const handleInput = useCallback(
    (value: string) => {
      if (isFinished) return;

      // Start the timer on first real input
      if (!isStarted && value.length > 0) {
        setIsStarted(true);
        startTimer();
      }

      const target = targetText;

      setChars((prev) => {
        const updated = prev.map((c, i) => {
          if (i < value.length) {
            // User has typed up to (or past) this position
            return {
              ...c,
              typed: value[i],
              state: value[i] === c.char ? "correct" : "incorrect",
            } as CharResult;
          } else if (i < target.length) {
            // Not yet typed
            return { ...c, typed: null, state: "pending" } as CharResult;
          }
          return c;
        });

        return updated;
      });

      const newCursor = Math.min(value.length, targetText.length);
      setCursor(newCursor);

      // Finished when the user has typed at least as many chars as the target
      if (value.length >= targetText.length) {
        stopTimer();
        setIsFinished(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetText, isStarted, isFinished]
  );

  // ─────────────────────────────────────────
  //  Derived statistics (memoised from chars)
  // ─────────────────────────────────────────

  const correctCount = chars.filter((c) => c.state === "correct").length;
  const errorCount = chars.filter((c) => c.state === "incorrect").length;
  const totalTyped = correctCount + errorCount;

  const wpm = calcWpm(correctCount, elapsedSeconds);
  const netWpm = calcNetWpm(correctCount, errorCount, elapsedSeconds);
  const accuracy = calcAccuracy(correctCount, totalTyped);

  return {
    chars,
    cursor,
    wpm,
    netWpm,
    accuracy,
    correctCount,
    errorCount,
    elapsedSeconds,
    isFinished,
    isStarted,
    reset,
    handleInput,
  };
}
