"use client";

// =============================================================================
//  /lessons  — full gamified curriculum browser
//
//  Breadcrumb flow:   Modules → Module → Lesson → Drill (GamifiedTypingEngine)
//  After finishing:   DrillResults modal
// =============================================================================

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Star, BookOpen, ArrowLeft, ArrowRight, BookText, Lightbulb, Keyboard, AlignLeft, CheckCircle2 } from "lucide-react";
import {
  ENGLISH_COURSE,
  type Drill,
  type Module,
  type Lesson,
  type IntroPage,
} from "@/data/englishCurriculum";
import { useLang } from "@/context/LangContext";
import { useProgress } from "@/hooks/useProgress";
import GamifiedTypingEngine, {
  type DrillCompleteStats,
} from "@/components/typing/GamifiedTypingEngine";
import DrillResults from "@/components/typing/DrillResults";

// ─── Types ────────────────────────────────────────────────────────────────────

type View =
  | { kind: "modules" }
  | { kind: "module";  mod: Module }
  | { kind: "lesson";  mod: Module; lesson: Lesson }
  | { kind: "drill";   mod: Module; lesson: Lesson; drill: Drill; drillIdx: number };

// ─── URL ↔ View helpers ───────────────────────────────────────────────────────
//
//  We encode the active view into URL search params so a page refresh always
//  lands on the exact same screen — no hydration mismatch, no localStorage race.
//
//  Param layout:
//    ?v=module&m=<modId>
//    ?v=lesson&m=<modId>&l=<lessonId>
//    ?v=drill &m=<modId>&l=<lessonId>&d=<drillId>&i=<drillIdx>

const DEFAULT_VIEW: View = { kind: "module", mod: ENGLISH_COURSE.modules[0] };

function viewToSearch(v: View): string {
  const p = new URLSearchParams();
  if (v.kind === "module") {
    p.set("v", "module"); p.set("m", v.mod.id);
  } else if (v.kind === "lesson") {
    p.set("v", "lesson"); p.set("m", v.mod.id); p.set("l", v.lesson.id);
  } else if (v.kind === "drill") {
    p.set("v", "drill");  p.set("m", v.mod.id); p.set("l", v.lesson.id);
    p.set("d", v.drill.id); p.set("i", String(v.drillIdx));
  }
  return p.toString();
}

function viewFromSearch(search: string): View {
  const p = new URLSearchParams(search);
  const kind = p.get("v");
  if (!kind) return DEFAULT_VIEW;

  const mod = ENGLISH_COURSE.modules.find(m => m.id === p.get("m")) ?? null;
  if (!mod) return DEFAULT_VIEW;

  if (kind === "module") return { kind: "module", mod };

  const lesson = mod.lessons.find(l => l.id === p.get("l")) ?? null;
  if (!lesson) return { kind: "module", mod };

  if (kind === "lesson") return { kind: "lesson", mod, lesson };

  if (kind === "drill") {
    const drillId  = p.get("d") ?? "";
    const drillIdx = parseInt(p.get("i") ?? "0", 10);
    // Match by both id and index for robustness
    const drill = lesson.drills.find(d => d.id === drillId)
               ?? lesson.drills[drillIdx]
               ?? lesson.drills[0];
    if (!drill) return { kind: "lesson", mod, lesson };
    const actualIdx = lesson.drills.indexOf(drill);
    return { kind: "drill", mod, lesson, drill, drillIdx: actualIdx };
  }

  return DEFAULT_VIEW;
}

// ─── Simple star row ─────────────────────────────────────────────────────────

function StarRow({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
        />
      ))}
    </span>
  );
}

// ─── Module Card ─────────────────────────────────────────────────────────────

