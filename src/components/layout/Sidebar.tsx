"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Timer,
  Gamepad2,
  BarChart3,
  Settings,
  Keyboard,
  ChevronRight,
  PenLine,
} from "lucide-react";

const navItems = [
  {
    label: "Studying",
    href: "/dashboard",
    icon: BookOpen,
    description: "Lessons & curriculum",
  },
  {
    label: "Practice",
    href: "/practice",
    icon: PenLine,
    description: "Free-form typing practice",
  },
  {
    label: "Typing Test",
    href: "/speed-test",
    icon: Timer,
    description: "Timed speed test",
  },
  {
    label: "Games",
    href: "/games",
    icon: Gamepad2,
    description: "Gamified practice",
  },
  {
    label: "Statistics",
    href: "/profile",
    icon: BarChart3,
    description: "Progress & history",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col z-40 select-none">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700/60">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30 shrink-0">
          <Keyboard className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            TechHat
          </p>
          <p className="text-slate-400 text-xs leading-tight truncate">
            Typing Master
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>

        {navItems.map(({ label, href, icon: Icon, description }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-150 ${
                active
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-emerald-400" />
              )}

              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                  active ? "text-emerald-400" : ""
                }`}
                strokeWidth={active ? 2.5 : 2}
              />

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium leading-tight ${
                    active ? "text-emerald-300" : ""
                  }`}
                >
                  {label}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight truncate">
                  {description}
                </p>
              </div>

              {active && (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all duration-150 group"
        >
          <Settings
            className="w-5 h-5 shrink-0 group-hover:rotate-90 transition-transform duration-300"
            strokeWidth={2}
          />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        {/* User chip */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shrink-0 shadow shadow-emerald-500/20">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-sm font-medium leading-tight truncate">
              Md Asadullah
            </p>
            <p className="text-slate-500 text-[11px] leading-tight truncate">
              Student
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
