"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Play, Clock, BookOpen,
  Lock, Zap, Trophy, Keyboard, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { useCourse } from "@/context/CourseContext";
import { useLang } from "@/context/LangContext";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface CourseItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  durationEn: string;
  durationBn: string;
  lessonsCount: number;
  progress: number;
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
  href: string;
  locked: boolean;
  badge?: { en: string; bn: string };
  subItems?: { en: string; bn: string; emoji: string }[];
}

const COURSES_LIST: CourseItem[] = [
  {
    id: "fast-touch",
    titleEn: "Fast Touch Typing",
    titleBn: "ফাস্ট টাচ টাইপিং",
    descEn: "Learn to type without looking at the keyboard. Starting from home row keys, you'll master every key step by step with structured lessons.",
    descBn: "কীবোর্ডের দিকে না তাকিয়ে টাইপ করতে শিখুন। হোম রো কী থেকে শুরু করে ধাপে ধাপে প্রতিটি কী আয়ত্ত করুন।",
    durationEn: "3 – 5 hours",
    durationBn: "৩ – ৫ ঘণ্টা",
    lessonsCount: 12,
    progress: 0,
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500",
    icon: <Keyboard className="w-6 h-6 text-white" />,
    href: "/lessons",
    locked: false,
    badge: { en: "Start Here", bn: "এখান থেকে শুরু" },
  },
  {
    id: "speed-building",
    titleEn: "Speed Building",
    titleBn: "স্পিড বিল্ডিং",
    descEn: "Once you know the keys, this course pushes your speed beyond 60 WPM with rhythm drills, burst exercises, and timed sprints.",
    descBn: "কী জানার পর এই কোর্স আপনাকে ৬০+ WPM-এ নিয়ে যাবে — রিদম ড্রিল, বার্স্ট এক্সারসাইজ ও টাইমড স্প্রিন্টের মাধ্যমে।",
    durationEn: "4 – 6 hours",
    durationBn: "৪ – ৬ ঘণ্টা",
    lessonsCount: 10,
    progress: 0,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500",
    icon: <Zap className="w-6 h-6 text-white" />,
    href: "/courses/speed-building",
    locked: true,
  },
  {
    id: "extra",
    titleEn: "Extra Courses",
    titleBn: "অতিরিক্ত কোর্স",
    descEn: "Specialized practice for numbers, symbols, and the numeric keypad to achieve complete keyboard mastery.",
    descBn: "সংখ্যা, প্রতীক ও নিউমেরিক কীপ্যাডের বিশেষ অনুশীলন — সম্পূর্ণ কীবোর্ড দক্ষতার জন্য।",
    durationEn: "2 – 3 hours",
    durationBn: "২ – ৩ ঘণ্টা",
    lessonsCount: 8,
    progress: 0,
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500",
    icon: <Trophy className="w-6 h-6 text-white" />,
    href: "/courses/extra",
    locked: true,
    subItems: [
      { en: "Keyboarding",       bn: "কীবোর্ডিং",       emoji: "⌨️" },
      { en: "Numbers & Symbols", bn: "সংখ্যা ও প্রতীক", emoji: "🔢" },
      { en: "Specials",          bn: "স্পেশাল কী",       emoji: "✳️" },
      { en: "10-Key Numpad",     bn: "১০-কী নামপ্যাড",  emoji: "🔑" },
    ],
  },
];

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  item,
  lang,
  defaultOpen,
}: {
  item: CourseItem;
  lang: "en" | "bn";
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const title    = lang === "en" ? item.titleEn    : item.titleBn;
  const desc     = lang === "en" ? item.descEn     : item.descBn;
  const duration = lang === "en" ? item.durationEn : item.durationBn;

  const notStarted = lang === "en" ? "Not started" : "শুরু হয়নি";
  const progressLabel = item.progress === 0 ? notStarted : `${item.progress}%`;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200
      bg-white dark:bg-slate-800/60
      border-slate-200 dark:border-slate-700/50
      shadow-sm
      ${item.locked ? "opacity-60" : ""}
    `}>

      {/* ── Header ── */}
      <button
        onClick={() => !item.locked && setOpen((v) => !v)}
        className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors
          ${item.locked
            ? "cursor-not-allowed"
            : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
          }
        `}
      >
        {/* Icon */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${item.iconBg} shrink-0 shadow`}>
          {item.locked ? <Lock className="w-5 h-5 text-white/80" /> : item.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[17px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {title}
            </span>
            {item.badge && !item.locked && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${item.gradient} text-white`}>
                {lang === "en" ? item.badge.en : item.badge.bn}
              </span>
            )}
            {item.locked && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full
                bg-slate-100 dark:bg-slate-700
                text-slate-400 dark:text-slate-500
                border border-slate-200 dark:border-slate-600">
                🔒 {lang === "en" ? "Locked" : "লক"}
              </span>
            )}
          </div>
          <p className="text-[13px] text-slate-400 dark:text-slate-500">
            {lang === "en"
              ? `${item.lessonsCount} lessons  ·  ${duration}`
              : `${item.lessonsCount}টি পাঠ  ·  ${duration}`}
          </p>
        </div>

        {/* Chevron */}
        {!item.locked && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          </motion.div>
        )}
      </button>

      {/* ── Expanded Body ── */}
      <AnimatePresence initial={false}>
        {open && !item.locked && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 space-y-5
              border-t border-slate-100 dark:border-slate-700/50"
            >

              {/* Description */}
              <p className="pt-3 text-[15px] leading-relaxed
                text-slate-600 dark:text-slate-300">
                {desc}
              </p>

              {/* Sub-items */}
              {item.subItems && (
                <div className="grid grid-cols-2 gap-2">
                  {item.subItems.map((s) => (
                    <div key={s.en} className="flex items-center gap-3 rounded-xl px-4 py-3
                      bg-slate-50 dark:bg-slate-700/50
                      border border-slate-100 dark:border-slate-600/50">
                      <span className="text-xl">{s.emoji}</span>
                      <span className="text-[14px] font-medium text-slate-700 dark:text-slate-200">
                        {lang === "en" ? s.en : s.bn}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: <Clock className="w-4 h-4" />,
                    label: lang === "en" ? "Duration" : "সময়কাল",
                    value: duration,
                  },
                  {
                    icon: <BookOpen className="w-4 h-4" />,
                    label: lang === "en" ? "Lessons" : "পাঠ",
                    value: lang === "en" ? `${item.lessonsCount} lessons` : `${item.lessonsCount}টি পাঠ`,
                  },
                  {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    label: lang === "en" ? "Progress" : "অগ্রগতি",
                    value: progressLabel,
                  },
                ].map((stat) => (
                  <div key={stat.label}
                    className="rounded-xl px-4 py-3 space-y-1
                      bg-slate-50 dark:bg-slate-700/50
                      border border-slate-100 dark:border-slate-600/40"
                  >
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {stat.icon}
                      <span className="text-[11px] font-semibold uppercase tracking-wide">
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Progress bar (only if started) */}
              {item.progress > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{lang === "en" ? "Progress" : "অগ্রগতি"}</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                href={item.href}
                className={`inline-flex items-center gap-2.5 rounded-xl px-7 py-3
                  bg-gradient-to-r ${item.gradient} text-white font-semibold text-[15px]
                  shadow hover:shadow-md hover:opacity-95 active:scale-[0.98] transition-all`}
              >
                <Play className="w-4 h-4 fill-white" />
                {item.progress > 0
                  ? (lang === "en" ? "Continue" : "চালিয়ে যান")
                  : (lang === "en" ? "Start Now" : "শুরু করুন")}
              </Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const { course } = useCourse();
  const { lang }   = useLang();

  const courseName = course ? (lang === "en" ? course.nameEn : course.nameBn) : "English";

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-7">

      {/* ── Back Button ── */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "en" ? "Back to Dashboard" : "ড্যাশবোর্ডে ফিরুন"}
      </Link>

      {/* ── Page Title ── */}
      <div className="space-y-2">
        <p className="text-[13px] font-medium flex items-center gap-1">
          <Link href="/dashboard" className="text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            {lang === "en" ? "Learning Path" : "শেখার পথ"}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">›</span>
          <Link href="/lessons" className="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
            {courseName}
          </Link>
        </p>
        <h1 className="text-[28px] font-bold leading-tight
          text-slate-800 dark:text-slate-50">
          {lang === "en" ? "Your Courses" : "আপনার কোর্সসমূহ"}
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Complete courses in order — finish one to unlock the next."
            : "কোর্সগুলো ক্রমানুসারে করুন — একটি শেষ করলে পরেরটি আনলক হবে।"}
        </p>
      </div>

      {/* ── Course Cards ── */}
      <div className="space-y-4">
        {COURSES_LIST.map((item, idx) => (
          <CourseCard
            key={item.id}
            item={item}
            lang={lang}
            defaultOpen={idx === 0}
          />
        ))}
      </div>

      {/* ── Tip ── */}
      <p className="text-[13px] text-center text-slate-400 dark:text-slate-600 pb-2">
        {lang === "en"
          ? "💡 15–20 minutes of daily practice gives the best results."
          : "💡 প্রতিদিন ১৫–২০ মিনিট অনুশীলন সবচেয়ে ভালো ফলাফল দেয়।"}
      </p>

    </div>
  );
}
