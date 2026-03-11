"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Keyboard, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import NavControls from "@/components/ui/NavControls";
import { useLang } from "@/context/LangContext";

// ── Inner form (needs Suspense for useSearchParams) ───────────────────────
function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";
  const { t, isBn } = useLang();
  const { theme }    = useTheme();
  const [mounted, setMounted]   = useState(false);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDark = !mounted || theme === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email:    email.toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${isDark ? "bg-[#0b0b1e] text-white" : "bg-white text-slate-900"}`}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <Keyboard className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className={`font-bold text-sm leading-none block ${isDark ? "text-white" : "text-slate-900"}`}>TechHat</span>
            <span className={`text-[10px] leading-none ${isDark ? "text-white/40" : "text-slate-400"}`}>Typing Master</span>
          </div>
        </Link>

        {/* Controls + Back */}
        <div className="flex items-center gap-3">
          <NavControls />
          <Link href="/" className={`flex items-center gap-1.5 text-xs font-medium transition group ${isDark ? "text-white/40 hover:text-white/80" : "text-slate-400 hover:text-slate-700"}`}>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className={isBn ? "font-bn" : ""}>{t("nav_home")}</span>
          </Link>
        </div>
      </div>

      {/* ── Form — vertically centered ───────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-16 pb-8">

        {/* Heading */}
        <div className="mb-8">
          <p className={`text-cyan-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2 ${isBn ? "font-bn" : ""}`}>{t("auth_welcome_label")}</p>
          <h1 className={`text-3xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"} ${isBn ? "font-bn" : ""}`}>{t("auth_login_title")}</h1>
          <p className={`text-sm ${isDark ? "text-white/40" : "text-slate-500"} ${isBn ? "font-bn" : ""}`}>{t("auth_login_sub")}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${isDark ? "text-white/50" : "text-slate-500"} ${isBn ? "font-bn" : ""}`}>{t("auth_email_label")}</label>
            <div className="relative">
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/25" : "text-slate-400"}`} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={`
                  w-full border rounded-2xl pl-10 pr-4 py-3 text-sm transition-all duration-200
                  focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/60
                  ${isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/20 hover:border-white/20"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:bg-white"}
                `}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${isDark ? "text-white/50" : "text-slate-500"} ${isBn ? "font-bn" : ""}`}>{t("auth_pass_label")}</label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/25" : "text-slate-400"}`} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={`
                  w-full border rounded-2xl pl-10 pr-4 py-3 text-sm transition-all duration-200
                  focus:outline-none focus:ring-1 focus:ring-cyan-500/20 focus:border-cyan-500/60
                  ${isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/20 hover:border-white/20"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:bg-white"}
                `}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              mx-auto block relative overflow-hidden px-10 py-2.5 rounded-2xl font-bold text-sm text-white
              bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500
              hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50
              transition-all duration-200 mt-3 group
            "
          >
            <span className={`relative z-10 flex items-center justify-center gap-2 ${isBn ? "font-bn" : ""}`}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("auth_login_loading") : t("auth_login_btn")}
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-slate-200"}`} />
          <span className={`text-xs ${isDark ? "text-white/25" : "text-slate-400"} ${isBn ? "font-bn" : ""}`}>{t("auth_or")}</span>
          <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-slate-200"}`} />
        </div>

        {/* Switch to register */}
        <p className={`text-center text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}>
          <span className={isBn ? "font-bn" : ""}>{t("auth_no_account")}</span>{" "}
          <Link href="/register" className={`text-cyan-400 hover:text-cyan-300 font-semibold transition ${isBn ? "font-bn" : ""}`}>
            {t("auth_create_free")}
          </Link>
        </p>
      </div>

      {/* ── Bottom footer ─────────────────────────────────────────── */}
      <p className={`text-center text-[11px] pb-5 ${isDark ? "text-white/15" : "text-slate-400"}`}>
        &copy; {new Date().getFullYear()} TechHat — Md Asadullah
      </p>
    </div>
  );
}

// ── Page export with Suspense boundary ───────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-[#0b0b1e]">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

