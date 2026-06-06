"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Heart } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Sidebar } from "@/components/layout/sidebar";
import { AICopilot } from "@/components/copilot/ai-copilot";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      <main className="flex-1 overflow-y-auto min-w-0 bg-[#F4F6F8]">
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden flex items-center h-12 px-4 bg-white border-b border-gray-200 sticky top-0 z-20 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="h-9 w-9 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <div className="h-5 w-5 rounded-md bg-gray-900 flex items-center justify-center">
              <Heart size={10} className="text-white fill-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">The Date Crew</span>
          </div>
          <div className="w-9" />
        </div>

        {children}
      </main>

      <AICopilot />
    </div>
  );
}
