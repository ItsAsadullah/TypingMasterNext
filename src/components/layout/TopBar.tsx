"use client";

import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Globe, CheckCheck, Zap, Trophy, BookOpen, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";
import { AnimatePresence, motion } from "framer-motion";

// ─── Page meta ────────────────────────────────────────────────────────────────

const pageTitles: Record<string, { en: string; bn: string; subEn: string; subBn: string }> = {
  "/dashboard": { en: "Dashboard",    bn: "ড্যাশবোর্ড",   subEn: "Continue your lessons",         subBn: "আপনার পাঠ চালিয়ে যান"       },
  "/lessons":   { en: "Lessons",      bn: "পাঠ",           subEn: "Structured curriculum",          subBn: "কাঠামোবদ্ধ পাঠ্যক্রম"        },
  "/speed-test":{ en: "Typing Test",  bn: "টাইপিং টেস্ট", subEn: "Measure your speed & accuracy", subBn: "গতি ও নির্ভুলতা পরিমাপ করুন" },
  "/games":     { en: "Games",        bn: "গেমস",          subEn: "Learn while having fun",         subBn: "মজার সাথে শিখুন"             },
  "/profile":   { en: "Statistics",   bn: "পরিসংখ্যান",   subEn: "Your progress overview",         subBn: "আপনার অগ্রগতির সারসংক্ষেপ"  },
  "/practice":  { en: "Practice",     bn: "অনুশীলন",       subEn: "Free-form typing practice",      subBn: "মুক্ত টাইপিং অনুশীলন"        },
  "/settings":  { en: "Settings",     bn: "সেটিংস",        subEn: "Customize your experience",      subBn: "আপনার অভিজ্ঞতা কাস্টমাইজ করুন"},
};

// ─── Mock notifications ────────────────────────────────────────────────────────

const MOCK_NOTIFS = [
  { id: 1, icon: Trophy,   color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10",   titleEn: "New record!",          titleBn: "নতুন রেকর্ড!",           bodyEn: "You hit 65 WPM on Speed Test.",     bodyBn: "স্পিড টেস্টে ৬৫ WPM অর্জন করেছেন।", time: "2m ago",  read: false },
  { id: 2, icon: Zap,      color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-500/10", titleEn: "Streak: 5 days 🔥",   titleBn: "স্ট্রিক: ৫ দিন 🔥",     bodyEn: "Keep it up! Practice daily.",       bodyBn: "চালিয়ে যান! প্রতিদিন অনুশীলন করুন।", time: "1h ago",  read: false },
  { id: 3, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10",titleEn: "Lesson unlocked",      titleBn: "পাঠ আনলক হয়েছে",        bodyEn: "Module 2: Top Row is ready.",       bodyBn: "মডিউল ২: টপ রো প্রস্তুত।",            time: "3h ago",  read: true  },
];

// ─── Notification panel ───────────────────────────────────────────────────────

function NotificationPanel({
  lang, onClose,
}: {
  lang: "en" | "bn";
  onClose: () => void;
}) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {lang === "en" ? "Notifications" : "বিজ্ঞপ্তি"}
          </p>
          {unread > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-500 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {lang === "en" ? "Mark all read" : "সব পড়া হয়েছে"}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50 dark:divide-slate-700/60 max-h-72 overflow-y-auto">
        {notifs.map((n) => {
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!n.read ? "bg-slate-50/60 dark:bg-slate-700/30" : ""}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.bg}`}>
                <Icon className={`w-4 h-4 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-slate-800 dark:text-slate-100 text-xs font-semibold truncate">
                    {lang === "en" ? n.titleEn : n.titleBn}
                  </p>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug mt-0.5 line-clamp-2">
                  {lang === "en" ? n.bodyEn : n.bodyBn}
                </p>
                <p className="text-slate-400 text-[10px] mt-1">{n.time}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
        <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
          {lang === "en" ? "View all notifications" : "সব বিজ্ঞপ্তি দেখুন"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar() {
  const pathname        = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang }   = useLang();
  const [mounted,       setMounted]    = useState(false);
  const [notifOpen,     setNotifOpen]  = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDark = mounted && theme === "dark";

  const current = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] ?? { en: "TechHat Typing Master", bn: "টেকহ্যাট টাইপিং মাস্টার", subEn: "Welcome back", subBn: "স্বাগতম" };

  const title    = lang === "en" ? current.en    : current.bn;
  const subtitle = lang === "en" ? current.subEn : current.subBn;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700/60">
      {/* Page title */}
      <div>
        <h1 className="text-gray-900 dark:text-slate-100 font-semibold text-lg leading-tight">
          {title}
        </h1>
        <p className="text-gray-400 dark:text-slate-500 text-xs leading-tight">{subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-slate-100 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all"
          title={lang === "en" ? "Switch to বাংলা" : "Switch to English"}
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{lang === "en" ? "EN" : "বাং"}</span>
        </button>

        {/* Dark / light toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-yellow-400 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all"
          aria-label="Toggle theme"
        >
          {mounted
            ? isDark
              ? <Sun  className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all border ${
              notifOpen
                ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-100"
                : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <NotificationPanel
                lang={lang}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
