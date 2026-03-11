import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/context/LangContext";
import { CourseProvider } from "@/context/CourseContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  weight: ["400", "500", "600", "700"],
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "TechHat Typing Master",
  description:
    "A modern, bilingual typing tutor — learn Bangla & English typing with lessons, speed tests, and games.",
  authors: [{ name: "Md Asadullah", url: "https://techhat.shop" }],
  keywords: ["typing tutor", "bangla typing", "bijoy", "avro", "WPM", "typing speed"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${
          geistSans.variable
        } ${geistMono.variable} ${hindSiliguri.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LangProvider>
            <CourseProvider>
              <SessionProvider>{children}</SessionProvider>
            </CourseProvider>
          </LangProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}