function ModuleCard({
  mod,
  onClick,
}: {
  mod: Module;
  onClick: () => void;
}) {
  const totalDrills = mod.lessons.reduce((sum, l) => sum + l.drills.length, 0);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left w-full"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner`}
        style={{ background: `var(--color-${mod.color}-100, #f0fdf4)` }}
      >
        {mod.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-base truncate">{mod.title}</p>
        <p className="text-slate-400 text-xs truncate">{mod.subtitle}</p>
        <p className="text-slate-300 text-[10px] mt-0.5 uppercase tracking-wider">
          {mod.lessons.length} lessons · {totalDrills} drills
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
    </motion.button>
  );
}

// ─── Lesson Card ─────────────────────────────────────────────────────────────

function LessonCard({
  lesson,
  completedCount,
  onClick,
}: {
  lesson: Lesson;
  completedCount: number;
  onClick: () => void;
}) {
  const total = lesson.drills.length;
  const allDone = completedCount === total;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left w-full"
    >
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center relative">
        <BookOpen className="w-5 h-5 text-slate-500" />
        {allDone && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-sm">{lesson.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: total > 0 ? `${Math.round((completedCount / total) * 100)}%` : "0%" }}
            />
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">{completedCount}/{total}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </motion.button>
  );
}

// ─── Drill Card ──────────────────────────────────────────────────────────────

