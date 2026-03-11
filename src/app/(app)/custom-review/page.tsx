"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenLine, Play, RotateCcw, ClipboardPaste, CheckCircle2,
  Target, Zap, AlignLeft, ArrowLeft,
} from "lucide-react";
import { useCourse } from "@/context/CourseContext";
import { useLang } from "@/context/LangContext";

// ─── Placeholder sample texts ─────────────────────────────────────────────────

const SAMPLE_TEXTS = {
  en: [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect. The more you type, the faster you get.",
    "Good typing speed comes from accuracy first, then gradually increasing pace.",
  ],
  bn: [
    "আমার সোনার বাংলা আমি তোমায় ভালোবাসি।",
    "অনুশীলন করলে দক্ষতা আসে। যত বেশি টাইপ করবেন তত ভালো হবেন।",
    "টাইপিং শেখার সেরা উপায় হলো প্রতিদিন নিয়মিত অনুশীলন করা।",
  ],
};

export default function CustomReviewPage() {
  const { course }       = useCourse();
  const { lang }         = useLang();
  const [text, setText]   = useState("");
  const textareaRef       = useRef<HTMLTextAreaElement>(null);

  const accentGrad   = course?.accent ?? "from-blue-500 to-indigo-600";
  const accentText   = course?.accentText ?? "text-blue-400";

  const samples = lang === "en" ? SAMPLE_TEXTS.en : SAMPLE_TEXTS.bn;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "en" ? "Back to Dashboard" : "ড্যাশবোর্ডে ফিরুন"}
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${accentGrad} text-white shadow`}>
            <PenLine className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {lang === "en" ? "Custom Review" : "কাস্টম রিভিউ"}
            </h1>
            <p className="text-slate-400 text-xs">
              {lang === "en" ? "Type any text to practice" : "যেকোনো টেক্সট লিখে অনুশীলন করুন"}
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Target className="w-4 h-4" />, en: "Paste your own content to practice", bn: "নিজের কনটেন্ট পেস্ট করুন" },
          { icon: <Zap className="w-4 h-4" />, en: "Great for work or school text", bn: "কাজ বা পড়াশোনার টেক্সট দিয়ে অনুশীলন" },
          { icon: <AlignLeft className="w-4 h-4" />, en: "Any length, any language", bn: "যেকোনো দৈর্ঘ্য, যেকোনো ভাষা" },
        ].map((tip, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-xl px-3 py-3 bg-slate-800/60 border border-slate-700/40">
            <span className="text-slate-400">{tip.icon}</span>
            <p className="text-slate-400 text-[11px] leading-snug">{lang === "en" ? tip.en : tip.bn}</p>
          </div>
        ))}
      </div>

      {/* Text Input Area */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/40">
          <p className="text-slate-300 text-sm font-medium">
            {lang === "en" ? "Enter your text" : "আপনার টেক্সট লিখুন"}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.readText().then((t) => setText(t)).catch(() => {});
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            {lang === "en" ? "Paste" : "পেস্ট"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            lang === "en"
              ? "Type or paste your text here..."
              : "এখানে টাইপ করুন বা পেস্ট করুন..."
          }
          rows={6}
          className="w-full bg-transparent px-5 py-4 text-slate-200 text-sm leading-relaxed placeholder:text-slate-600 resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/40">
          <span className="text-slate-500 text-xs">
            {text.length} {lang === "en" ? "characters" : "অক্ষর"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setText("")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              {lang === "en" ? "Clear" : "মুছুন"}
            </button>
            <button
              disabled={text.trim().length < 10}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-all ${
                text.trim().length >= 10
                  ? `bg-gradient-to-r ${accentGrad} hover:opacity-90 shadow`
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Play className="w-3 h-3 fill-white" />
              {lang === "en" ? "Start Typing" : "শুরু করুন"}
            </button>
          </div>
        </div>
      </div>

      {/* Sample Texts */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {lang === "en" ? "Sample Texts" : "নমুনা টেক্সট"}
        </p>
        {samples.map((sample, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 4 }}
            onClick={() => setText(sample)}
            className="w-full text-left rounded-xl px-4 py-3 bg-slate-800/60 border border-slate-700/40 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${accentText} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{sample}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Coming soon note */}
      <div className="rounded-xl px-4 py-3 bg-slate-800/40 border border-slate-700/30 flex items-center gap-3">
        <span className="text-lg">🚧</span>
        <p className="text-slate-500 text-xs leading-relaxed">
          {lang === "en"
            ? "Full typing engine integration coming soon. You'll be able to practice with any text and track WPM & accuracy in real time."
            : "শীঘ্রই পূর্ণ টাইপিং ইঞ্জিন যুক্ত হবে। যেকোনো টেক্সটে অনুশীলন করতে পারবেন এবং রিয়েল-টাইমে WPM ও নির্ভুলতা ট্র্যাক করতে পারবেন।"}
        </p>
      </div>

    </div>
  );
}
