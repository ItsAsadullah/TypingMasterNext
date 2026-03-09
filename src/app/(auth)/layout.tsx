/**
 * Auth Layout — overrides the root layout for login/register pages.
 * No sidebar, no topbar — full-screen centered design.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 ml-0 flex items-center justify-center bg-slate-950 z-50">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">{children}</div>

      {/* Branding */}
      <p className="absolute bottom-4 text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} TechHat — Md Asadullah
      </p>
    </div>
  );
}
