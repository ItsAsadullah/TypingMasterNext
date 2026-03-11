"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Zap, Target, Flame, Trophy, Clock, BookOpen,
  Timer, Gamepad2, PenLine, TrendingUp, ChevronRight,
  Star, Award, Keyboard, ArrowUpRight, Sparkles,
  BarChart3, RefreshCw, Languages,
} from "lucide-react";
import { useCourse, COURSES, CourseId } from "@/context/CourseContext";
import { useLang } from "@/context/LangContext";
import CourseSelector from "@/components/course/CourseSelector";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StatsData {
  totalTests: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalMinutes: number;
  streak: number;
  recentRecords: {
    id: string;
    wpm: number;
    accuracy: number;
    timeSpent: number;
    lessonTitle: string;
    difficulty: string;
    createdAt: string;
  }[];
  wpmHistory: { wpm: number; date: string }[];
  user: { name: string; createdAt: string };
}

// ── WPM Sparkline ─────────────────────────────────────────────────────────────

function WpmSparkline({
  data,
  accentColor,
}: {
  data: { wpm: number }[];
  accentColor: string;
}) {
  if (!data.length) return null;
  const W = 280, H = 72, pad = 6;
  const max   = Math.max(...data.map((d) => d.wpm), 1);
  const min   = Math.min(...data.map((d) => d.wpm), 0);
  const range = max - min || 1;

  const pts = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
    const y = H - pad - ((d.wpm - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  });

  const areaBottom = `${pts[pts.length - 1].split(",")[0]},${H - pad} ${pad},${H - pad}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-18">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={accentColor} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={`${pts.join(" ")} ${areaBottom}`} fill="url(#sparkGrad)" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((p, i) => {
        const [x, y] = p.split(",");
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={accentColor} stroke="white" strokeWidth="1.5" />
        );
      })}
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function DiffBadge({ diff, lang }: { diff: string; lang: "en" | "bn" }) {
  const styles: Record<string, string> = {
    BEGINNER:     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
    INTERMEDIATE: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    ADVANCED:     "bg-red-500/15 text-red-400 border border-red-500/25",
  };
  const labelsEn: Record<string, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };
  const labelsBn: Record<string, string> = { BEGINNER: "শিক্ষানবিশ", INTERMEDIATE: "মধ্যবর্তী", ADVANCED: "উন্নত" };
  const labels = lang === "en" ? labelsEn : labelsBn;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[diff] ?? "bg-slate-700 text-slate-400"}`}>
      {labels[diff] ?? diff}
    </span>
  );
}

function greeting(lang: "en" | "bn") {
  const h = new Date().getHours();
  if (lang === "en") {
    if (h < 12) return "Good morning"; if (h < 17) return "Good afternoon"; return "Good evening";
  }
  if (h < 12) return "শুভ সকাল"; if (h < 17) return "শুভ বিকেল"; return "শুভ সন্ধ্যা";
}

