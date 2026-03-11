"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Keyboard, User, Mail, Lock, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import NavControls from "@/components/ui/NavControls";
import { useLang } from "@/context/LangContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t, isBn } = useLang();
  const { theme }   = useTheme();
  const [mounted, setMounted]   = useState(false);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const isDark = !mounted || theme === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed.");
    } else {
      setSuccess(true);
      const signInRes = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });
      setTimeout(() => {
        router.push(signInRes?.ok ? "/dashboard" : "/login");
        router.refresh();
      }, 1000);
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
        <div className="mb-7">
          <p className={`text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2 ${isBn ? "font-bn" : ""}`}>{t("auth_new_label")}</p>
          <h1 className={`text-3xl font-black mb-1 ${isDark ? "text-white" : "text-slate-900"} ${isBn ? "font-bn" : ""}`}>{t("auth_reg_title")}</h1>
          <p className={`text-sm ${isDark ? "text-white/40" : "text-slate-500"} ${isBn ? "font-bn" : ""}`}>{t("auth_reg_sub")}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Account created! Signing you in…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${isDark ? "text-white/50" : "text-slate-500"} ${isBn ? "font-bn" : ""}`}>{t("auth_name_label")}</label>
            <div className="relative">
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/25" : "text-slate-400"}`} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Md Asadullah"
                className={`
                  w-full border rounded-2xl pl-10 pr-4 py-3 text-sm transition-all duration-200
                  focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-500/60
                  ${isDark
                    ? "bg-white/5 border-white/10 text-white placeholder-white/20 hover:border-white/20"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:bg-white"}
                `}
              />
            </div>
          </div>

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
                  focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-500/60
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
                minLength={6}
                placeholder="min. 6 characters"
                className={`
                  w-full border rounded-2xl pl-10 pr-4 py-3 text-sm transition-all duration-200
                  focus:outline-none focus:ring-1 focus:ring-violet-500/20 focus:border-violet-500/60
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
            disabled={loading || success}
            className="
              mx-auto block px-10 py-2.5 rounded-2xl font-bold text-sm text-white
              bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500
              hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40
              transition-all duration-200 mt-2
            "
          >
            <span className={`flex items-center justify-center gap-2 ${isBn ? "font-bn" : ""}`}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t("auth_reg_loading") : t("auth_reg_btn")}
            </span>
          </button>
        </form>

        {/* Terms hint */}
        <p className={`text-center text-[11px] mt-3 ${isDark ? "text-white/20" : "text-slate-400"} ${isBn ? "font-bn" : ""}`}>
          {t("auth_terms")}
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-slate-200"}`} />
          <span className={`text-xs ${isDark ? "text-white/25" : "text-slate-400"} ${isBn ? "font-bn" : ""}`}>{t("auth_or")}</span>
          <div className={`flex-1 h-px ${isDark ? "bg-white/8" : "bg-slate-200"}`} />
        </div>

        {/* Switch to login */}
        <p className={`text-center text-sm ${isDark ? "text-white/40" : "text-slate-500"}`}>
          <span className={isBn ? "font-bn" : ""}>{t("auth_have_account")}</span>{" "}
          <Link href="/login" className={`text-violet-400 hover:text-violet-300 font-semibold transition ${isBn ? "font-bn" : ""}`}>
            {t("auth_signin_link")}
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

