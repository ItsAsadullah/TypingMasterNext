"use client";

import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Globe } from "lucide-react";
import { useState } from "react";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Studying", subtitle: "Continue your lessons" },
  "/speed-test": { title: "Typing Test", subtitle: "Measure your speed & accuracy" },
  "/games": { title: "Games", subtitle: "Learn while having fun" },
  "/profile": { title: "Statistics", subtitle: "Your progress overview" },
  "/practice": { title: "Practice", subtitle: "Free-form typing practice" },
  "/settings": { title: "Settings", subtitle: "Customize your experience" },
};

export default function TopBar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  const current =
    Object.entries(pageTitles).find(([key]) =>
      pathname.startsWith(key)
    )?.[1] ?? { title: "TechHat Typing Master", subtitle: "Welcome back" };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-gray-50/80 backdrop-blur-md border-b border-gray-200">
      {/* Page title */}
      <div>
        <h1 className="text-gray-900 font-semibold text-lg leading-tight">
          {current.title}
        </h1>
        <p className="text-gray-400 text-xs leading-tight">{current.subtitle}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200 transition-colors">
          <Globe className="w-4 h-4" />
          <span>EN</span>
        </button>

        {/* Dark mode */}
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
        </button>
      </div>
    </header>
  );
}