function timeAgo(dateStr: string, lang: "en" | "bn") {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (lang === "en") {
    if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`; return `${Math.floor(h / 24)}d ago`;
  }
  if (m < 1) return "এইমাত্র"; if (m < 60) return `${m} মিনিট আগে`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} ঘণ্টা আগে`; return `${Math.floor(h / 24)} দিন আগে`;
}

// ── Quick-action sets per course type ─────────────────────────────────────────

const NAV_ITEMS_EN = [
  { href: "/practice",   icon: PenLine,  en: "Practice",       bn: "অনুশীলন",     descEn: "Free typing session",     descBn: "মুক্ত টাইপিং",       color: "from-emerald-500 to-teal-500",  shadow: "shadow-emerald-500/20" },
  { href: "/speed-test", icon: Timer,    en: "Speed Test",     bn: "স্পিড টেস্ট",  descEn: "Measure WPM & accuracy",  descBn: "WPM পরিমাপ",           color: "from-blue-500 to-cyan-500",     shadow: "shadow-blue-500/20"    },
  { href: "/lessons",    icon: BookOpen, en: "Lessons",        bn: "পাঠ",           descEn: "Structured curriculum",   descBn: "কাঠামোবদ্ধ পাঠ",     color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20"  },
  { href: "/games",      icon: Gamepad2, en: "Games",          bn: "গেমস",          descEn: "Learn while having fun",  descBn: "মজার গেমস",            color: "from-amber-500 to-orange-500",  shadow: "shadow-amber-500/20"   },
];

const NAV_ITEMS_BN = [
  { href: "/lessons",    icon: BookOpen, en: "Bangla Lessons", bn: "বাংলা পাঠ",    descEn: "Structured Bangla path",  descBn: "বাংলা পাঠ্যক্রম",    color: "from-emerald-500 to-teal-500",  shadow: "shadow-emerald-500/20" },
  { href: "/practice",   icon: PenLine,  en: "Practice",       bn: "অনুশীলন",     descEn: "Free Bangla typing",      descBn: "মুক্ত বাংলা টাইপিং", color: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20"  },
  { href: "/speed-test", icon: Timer,    en: "Speed Test",     bn: "স্পিড টেস্ট",  descEn: "Test your Bangla speed",  descBn: "গতি পরিমাপ",           color: "from-blue-500 to-cyan-500",     shadow: "shadow-blue-500/20"    },
  { href: "/games",      icon: Gamepad2, en: "Games",          bn: "গেমস",          descEn: "Bangla typing games",     descBn: "বাংলা গেমস",           color: "from-amber-500 to-orange-500",  shadow: "shadow-amber-500/20"   },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session }             = useSession();
  const { course, clearCourse }       = useCourse();
  const { lang }                      = useLang();
  const [stats,   setStats]           = useState<StatsData | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/user/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Show course selector if user hasn't chosen yet ────────────────────────
  if (!course) return <CourseSelector />;

  const firstName = (session?.user?.name ?? stats?.user?.name ?? "Learner").split(" ")[0];
  const isEmpty   = !loading && stats?.totalTests === 0;
  const isBangla  = course.id !== "en";
  const navItems  = isBangla ? NAV_ITEMS_BN : NAV_ITEMS_EN;

  const statCards = [
    { label: lang === "en" ? "Best WPM"   : "সেরা WPM",       value: loading ? "—" : stats?.bestWpm      ?? 0,     icon: Zap,        color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
    { label: lang === "en" ? "Avg WPM"    : "গড় WPM",         value: loading ? "—" : stats?.avgWpm       ?? 0,     icon: TrendingUp, color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
    { label: lang === "en" ? "Accuracy"   : "নির্ভুলতা",       value: loading ? "—" : `${stats?.avgAccuracy ?? 0}%`, icon: Target,     color: course.accentText,  bg: course.accentBg,     border: course.accentBorder     },
    { label: lang === "en" ? "Tests Done" : "টেস্ট সম্পন্ন",  value: loading ? "—" : stats?.totalTests   ?? 0,     icon: Trophy,     color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
    { label: lang === "en" ? "Minutes"    : "মিনিট",            value: loading ? "—" : stats?.totalMinutes ?? 0,     icon: Clock,      color: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20"    },
    { label: lang === "en" ? "Day Streak" : "একটানা দিন",      value: loading ? "—" : stats?.streak       ?? 0,     icon: Flame,      color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20"  },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">

      {/* ── Course switch strip ───────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">
            {lang === "en" ? "Want to learn a different language?" : "অন্য কোর্সে যেতে চান?"}
          </span>
        </div>
        <button
          onClick={clearCourse}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          {lang === "en" ? "Switch course" : "কোর্স পরিবর্তন"}
        </button>
      </div>

      {/* ── Welcome banner ────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden rounded-2xl border ${course.accentBorder} shadow-xl px-7 py-6`}
        style={{ background: `linear-gradient(135deg, rgb(15 23 42) 0%, rgb(15 23 42 / 0.95) 60%, ${course.accentColor}18 100%)` }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20" style={{ background: course.accentColor }} />
        <div className="absolute -bottom-6 left-20 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-10" style={{ background: course.accentColor }} />

        <div className="relative flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${course.accentBg} ${course.accentText} border ${course.accentBorder}`}>
                {course.emoji} {lang === "en" ? course.nameEn : course.nameBn}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className={`w-4 h-4 ${course.accentText}`} />
              <span className={`${course.accentText} text-sm font-medium`}>{greeting(lang)}</span>
            </div>
            <h2 className="text-white text-2xl font-bold tracking-tight mb-1">
              {lang === "en"
                ? <><span>Welcome back, </span><span className={course.accentText}>{firstName}</span>!</>
                : <><span>স্বাগতম, </span><span className={course.accentText}>{firstName}</span>!</>
              }
            </h2>
            <p className="text-slate-400 text-sm">
              {isEmpty
                ? (lang === "en" ? "No tests yet — let's get started!" : "এখনো কোনো টেস্ট নেই — শুরু করুন!")
                : (lang === "en"
                    ? `You've completed ${stats?.totalTests} test${(stats?.totalTests ?? 0) !== 1 ? "s" : ""}. Keep pushing!`
                    : `আপনি ${stats?.totalTests}টি টেস্ট সম্পন্ন করেছেন। চালিয়ে যান!`)
              }
            </p>
          </div>
          <div className={`hidden sm:flex shrink-0 w-16 h-16 rounded-2xl ${course.accentBg} border ${course.accentBorder} items-center justify-center`}>
            <Keyboard className={`w-8 h-8 ${course.accentText}`} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 flex flex-col gap-2 backdrop-blur-sm`}>
            <div className="w-8 h-8 rounded-xl bg-slate-800 shadow-sm flex items-center justify-center">
              <Icon className={`w-4 h-4 ${color}`} strokeWidth={2} />
            </div>
            <div>
              <p className="text-slate-100 text-xl font-bold leading-none">{value}</p>
              <p className="text-slate-500 text-[11px] font-medium mt-0.5 uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* WPM Chart */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-100 font-semibold text-sm">{lang === "en" ? "WPM Progress" : "WPM অগ্রগতি"}</h3>
              <p className="text-slate-500 text-xs">{lang === "en" ? `Last ${stats?.wpmHistory.length ?? 0} sessions` : `শেষ ${stats?.wpmHistory.length ?? 0}টি সেশন`}</p>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-medium ${course.accentBg} ${course.accentText} border ${course.accentBorder} px-2.5 py-1 rounded-full`}>
              <TrendingUp className="w-3.5 h-3.5" />{lang === "en" ? "Trend" : "ট্রেন্ড"}
            </span>
          </div>
          {!stats?.wpmHistory.length ? (
            <div className="flex flex-col items-center justify-center h-20 gap-2 text-slate-500">
              <TrendingUp className="w-8 h-8 text-slate-700" />
              <p className="text-xs text-center">{lang === "en" ? "No data yet — complete a test to see progress" : "এখনো কোনো তথ্য নেই — একটি টেস্ট দিন"}</p>
            </div>
          ) : (
            <>
              <WpmSparkline data={stats.wpmHistory} accentColor={course.accentColor} />
              <div className="flex justify-between mt-1 px-1">
                <span className="text-[10px] text-slate-500">{lang === "en" ? "Oldest" : "পুরানো"}</span>
                <span className="text-[10px] text-slate-500">{lang === "en" ? "Latest" : "সর্বশেষ"}</span>
              </div>
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm shadow-sm p-5">
          <h3 className="text-slate-100 font-semibold text-sm mb-4">{lang === "en" ? "Quick Start" : "দ্রুত শুরু"}</h3>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map(({ href, icon: Icon, en, bn, descEn, descBn, color, shadow }) => (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col gap-2 rounded-xl p-3 bg-gradient-to-br ${color} hover:scale-[1.04] active:scale-95 transition-all duration-150 shadow-lg ${shadow}`}
              >
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold leading-tight">{lang === "en" ? en : bn}</p>
                  <p className="text-white/70 text-[10px] leading-tight mt-0.5">{lang === "en" ? descEn : descBn}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent activity ───────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          <div>
            <h3 className="text-slate-100 font-semibold text-sm">{lang === "en" ? "Recent Activity" : "সাম্প্রতিক কার্যক্রম"}</h3>
            <p className="text-slate-500 text-xs">{lang === "en" ? "Your last typing sessions" : "আপনার শেষ টাইপিং সেশন"}</p>
          </div>
          <Link href="/profile" className={`flex items-center gap-1 ${course.accentText} text-xs font-medium hover:underline`}>
            {lang === "en" ? "View all" : "সব দেখুন"}<ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {!stats?.recentRecords.length ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
              <Keyboard className="w-8 h-8 text-slate-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-slate-200 font-semibold">{lang === "en" ? "No sessions yet" : "এখনো কোনো সেশন নেই"}</p>
              <p className="text-slate-500 text-sm mt-1">{lang === "en" ? "Complete your first typing test to track progress here." : "প্রথম টাইপিং টেস্ট দিন — অগ্রগতি এখানে দেখানো হবে।"}</p>
            </div>
            <Link href="/speed-test" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${course.accent} text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg`}>
              <Zap className="w-4 h-4" />{lang === "en" ? "Start First Test" : "প্রথম টেস্ট শুরু করুন"}<ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/40">
                  <th className="text-left px-5 py-3 font-semibold">{lang === "en" ? "Lesson" : "পাঠ"}</th>
                  <th className="text-center px-4 py-3 font-semibold">WPM</th>
                  <th className="text-center px-4 py-3 font-semibold">{lang === "en" ? "Accuracy" : "নির্ভুলতা"}</th>
                  <th className="text-center px-4 py-3 font-semibold">{lang === "en" ? "Time" : "সময়"}</th>
                  <th className="text-center px-4 py-3 font-semibold">{lang === "en" ? "Level" : "স্তর"}</th>
                  <th className="text-right px-5 py-3 font-semibold">{lang === "en" ? "When" : "কখন"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {stats.recentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5 text-slate-200 font-medium max-w-[180px] truncate">{r.lessonTitle}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-bold ${r.wpm >= 60 ? "text-emerald-400" : r.wpm >= 40 ? "text-blue-400" : "text-slate-400"}`}>{r.wpm}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`font-medium ${r.accuracy >= 95 ? "text-emerald-400" : r.accuracy >= 85 ? "text-amber-400" : "text-red-400"}`}>{r.accuracy}%</span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-400">{r.timeSpent < 60 ? `${r.timeSpent}s` : `${Math.round(r.timeSpent / 60)}m`}</td>
                    <td className="px-4 py-3.5 text-center"><DiffBadge diff={r.difficulty} lang={lang} /></td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-xs">{timeAgo(r.createdAt, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Achievements ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-slate-100 font-semibold text-sm">{lang === "en" ? "Achievements" : "অর্জন"}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { lEn: "First Test",    lBn: "প্রথম টেস্ট",   dEn: "Complete first test", dBn: "প্রথম টেস্ট দিন",   icon: Star,   earned: (stats?.totalTests ?? 0) >= 1,                                  eb: "bg-amber-500/10",   ebd: "border-amber-500/25",   ib: "bg-amber-500/20",   ic: "text-amber-400"   },
            { lEn: "Speed Demon",   lBn: "গতির রাজা",      dEn: "Reach 60+ WPM",       dBn: "৬০+ WPM অর্জন",     icon: Zap,    earned: (stats?.bestWpm ?? 0) >= 60,                                    eb: "bg-blue-500/10",    ebd: "border-blue-500/25",    ib: "bg-blue-500/20",    ic: "text-blue-400"    },
            { lEn: "Perfectionist", lBn: "নিখুঁত",         dEn: "100% accuracy",        dBn: "১০০% নির্ভুলতা",    icon: Target, earned: stats?.recentRecords?.some((r) => r.accuracy === 100) ?? false,  eb: "bg-emerald-500/10", ebd: "border-emerald-500/25", ib: "bg-emerald-500/20", ic: "text-emerald-400" },
            { lEn: "Consistent",    lBn: "ধারাবাহিক",       dEn: "3-day streak",         dBn: "৩ দিনের স্ট্রিক",   icon: Flame,  earned: (stats?.streak ?? 0) >= 3,                                      eb: "bg-orange-500/10",  ebd: "border-orange-500/25",  ib: "bg-orange-500/20",  ic: "text-orange-400"  },
          ].map(({ lEn, lBn, dEn, dBn, icon: Icon, earned, eb, ebd, ib, ic }) => (
            <div key={lEn} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${earned ? `${ebd} ${eb}` : "border-slate-700/40 bg-slate-900/30 opacity-40"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${earned ? ib : "bg-slate-800"}`}>
                <Icon className={`w-4 h-4 ${earned ? ic : "text-slate-600"}`} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold leading-tight ${earned ? "text-slate-100" : "text-slate-500"}`}>{lang === "en" ? lEn : lBn}</p>
                <p className="text-[10px] text-slate-500 leading-tight truncate">{lang === "en" ? dEn : dBn}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── All courses overview ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <h3 className="text-slate-200 font-semibold text-sm">{lang === "en" ? "All Courses" : "সব কোর্স"}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COURSES.map((c) => {
            const isActive = c.id === course.id;
            return (
              <button
                key={c.id}
                onClick={() => { if (!isActive) clearCourse(); }}
                disabled={isActive}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left
                  ${isActive ? `${c.accentBorder} ${c.accentBg} cursor-default` : "border-slate-700/40 hover:border-slate-600 hover:bg-slate-700/30 cursor-pointer"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${c.accent} shadow-sm shrink-0`}>{c.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold leading-tight ${isActive ? c.accentText : "text-slate-200"}`}>{lang === "en" ? c.nameEn : c.nameBn}</p>
                  <p className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${isActive ? c.accentText : "text-slate-500"}`}>{c.tag}</p>
                </div>
                {isActive
                  ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.accentBg} ${c.accentText} border ${c.accentBorder} shrink-0`}>{lang === "en" ? "Active" : "সক্রিয়"}</span>
                  : <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
