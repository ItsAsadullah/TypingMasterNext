"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useLang } from "@/context/LangContext";
import { useCourse, COURSES } from "@/context/CourseContext";
import {
  BookOpen, Gamepad2, BarChart3, Settings,
  Keyboard, ChevronRight, PenLine, LogOut, GraduationCap,
  Globe, Sun, Moon, RefreshCw, Info, LayoutDashboard,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Course-specific nav sets ─────────────────────────────────────────────────

const navItemsEn = [
  { labelEn: "Dashboard",     labelBn: "ড্যাশবোর্ড",     href: "/dashboard",      icon: LayoutDashboard, descEn: "Overview & stats",         descBn: "সারসংক্ষেপ ও পরিসংখ্যান" },
  { labelEn: "Courses",       labelBn: "কোর্সমূহ",        href: "/courses",         icon: GraduationCap,   descEn: "All typing courses",        descBn: "সব কোর্স দেখুন"             },
  { labelEn: "Custom Review", labelBn: "কাস্টম রিভিউ",    href: "/custom-review",  icon: PenLine,         descEn: "Practice your own text",    descBn: "নিজের টেক্সট অনুশীলন"      },
  { labelEn: "Games",         labelBn: "গেমস",             href: "/games",           icon: Gamepad2,        descEn: "Gamified practice",         descBn: "মজার গেমস"                  },
  { labelEn: "Statistics",    labelBn: "পরিসংখ্যান",       href: "/profile",         icon: BarChart3,       descEn: "Progress & history",        descBn: "অগ্রগতি ও ইতিহাস"           },
  { labelEn: "Settings",      labelBn: "সেটিংস",           href: "/settings",        icon: Settings,        descEn: "App preferences",           descBn: "অ্যাপ সেটিংস"               },
  { labelEn: "About",         labelBn: "সম্পর্কে",          href: "/about",           icon: Info,            descEn: "About TechHat",             descBn: "TechHat সম্পর্কে"            },
];

const navItemsBn = [
  { labelEn: "Dashboard",     labelBn: "ড্যাশবোর্ড",     href: "/dashboard",      icon: LayoutDashboard, descEn: "Overview & stats",         descBn: "সারসংক্ষেপ ও পরিসংখ্যান" },
  { labelEn: "Courses",       labelBn: "কোর্সমূহ",        href: "/courses",         icon: GraduationCap,   descEn: "All typing courses",        descBn: "সব কোর্স দেখুন"             },
  { labelEn: "Custom Review", labelBn: "কাস্টম রিভিউ",    href: "/custom-review",  icon: PenLine,         descEn: "Practice your own text",    descBn: "নিজের টেক্সট অনুশীলন"      },
  { labelEn: "Games",         labelBn: "গেমস",             href: "/games",           icon: Gamepad2,        descEn: "Bangla typing games",       descBn: "বাংলা টাইপিং গেমস"          },
  { labelEn: "Statistics",    labelBn: "পরিসংখ্যান",       href: "/profile",         icon: BarChart3,       descEn: "Progress & history",        descBn: "অগ্রগতি ও ইতিহাস"           },
  { labelEn: "Settings",      labelBn: "সেটিংস",           href: "/settings",        icon: Settings,        descEn: "App preferences",           descBn: "অ্যাপ সেটিংস"               },
  { labelEn: "About",         labelBn: "সম্পর্কে",          href: "/about",           icon: Info,            descEn: "About TechHat",             descBn: "TechHat সম্পর্কে"            },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname                = usePathname();
  const { data: session }       = useSession();
  const { theme, setTheme }     = useTheme();
  const { lang, setLang }       = useLang();
  const { course, clearCourse } = useCourse();
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark    = mounted && theme === "dark";
  const userName  = session?.user?.name  ?? "Student";
  const userEmail = session?.user?.email ?? "";
  const initials  = userName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const isBangla   = course && course.id !== "en";
  const navItems   = isBangla ? navItemsBn : navItemsEn;
  const accentText   = course?.accentText   ?? "text-emerald-400";
  const accentBg     = course?.accentBg     ?? "bg-emerald-500/15";
  const accentBorder = course?.accentBorder ?? "border-emerald-500/30";
  const accentGrad   = course?.accent       ?? "from-emerald-400 to-cyan-500";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col z-40 select-none border-r border-slate-700/40">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/60">
        <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${accentGrad} shadow-lg shrink-0`}>
          <Keyboard className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">TechHat</p>
          <p className="text-slate-400 text-xs leading-tight truncate">Typing Master</p>
        </div>
      </div>

      {/* ── Active course badge ── */}
      {course ? (
        <div className={`mx-3 mt-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2 ${accentBg} border ${accentBorder}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base shrink-0">{course.emoji}</span>
            <div className="min-w-0">
              <p className={`text-[11px] font-bold ${accentText} leading-tight truncate`}>
                {lang === "en" ? course.nameEn : course.nameBn}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">{lang === "en" ? "Active course" : "সক্রিয় কোর্স"}</p>
            </div>
          </div>
          <button
            onClick={clearCourse}
            className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
            title={lang === "en" ? "Switch course" : "কোর্স পরিবর্তন"}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <Link
          href="/dashboard"
          className="mx-3 mt-3 flex items-center gap-2 rounded-xl px-3 py-2 bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-[11px] text-slate-400">{lang === "en" ? "Choose a course →" : "কোর্স বেছে নিন →"}</p>
        </Link>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          {lang === "en" ? "Main Menu" : "প্রধান মেনু"}
        </p>

        {navItems.map(({ labelEn, labelBn, href, icon: Icon, descEn, descBn }) => {
          const active = isActive(href);
          const label  = lang === "en" ? labelEn : labelBn;
          const desc   = lang === "en" ? descEn  : descBn;
          return (
            <Link
              key={href + labelEn}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                active
                  ? `${accentBg} ${accentText}`
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              {active && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${accentGrad}`} />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${active ? accentText : ""}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium leading-tight ${active ? accentText : ""}`}>{label}</p>
                <p className="text-[11px] text-slate-600 leading-tight truncate">{desc}</p>
              </div>
              {active && <ChevronRight className={`w-3.5 h-3.5 ${accentText} shrink-0`} />}
            </Link>
          );
        })}

        {/* ── Other courses ── */}
        {course && (
          <>
            <div className="pt-4 pb-1.5">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {lang === "en" ? "Other Courses" : "অন্যান্য কোর্স"}
              </p>
            </div>
            {COURSES.filter((c) => c.id !== course.id).map((c) => (
              <button
                key={c.id}
                onClick={clearCourse}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all group"
              >
                <span className="text-base">{c.emoji}</span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-medium leading-tight truncate">
                    {lang === "en" ? c.nameEn : c.nameBn}
                  </p>
                </div>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </>
        )}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-700/60 space-y-1">

        <div className="flex items-center gap-1.5 px-1 py-1">
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all flex-1 justify-center border border-slate-700/50 hover:border-slate-600"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "বাংলা" : "English"}</span>
          </button>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-yellow-400 transition-all border border-slate-700/50 hover:border-slate-600"
            aria-label="Toggle theme"
          >
            {mounted ? isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-slate-800/60 mt-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${accentGrad} flex items-center justify-center shrink-0 shadow`}>
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-sm font-medium leading-tight truncate">{userName}</p>
            <p className="text-slate-500 text-[11px] leading-tight truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-700 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
            title={lang === "en" ? "Sign out" : "লগ আউট"}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
}
