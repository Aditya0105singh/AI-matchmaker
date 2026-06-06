"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, LogOut, ChevronLeft,
  ChevronRight, Heart, X
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients",   icon: Users,           label: "Clients"   },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, logout } = useAppStore();

  function handleLogout() {
    logout();
    toast("Logged out", { icon: "👋" });
    router.push("/login");
  }

  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 shrink-0 z-40",
        "transition-transform duration-200 shadow-[1px_0_0_0_#E5E7EB]",
        // Mobile: fixed overlay drawer; Desktop: static flex child
        "fixed md:relative",
        // Mobile: slide in/out; Desktop: always visible
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        // Width: always full on mobile, collapsed/expanded on desktop
        "w-54",
        collapsed ? "md:w-13" : "md:w-54",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3.5 py-4 border-b border-gray-200 shrink-0 overflow-hidden">
        <div className="h-7 w-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
          <Heart size={13} className="text-white fill-white" />
        </div>
        <div className={cn("min-w-0", collapsed ? "md:hidden" : "")}>
          <p className="text-sm font-semibold text-gray-900 whitespace-nowrap leading-tight">The Date Crew</p>
          <p className="text-[10px] text-gray-400 whitespace-nowrap">Matchmaker Platform</p>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="ml-auto h-7 w-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors md:hidden"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 md:py-1.5 rounded-md text-sm transition-colors group",
                active
                  ? "bg-indigo-50 text-indigo-700 font-medium border-l-2 border-indigo-600 rounded-l-none"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span className={cn("whitespace-nowrap", collapsed ? "md:hidden" : "")}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="px-2 py-2 border-t border-gray-200 hidden md:block">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* User */}
      <div className="px-2.5 pb-3 border-t border-gray-200 pt-2.5 overflow-hidden">
        <div className="flex items-center gap-2">
          <Avatar id="MM_001" name="Riya Kapoor" size="sm" className="shrink-0" />
          <div className={cn("flex-1 min-w-0", collapsed ? "md:hidden" : "")}>
            <p className="text-xs font-medium text-gray-800 truncate">Riya Kapoor</p>
            <p className="text-[10px] text-gray-400 truncate">Senior Matchmaker</p>
          </div>
          <button
            onClick={handleLogout}
            className={cn("p-1 text-gray-400 hover:text-red-500 transition-colors rounded", collapsed ? "md:hidden" : "")}
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
