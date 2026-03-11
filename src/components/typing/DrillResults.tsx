"use client";

// =============================================================================
//  DrillResults
//  Animated results modal shown after completing a drill.
//
//  Features
//  • Stars (0-3) animate in one-by-one with a bounce
//  • XP counter counts up
//  • WPM / ACC / Errors summary
//  • Buttons: Retry | Next Drill | Play Mini-Game
// =============================================================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ChevronRight, Sword, Star } from "lucide-react";
import { calcStars, calcXp } from "@/data/englishCurriculum";
import type { Drill } from "@/data/englishCurriculum";
import type { DrillCompleteStats } from "@/components/typing/GamifiedTypingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DrillResultsProps {
  drill:          Drill;
  stats:          DrillCompleteStats;
  show:           boolean;
  onRetry:        () => void;
  onNext:         () => void;
  onPlayMiniGame: () => void;
}

// ─── Animated Star ────────────────────────────────────────────────────────────

function AnimStar({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 14, delay }}
    >
      <Star
        className={`w-12 h-12 drop-shadow-md ${filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
      />
    </motion.div>
  );
}

// ─── XP Counter ──────────────────────────────────────────────────────────────

function XPCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <motion.span
      className="text-5xl font-black text-emerald-500"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
    >
      +{display}
    </motion.span>
  );
}

// ─── Grade Banner ─────────────────────────────────────────────────────────────

function GradeBanner({ stars, accuracy }: { stars: number; accuracy: number }) {
  const [label, color] =
    stars === 3 ? ["⚡ Flawless!", "from-amber-400 to-yellow-500 text-white"] :
    stars === 2 ? ["✅ Great Job!", "from-emerald-400 to-teal-500 text-white"] :
    stars === 1 ? ["👍 Nice Try!", "from-blue-400 to-blue-500 text-white"] :
                  ["💪 Keep Going", "from-slate-400 to-slate-500 text-white"];
  return (
    <motion.div
      className={`inline-block px-6 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${color} shadow-md`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.3 }}
    >
      {label} · {accuracy}% Accuracy
    </motion.div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <motion.div
      className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.9, type: "spring", stiffness: 290 }}
    >
      <p className={`text-3xl font-black leading-none ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DrillResults({
  drill, stats, show, onRetry, onNext, onPlayMiniGame,
}: DrillResultsProps) {
  const stars = calcStars(drill, stats.wpm, stats.accuracy);
  const xp    = calcXp(stats.wpm, stats.accuracy, stats.maxCombo);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            key="card"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 310, damping: 22 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center gap-6">

              {/* Drill title */}
              <motion.p
                className="text-slate-400 text-sm uppercase tracking-widest font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {drill.title}
              </motion.p>

              {/* Stars */}
              <div className="flex gap-3 items-center">
                {[0, 1, 2].map((i) => (
                  <AnimStar key={i} filled={i < stars} delay={0.3 + i * 0.18} />
                ))}
              </div>

              {/* Grade banner */}
              <GradeBanner stars={stars} accuracy={stats.accuracy} />

              {/* XP */}
              <div className="flex flex-col items-center gap-0.5">
                <XPCounter target={xp} />
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">XP Earned</p>
                {stats.maxCombo >= 10 && (
                  <motion.p
                    className="text-xs text-amber-500 font-semibold mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    🔥 Max combo: {stats.maxCombo}x bonus included
                  </motion.p>
                )}
              </div>

              {/* Stats row */}
              <div className="flex gap-3 w-full">
                <StatPill label="WPM" value={stats.wpm} sub={`net ${stats.netWpm}`} color="text-blue-600" />
                <StatPill label="Accuracy" value={`${stats.accuracy}%`} color={stats.accuracy >= 95 ? "text-emerald-600" : stats.accuracy >= 85 ? "text-amber-600" : "text-red-500"} />
                <StatPill label="Errors" value={stats.errors} color={stats.errors === 0 ? "text-emerald-600" : "text-red-500"} />
              </div>

              {/* Action buttons */}
              <motion.div
                className="flex gap-3 w-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <button
                  onClick={onRetry}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={onPlayMiniGame}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-violet-100 hover:bg-violet-200 text-violet-700 font-semibold text-sm transition-colors"
                >
                  <Sword className="w-4 h-4" />
                  Word Ninja
                </button>
                <button
                  onClick={onNext}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
