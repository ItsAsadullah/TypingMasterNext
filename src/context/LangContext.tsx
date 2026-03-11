"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "bn";

export const translations = {
  en: {
    // Navbar
    nav_features:    "Features",
    nav_how:         "How it works",
    nav_languages:   "Languages",
    nav_login:       "Log in",
    nav_start:       "Get Started Free",
    nav_home:        "Home",

    // Hero
    hero_badge:   "Free Bilingual Typing Tutor",
    hero_h1a:     "Master Typing",
    hero_h1b:     "at Lightning Speed",
    hero_desc:    "Learn Bangla (Bijoy & Avro) and English typing — with structured lessons, real-time speed tests, and games that make practice feel effortless.",
    hero_cta1:    "Start for Free",
    hero_cta2:    "Start as Guest (No Sign-in)",
    hero_check_1: "No credit card required",
    hero_check_2: "Free forever plan",
    hero_check_3: "Works on all devices",

    // Stats
    stat_1_label: "Active Learners",
    stat_2_label: "Avg. Improvement",
    stat_3_label: "Uptime",
    stat_4_label: "Bangla & English",

    // Features
    feat_eyebrow: "Everything you need",
    feat_h2a:     "One platform,",
    feat_h2b:     "complete typing mastery",
    feat_sub:     "From your very first lesson to 100+ WPM — every tool you need is built-in.",
    feat_1_title: "Structured Lessons",
    feat_1_desc:  "Start from home row keys and progress through a curated curriculum — from beginner to advanced.",
    feat_2_title: "Speed Tests",
    feat_2_desc:  "Take timed 1, 3, or 5-minute tests. Track your WPM and accuracy over time.",
    feat_3_title: "Typing Games",
    feat_3_desc:  "Beat the boredom with falling-word games. Make practice feel like play.",
    feat_4_title: "Progress Analytics",
    feat_4_desc:  "Visualize your speed history, accuracy trends, and personal records at a glance.",
    feat_explore: "Explore",

    // How it works
    how_eyebrow: "Simple process",
    how_h2:      "Get started in minutes",
    how_1_title: "Create a free account",
    how_1_desc:  "Sign up in seconds — no credit card required.",
    how_2_title: "Pick your learning path",
    how_2_desc:  "Choose from structured lessons, free practice, or quick speed tests.",
    how_3_title: "Track your growth",
    how_3_desc:  "Watch your WPM climb as you build muscle memory and accuracy.",
    how_step:    "STEP",

    // Languages
    lang_badge: "Bilingual Support",
    lang_h2a:   "Type in",
    lang_h2b:   "Bangla & English",
    lang_desc:  "The only typing tutor built specifically for Bangladeshi learners. Master both Bijoy and Avro keyboard layouts, as well as standard English.",
    lang_check_1: "বিজয় কীবোর্ড লেয়আউট (Bijoy Layout)",
    lang_check_2: "অভ্র কীবোর্ড লেয়আউট (Avro Layout)",
    lang_check_3: "English QWERTY / Touch Typing",

    // CTA
    cta_h2a:  "Ready to type",
    cta_h2b:  "faster?",
    cta_desc: "Join thousands of learners who improved their typing speed with TechHat Typing Master.",
    cta_1:    "Create Free Account",
    cta_2:    "Sign In",

    // Footer
    footer_practice: "Practice",
    footer_speed:    "Speed Test",
    footer_made:     "Made with ❤️ by",

    // Auth – Login
    auth_welcome_label:  "WELCOME BACK",
    auth_login_title:    "Sign In",
    auth_login_sub:      "Sign in to your account",
    auth_email_label:    "Email",
    auth_pass_label:     "Password",
    auth_login_btn:      "Sign In →",
    auth_login_loading:  "Signing in…",
    auth_no_account:     "Don't have an account?",
    auth_create_free:    "Create one free →",
    auth_or:             "or",

    // Auth – Register
    auth_new_label:   "NEW MEMBER",
    auth_reg_title:   "Sign Up",
    auth_reg_sub:     "Create a free account",
    auth_name_label:  "Full Name",
    auth_reg_btn:     "Create Account →",
    auth_reg_loading: "Creating…",
    auth_have_account:"Already have an account?",
    auth_signin_link: "Sign In →",
    auth_terms:       "By creating an account you agree to our Terms & Privacy Policy.",
  },

  bn: {
    // Navbar
    nav_features:    "বৈশিষ্ট্য",
    nav_how:         "কিভাবে কাজ করে",
    nav_languages:   "ভাষাসমূহ",
    nav_login:       "লগইন",
    nav_start:       "বিনামূল্যে শুরু করুন",
    nav_home:        "হোমপেজ",

    // Hero
    hero_badge:   "বিনামূল্যে দ্বিভাষিক টাইপিং টিউটর",
    hero_h1a:     "টাইপিং আয়ত্ত করুন",
    hero_h1b:     "বিদ্যুৎ গতিতে",
    hero_desc:    "বাংলা (বিজয় ও অভ্র) এবং ইংরেজি টাইপিং শিখুন — কাঠামোগত পাঠ, রিয়েল-টাইম স্পিড টেস্ট এবং মজাদার গেমস দিয়ে।",
    hero_cta1:    "বিনামূল্যে শুরু করুন",
    hero_cta2:    "সাইনইন ছাড়াই শুরু করুন (গেস্ট মোড)",
    hero_check_1: "কোনো ক্রেডিট কার্ড লাগবে না",
    hero_check_2: "বিনামূল্যে চিরতরে",
    hero_check_3: "সব ডিভাইসে কাজ করে",

    // Stats
    stat_1_label: "সক্রিয় শিক্ষার্থী",
    stat_2_label: "গড় উন্নতি",
    stat_3_label: "আপটাইম",
    stat_4_label: "বাংলা ও ইংরেজি",

    // Features
    feat_eyebrow: "আপনার যা দরকার",
    feat_h2a:     "একটি প্ল্যাটফর্মে,",
    feat_h2b:     "সম্পূর্ণ টাইপিং দক্ষতা",
    feat_sub:     "প্রথম পাঠ থেকে ১০০+ WPM পর্যন্ত — সব কিছু এখানেই আছে।",
    feat_1_title: "কাঠামোগত পাঠ",
    feat_1_desc:  "হোম রো কী থেকে শুরু করে ধাপে ধাপে শিখুন — নতুন থেকে অ্যাডভান্সড পর্যন্ত।",
    feat_2_title: "স্পিড টেস্ট",
    feat_2_desc:  "১, ৩ বা ৫ মিনিটের টেস্ট নিন। সময়ের সাথে WPM এবং নির্ভুলতা ট্র্যাক করুন।",
    feat_3_title: "টাইপিং গেমস",
    feat_3_desc:  "পড়ন্ত শব্দের গেমে বিরক্তি দূর করুন। অনুশীলনকে মজাদার করুন।",
    feat_4_title: "অগ্রগতি বিশ্লেষণ",
    feat_4_desc:  "স্পিড ইতিহাস, নির্ভুলতার ট্রেন্ড এবং ব্যক্তিগত রেকর্ড এক নজরে দেখুন।",
    feat_explore: "দেখুন",

    // How it works
    how_eyebrow: "সহজ প্রক্রিয়া",
    how_h2:      "মিনিটেই শুরু করুন",
    how_1_title: "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন",
    how_1_desc:  "কয়েক সেকেন্ডে সাইন আপ করুন — কোনো ক্রেডিট কার্ড লাগবে না।",
    how_2_title: "আপনার শেখার পথ বেছে নিন",
    how_2_desc:  "কাঠামোগত পাঠ, বিনামূল্যে অনুশীলন, বা দ্রুত স্পিড টেস্ট থেকে বেছে নিন।",
    how_3_title: "আপনার অগ্রগতি ট্র্যাক করুন",
    how_3_desc:  "পেশীর স্মৃতি ও নির্ভুলতা বাড়ানোর সাথে সাথে WPM বাড়তে দেখুন।",
    how_step:    "ধাপ",

    // Languages
    lang_badge:    "দ্বিভাষিক সমর্থন",
    lang_h2a:      "টাইপ করুন",
    lang_h2b:      "বাংলা ও ইংরেজিতে",
    lang_desc:     "বাংলাদেশি শিক্ষার্থীদের জন্য তৈরি একমাত্র টাইপিং টিউটর। বিজয় ও অভ্র কীবোর্ড লেআউট এবং ইংরেজি শিখুন।",
    lang_check_1: "বিজয় কীবোর্ড লেআউট",
    lang_check_2: "অভ্র কীবোর্ড লেআউট",
    lang_check_3: "ইংরেজি QWERTY / টাচ টাইপিং",

    // CTA
    cta_h2a:  "দ্রুত টাইপ করতে",
    cta_h2b:  "প্রস্তুত?",
    cta_desc: "হাজার হাজার শিক্ষার্থী এই প্ল্যাটফর্ম দিয়ে তাদের টাইপিং গতি উন্নত করেছেন।",
    cta_1:    "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন",
    cta_2:    "সাইন ইন",

    // Footer
    footer_practice: "অনুশীলন",
    footer_speed:    "স্পিড টেস্ট",
    footer_made:     "ভালোবাসায় তৈরি করেছেন",

    // Auth – Login
    auth_welcome_label:  "স্বাগতম",
    auth_login_title:    "সাইন ইন",
    auth_login_sub:      "আপনার অ্যাকাউন্টে লগইন করুন",
    auth_email_label:    "ইমেইল",
    auth_pass_label:     "পাসওয়ার্ড",
    auth_login_btn:      "সাইন ইন →",
    auth_login_loading:  "লগইন হচ্ছে…",
    auth_no_account:     "অ্যাকাউন্ট নেই?",
    auth_create_free:    "বিনামূল্যে তৈরি করুন →",
    auth_or:             "অথবা",

    // Auth – Register
    auth_new_label:   "নতুন সদস্য",
    auth_reg_title:   "সাইন আপ",
    auth_reg_sub:     "বিনামূল্যে অ্যাকাউন্ট তৈরি করুন",
    auth_name_label:  "পূর্ণ নাম",
    auth_reg_btn:     "অ্যাকাউন্ট তৈরি করুন →",
    auth_reg_loading: "তৈরি হচ্ছে…",
    auth_have_account:"আগে থেকেই অ্যাকাউন্ট আছে?",
    auth_signin_link: "সাইন ইন →",
    auth_terms:       "অ্যাকাউন্ট তৈরি করলে আমাদের Terms ও Privacy Policy মেনে নেওয়া হবে।",
  },
} as const;

type TKey = keyof typeof translations.en;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  isBn: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations.en[key],
  isBn: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("tm-lang") as Lang | null;
    if (stored === "en" || stored === "bn") {
      setLangState(stored);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("tm-lang", l);
  };

  const t = (key: TKey): string => translations[lang][key] as string;

  return (
    <LangContext.Provider value={{ lang, setLang, t, isBn: lang === "bn" }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
