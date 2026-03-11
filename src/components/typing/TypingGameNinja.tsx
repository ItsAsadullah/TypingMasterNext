"use client";

// =============================================================================
//  TypingGameNinja  — "Word Ninja" falling-words mini-game
//
//  Words fall from the top. Type the word exactly to destroy it (+10 pts).
//  If a word reaches the bottom you lose a life (3 lives total).
//  Speed increases every 10 words destroyed.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Zap, X } from "lucide-react";

// ─── Word Pool ────────────────────────────────────────────────────────────────

const WORD_POOL = [
  "the","and","for","are","but","not","you","all","can","her","was","one","our",
  "out","day","get","has","him","his","how","man","new","now","old","see","two",
  "way","who","boy","did","its","let","put","say","she","too","use","dad","run",
  "cat","dog","hot","big","red","sky","sun","top","win","yes","zip","job","fix",
  "key","log","mix","nap","oak","pay","quiz","rag","sit","tap","urn","van","wax",
  "have","with","this","will","your","from","they","know","want","been","good",
  "much","some","time","very","when","come","here","just","like","long","make",
  "many","over","such","take","than","them","well","were","what","word","also",
  "fast","type","code","data","hack","link","node","port","sort","sync","test",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _uid = 0;
const uid = () => ++_uid;

function pickWord(): string {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FallingWord {
  id:      number;
  word:    string;
  x:       number; // % from left (5 – 80)
  startMs: number; // timestamp when spawned
  dur:     number; // fall duration ms
  hit?:    boolean;
  missed?: boolean;
}

interface GameState {
  phase:   "idle" | "playing" | "gameover";
  score:   number;
  lives:   number;
  level:   number;
  killed:  number; // total words destroyed
  combo:   number;
  maxCombo:number;
}

const INIT_STATE: GameState = {
  phase: "idle", score: 0, lives: 3, level: 1, killed: 0, combo: 0, maxCombo: 0,
};

const BASE_FALL_MS   = 4000;
const SPEED_UP_MS    = 400;   // shave this off per level
const MIN_FALL_MS    = 1200;

// ─── Lives Display ───────────────────────────────────────────────────────────

function LivesRow({ lives }: { lives: number }) {
  return (
    <div className="flex gap-1">
      {[0,1,2].map((i) => (
        <motion.div
          key={i}
          animate={{ scale: i < lives ? 1 : 0.55, opacity: i < lives ? 1 : 0.3 }}
        >
          <Heart className={`w-5 h-5 ${i < lives ? "fill-red-400 text-red-400" : "text-slate-300"}`} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Single Falling Word ─────────────────────────────────────────────────────

function WordSprite({
  fw, typed, active,
}: {
  fw:     FallingWord;
  typed:  string;
  active: boolean;
}) {
  const matched = active ? fw.word.startsWith(typed) : false;
  const dur     = fw.dur / 1000;

  return (
    <motion.div
      key={fw.id}
      className="absolute select-none pointer-events-none"
      style={{ left: `${fw.x}%` }}
      initial={{ top: "-6%" }}
      animate={{ top: fw.hit ? "-6%" : "105%" }}
      transition={fw.hit
        ? { duration: 0.05 }
        : { duration: dur, ease: "linear", delay: 0 }}
    >
      <motion.div
        className={`
          px-3 py-1.5 rounded-xl text-base font-mono font-bold shadow-lg
          border-2 whitespace-nowrap
          ${active && matched ? "bg-emerald-50 border-emerald-400 text-emerald-800" : "bg-white border-slate-300 text-slate-700"}
          ${fw.missed ? "opacity-0" : ""}
        `}
        animate={fw.hit ? { scale: [1, 1.6, 0], opacity: [1, 1, 0] } : {}}
        transition={{ duration: 0.35 }}
      >
        {active && matched
          ? <>{
              fw.word.split("").map((ch, i) => (
                <span key={i} className={i < typed.length ? "text-emerald-500" : "text-slate-700"}>{ch}</span>
              ))
            }</>
          : fw.word
        }
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TypingGameNinjaProps {
  onClose?: () => void;
}

export default function TypingGameNinja({ onClose }: TypingGameNinjaProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const frameRef  = useRef<number>(0);
  const spawnRef  = useRef<number>(0);

  const [state,   setState]   = useState<GameState>(INIT_STATE);
  const [words,   setWords]   = useState<FallingWord[]>([]);
  const [typed,   setTyped]   = useState("");
  const [flash,   setFlash]   = useState<string | null>(null);

  const stateRef  = useRef(state);
  const wordsRef  = useRef(words);
  stateRef.current = state;
  wordsRef.current = words;

  // ── Spawn loop ──
  const getSpawnInterval = useCallback((level: number) => {
    return Math.max(1400 - (level - 1) * 150, 650);
  }, []);

  const getFallDur = useCallback((level: number) => {
    return Math.max(BASE_FALL_MS - (level - 1) * SPEED_UP_MS, MIN_FALL_MS);
  }, []);

  const spawnWord = useCallback(() => {
    if (stateRef.current.phase !== "playing") return;
    const x = 5 + Math.random() * 78;
    setWords((prev) => [...prev, {
      id:      uid(),
      word:    pickWord(),
      x,
      startMs: performance.now(),
      dur:     getFallDur(stateRef.current.level),
    }]);
  }, [getFallDur]);

  // ── Game loop: detect words that reached bottom ──
  useEffect(() => {
    if (state.phase !== "playing") return;
    const tick = () => {
      const now = performance.now();
      const expired: number[] = [];
      wordsRef.current.forEach((fw) => {
        if (fw.hit || fw.missed) return;
        const elapsed = now - fw.startMs;
        if (elapsed >= fw.dur) expired.push(fw.id);
      });
      if (expired.length > 0) {
        setWords((prev) =>
          prev.map((fw) => expired.includes(fw.id) ? { ...fw, missed: true } : fw)
        );
        setState((s) => {
          const newLives = s.lives - expired.length;
          if (newLives <= 0) return { ...s, lives: 0, phase: "gameover", combo: 0 };
          setFlash("💔 Missed!");
          setTimeout(() => setFlash(null), 700);
          return { ...s, lives: newLives, combo: 0 };
        });
      }
      // Cleanup old hit/missed words
      setWords((prev) => prev.filter((fw) => {
        const age = now - fw.startMs;
        return age < fw.dur + 800;
      }));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [state.phase]);

  // ── Spawn interval ──
  useEffect(() => {
    if (state.phase !== "playing") return;
    spawnWord(); // immediate first spawn
    const id = setInterval(spawnWord, getSpawnInterval(state.level));
    spawnRef.current = id as unknown as number;
    return () => clearInterval(id);
  }, [state.phase, state.level, spawnWord, getSpawnInterval]);

  // ── Level up every 10 kills ──
  useEffect(() => {
    if (state.phase !== "playing") return;
    const newLevel = Math.floor(state.killed / 10) + 1;
    if (newLevel !== state.level) {
      setState((s) => ({ ...s, level: newLevel }));
      setFlash(`⚡ Level ${newLevel}!`);
      setTimeout(() => setFlash(null), 900);
    }
  }, [state.killed, state.level, state.phase]);

  // ── Input handling ──
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);

    // Find matching word (prefer closest to bottom = oldest active)
    const active = wordsRef.current
      .filter((fw) => !fw.hit && !fw.missed && fw.word.startsWith(val))
      .sort((a, b) => a.startMs - b.startMs); // oldest first

    if (val === "") return;

    const hit = active.find((fw) => fw.word === val);
    if (hit) {
      setWords((prev) => prev.map((fw) => fw.id === hit.id ? { ...fw, hit: true } : fw));
      setState((s) => {
        const newKilled = s.killed + 1;
        const newCombo  = s.combo + 1;
        const maxCombo  = Math.max(s.maxCombo, newCombo);
        const bonus     = newCombo >= 5 ? 5 : 0;
        return { ...s, score: s.score + 10 + bonus, killed: newKilled, combo: newCombo, maxCombo };
      });
      setTyped("");
      if (e.target) e.target.value = "";
    }
  }, []);

  const startGame = () => {
    setWords([]);
    setTyped("");
    setState({ ...INIT_STATE, phase: "playing" });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            🥷 Word Ninja
          </h2>
          <p className="text-slate-400 text-xs">Type words before they escape!</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* Score bar */}
      <div className="flex items-center justify-between bg-slate-800 rounded-2xl px-5 py-3">
        <LivesRow lives={state.lives} />
        <div className="flex items-center gap-4 text-white">
          {state.phase === "playing" && state.combo >= 5 && (
            <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
              <Zap className="w-4 h-4" />{state.combo}x
            </span>
          )}
          <span className="text-2xl font-black">{state.score}</span>
          <span className="text-xs text-slate-400 uppercase">pts</span>
          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-lg text-slate-300">Lv {state.level}</span>
        </div>
      </div>

      {/* Arena */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl overflow-hidden"
           style={{ height: 340 }}>
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-red-900/70 to-transparent flex items-end justify-center pb-2">
          <p className="text-red-400 text-[10px] uppercase tracking-widest font-semibold opacity-70">Danger Zone</p>
        </div>

        {/* Words */}
        {words.map((fw) => (
          <WordSprite key={fw.id} fw={fw} typed={typed} active={!fw.hit && !fw.missed} />
        ))}

        {/* Flash toast */}
        <AnimatePresence>
          {flash && (
            <motion.div
              key={flash}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-5 py-2 rounded-full text-slate-800 font-bold text-sm shadow-lg"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              {flash}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle overlay */}
        {state.phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <p className="text-white text-4xl font-black">🥷</p>
            <p className="text-slate-300 text-sm">Type falling words to destroy them</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full text-base transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game over overlay */}
        {state.phase === "gameover" && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-5xl">💥</p>
            <p className="text-white text-2xl font-black">Game Over</p>
            <p className="text-slate-300 text-sm">Score: <span className="text-emerald-400 font-bold">{state.score}</span> · Max Combo: <span className="text-amber-400 font-bold">{state.maxCombo}x</span></p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-full text-base transition-colors"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        onChange={handleInput}
        value={typed}
        placeholder={state.phase === "playing" ? "Type the word…" : ""}
        disabled={state.phase !== "playing"}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full px-5 py-3 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 text-lg font-mono focus:outline-none focus:border-emerald-400 transition-colors placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-300"
      />
    </div>
  );
}