function DrillCard({
  drill,
  index,
  completed,
  onClick,
}: {
  drill: Drill;
  index: number;
  completed: boolean;
  onClick: () => void;
}) {
  const isIntro = drill.type === "intro";
  const isTip   = drill.type === "tip";

  const typeIcon =
    isTip   ? <Lightbulb className="w-4 h-4" /> :
    isIntro ? <BookText  className="w-4 h-4" /> :
    drill.type === "key"       ? <Keyboard  className="w-4 h-4" /> :
    drill.type === "paragraph" ? <AlignLeft className="w-4 h-4" /> :
                                 <BookOpen  className="w-4 h-4" />;

  const iconBg =
    completed ? "bg-emerald-100 text-emerald-600" :
    isTip     ? "bg-amber-100 text-amber-600" :
    isIntro   ? "bg-sky-100 text-sky-600" :
                "bg-slate-100 text-slate-500";

  const diffColor =
    drill.difficulty === "BEGINNER"     ? "bg-emerald-100 text-emerald-700" :
    drill.difficulty === "INTERMEDIATE" ? "bg-blue-100 text-blue-700" :
    drill.difficulty === "ADVANCED"     ? "bg-violet-100 text-violet-700" :
                                          "bg-red-100 text-red-700";

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-4 bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left w-full ${
        completed ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${iconBg}`}>
        {completed ? <CheckCircle2 className="w-4 h-4" /> : typeIcon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${completed ? "text-slate-500" : "text-slate-800"}`}>
          <span className="text-slate-400 font-normal mr-1">{index + 1}.</span>
          {drill.title}
        </p>
        {!isIntro && !isTip && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${diffColor}`}>
              {drill.difficulty}
            </span>
            <span className="text-[10px] text-slate-400">{drill.targetWpm} WPM target</span>
          </div>
        )}
        {(isIntro || isTip) && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isTip ? "Tip" : "Introduction"} · 3 min.
          </p>
        )}
      </div>
      {completed
        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        : (!isIntro && !isTip)
          ? <StarRow count={0} />
          : <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
      }
    </motion.button>
  );
}

// ─── IntroViewer ─────────────────────────────────────────────────────────────

// Highlight inline key names like A, S, D, F, J, K, L, ; etc.
function highlightKeys(text: string) {
  // Match single uppercase letters or keyboard symbols preceded by → or standalone bracketed
  return text.split(/(→\s*[A-Z;])/g).map((chunk, ci) => {
    if (/^→\s*[A-Z;]$/.test(chunk)) {
      const key = chunk.replace(/^→\s*/, "");
      return (
        <span key={ci} className="inline-flex items-center gap-1">
          <span className="text-slate-400 mx-0.5">→</span>
          <kbd className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-bold
            bg-slate-800 dark:bg-slate-700 text-white border border-slate-600 shadow-sm min-w-[26px]">
            {key}
          </kbd>
        </span>
      );
    }
    return chunk;
  });
}

function renderBody(body: string, accentColor: "blue" | "amber" = "blue") {
  const accent = accentColor === "amber"
    ? { dot: "bg-amber-500", num: "bg-amber-500 text-white", head: "border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30" }
    : { dot: "bg-blue-500", num: "bg-blue-600 text-white", head: "border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30" };

  return body.split("\n").map((line, i) => {
    if (line === "") return <div key={i} className="h-2" />;

    const isBullet   = line.startsWith("\u2022 ");
    const isNumbered = /^\d+\.\s/.test(line) || /^[\u09E6-\u09EF]+\.\s/.test(line);
    const isAllCaps  = !isBullet && !isNumbered && line === line.toUpperCase() && line.length > 3 && /[A-Z]/.test(line);
    const isSubHead  = !isBullet && !isNumbered && !isAllCaps && line.endsWith(":") && line.length < 70;
    const isTipLine  = !isSubHead && (line.startsWith("Tip!") || line.startsWith("Tip:") || line.startsWith("টিপ!") || line.startsWith("টিপ:"));
    const isCtaLine   = !isSubHead && (line.startsWith("Press ") || line.startsWith("নিচের ") || line.startsWith("সামনে ")) || (!isSubHead && (line.startsWith("You are ready") || line.startsWith("আপনি প্রস্তুত")));

    if (isBullet) {
      const text = line.slice(2);
      return (
        <div key={i} className="flex gap-3 items-start py-0.5">
          <span className={`mt-[7px] w-2 h-2 rounded-full shrink-0 ${accent.dot}`} />
          <span className="text-slate-700 dark:text-slate-200 text-[16px] leading-relaxed">{highlightKeys(text)}</span>
        </div>
      );
    }

    if (isNumbered) {
      const match = line.match(/^(\d+|[\u09E6-\u09EF]+)\.\s(.+)/);
      const num   = match?.[1] ?? "";
      const text  = match?.[2] ?? line;
      return (
        <div key={i} className="flex gap-3 items-start py-1">
          <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${accent.num}`}>
            {num}
          </span>
          <span className="text-slate-700 dark:text-slate-200 text-[16px] leading-relaxed pt-0.5">{highlightKeys(text)}</span>
        </div>
      );
    }

    if (isAllCaps) {
      return (
        <p key={i} className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-3 mb-0.5">
          {line}
        </p>
      );
    }

    if (isSubHead) {
      return (
        <div key={i} className={`flex items-center gap-2 pl-3 pr-4 py-1.5 mt-2 rounded-lg border-l-4 ${accent.head}`}>
          <span className="font-bold text-[16px] leading-snug">{line.slice(0, -1)}</span>
        </div>
      );
    }

    if (isTipLine) {
      return (
        <div key={i} className="flex gap-2 items-start px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mt-1">
          <span className="text-amber-500 shrink-0 mt-0.5">💡</span>
          <span className="text-amber-800 dark:text-amber-200 text-[15px] leading-relaxed">{line}</span>
        </div>
      );
    }

    if (isCtaLine) {
      return (
        <div key={i} className={`mt-3 px-4 py-3 rounded-xl font-semibold text-[15px] ${
          accentColor === "amber"
            ? "bg-amber-500 text-white"
            : "bg-blue-600 text-white"
        }`}>
          {line}
        </div>
      );
    }

    return (
      <p key={i} className="text-slate-600 dark:text-slate-300 text-[16px] leading-relaxed">
        {highlightKeys(line)}
      </p>
    );
  });
}

