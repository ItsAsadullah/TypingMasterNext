import TypingPanel from "@/components/auth/TypingPanel";

/**
 * Auth Layout — full-screen split design.
 * Left (44%): form content (login / register)
 * Right (56%): animated typing panel
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-[#080818]">

      {/* ── LEFT — Form panel ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col w-full md:w-[44%] h-full overflow-y-auto">
        {children}
      </div>

      {/* ── RIGHT — Animated typing panel ───────────────────────────── */}
      <div className="hidden md:block flex-1 h-full">
        <TypingPanel />
      </div>

    </div>
  );
}

