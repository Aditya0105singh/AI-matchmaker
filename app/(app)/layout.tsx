"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Sidebar } from "@/components/layout/sidebar";
import { AICopilot } from "@/components/copilot/ai-copilot";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0 bg-[#F4F6F8]">
        {children}
      </main>
      <AICopilot />
    </div>
  );
}
