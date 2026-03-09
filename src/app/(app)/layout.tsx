import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div className="ml-64 flex flex-col min-h-screen bg-gray-50">
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
    </>
  );
}
