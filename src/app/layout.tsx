import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${
          geistSans.variable
        } ${geistMono.variable} antialiased bg-gray-50`}
      >
        <SessionProvider>
          {/* Fixed left sidebar */}
          <Sidebar />

          {/* Main content — offset by sidebar width */}
          <div className="ml-64 flex flex-col min-h-screen">
            <TopBar />
            <main className="flex-1 p-6">{children}</main>

            {/* Footer */}
            <footer className="px-6 py-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()}{" "}
                <span className="font-medium text-gray-500">TechHat</span> — Made
                with ❤️ by Md Asadullah &middot; Jhenaidah, Bangladesh
              </p>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
