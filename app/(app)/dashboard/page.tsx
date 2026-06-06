"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users, AlertTriangle, Info, UserCheck, ArrowRight
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { KpiCard } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ClientStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import type { Profile, SmartInsight } from "@/types";

function useAlerts(clients: Profile[]): SmartInsight[] {
  return useMemo(() => {
    const alerts: SmartInsight[] = [];
    const now = Date.now();
    const twoWeeks = 14 * 86400000;
    const active = clients.filter((c) => c.clientStatus === "active");

    const inactive = active.filter(
      (c) => !c.lastContactedAt || now - new Date(c.lastContactedAt).getTime() > twoWeeks
    );
    if (inactive.length)
      alerts.push({ id: "inactive", type: "warning",
        message: `${inactive.length} client${inactive.length > 1 ? "s" : ""} inactive 14+ days`,
        action: "Follow up" });

    const noMatches = active.filter((c) => c.matchCount < 1);
    if (noMatches.length)
      alerts.push({ id: "no-matches", type: "warning",
        message: `${noMatches.length} active client${noMatches.length > 1 ? "s have" : " has"} no matches`,
        action: "Assign matches" });

    const incomplete = active.filter((c) => c.profileCompleteness < 70);
    if (incomplete.length)
      alerts.push({ id: "incomplete", type: "info",
        message: `${incomplete.length} profile${incomplete.length > 1 ? "s" : ""} below 70% complete`,
        action: "Complete" });

    const highReadiness = active.filter((c) => c.relationshipReadinessScore >= 85);
    if (highReadiness.length)
      alerts.push({ id: "ready", type: "success" as const,
        message: `${highReadiness.length} client${highReadiness.length > 1 ? "s" : ""} ready to match now`,
        action: "View" });

    return alerts.slice(0, 6);
  }, [clients]);
}

const ALERT_STYLE = {
  warning: { Icon: AlertTriangle, color: "text-amber-600", border: "border-l-amber-400" },
  info:    { Icon: Info,          color: "text-blue-600",  border: "border-l-blue-400"  },
  success: { Icon: UserCheck,     color: "text-green-600", border: "border-l-green-400" },
};

export default function DashboardPage() {
  const router = useRouter();
  const { clients } = useAppStore();
  const alerts = useAlerts(clients);

  const stats = useMemo(() => {
    const now = Date.now();
    const active = clients.filter((c) => c.clientStatus === "active");
    const matched = clients.filter((c) => c.clientStatus === "matched");
    return {
      total: clients.length,
      active: active.length,
      matched: matched.length,
      successRate: clients.length ? Math.round((matched.length / clients.length) * 100) : 0,
      newThisWeek: clients.filter((c) => now - new Date(c.joinedAt).getTime() < 7 * 86400000).length,
    };
  }, [clients]);

  const recent = useMemo(
    () => [...clients]
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 15),
    [clients]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Your matchmaking pipeline overview</p>
        </div>
        <Button variant="primary" size="md" onClick={() => router.push("/clients")}>
          <Users size={13} /> All Clients
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard label="Total Clients"  value={stats.total}            icon={<Users size={13} />} accent="gray"   />
          <KpiCard label="Active"         value={stats.active}           subtext="in pipeline"      accent="green"  />
          <KpiCard label="Matched"        value={stats.matched}          trend={`${stats.successRate}%`} trendUp    accent="blue"   />
          <KpiCard label="Success Rate"   value={`${stats.successRate}%`}                           accent="indigo" />
          <KpiCard label="New This Week"  value={stats.newThisWeek}      trend={stats.newThisWeek > 0 ? `+${stats.newThisWeek}` : undefined} trendUp={stats.newThisWeek > 0} accent="amber" />
        </div>

        {/* Table + Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_288px] gap-5">
          {/* Client Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Clients</h2>
              <button onClick={() => router.push("/clients")} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={11} />
              </button>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Client</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">City</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Matches</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">Readiness</th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar id={client.id} name={`${client.firstName} ${client.lastName}`} size="sm" />
                        <div>
                          <p className="text-xs font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                          <p className="text-[10px] text-gray-400">{client.age}y · {client.gender === "male" ? "Male" : "Female"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap hidden sm:table-cell">{client.city}</td>
                    <td className="px-4 py-2.5"><ClientStatusBadge status={client.clientStatus} /></td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 tabular-nums hidden md:table-cell">{client.matchCount}</td>
                    <td className="px-4 py-2.5 hidden md:table-cell">
                      <span className={`text-xs font-medium tabular-nums ${
                        client.relationshipReadinessScore >= 80 ? "text-green-700" :
                        client.relationshipReadinessScore >= 60 ? "text-amber-700" : "text-red-600"
                      }`}>
                        {client.relationshipReadinessScore}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap hidden lg:table-cell">
                      {client.lastContactedAt ? timeAgo(client.lastContactedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Alerts */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Alerts</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {alerts.length === 0 ? (
                  <p className="px-4 py-5 text-xs text-gray-400 text-center">All clear — no pending alerts</p>
                ) : alerts.map((alert) => {
                  const s = ALERT_STYLE[alert.type as keyof typeof ALERT_STYLE] ?? ALERT_STYLE.info;
                  return (
                    <div key={alert.id} className={`px-4 py-3 border-l-2 ${s.border}`}>
                      <div className="flex items-start gap-2">
                        <s.Icon size={12} className={`${s.color} mt-0.5 shrink-0`} />
                        <div>
                          <p className="text-xs text-gray-700">{alert.message}</p>
                          {alert.action && (
                            <button onClick={() => router.push("/clients")} className="text-[10px] text-blue-600 hover:underline mt-0.5">
                              {alert.action} →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Pipeline</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Active",     count: clients.filter(c => c.clientStatus === "active").length,     dot: "bg-green-500" },
                  { label: "Onboarding", count: clients.filter(c => c.clientStatus === "onboarding").length, dot: "bg-amber-500" },
                  { label: "Paused",     count: clients.filter(c => c.clientStatus === "paused").length,     dot: "bg-gray-400"  },
                  { label: "Matched",    count: clients.filter(c => c.clientStatus === "matched").length,    dot: "bg-blue-500"  },
                ].map(({ label, count, dot }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${dot} shrink-0`} />
                    <span className="text-xs text-gray-600 flex-1">{label}</span>
                    <span className="text-xs font-semibold text-gray-900 tabular-nums w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
