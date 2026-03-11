"use client";

import { useTheme } from "next-themes";
import { useLang } from "@/context/LangContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function NavControls() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="w-22 h-8 rounded-full" />;

  const isDark = theme === "dark";

  // Base pill style
  const pill =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none border";

  const themePill = isDark
    ? `${pill} border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700`
    : `${pill} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm`;

  const langPill = isDark
    ? `${pill} border-slate-700 bg-slate-800/70 text-slate-200 hover:bg-slate-700`
    : `${pill} border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm`;

  return (
    <div className="flex items-center gap-2">
      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "bn" : "en")}
        title={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
        className={langPill}
      >
        <span className="text-[11px] leading-none">
          {lang === "en" ? "বাংলা" : "EN"}
        </span>
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Light mode" : "Dark mode"}
        className={themePill}
      >
        {isDark ? (
          <Sun size={13} strokeWidth={2.2} />
        ) : (
          <Moon size={13} strokeWidth={2.2} />
        )}
        <span className="text-[11px] leading-none">{isDark ? "Light" : "Dark"}</span>
      </button>
    </div>
  );
}
