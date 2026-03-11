"use client";

import { useState, useEffect, useRef } from "react";
import { useCourse, COURSES, CourseId, Course } from "@/context/CourseContext";
import { useLang } from "@/context/LangContext";
import { useTheme } from "next-themes";
import {
  Keyboard, Globe, Sun, Moon, Sparkles,
  Check, X, ArrowRight,
  BookOpen, Zap, Gamepad2, Timer, BarChart3, PenLine, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CourseId3 = CourseId;

// ─── Sample preview texts ─────────────────────────────────────────────────────

const PREVIEW_TEXTS: Record<CourseId3, { lines: string[]; label: string; labelBn: string }> = {
  "en": {
    label: "English QWERTY",
    labelBn: "ইংরেজি QWERTY",
    lines: [
      "The quick brown fox jumps over the lazy dog.",
      "Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump!",
    ],
  },
  "bn-avro": {
    label: "Bangla Avro (Phonetic)",
    labelBn: "বাংলা অভ্র (ফনেটিক)",
    lines: [
      "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।",
      "আকাশ ভরা সূর্য তারা, বিশ্ব ভরা প্রাণ।",
      "অভ্র ব্যবহার করে সহজে বাংলা টাইপ করুন।",
    ],
  },
  "bn-bijoy": {
    label: "Bangla Bijoy",
    labelBn: "বাংলা বিজয়",
    lines: [
      "বাংলাদেশ আমার গর্বিত মাতৃভূমি।",
      "বিজয় কীবোর্ড দিয়ে পেশাদার বাংলা টাইপ করুন।",
      "শিক্ষা, দক্ষতা এবং অনুশীলনের মাধ্যমে এগিয়ে যান।",
    ],
  },
};

// ─── Keyboard SVG illustrations ───────────────────────────────────────────────

/** Generic key row — renders 3-D looking keys with optional Bangla sub-label */
function KbRow({
  keys, startX, y, faceColor, borderColor, textColor,
  highlightKeys = [], hlFace = "#1d4ed8", hlText = "#fff",
  subLabels, subColor = "#fff",
}: {
  keys: string[]; startX: number; y: number;
  faceColor: string; borderColor: string; textColor: string;
  highlightKeys?: string[]; hlFace?: string; hlText?: string;
  subLabels?: Record<string, string>; subColor?: string;
}) {
  const hlSet = new Set(highlightKeys);
  const KW = 24, KH = 24, S = 27;
  return (
    <>
      {keys.map((k, ki) => {
        const x = startX + ki * S;
        const isHL = hlSet.has(k);
        const fc = isHL ? hlFace : faceColor;
        const tc = isHL ? hlText : textColor;
        const sub = subLabels?.[k];
        return (
          <g key={k + ki}>
            {/* 3-D shadow */}
            <rect x={x} y={y + 2} width={KW} height={KH} rx="3" fill="rgba(0,0,0,0.55)" />
            {/* Key face */}
            <rect x={x} y={y} width={KW} height={KH} rx="3" fill={fc} stroke={borderColor} strokeWidth="0.5" />
            {/* Highlight dot for home-row nubs */}
            {isHL && <circle cx={x + 12} cy={y + KH - 4} r="1.5" fill="rgba(255,255,255,0.5)" />}
            {sub ? (
              <>
                <text x={x + 4} y={y + 9} fontSize="6" fontFamily="monospace" fontWeight="700" fill={tc} opacity="0.75">{k}</text>
                <text x={x + 12} y={y + 21} textAnchor="middle" fontSize="8" fontFamily="serif" fill={subColor}>{sub}</text>
              </>
            ) : (
              <text x={x + 12} y={y + 15} textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="600" fill={tc}>{k}</text>
            )}
          </g>
        );
      })}
    </>
  );
}

function EnglishKeyboardSVG() {
  const r1 = ["Q","W","E","R","T","Y","U","I","O","P"];
  const r2 = ["A","S","D","F","G","H","J","K","L"];
  const r3 = ["Z","X","C","V","B","N","M"];
  const FAKE = ["F","J"]; // home-row nub keys
  return (
    <svg viewBox="0 0 300 118" className="w-full h-full" aria-label="English QWERTY keyboard">
      <defs>
        <linearGradient id="kbgEn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2e45" />
          <stop offset="100%" stopColor="#0d1b2a" />
        </linearGradient>
      </defs>
      <rect width="300" height="118" rx="10" fill="url(#kbgEn)" />
      <KbRow keys={r1} startX={13} y={5}  faceColor="#243650" borderColor="#2d4a6b" textColor="#94a3b8" />
      <KbRow keys={r2} startX={20} y={33} faceColor="#243650" borderColor="#2d4a6b" textColor="#94a3b8"
        highlightKeys={FAKE} hlFace="#1d4ed8" hlText="#fff" />
      <KbRow keys={r3} startX={30} y={61} faceColor="#243650" borderColor="#2d4a6b" textColor="#94a3b8" />
      {/* Space bar */}
      <rect x="62" y={91} width="130" height="16" rx="3" fill="rgba(0,0,0,0.55)" />
      <rect x="62" y={89} width="130" height="16" rx="3" fill="#243650" stroke="#2d4a6b" strokeWidth="0.5" />
      <text x="127" y={100} textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#475569">SPACE</text>
      <text x="150" y="114" textAnchor="middle" fontSize="6" fontFamily="sans-serif" fill="#334155" letterSpacing="0.8">QWERTY Layout</text>
    </svg>
  );
}

function AvroKeyboardSVG() {
  // Avro phonetic: QWERTY layout, each key shows English + Bangla phonetic
  const r1 = ["Q","W","E","R","T","Y","U","I","O","P"];
  const r2 = ["A","S","D","F","G","H","J","K","L"];
  const r3 = ["Z","X","C","V","B","N","M"];
  const sub: Record<string, string> = {
    Q:"ক",W:"ও",E:"এ",R:"র",T:"ত",Y:"য়",U:"উ",I:"ই",O:"ো",P:"প",
    A:"আ",S:"স",D:"দ",F:"ফ",G:"গ",H:"হ",J:"জ",K:"ক",L:"ল",
    Z:"জ",X:"ক্স",C:"চ",V:"ভ",B:"ব",N:"ন",M:"ম",
  };
  return (
    <svg viewBox="0 0 300 118" className="w-full h-full" aria-label="Avro phonetic keyboard">
      <defs>
        <linearGradient id="kbgAvro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#052e16" />
          <stop offset="100%" stopColor="#021d10" />
        </linearGradient>
      </defs>
      <rect width="300" height="118" rx="10" fill="url(#kbgAvro)" />
      <KbRow keys={r1} startX={13} y={5}  faceColor="#064e3b" borderColor="#059669" textColor="#6ee7b7" subLabels={sub} subColor="#ffffff" />
      <KbRow keys={r2} startX={20} y={33} faceColor="#064e3b" borderColor="#059669" textColor="#6ee7b7"
        highlightKeys={["F","J"]} hlFace="#047857" hlText="#fff" subLabels={sub} subColor="#ffffff" />
      <KbRow keys={r3} startX={30} y={61} faceColor="#064e3b" borderColor="#059669" textColor="#6ee7b7" subLabels={sub} subColor="#ffffff" />
      <rect x="62" y={91} width="130" height="16" rx="3" fill="rgba(0,0,0,0.55)" />
      <rect x="62" y={89} width="130" height="16" rx="3" fill="#064e3b" stroke="#059669" strokeWidth="0.5" />
      <text x="127" y={100} textAnchor="middle" fontSize="7" fontFamily="sans-serif" fill="#6ee7b7">স্পেস</text>
      <text x="150" y="114" textAnchor="middle" fontSize="6" fontFamily="sans-serif" fill="#065f46" letterSpacing="0.8">Avro Phonetic Layout</text>
    </svg>
  );
}

function BijoyKeyboardSVG() {
  // Real Bijoy 2000 lowercase layout
  const r1 = ["Q","W","E","R","T","Y","U","I","O","P"];
  const r2 = ["A","S","D","F","G","H","J","K","L"];
  const r3 = ["Z","X","C","V","B","N","M"];
  // Bijoy lowercase character mapping (standard Bijoy 2000)
  const sub: Record<string, string> = {
    Q:"া", W:"ি", E:"ে", R:"র", T:"ত", Y:"ু", U:"ূ", I:"ী", O:"ো", P:"প",
    A:"অ", S:"স", D:"ড", F:"ব", G:"গ", H:"হ", J:"জ", K:"ক", L:"ল",
    Z:"য", X:"ক্ষ", C:"চ", V:"ভ", B:"ব", N:"ন", M:"ম",
  };
  return (
    <svg viewBox="0 0 300 118" className="w-full h-full" aria-label="Bijoy keyboard">
      <defs>
        <linearGradient id="kbgBijoy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e1065" />
          <stop offset="100%" stopColor="#1a0a3d" />
        </linearGradient>
      </defs>
      <rect width="300" height="118" rx="10" fill="url(#kbgBijoy)" />
      <KbRow keys={r1} startX={13} y={5}  faceColor="#4c1d95" borderColor="#7c3aed" textColor="#c4b5fd" subLabels={sub} subColor="#ffffff" />
      <KbRow keys={r2} startX={20} y={33} faceColor="#4c1d95" borderColor="#7c3aed" textColor="#c4b5fd"
        highlightKeys={["F","J"]} hlFace="#6d28d9" hlText="#fff" subLabels={sub} subColor="#ffffff" />
      <KbRow keys={r3} startX={30} y={61} faceColor="#4c1d95" borderColor="#7c3aed" textColor="#c4b5fd" subLabels={sub} subColor="#ffffff" />
      <rect x="62" y={91} width="130" height="16" rx="3" fill="rgba(0,0,0,0.55)" />
      <rect x="62" y={89} width="130" height="16" rx="3" fill="#4c1d95" stroke="#7c3aed" strokeWidth="0.5" />
      <text x="127" y={100} textAnchor="middle" fontSize="7" fontFamily="sans-serif" fill="#c4b5fd">স্পেস</text>
      <text x="150" y="114" textAnchor="middle" fontSize="6" fontFamily="sans-serif" fill="#6d28d9" letterSpacing="0.8">Bijoy Keyboard Layout</text>
    </svg>
  );
}

const KEYBOARD_SVGs: Record<CourseId3, React.FC> = {
  "en":       EnglishKeyboardSVG,
  "bn-avro":  AvroKeyboardSVG,
  "bn-bijoy": BijoyKeyboardSVG,
};

// ─── Typing Preview Modal ──────────────────────────────────────────────────────

function TypingPreviewModal({
  course,
  lang,
  onClose,
}: {
  course: Course;
  lang: "en" | "bn";
  onClose: () => void;
}) {
  const preview = PREVIEW_TEXTS[course.id];
  const [lineIdx, setLineIdx]   = useState(0);
  const [charIdx, setCharIdx]   = useState(0);
  const [typed,   setTyped]     = useState("");
  const [blinking, setBlinking] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLine = preview.lines[lineIdx];

  useEffect(() => {
    const interval = setInterval(() => setBlinking((b) => !b), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (charIdx < currentLine.length) {
      timerRef.current = setTimeout(() => {
        setTyped(currentLine.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 60);
    } else {
      timerRef.current = setTimeout(() => {
        const next = (lineIdx + 1) % preview.lines.length;
        setLineIdx(next);
        setCharIdx(0);
        setTyped("");
      }, 1400);
    }
    return () => clearTimeout(timerRef.current ?? undefined);
  }, [charIdx, lineIdx, currentLine, preview.lines.length]);

  const KbdSVG = KEYBOARD_SVGs[course.id];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-xl rounded-3xl border ${course.accentBorder} bg-white dark:bg-slate-900 shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 bg-gradient-to-r ${course.accent} bg-opacity-10`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{course.emoji}</span>
            <div>
              <p className="text-slate-900 dark:text-white font-bold text-sm">{lang === "en" ? preview.label : preview.labelBn}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{lang === "en" ? "Live typing preview" : "লাইভ টাইপিং প্রিভিউ"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard illustration */}
        <div className="px-6 pt-5 pb-3">
          <div className="w-full h-28 rounded-2xl overflow-hidden">
            <KbdSVG />
          </div>
        </div>

        {/* Typing area */}
        <div className="px-6 pb-6">
          <div className={`rounded-2xl border ${course.accentBorder} ${course.accentBg} p-4 min-h-[80px]`}>
            <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-bold mb-2">
              {lang === "en" ? "Typing demo" : "টাইপিং ডেমো"}
            </p>
            {/* Ghost text */}
            <div className="relative font-mono text-base leading-relaxed">
              <span className="text-slate-300 dark:text-slate-600">{currentLine}</span>
              <span className="absolute left-0 top-0 whitespace-pre">
                <span className={`text-slate-900 dark:text-white font-medium`}>{typed}</span>
                <span className={`inline-block w-0.5 h-5 ml-0.5 align-middle bg-slate-900 dark:bg-white rounded-full transition-opacity ${blinking ? "opacity-100" : "opacity-0"}`} />
              </span>
            </div>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {preview.lines.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === lineIdx ? `w-6 bg-gradient-to-r ${course.accent}` : "w-1.5 bg-slate-200 dark:bg-slate-700"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className={`px-6 pb-5`}>
          <p className="text-center text-slate-400 dark:text-slate-500 text-xs pb-3">
            {lang === "en" ? "Click the card to start learning this layout" : "এই লেআউটে শেখা শুরু করতে কার্ডে ক্লিক করুন"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Course features ──────────────────────────────────────────────────────────

const courseFeatures: Record<CourseId3, { en: string; bn: string }[]> = {
  "en": [
    { en: "QWERTY touch typing",        bn: "QWERTY টাচ টাইপিং"        },
    { en: "30 structured lessons",       bn: "৩০টি কাঠামোবদ্ধ পাঠ"     },
    { en: "WPM & accuracy tracking",    bn: "WPM ও নির্ভুলতা ট্র্যাকিং" },
    { en: "Typing games & speed tests", bn: "গেমস ও স্পিড টেস্ট"        },
  ],
  "bn-avro": [
    { en: "Phonetic (Avro) layout",     bn: "ফনেটিক অভ্র লেআউট"        },
    { en: "Easiest Bangla typing",       bn: "সবচেয়ে সহজ বাংলা টাইপিং"  },
    { en: "Bangla lessons & games",     bn: "বাংলা পাঠ ও গেমস"           },
    { en: "Virtual keyboard guide",     bn: "ভার্চুয়াল কীবোর্ড গাইড"    },
  ],
  "bn-bijoy": [
    { en: "Traditional Bijoy layout",   bn: "ঐতিহ্যবাহী বিজয় লেআউট"    },
    { en: "Office & professional use",  bn: "অফিস ও পেশাদার ব্যবহার"     },
    { en: "Bangla lessons & games",     bn: "বাংলা পাঠ ও গেমস"           },
    { en: "Virtual keyboard guide",     bn: "ভার্চুয়াল কীবোর্ড গাইড"    },
  ],
};

// ─── Single course card ───────────────────────────────────────────────────────

function CourseCard({
  course,
  lang,
  onSelect,
  onPreview,
}: {
  course: Course;
  lang: "en" | "bn";
  onSelect: () => void;
  onPreview: (e: React.MouseEvent) => void;
}) {
  const features = courseFeatures[course.id];
  const KbdSVG   = KEYBOARD_SVGs[course.id];
  const coverImage = course.coverImage;

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col rounded-3xl border-2 cursor-pointer
        border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60
        hover:border-transparent hover:shadow-2xl hover:scale-[1.02]
        active:scale-[0.99] transition-all duration-300 overflow-hidden`}
      style={{ boxShadow: undefined }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = course.accentColor;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${course.accentColor}25, 0 0 0 1px ${course.accentColor}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      {/* ── Gradient header ── */}
      <div className={`relative h-36 bg-gradient-to-br ${course.accent} overflow-hidden`}>

        {/* Hardcoded cover image */}
        {coverImage && (
          <img src={coverImage} alt="Course cover"
            className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Dim overlay when image present */}
        {coverImage && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
        )}
        {/* Noise texture (only without image) */}
        {!coverImage && (
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        )}
        {/* Keyboard SVG (hidden when cover image is set) */}
        {!coverImage && (
          <div className="absolute inset-0 flex items-center justify-center p-3 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
            <KbdSVG />
          </div>
        )}

        {/* Tag pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/20">
            {course.tag}
          </span>
        </div>

        {/* Preview button */}
        <button
          onClick={onPreview}
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95"
        >
          <Eye className="w-3 h-3" />
          {lang === "en" ? "Preview" : "প্রিভিউ"}
        </button>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-900 dark:text-white font-extrabold text-lg leading-tight">
              {lang === "en" ? course.nameEn : course.nameBn}
            </p>
            <p className={`text-xs font-semibold mt-0.5 ${course.accentText}`}>
              {course.id === "en"
                ? (lang === "en" ? "English · QWERTY" : "ইংরেজি · QWERTY")
                : course.id === "bn-avro"
                ? (lang === "en" ? "Bangla · Phonetic" : "বাংলা · ফনেটিক")
                : (lang === "en" ? "Bangla · Traditional" : "বাংলা · ঐতিহ্যবাহী")}
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${course.accent} shadow-lg`}>
            {course.emoji}
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2 flex-1 mb-5">
          {features.map((f) => (
            <li key={f.en} className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${course.accent}`}>
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 leading-tight">
                {lang === "en" ? f.en : f.bn}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 bg-gradient-to-r ${course.accent} group-hover:shadow-lg transition-all`}
          style={{ boxShadow: `0 4px 20px ${course.accentColor}40` }}>
          <span className="text-white font-bold text-sm">
            {lang === "en" ? "Start Learning" : "শেখা শুরু করুন"}
          </span>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

// ─── Main CourseSelector ──────────────────────────────────────────────────────

interface CourseSelectorProps {
  onAfterSelect?: () => void;
}

export default function CourseSelector({ onAfterSelect }: CourseSelectorProps = {}) {
  const { setCourse }             = useCourse();
  const { lang, setLang }         = useLang();
  const { theme, setTheme }       = useTheme();
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = !mounted || theme === "dark";
  const fontClass = lang === "bn" ? "font-hind-siliguri" : "";

  const handleSelect = (courseId: CourseId) => {
    setCourse(courseId);
    onAfterSelect?.();
  };

  const handlePreview = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setPreviewCourse(course);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col overflow-y-auto
      bg-slate-50 dark:bg-slate-950 transition-colors duration-300 ${fontClass}`}>

      {/* ── Atmospheric background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/8 dark:bg-blue-500/6 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-violet-500/8 dark:bg-violet-500/6 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-emerald-500/8 dark:bg-emerald-500/6 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between px-6 pt-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Keyboard className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-bold text-sm leading-tight">TechHat</p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-tight">Typing Master</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 text-[11px] font-semibold
              text-slate-600 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-slate-100
              px-3 py-1.5 rounded-xl
              border border-slate-200 dark:border-slate-700
              hover:bg-slate-100 dark:hover:bg-slate-800
              bg-white/80 dark:bg-transparent
              transition-all"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="w-9 h-9 rounded-xl
                border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-400
                hover:text-amber-500 dark:hover:text-yellow-400
                hover:bg-slate-100 dark:hover:bg-slate-800
                bg-white/80 dark:bg-transparent
                flex items-center justify-center transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
          bg-emerald-50 dark:bg-emerald-500/10
          border border-emerald-200 dark:border-emerald-500/25 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide">
            {lang === "en" ? "Choose your learning path" : "আপনার শেখার পথ বেছে নিন"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3
          text-slate-900 dark:text-white">
          {lang === "en" ? (
            <>Which course do you want to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">start?</span>
            </>
          ) : (
            <>কোন কোর্সে{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">শুরু করতে চান?</span>
            </>
          )}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          {lang === "en"
            ? "Click a course card to start immediately. Use the Preview button to explore each layout first."
            : "কার্ডে ক্লিক করলেই সরাসরি শুরু হবে। প্রিভিউ বাটনে ক্লিক করে আগে কীবোর্ড লেআউট দেখুন।"}
        </p>
      </div>

      {/* ── Three‑column course grid ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              lang={lang}
              onSelect={() => handleSelect(course.id)}
              onPreview={(e) => handlePreview(e, course)}
            />
          ))}
        </div>
      </div>

      {/* ── Feature strip ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-14">
        <p className="text-[10px] font-bold tracking-widest uppercase
          text-slate-400 dark:text-slate-600 mb-3 text-center">
          {lang === "en" ? "Everything included in every course" : "প্রতিটি কোর্সে যা যা আছে"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: BookOpen, en: "Structured Lessons",  bn: "কাঠামোবদ্ধ পাঠ"    },
            { icon: Timer,    en: "Speed Tests",          bn: "স্পিড টেস্ট"        },
            { icon: Gamepad2, en: "Typing Games",         bn: "টাইপিং গেমস"        },
            { icon: PenLine,  en: "Free Practice",        bn: "মুক্ত অনুশীলন"      },
            { icon: BarChart3,en: "Progress Analytics",   bn: "অগ্রগতি বিশ্লেষণ"  },
            { icon: Zap,      en: "WPM Tracking",         bn: "WPM ট্র্যাকিং"      },
          ].map(({ icon: Icon, en, bn }) => (
            <span key={en}
              className="flex items-center gap-1.5 text-xs
                text-slate-500 dark:text-slate-400
                px-3 py-1.5 rounded-full
                bg-white dark:bg-slate-800/60
                border border-slate-200 dark:border-slate-700/50
                shadow-sm">
              <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {lang === "en" ? en : bn}
            </span>
          ))}
        </div>
      </div>

      {/* ── Preview modal ── */}
      {previewCourse && (
        <TypingPreviewModal
          course={previewCourse}
          lang={lang}
          onClose={() => setPreviewCourse(null)}
        />
      )}
    </div>
  );
}
