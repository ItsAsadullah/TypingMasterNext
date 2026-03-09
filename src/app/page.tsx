"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Keyboard,
  BookOpen,
  Timer,
  Gamepad2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap,
  Target,
  TrendingUp,
  Star,
} from "lucide-react";

// ─── Typing animation demo ─────────────────────────────────────────────────

const DEMO_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
];

function TypingDemo() {
  const [textIdx, setTextIdx] = useState(0);
  const [typed, setTyped]     = useState(0);

  useEffect(() => {
    const text = DEMO_TEXTS[textIdx];
    if (typed >= text.length) {
      const t = setTimeout(() => { setTextIdx((i) => (i + 1) % DEMO_TEXTS.length); setTyped(0); }, 1400);
      return () => clearTimeout(t);
    }
    const delay = Math.random() * 55 + 35;
    const t = setTimeout(() => setTyped((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [typed, textIdx]);

  const text = DEMO_TEXTS[textIdx];
  const wpm  = Math.min(Math.round((typed / 5) / (1 / 60)) || 0, 120);
  const acc  = typed > 3 ? 97 : 100;

  return (
    <div className="relative rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm p-6 shadow-2xl shadow-black/40">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 mb-5">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-slate-500 text-xs font-mono">typing-practice.tsx</span>
      </div>

      {/* Stats row */}
      <div className="flex gap-4 mb-5">
        {[
          { label: "WPM",      value: wpm,        color: "text-blue-400"    },
          { label: "Accuracy", value: `${acc}%`,  color: "text-emerald-400" },
          { label: "Streak",   value: "🔥 7",     color: "text-amber-400"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-slate-900/60 rounded-xl px-3 py-2 text-center">
            <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Text display */}
      <div className="rounded-xl bg-slate-900/80 px-4 py-4 font-mono text-[15px] leading-relaxed min-h-[72px] tracking-wide">
        <span className="text-emerald-400">{text.slice(0, typed)}</span>
        <span className="inline-block w-0.5 h-5 bg-emerald-400 animate-pulse align-middle mx-0.5" />
        <span className="text-slate-500">{text.slice(typed)}</span>
      </div>

      {/* Progress */}
      <div className="mt-3 h-1 rounded-full bg-slate-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-150"
          style={{ width: `${(typed / text.length) * 100}%` }}
        />
      </div>

      {/* Keyboard row */}
      <div className="mt-4 flex justify-center gap-1.5">
        {"ASDFGHJKL".split("").map((k) => (
          <div key={k} className="w-7 h-7 rounded-md bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-400">
            {k}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon:   BookOpen,
    title:  "Structured Lessons",
    desc:   "Start from home row keys and progress through a curated curriculum — from beginner to advanced.",
    color:  "text-emerald-400",
    bg:     "bg-emerald-500/10",
    border: "border-emerald-500/20",
    href:   "/lessons",
  },
  {
    icon:   Timer,
    title:  "Speed Tests",
    desc:   "Take timed 1, 3, or 5-minute tests. Track your WPM and accuracy over time.",
    color:  "text-blue-400",
    bg:     "bg-blue-500/10",
    border: "border-blue-500/20",
    href:   "/speed-test",
  },
  {
    icon:   Gamepad2,
    title:  "Typing Games",
    desc:   "Beat the boredom with falling-word games. Make practice feel like play.",
    color:  "text-violet-400",
    bg:     "bg-violet-500/10",
    border: "border-violet-500/20",
    href:   "/games",
  },
  {
    icon:   BarChart3,
    title:  "Progress Analytics",
    desc:   "Visualize your speed history, accuracy trends, and personal records at a glance.",
    color:  "text-amber-400",
    bg:     "bg-amber-500/10",
    border: "border-amber-500/20",
    href:   "/profile",
  },
];

// ─── Steps ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num:   "01",
    icon:  Star,
    title: "Create a free account",
    desc:  "Sign up in seconds — no credit card required.",
    color: "text-emerald-400",
    ring:  "ring-emerald-500/30",
  },
  {
    num:   "02",
    icon:  Target,
    title: "Pick your learning path",
    desc:  "Choose from structured lessons, free practice, or quick speed tests.",
    color: "text-blue-400",
    ring:  "ring-blue-500/30",
  },
  {
    num:   "03",
    icon:  TrendingUp,
    title: "Track your growth",
    desc:  "Watch your WPM climb as you build muscle memory and accuracy.",
    color: "text-violet-400",
    ring:  "ring-violet-500/30",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orbs */}
      <div className="pointer-events-none fixed top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-100px] right-[-150px] w-[600px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <header className="relative z-50 border-b border-slate-800/60 backdrop-blur-md bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <Keyboard className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none">TechHat</span>
              <span className="block text-slate-400 text-[11px] leading-none">Typing Master</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features"     className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#languages"    className="hover:text-white transition-colors">Languages</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login"    className="px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-all">Log in</Link>
            <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium mb-6">
              <Zap className="w-3.5 h-3.5" />
              Free Bilingual Typing Tutor
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Master Typing{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                at Lightning Speed
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
              Learn{" "}
              <span className="text-white font-medium">Bangla</span> (Bijoy &amp; Avro) and{" "}
              <span className="text-white font-medium">English</span> typing — with
              structured lessons, real-time speed tests, and games that make practice feel effortless.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-[15px] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02]"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-[15px] border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Try Practice Mode
              </Link>
            </div>

            <ul className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start text-sm text-slate-400">
              {["No credit card required", "Free forever plan", "Works on all devices"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block">
            <TypingDemo />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────── */}
      <div className="relative z-10 border-y border-slate-800/60 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10,000+", label: "Active Learners"     },
            { value: "50 WPM",  label: "Avg. Improvement"    },
            { value: "99%",     label: "Uptime"              },
            { value: "2 langs", label: "Bangla & English"    },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{value}</p>
              <p className="text-slate-500 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-4xl font-extrabold">
            One platform,{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              complete typing mastery
            </span>
          </h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">
            From your very first lesson to 100+ WPM — every tool you need is built-in.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg, border, href }) => (
            <Link
              key={title}
              href={href}
              className={`group relative rounded-2xl ${bg} border ${border} p-6 hover:scale-[1.02] transition-all duration-200 hover:shadow-xl hover:shadow-black/30`}
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${bg} border ${border} ${color} mb-4`}>
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              <div className={`mt-4 inline-flex items-center gap-1 text-xs ${color} font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl font-extrabold">Get started in minutes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ num, icon: Icon, title, desc, color, ring }) => (
              <div key={num} className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 ring-4 ${ring} mb-5 mx-auto shadow-xl`}>
                  <Icon className={`w-8 h-8 ${color}`} strokeWidth={1.5} />
                </div>
                <div className={`inline-block text-xs font-bold ${color} mb-2 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700`}>
                  STEP {num}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LANGUAGES ───────────────────────────────────────────────── */}
      <section id="languages" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-medium mb-5">
              <Globe className="w-3.5 h-3.5" />
              Bilingual Support
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight">
              Type in{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Bangla &amp; English
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              The only typing tutor built specifically for Bangladeshi learners. Master both Bijoy and Avro keyboard layouts, as well as standard English.
            </p>
            <ul className="space-y-3">
              {[
                "বিজয় কীবোর্ড লেয়আউট (Bijoy Layout)",
                "অভ্র কীবোর্ড লেয়আউট (Avro Layout)",
                "English QWERTY / Touch Typing",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-[15px]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                flag:   "🇧🇩",
                lang:   "বাংলা",
                sub:    "Bangla",
                items:  ["Bijoy কীবোর্ড", "Avro ফোনেটিক", "ইউনিকোড সাপোর্ট"],
                color:  "text-emerald-400",
                bullet: "bg-emerald-500",
                border: "border-emerald-500/20",
                bg:     "bg-emerald-500/5",
              },
              {
                flag:   "🇬🇧",
                lang:   "English",
                sub:    "International",
                items:  ["QWERTY layout", "Touch typing", "10-finger method"],
                color:  "text-blue-400",
                bullet: "bg-blue-500",
                border: "border-blue-500/20",
                bg:     "bg-blue-500/5",
              },
            ].map(({ flag, lang, sub, items, color, bullet, border, bg }) => (
              <div key={lang} className={`rounded-2xl ${bg} border ${border} p-6`}>
                <div className="text-4xl mb-3">{flag}</div>
                <h3 className={`font-bold text-xl mb-0.5 ${color}`}>{lang}</h3>
                <p className="text-slate-500 text-xs mb-4">{sub}</p>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-400 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${bullet} shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-slate-900 border border-emerald-500/20 overflow-hidden p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent pointer-events-none" />
          <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-emerald-600/15 blur-[80px] pointer-events-none" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-xl shadow-emerald-500/30 mb-6 mx-auto">
              <Keyboard className="w-8 h-8 text-white" strokeWidth={1.75} />
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
              Ready to type{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">faster?</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
              Join thousands of learners who improved their typing speed with TechHat Typing Master.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-semibold text-base hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 hover:scale-[1.02]"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-800/80 text-slate-200 font-semibold text-base border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Keyboard className="w-4 h-4 text-emerald-400" strokeWidth={2} />
              </div>
              <span className="text-slate-400 text-sm">
                <span className="text-slate-200 font-semibold">TechHat</span> Typing Master
              </span>
            </div>

            <nav className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/login"      className="hover:text-slate-300 transition-colors">Log in</Link>
              <Link href="/register"   className="hover:text-slate-300 transition-colors">Register</Link>
              <Link href="/practice"   className="hover:text-slate-300 transition-colors">Practice</Link>
              <Link href="/speed-test" className="hover:text-slate-300 transition-colors">Speed Test</Link>
            </nav>

            <p className="text-slate-600 text-xs">
              &copy; {new Date().getFullYear()} TechHat — Made with ❤️ by{" "}
              <a href="https://techhat.shop" className="text-slate-500 hover:text-slate-300 transition-colors">
                Md Asadullah
              </a>{" "}
              · Jhenaidah, Bangladesh
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


