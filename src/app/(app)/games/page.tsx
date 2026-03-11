"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sword, Gamepad2, ArrowLeft } from "lucide-react";
import TypingGameNinja from "@/components/typing/TypingGameNinja";

type GameId = "ninja" | null;

const GAME_CARDS = [
  {
    id:          "ninja" as GameId,
    title:       "Word Ninja",
    emoji:       "🥷",
    description: "Destroy falling words before they escape! Speed increases every 10 words.",
    tags:        ["Action", "Speed"],
    color:       "from-violet-500 to-purple-600",
  },
];

export default function GamesPage() {
  const [active, setActive] = useState<GameId>(null);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-violet-500" /> Typing Games
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">Level up your speed with these mini-games.</p>
      </div>

      {/* Game picker */}
      {!active && (
        <div className="flex flex-col gap-3">
          {GAME_CARDS.map((g) => (
            <motion.button
              key={g.id}
              onClick={() => setActive(g.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-5 bg-gradient-to-r ${g.color} text-white rounded-2xl p-5 shadow-lg text-left`}
            >
              <span className="text-5xl drop-shadow">{g.emoji}</span>
              <div className="flex-1">
                <p className="font-black text-xl leading-tight">{g.title}</p>
                <p className="text-white/80 text-sm mt-0.5">{g.description}</p>
                <div className="flex gap-1.5 mt-2">
                  {g.tags.map((t) => (
                    <span key={t} className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <Sword className="w-6 h-6 text-white/70" />
            </motion.button>
          ))}
        </div>
      )}

      {/* Active game */}
      {active === "ninja" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TypingGameNinja onClose={() => setActive(null)} />
        </motion.div>
      )}
    </div>
  );
}
