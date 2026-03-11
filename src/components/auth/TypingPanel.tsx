"use client";

import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";

// ── Demo texts for the typing animation ──────────────────────────────────
const DEMO_LINES = [
  { text: "The quick brown fox jumps over the lazy dog.", lang: "English" },
  { text: "আমি বাংলায় টাইপিং শিখছি এবং দ্রুত হচ্ছি।", lang: "বাংলা" },
  { text: "Pack my box with five dozen liquor jugs.", lang: "English" },
  { text: "প্রতিদিন অনুশীলন করলে দক্ষতা বাড়ে।", lang: "বাংলা" },
];

// ── Particle type ───────────────────────────────────────────────────────
interface Particle {
  id: number; x: number; y: number;
  size: number; delay: number; dur: number; opacity: number;
}

// ── Keyboard rows ─────────────────────────────────────────────────────────
const KB_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export default function TypingPanel() {
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped]     = useState(0);
  const [wpm, setWpm]         = useState(0);
  const [activeKey, setActiveKey] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const [acc, setAcc] = useState(100);

  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 6,
        dur: Math.random() * 8 + 6,
        opacity: 0.15 + Math.random() * 0.2,
      }))
    );
  }, []);

  const current = DEMO_LINES[lineIdx];

  // All keyboard chars flattened for random fallback highlight
  const ALL_KEYS = KB_ROWS.join("");

  // Typing animation
  useEffect(() => {
    if (typed >= current.text.length) {
      const t = setTimeout(() => {
        setLineIdx((i) => (i + 1) % DEMO_LINES.length);
        setTyped(0);
      }, 1600);
      return () => clearTimeout(t);
    }
    const delay = Math.random() * 60 + 30;
    const t = setTimeout(() => {
      setTyped((n) => n + 1);
      const ch = current.text[typed]?.toUpperCase() ?? "";
      // For Latin chars use actual key; for others (Bengali etc.) pick random key
      if (/[A-Z]/.test(ch)) {
        setActiveKey(ch);
      } else if (ch !== " ") {
        setActiveKey(ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)]);
      } else {
        setActiveKey("");
      }
      // Simulate WPM
      setWpm((w) => Math.min(w + Math.floor(Math.random() * 3), 94));
    }, delay);
    return () => clearTimeout(t);
  }, [typed, lineIdx, current.text, ALL_KEYS]);

  // Clear active key highlight after short delay for realistic tap feel
  useEffect(() => {
    if (!activeKey) return;
    const t = setTimeout(() => setActiveKey(""), 130);
    return () => clearTimeout(t);
  }, [activeKey]);

  // Reset WPM on new line
  useEffect(() => {
    setWpm(Math.floor(Math.random() * 20) + 30);
  }, [lineIdx]);

  // Update accuracy client-side only (inside effect to avoid hydration mismatch)
  useEffect(() => {
    if (typed > 4) setAcc(97 + Math.floor(Math.random() * 3));
    else setAcc(100);
  }, [typed]);

  const progress = (typed / current.text.length) * 100;

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center px-10 py-12">

      {/* ── Deep gradient background ─────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />

      {/* ── Animated fluid blobs ─────────────────────────────────────── */}
      <div
        className="absolute top-[-10%] left-[10%] w-[420px] h-[420px] rounded-full opacity-40 animate-blob"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, #4f46e5 40%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-[-5%] right-[5%] w-[380px] h-[380px] rounded-full opacity-35 animate-blob-delay"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, #3b82f6 40%, transparent 70%)", filter: "blur(70px)" }}
      />
      <div
        className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] rounded-full opacity-25 animate-blob-slow"
        style={{ background: "radial-gradient(circle, #ec4899 0%, #8b5cf6 50%, transparent 70%)", filter: "blur(80px)" }}
      />

      {/* ── Subtle grid overlay ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Floating particles (client-only, no SSR) ──────────────────── */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white animate-float-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-xl text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
          <Keyboard className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-white/80 text-xs font-medium tracking-wide">TechHat Typing Master</span>
        </div>

        {/* Main headline */}
        <h1 className="text-6xl font-black text-white mb-4 leading-tight">
          Type{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x">
            Faster.
          </span>
        </h1>
        <p className="text-white/55 text-lg mb-10">
          Build speed, accuracy & muscle memory — practice every day.
        </p>

        {/* ── Live typing terminal ──────────────────────────────── */}
        <div className="bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden shadow-2xl shadow-black/50 mb-6">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            </div>
            <span className="text-white/30 text-[11px] font-mono">practice.tsx</span>
            <span className="text-cyan-400/60 text-[10px] font-mono">{current.lang}</span>
          </div>

          {/* Stats row */}
          <div className="flex divide-x divide-white/10">
            {[
              { label: "WPM",      value: wpm,       color: "text-cyan-400"   },
              { label: "Accuracy", value: `${acc}%`, color: "text-emerald-400"},
              { label: "Streak",   value: "🔥 12",   color: "text-amber-400"  },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex-1 py-4 text-center">
                <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                <p className="text-white/30 text-[11px] uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Typing text */}
          <div className="px-5 py-5 font-mono text-[17px] leading-loose tracking-wide text-left min-h-[80px]">
            <span className="text-emerald-400">{current.text.slice(0, typed)}</span>
            <span className="inline-block w-0.5 h-5 bg-cyan-400 animate-pulse align-middle mx-[1px] rounded-sm" />
            <span className="text-white/30">{current.text.slice(typed)}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-200 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Mini keyboard ────────────────────────────────────── */}
        <div className="space-y-2 mt-2">
          {KB_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1.5">
              {row.split("").map((k) => (
                <div
                  key={k}
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold border transition-all duration-75
                    ${activeKey === k
                      ? "bg-cyan-500 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.9)] scale-110"
                      : "bg-white/5 border-white/10 text-white/35"
                    }
                  `}
                >
                  {k}
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* ── Bottom tagline ────────────────────────────────────────────── */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-white/20 text-xs z-10">
        Join 10,000+ learners improving their typing speed
      </p>

    </div>
  );
}
