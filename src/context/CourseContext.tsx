"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CourseId = "en" | "bn-avro" | "bn-bijoy";

export interface Course {
  id: CourseId;
  /** Display name */
  nameEn: string;
  nameBn: string;
  /** Short label shown in UI pills */
  tag: string;
  /** Tailwind gradient for accent colour */
  accent: string;            // e.g. "from-blue-500 to-cyan-500"
  accentColor: string;       // raw hex/tailwind for text
  accentBg: string;          // bg class
  accentBorder: string;      // border class
  accentText: string;        // text class
  accentShadow: string;      // shadow class
  /** Icon emoji */
  emoji: string;
  /**
   * Hardcoded cover image for the course card header.
   * Drop the image file into /public/course-images/ and set the path here.
   * Leave empty ("") to show the default keyboard SVG illustration.
   * e.g. "/course-images/english.jpg"
   */
  coverImage: string;
}

export const COURSES: Course[] = [
  {
    id:           "en",
    nameEn:       "English Typing",
    nameBn:       "ইংরেজি টাইপিং",
    tag:          "EN",
    accent:       "from-blue-500 to-indigo-600",
    accentColor:  "#3b82f6",
    accentBg:     "bg-blue-500/10",
    accentBorder: "border-blue-500/30",
    accentText:   "text-blue-400",
    accentShadow: "shadow-blue-500/20",
    emoji:        "🇬🇧",
    coverImage:   "/course-images/english.JPG",
  },
  {
    id:           "bn-avro",
    nameEn:       "Bangla — Avro Layout",
    nameBn:       "বাংলা — অভ্র লেআউট",
    tag:          "অভ্র",
    accent:       "from-emerald-500 to-teal-500",
    accentColor:  "#10b981",
    accentBg:     "bg-emerald-500/10",
    accentBorder: "border-emerald-500/30",
    accentText:   "text-emerald-400",
    accentShadow: "shadow-emerald-500/20",
    emoji:        "🇧🇩",
    coverImage:   "/course-images/avro.jpg",
  },
  {
    id:           "bn-bijoy",
    nameEn:       "Bangla — Bijoy Layout",
    nameBn:       "বাংলা — বিজয় লেআউট",
    tag:          "বিজয়",
    accent:       "from-violet-500 to-purple-600",
    accentColor:  "#8b5cf6",
    accentBg:     "bg-violet-500/10",
    accentBorder: "border-violet-500/30",
    accentText:   "text-violet-400",
    accentShadow: "shadow-violet-500/20",
    emoji:        "🇧🇩",
    coverImage:   "/course-images/bijoy.jpg",
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────


interface CourseContextType {
  course: Course | null;
  setCourse: (id: CourseId) => void;
  clearCourse: () => void;
  hasChosen: boolean;
}

const CourseContext = createContext<CourseContextType>({
  course:      null,
  setCourse:   () => {},
  clearCourse: () => {},
  hasChosen:   false,
});

const STORAGE_KEY = "tm-course";

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courseId, setCourseId] = useState<CourseId | null>(null);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CourseId | null;
    if (stored && COURSES.find((c) => c.id === stored)) {
      setCourseId(stored);
    }
    setReady(true);
  }, []);

  const setCourse = (id: CourseId) => {
    setCourseId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  const clearCourse = () => {
    setCourseId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const course = courseId ? (COURSES.find((c) => c.id === courseId) ?? null) : null;

  if (!ready) return null;

  return (
    <CourseContext.Provider value={{ course, setCourse, clearCourse, hasChosen: !!course }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  return useContext(CourseContext);
}
