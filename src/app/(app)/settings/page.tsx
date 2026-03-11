"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Settings, Sun, Moon, Globe, Bell, Keyboard,
  Volume2, Eye, Palette, Check, ArrowLeft,
} from "lucide-react";
import { useLang } from "@/context/LangContext";
import { useCourse } from "@/context/CourseContext";

// ─── Setting Row ──────────────────────────────────────────────────────────────

function SettingRow({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-700/60 text-slate-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium leading-tight">{title}</p>
        <p className="text-slate-500 text-xs leading-tight mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        on ? "bg-blue-500" : "bg-slate-600"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang }   = useLang();
  const { course }          = useCourse();
  const [mounted, setMounted] = useState(false);

  const [soundOn,  setSoundOn]  = useState(true);
  const [hints,    setHints]    = useState(true);
  const [virtKbd,  setVirtKbd]  = useState(true);
  const [handAnim, setHandAnim] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  const isDark    = mounted && theme === "dark";
  const accentGrad = course?.accent ?? "from-blue-500 to-indigo-600";

  const t = (en: string, bn: string) => lang === "en" ? en : bn;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">

      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("Back to Dashboard", "ড্যাশবোর্ডে ফিরুন")}
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${accentGrad} text-white shadow`}>
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">{t("Settings", "সেটিংস")}</h1>
          <p className="text-slate-400 text-xs">{t("Customize your experience", "আপনার অভিজ্ঞতা কাস্টমাইজ করুন")}</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/40">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t("Appearance", "চেহারা")}
          </p>
        </div>

        <SettingRow
          icon={isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          title={t("Theme", "থিম")}
          desc={t("Switch between dark and light mode", "ডার্ক ও লাইট মোড পরিবর্তন করুন")}
          action={
            <div className="flex items-center gap-1 rounded-xl bg-slate-700/60 p-1">
              {(["dark", "light"] as const).map((t_) => (
                <button
                  key={t_}
                  onClick={() => setTheme(t_)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    theme === t_
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t_ === "dark" ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  {t_ === "dark" ? t("Dark", "ডার্ক") : t("Light", "লাইট")}
                </button>
              ))}
            </div>
          }
        />

        <div className="border-t border-slate-700/40">
          <SettingRow
            icon={<Globe className="w-4 h-4" />}
            title={t("Language", "ভাষা")}
            desc={t("Interface display language", "ইন্টারফেসের ভাষা")}
            action={
              <div className="flex items-center gap-1 rounded-xl bg-slate-700/60 p-1">
                {(["en", "bn"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      lang === l
                        ? "bg-white text-slate-900 shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {l === "en" ? "English" : "বাংলা"}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>

      {/* Typing */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/40">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t("Typing Options", "টাইপিং অপশন")}
          </p>
        </div>

        {[
          { icon: <Volume2 className="w-4 h-4" />, en: "Keystroke Sounds", bn: "কীস্ট্রোক সাউন্ড", descEn: "Play a click sound on each keypress", descBn: "প্রতিটি কীপ্রেসে ক্লিক শব্দ", val: soundOn, set: setSoundOn },
          { icon: <Eye className="w-4 h-4" />, en: "Show Hints", bn: "হিন্ট দেখান", descEn: "Display coaching hints during drills", descBn: "ড্রিলের সময় হিন্ট দেখান", val: hints, set: setHints },
          { icon: <Keyboard className="w-4 h-4" />, en: "Virtual Keyboard", bn: "ভার্চুয়াল কীবোর্ড", descEn: "Show on-screen keyboard while typing", descBn: "টাইপ করার সময় অনস্ক্রিন কীবোর্ড দেখান", val: virtKbd, set: setVirtKbd },
          { icon: <Palette className="w-4 h-4" />, en: "Hand Animation", bn: "হ্যান্ড অ্যানিমেশন", descEn: "Show finger placement guide", descBn: "আঙুল রাখার গাইড দেখান", val: handAnim, set: setHandAnim },
        ].map((row, i, arr) => (
          <div key={row.en} className={i < arr.length - 1 ? "border-b border-slate-700/40" : ""}>
            <SettingRow
              icon={row.icon}
              title={t(row.en, row.bn)}
              desc={t(row.descEn, row.descBn)}
              action={<Toggle on={row.val} onToggle={() => row.set(!row.val)} />}
            />
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-700/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-700/40">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {t("Notifications", "নোটিফিকেশন")}
          </p>
        </div>
        <SettingRow
          icon={<Bell className="w-4 h-4" />}
          title={t("Daily Reminders", "দৈনিক রিমাইন্ডার")}
          desc={t("Get reminded to practice every day", "প্রতিদিন অনুশীলনের রিমাইন্ডার পান")}
          action={<Toggle on={false} onToggle={() => {}} />}
        />
      </div>

      {/* Save note */}
      <div className="flex items-center gap-2 px-1">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <p className="text-slate-500 text-xs">
          {t("Settings are saved automatically", "সেটিংস স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়")}
        </p>
      </div>

    </div>
  );
}
