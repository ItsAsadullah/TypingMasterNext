"use client";

import {
  Info, Github, Globe, Mail, Keyboard, GraduationCap,
  Gamepad2, BarChart3, Zap, Star, Heart, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useLang } from "@/context/LangContext";
import { useCourse } from "@/context/CourseContext";

export default function AboutPage() {
  const { lang } = useLang();
  const { course } = useCourse();

  const accentGrad = course?.accent ?? "from-blue-500 to-indigo-600";
  const t = (en: string, bn: string) => lang === "en" ? en : bn;

  const features = [
    { icon: <GraduationCap className="w-4 h-4" />, en: "Structured Courses", bn: "কাঠামোবদ্ধ কোর্স", descEn: "Progressive lessons from beginner to advanced", descBn: "শিক্ষানবিশ থেকে উন্নত পর্যায়ের ধাপে ধাপে পাঠ" },
    { icon: <Keyboard className="w-4 h-4" />, en: "Touch Typing Method", bn: "টাচ টাইপিং পদ্ধতি", descEn: "Learn to type without looking at keys", descBn: "কীবোর্ড না দেখে টাইপ করতে শিখুন" },
    { icon: <Gamepad2 className="w-4 h-4" />, en: "Gamified Practice", bn: "গেমিফাইড অনুশীলন", descEn: "Stars, streaks, and XP keep you motivated", descBn: "স্টার, স্ট্রিক ও XP দিয়ে অনুপ্রাণিত থাকুন" },
    { icon: <BarChart3 className="w-4 h-4" />, en: "Detailed Statistics", bn: "বিস্তারিত পরিসংখ্যান", descEn: "Track WPM, accuracy, and progress over time", descBn: "সময়ের সাথে WPM, নির্ভুলতা ও অগ্রগতি ট্র্যাক করুন" },
    { icon: <Zap className="w-4 h-4" />, en: "Bangla Support", bn: "বাংলা সাপোর্ট", descEn: "Full Avro & Bijoy keyboard support", descBn: "অভ্র ও বিজয় কীবোর্ড সম্পূর্ণ সাপোর্ট" },
    { icon: <Star className="w-4 h-4" />, en: "Dark & Light Themes", bn: "ডার্ক ও লাইট থিম", descEn: "Comfortable typing in any environment", descBn: "যেকোনো পরিবেশে আরামদায়ক টাইপিং" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("Back to Dashboard", "ড্যাশবোর্ডে ফিরুন")}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${accentGrad} text-white shadow-lg`}>
          <Keyboard className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">TechHat Typing Master</h1>
          <p className="text-slate-400 text-sm">{t("Version 1.0.0 · Made with ❤️ in Bangladesh", "ভার্সন ১.০.০ · বাংলাদেশে তৈরি ❤️")}</p>
        </div>
      </div>

      {/* About card */}
      <div className={`rounded-2xl bg-gradient-to-r ${accentGrad} p-px`}>
        <div className="rounded-[15px] bg-slate-900 px-6 py-5 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <p className="text-slate-300 text-sm font-semibold">{t("About", "সম্পর্কে")}</p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t(
              "TechHat Typing Master is a free, open-source typing tutor designed to help you learn touch typing from scratch. Whether you're a complete beginner or looking to speed up, our structured curriculum and gamified approach make learning enjoyable and effective.",
              "TechHat Typing Master একটি বিনামূল্যের, ওপেন-সোর্স টাইপিং টিউটর যা আপনাকে স্ক্র্যাচ থেকে টাচ টাইপিং শিখতে সাহায্য করে। সম্পূর্ণ শিক্ষানবিশ হোন বা গতি বাড়াতে চান, আমাদের কাঠামোবদ্ধ পাঠ্যক্রম এবং গেমিফাইড পদ্ধতি শেখাকে আনন্দদায়ক এবং কার্যকর করে তোলে।"
            )}
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-1">
          {t("Features", "বৈশিষ্ট্যসমূহ")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f) => (
            <div
              key={f.en}
              className="flex items-start gap-3 rounded-xl px-4 py-3 bg-slate-800/60 border border-slate-700/40"
            >
              <span className="text-slate-400 mt-0.5 shrink-0">{f.icon}</span>
              <div className="min-w-0">
                <p className="text-slate-200 text-xs font-semibold leading-tight">{t(f.en, f.bn)}</p>
                <p className="text-slate-500 text-[11px] leading-snug mt-0.5">{t(f.descEn, f.descBn)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/40">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t("Built With", "যা দিয়ে তৈরি")}
          </p>
        </div>
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {["Next.js 15", "Tailwind CSS v4", "TypeScript", "Prisma", "PostgreSQL", "NextAuth.js", "Framer Motion", "Lucide Icons"].map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium px-3 py-1 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-1">
          {t("Links", "লিংক")}
        </p>
        {[
          { icon: <Github className="w-4 h-4" />, label: "GitHub", href: "https://github.com/TechHatBD", desc: t("Source code", "সোর্স কোড") },
          { icon: <Globe className="w-4 h-4" />, label: "TechHat BD", href: "https://techhat.com.bd", desc: t("Website", "ওয়েবসাইট") },
          { icon: <Mail className="w-4 h-4" />, label: "Contact", href: "mailto:info@techhat.com.bd", desc: t("Support & feedback", "সাপোর্ট ও মতামত") },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-4 py-3 bg-slate-800/60 border border-slate-700/40 hover:border-slate-600 hover:bg-slate-800 transition-all group"
          >
            <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{link.icon}</span>
            <div className="flex-1">
              <p className="text-slate-300 text-sm font-medium leading-tight group-hover:text-slate-100 transition-colors">{link.label}</p>
              <p className="text-slate-500 text-xs">{link.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center py-2">
        <p className="text-slate-600 text-xs flex items-center justify-center gap-1">
          {t("Made with", "তৈরি করা হয়েছে")}
          <Heart className="w-3 h-3 text-red-400 fill-red-400" />
          {t("by TechHat · Bangladesh", "TechHat · বাংলাদেশ দ্বারা")}
        </p>
      </div>

    </div>
  );
}