function IntroViewer({
  drill,
  onDone,
  onCancel,
  onHome,
}: {
  drill: Drill;
  onDone: () => void;
  onCancel: () => void;
  onHome: () => void;
}) {
  const [pageIdx, setPageIdx] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const { lang } = useLang();

  const pages: IntroPage[] = drill.pages ?? [{ title: drill.title, body: drill.content }];
  const page    = pages[pageIdx];
  const isFirst = pageIdx === 0;
  const isLast  = pageIdx === pages.length - 1;
  const total   = pages.length;
  const isTip   = drill.type === "tip";

  const title  = lang === "bn" && page.titleBn ? page.titleBn : page.title;
  const body   = lang === "bn" && page.bodyBn  ? page.bodyBn  : page.body;

  const nextLabel   = lang === "bn" ? (isLast ? "সামনে যান" : "পরেরটি") : (isLast ? "Forward" : "Next");
  const prevLabel   = lang === "bn" ? "পূর্ববর্তী" : "Back";
  const cancelLabel = lang === "bn" ? "বাতিল" : "Cancel";
  const pageLabel   = total > 1
    ? (lang === "bn" ? `পাতা ${pageIdx + 1} / ${total}` : `Page ${pageIdx + 1} of ${total}`)
    : null;

  const accentCls = isTip
    ? "bg-amber-500 hover:bg-amber-600"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700${lang === "bn" ? " font-bn" : ""}`}
    >
      {/* Header */}
      <div className={`shrink-0 px-7 pt-5 pb-4 ${isTip ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-blue-700 to-blue-500"}`}>
        <div className="flex items-center gap-3">
          <span className="text-white/90 text-2xl leading-none">{isTip ? "💡" : "📖"}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h2
              key={pageIdx + "-title"}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="text-white font-bold text-xl leading-snug"
            >
              {title}
            </motion.h2>
          </AnimatePresence>
        </div>
        {/* Page progress dots */}
        {total > 1 && (
          <div className="flex gap-1.5 mt-3">
            {pages.map((_, pi) => (
              <button
                key={pi}
                onClick={() => setPageIdx(pi)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  pi === pageIdx
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body — grows to fill all remaining space, scrolls if content overflows */}
      <div className={`flex-1 min-h-0 bg-white dark:bg-slate-800 overflow-hidden ${showDone ? "hidden" : "flex"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pageIdx + "-body"}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="flex-1 px-8 py-6 overflow-y-auto space-y-1"
          >
            {renderBody(body, isTip ? "amber" : "blue")}
          </motion.div>
        </AnimatePresence>

        {/* Image panel — fixed width, always same height as body */}
        {page.image && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pageIdx + "-img"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="shrink-0 w-1/3 border-l border-slate-100 dark:border-slate-700
                flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.image}
                alt=""
                className="max-w-full max-h-[380px] object-contain rounded-xl shadow-md"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer — always pinned at bottom, fixed 3-column grid */}
      <div className={`shrink-0 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700
        px-6 py-4 items-center ${showDone ? "hidden" : "grid"}`} style={{ gridTemplateColumns: "1fr auto 1fr" }}>

        {/* Left: Cancel + Back (Back is invisible on page 1 but still takes space) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="min-w-[80px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600
              text-slate-500 dark:text-slate-400 text-sm font-medium text-center
              hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => setPageIdx(p => p - 1)}
            disabled={isFirst}
            className={`min-w-[90px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
              border border-slate-300 dark:border-slate-600
              text-slate-600 dark:text-slate-300 text-sm font-medium
              hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors
              ${isFirst ? "invisible pointer-events-none" : ""}`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {prevLabel}
          </button>
        </div>

        {/* Centre: page counter — always present, empty span when single page */}
        <div className="flex justify-center px-4">
          <span className={`text-sm text-slate-400 whitespace-nowrap${lang === "bn" ? " font-bn" : ""}`}>
            {pageLabel ?? ""}
          </span>
        </div>

        {/* Right: Next / Forward — fixed min-width so label change doesn't shift it */}
        <div className="flex justify-end">
          <button
            onClick={() => isLast ? setShowDone(true) : setPageIdx(p => p + 1)}
            className={`min-w-[120px] inline-flex items-center justify-center gap-2 px-5 py-2.5
              rounded-xl text-white text-sm font-semibold transition-colors ${accentCls}`}
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* ── Intro Done screen — appears after last page Forward ── */}
      {showDone && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-1 min-h-0 flex flex-col items-center justify-center gap-7 px-8 py-10
            bg-white dark:bg-slate-800 overflow-y-auto${lang === "bn" ? " font-bn" : ""}`}
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", bounce: 0.45 }}
            className="text-[80px] leading-none select-none"
          >🎉</motion.div>

          <div className="text-center">
            <h3 className="text-2xl font-black text-blue-700 dark:text-blue-400 mb-3">
              {lang === "bn" ? "অভিনন্দন!" : "Congratulations!"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-[17px] leading-relaxed max-w-md">
              {lang === "bn"
                ? "আপনি এবার টাচ টাইপিং এর জন্য সম্পূর্ণ প্রস্তুত! পরের ধাপে আমরা শুরু করব।"
                : "You are now fully ready for touch typing! In the next step, let's begin."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={onHome}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl border border-slate-300 dark:border-slate-600
                text-slate-600 dark:text-slate-300 text-sm font-semibold
                hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              🏠 {lang === "bn" ? "হোমে যান" : "Go Home"}
            </button>
            <button
              onClick={() => { setShowDone(false); setPageIdx(0); }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl border border-slate-300 dark:border-slate-600
                text-slate-600 dark:text-slate-300 text-sm font-semibold
                hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              🔄 {lang === "bn" ? "আবার চেষ্টা করুন" : "Try Again"}
            </button>
            <button
              onClick={onDone}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                rounded-xl text-white text-sm font-bold transition-colors ${accentCls}`}
            >
              ▶ {lang === "bn" ? "পরবর্তী লেসন শুরু করুন" : "Next Lesson"}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── LessonCompleteOverlay ────────────────────────────────────────────────────

function LessonCompleteOverlay({
  lesson,
  stats,
  onHome,
  onRetry,
  onNextLesson,
}: {
  lesson: Lesson;
  stats: DrillCompleteStats | null;
  onHome: () => void;
  onRetry: () => void;
  onNextLesson: () => void;
}) {
  const { lang } = useLang();
  const wpm   = stats?.wpm      ?? 0;
  const acc   = stats?.accuracy ?? 0;
  const stars = wpm >= 40 ? 3 : wpm >= 25 ? 2 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={   { opacity: 0, scale: 0.88, y: 20 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.28 }}
      className="flex-1 min-h-0 flex items-center justify-center py-6 overflow-y-auto"
    >
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200
        dark:border-slate-700 p-10 max-w-lg w-full flex flex-col items-center gap-6 text-center
        ${lang === "bn" ? "font-bn" : ""}`}>

        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate:   0 }}
          transition={{ delay: 0.15, type: "spring", bounce: 0.5 }}
          className="text-[84px] leading-none select-none"
        >🏆</motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate:   0 }}
              transition={{ delay: 0.35 + i * 0.1, type: "spring", bounce: 0.5 }}
              className={`text-4xl ${i < stars ? "" : "grayscale opacity-30"}`}
            >⭐</motion.span>
          ))}
        </motion.div>

        {/* Title + lesson name */}
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">
            {lang === "bn" ? "লেসন সম্পন্ন!" : "Lesson Complete!"}
          </h2>
          <p className="text-slate-400 text-sm">{lesson.title}</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
              <p className="text-3xl font-black text-blue-700 dark:text-blue-400">{wpm}</p>
              <p className="text-xs text-blue-500 font-semibold mt-0.5 uppercase tracking-wide">WPM</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4">
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{acc}%</p>
              <p className="text-xs text-emerald-500 font-semibold mt-0.5 uppercase tracking-wide">
                {lang === "bn" ? "নির্ভুলতা" : "Accuracy"}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onNextLesson}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
              bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] transition-colors"
          >
            ▶ {lang === "bn" ? "পরবর্তী লেসন শুরু করুন" : "Start Next Lesson"}
          </button>
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
              border border-slate-300 dark:border-slate-600
              text-slate-600 dark:text-slate-300 font-semibold text-[15px]
              hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            🔄 {lang === "bn" ? "আবার চেষ্টা করুন" : "Try Lesson Again"}
          </button>
          <button
            onClick={onHome}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
              border border-slate-300 dark:border-slate-600
              text-slate-400 dark:text-slate-500 font-medium text-[14px]
              hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            🏠 {lang === "bn" ? "হোমে যান" : "Go Home"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── DrillResults ─────────────────────────────────────────────────────────────

function Breadcrumb({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (v: View) => void;
}) {
  const parts: { label: string; action: () => void }[] = [
    { label: "Curriculum", action: () => onNavigate({ kind: "module", mod: ENGLISH_COURSE.modules[0] }) },
  ];
  if (view.kind === "lesson" || view.kind === "drill") {
    const v = view as Extract<View, { lesson: Lesson }>;
    parts.push({ label: v.lesson.title, action: () => onNavigate({ kind: "lesson", mod: v.mod, lesson: v.lesson }) });
  }
  if (view.kind === "drill") {
    const v = view as Extract<View, { drill: Drill }>;
    parts.push({ label: v.drill.title, action: () => {} });
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-400 flex-wrap">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          <button
            onClick={p.action}
            className={`hover:text-slate-700 transition-colors ${i === parts.length - 1 ? "text-slate-700 font-semibold pointer-events-none" : ""}`}
          >
            {p.label}
          </button>
        </span>
      ))}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LessonsPage() {
  // Start with DEFAULT_VIEW so server and client render the same HTML (no hydration mismatch).
  // The correct view is restored from the URL on the first client-side effect below.
  const [view,               setView]               = useState<View>(DEFAULT_VIEW);
  const [mounted,            setMounted]            = useState(false);
  const [stats,              setStats]              = useState<DrillCompleteStats | null>(null);
  const [showResult,         setShowResult]         = useState(false);
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const [completedLesson,    setCompletedLesson]    = useState<{ mod: Module; lesson: Lesson } | null>(null);

  // ── Progress tracking (works for guests via localStorage and signed-in users via API) ──
  const { completedDrills, lastPosition, isLoaded, markComplete, savePosition } = useProgress();

  // ── Restore view from URL on first client render ──────────────────────────
  // URL params survive refresh; no async gaps, no hydration mismatches.
  useEffect(() => {
    setView(viewFromSearch(window.location.search));
    setMounted(true);
  }, []); // intentionally empty — only run on mount

  // ── For signed-in users: override view from API last-position if URL is bare ──
  const hasAutoResumed = useRef(false);
  useEffect(() => {
    if (hasAutoResumed.current || !isLoaded || !lastPosition) return;
    hasAutoResumed.current = true;
    // Only apply if the URL has no view param (fresh navigation, not a bookmarked drill)
    if (new URLSearchParams(window.location.search).has("v")) return;
    const mod = ENGLISH_COURSE.modules.find(m => m.id === lastPosition.modId);
    if (!mod) return;
    const lesson = mod.lessons.find(l => l.id === lastPosition.lessonId);
    if (!lesson) return;
    const drillIdx = lesson.drills.findIndex(d => d.id === lastPosition.drillId);
    if (drillIdx < 0) return;
    navigate({ kind: "drill", mod, lesson, drill: lesson.drills[drillIdx], drillIdx });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, lastPosition]); // navigate intentionally omitted to avoid loop

  const navigate = useCallback((v: View) => {
    setView(v);
    setStats(null);
    setShowResult(false);
    setShowLessonComplete(false);
    // Encode view into URL — this is what survives a page refresh
    const search = viewToSearch(v);
    window.history.replaceState(null, "", search ? `/lessons?${search}` : "/lessons");
    if (v.kind === "drill") {
      savePosition(v.drill.id, v.lesson.id, v.mod.id);
    }
  }, [savePosition]);

  const handleComplete = useCallback((s: DrillCompleteStats) => {
    if (view.kind !== "drill") return;
    const { mod, lesson, drill, drillIdx } = view;
    // Always mark the finished drill as complete
    markComplete(drill.id, lesson.id, mod.id);
    setStats(s);
    // Last drill in lesson → skip DrillResults, go straight to LessonCompleteOverlay
    // This ensures the tick appears even without clicking "Next"
    if (drillIdx + 1 >= lesson.drills.length) {
      setCompletedLesson({ mod, lesson });
      setShowLessonComplete(true);
    } else {
      setShowResult(true);
    }
  }, [view, markComplete]);

  const handleRetry = useCallback(() => {
    setStats(null);
    setShowResult(false);
    // keep same drill view — engine resets via useEffect[drill.id]
  }, []);

  const handleNext = useCallback(() => {
    if (view.kind !== "drill") return;
    const { mod, lesson, drillIdx } = view;
    setShowResult(false);
    setStats(null);
    if (drillIdx + 1 < lesson.drills.length) {
      const nextDrill = lesson.drills[drillIdx + 1];
      setView({ kind: "drill", mod, lesson, drill: nextDrill, drillIdx: drillIdx + 1 });
      savePosition(nextDrill.id, lesson.id, mod.id);
    } else {
      // Last drill done → show lesson complete overlay
      setCompletedLesson({ mod, lesson });
      setShowLessonComplete(true);
    }
  }, [view, savePosition]);

  const handleLessonHome = useCallback(() => {
    setShowLessonComplete(false);
    setStats(null);
    // Return to the lesson's drill list, not the module overview
    if (completedLesson) navigate({ kind: "lesson", mod: completedLesson.mod, lesson: completedLesson.lesson });
  }, [completedLesson, navigate]);

  const handleLessonRetry = useCallback(() => {
    if (!completedLesson) return;
    const { mod, lesson } = completedLesson;
    setShowLessonComplete(false);
    setStats(null);
    navigate({ kind: "drill", mod, lesson, drill: lesson.drills[0], drillIdx: 0 });
  }, [completedLesson, navigate]);

  const handleNextLesson = useCallback(() => {
    if (!completedLesson) return;
    const { mod, lesson } = completedLesson;
    const lessonIdx = mod.lessons.findIndex(l => l.id === lesson.id);
    setShowLessonComplete(false);
    setStats(null);
    if (lessonIdx + 1 < mod.lessons.length) {
      navigate({ kind: "lesson", mod, lesson: mod.lessons[lessonIdx + 1] });
    } else {
      navigate({ kind: "module", mod });
    }
  }, [completedLesson, navigate]);

  const handleMiniGame = useCallback(() => {
    setShowResult(false);
    window.location.href = "/games";
  }, []);

  // ── Render ──
  // Don't render until the mount effect has read the URL and set the correct view.
  // This prevents a flash of DEFAULT_VIEW before the URL-based view is applied.
  if (!mounted) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isDrill = view.kind === "drill";

  return (
    <>
    {/* ── Focus overlay — covers sidebar/topbar/footer when a drill is active ── */}
    <AnimatePresence>
      {isDrill && (
        <motion.div
          key="focus-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-gray-50 dark:bg-slate-950 flex flex-col"
        >
          <div className="flex-1 min-h-0 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-4">
            {/* Breadcrumb inside focus mode */}
            <Breadcrumb view={view} onNavigate={navigate} />

            {/* Intro / Tip viewer */}
            {(view.drill.type === "intro" || view.drill.type === "tip") && (
              <IntroViewer
                key={view.drill.id}
                drill={view.drill}
                onDone={() => {
                  const { mod, lesson, drill, drillIdx } = view as Extract<View, { kind: "drill" }>;
                  // Mark intro/tip drill as complete
                  markComplete(drill.id, lesson.id, mod.id);
                  if (drillIdx + 1 < lesson.drills.length) {
                    navigate({ kind: "drill", mod, lesson, drill: lesson.drills[drillIdx + 1], drillIdx: drillIdx + 1 });
                  } else {
                    // Last drill in lesson was an intro — show lesson complete
                    setCompletedLesson({ mod, lesson });
                    setShowLessonComplete(true);
                  }
                }}
                onCancel={() => {
                  const { mod, lesson } = view as Extract<View, { kind: "drill" }>;
                  navigate({ kind: "lesson", mod, lesson });
                }}
                onHome={() => {
                  const { mod, lesson } = view as Extract<View, { kind: "drill" }>;
                  navigate({ kind: "lesson", mod, lesson });
                }}
              />
            )}

            {/* Typing engine drills */}
            {view.drill.type !== "intro" && view.drill.type !== "tip" && (
              <motion.div
                key={view.drill.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => navigate({ kind: "lesson", mod: view.mod, lesson: view.lesson })}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to lesson
                  </button>
                </div>
                <GamifiedTypingEngine
                  drill={view.drill}
                  showKeyboard={true}
                  onComplete={handleComplete}
                />
              </motion.div>
            )}

            {/* Results modal */}
            {stats && !showLessonComplete && (
              <DrillResults
                drill={view.drill}
                stats={stats}
                show={showResult}
                onRetry={handleRetry}
                onNext={handleNext}
                onPlayMiniGame={handleMiniGame}
              />
            )}

            {/* Lesson complete overlay */}
            <AnimatePresence>
              {showLessonComplete && completedLesson && (
                <LessonCompleteOverlay
                  key="lesson-complete"
                  lesson={completedLesson.lesson}
                  stats={stats}
                  onHome={handleLessonHome}
                  onRetry={handleLessonRetry}
                  onNextLesson={handleNextLesson}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── Normal layout (module / lesson list) ── */}
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Global back to courses */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>

      {/* Back button (not on top-level) */}
      {view.kind === "lesson" && (
        <button
          onClick={() => navigate({ kind: "module", mod: (view as Extract<View, { mod: Module }>).mod })}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      <Breadcrumb view={view} onNavigate={navigate} />

      <AnimatePresence mode="wait">

        {/* ── Module grid ── */}
        {view.kind === "modules" && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-3"
          >
            <div>
              <h1 className="text-2xl font-black text-slate-800">Curriculum</h1>
              <p className="text-slate-400 text-sm mt-0.5">Master every key from home row to speed runs.</p>
            </div>
            {ENGLISH_COURSE.modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                onClick={() => navigate({ kind: "module", mod })}
              />
            ))}
          </motion.div>
        )}

        {/* ── Lesson list ── */}
        {view.kind === "module" && (
          <motion.div
            key="module"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-3"
          >
            <div>
              <h1 className="text-2xl font-black text-slate-800">Curriculum</h1>
              <p className="text-slate-400 text-sm mt-0.5">{view.mod.subtitle}</p>
            </div>
            {view.mod.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                completedCount={lesson.drills.filter(d => completedDrills.has(d.id)).length}
                onClick={() => navigate({ kind: "lesson", mod: view.mod, lesson })}
              />
            ))}
          </motion.div>
        )}

        {/* ── Drill list ── */}
        {view.kind === "lesson" && (
          <motion.div
            key="lesson"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-3"
          >
            <div>
              <h1 className="text-xl font-black text-slate-800">{view.lesson.title}</h1>
              <p className="text-slate-400 text-sm">{view.lesson.drills.length} drills</p>
            </div>
            {view.lesson.drills.map((drill, idx) => (
              <DrillCard
                key={drill.id}
                drill={drill}
                index={idx}
                completed={completedDrills.has(drill.id)}
                onClick={() => navigate({ kind: "drill", mod: view.mod, lesson: view.lesson, drill, drillIdx: idx })}
              />
            ))}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
    </>
  );
}
