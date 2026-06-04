"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, Heart, TrendingUp, MessageSquare, Sparkles,
  UserPlus, AlertCircle, CheckCircle, Clock, Bot, ArrowRight
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { KpiCard } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, ClientStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, timeAgo, formatCurrency } from "@/lib/utils";
import type { SmartInsight, Profile } from "@/types";

function useSmartInsights(clients: Profile[]) {
  return useMemo<SmartInsight[]>(() => {
    const insights: SmartInsight[] = [];
    const activeClients = clients.filter((c) => c.clientStatus === "active");
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    const noRecent = activeClients.filter(
      (c) => !c.lastContactedAt || now - new Date(c.lastContactedAt).getTime() > oneWeek
    );
    if (noRecent.length > 0) {
      insights.push({
        id: "no-contact",
        type: "warning",
        message: `${noRecent.length} active client${noRecent.length > 1 ? "s" : ""} haven't been contacted in over a week.`,
        clientIds: noRecent.map((c) => c.id),
        action: "Follow up",
      });
    }

    const lowMatches = activeClients.filter((c) => c.matchCount < 2);
    if (lowMatches.length > 0) {
      insights.push({
        id: "low-matches",
        type: "info",
        message: `${lowMatches.length} client${lowMatches.length > 1 ? "s have" : " has"} fewer than 2 matches — needs attention.`,
        clientIds: lowMatches.map((c) => c.id),
        action: "Find Matches",
      });
    }

    const incomplete = activeClients.filter((c) => c.profileCompleteness < 75);
    if (incomplete.length > 0) {
      insights.push({
        id: "incomplete",
        type: "warning",
        message: `${incomplete.length} client profile${incomplete.length > 1 ? "s are" : " is"} less than 75% complete.`,
        clientIds: incomplete.map((c) => c.id),
        action: "Complete Profile",
      });
    }

    const highReadiness = activeClients.filter((c) => c.relationshipReadinessScore >= 85);
    if (highReadiness.length > 0) {
      insights.push({
        id: "high-readiness",
        type: "success",
        message: `${highReadiness.length} client${highReadiness.length > 1 ? "s are" : " is"} highly ready for matchmaking — prioritize them.`,
        clientIds: highReadiness.map((c) => c.id),
        action: "View",
      });
    }

    return insights.slice(0, 5);
  }, [clients]);
}

export default function DashboardPage() {
  const router = useRouter();
  const { clients, setCopilotOpen } = useAppStore();
  const insights = useSmartInsights(clients);

  const stats = useMemo(() => {
    const activeClients = clients.filter((c) => c.clientStatus === "active");
    const matched = clients.filter((c) => c.clientStatus === "matched");
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = clients.filter(
      (c) => now - new Date(c.joinedAt).getTime() < oneWeek
    ).length;
    const totalMatches = clients.reduce((s, c) => s + c.matchCount, 0);
    return {
      total: clients.length,
      active: activeClients.length,
      successRate: clients.length > 0 ? Math.round((matched.length / clients.length) * 100) : 0,
      feedbackPending: Math.floor(activeClients.length * 0.3),
      newThisWeek,
      totalMatches,
    };
  }, [clients]);

  const recentClients = useMemo(() =>
    [...clients]
      .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
      .slice(0, 12),
    [clients]
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-zinc-100"
          >
            Good morning, Riya 👋
          </motion.h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here's your matchmaking overview for today
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setCopilotOpen(true)}>
          <Bot size={14} className="text-fuchsia-400" />
          Ask AI Copilot
        </Button>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <KpiCard label="Total Clients" value={stats.total} icon={<Users size={18} />} delta="+3 this month" />
        <KpiCard label="Active Clients" value={stats.active} icon={<Heart size={18} />} variant="brand" />
        <KpiCard label="Success Rate" value={`${stats.successRate}%`} icon={<TrendingUp size={18} />} variant="success" delta="+2% vs last mo" />
        <KpiCard label="Feedback Pending" value={stats.feedbackPending} icon={<MessageSquare size={18} />} variant="warning" />
        <KpiCard label="New This Week" value={stats.newThisWeek} icon={<UserPlus size={18} />} />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Client Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2 bg-zinc-900/60 rounded-xl border border-zinc-800"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-zinc-200">Client List</h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
              View All <ArrowRight size={13} />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase tracking-wider border-b border-zinc-800">
                  <th className="text-left px-5 py-3 font-medium">Client</th>
                  <th className="text-left px-3 py-3 font-medium">City</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-left px-3 py-3 font-medium">Matches</th>
                  <th className="text-left px-3 py-3 font-medium">Last Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {recentClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors group"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar id={client.id} name={`${client.firstName} ${client.lastName}`} size="sm" />
                        <div>
                          <p className="font-medium text-zinc-200 group-hover:text-fuchsia-300 transition-colors">
                            {client.firstName} {client.lastName}
                          </p>
                          <p className="text-xs text-zinc-500">{client.age}y · {client.gender === "male" ? "M" : "F"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-zinc-400">{client.city}</td>
                    <td className="px-3 py-3">
                      <ClientStatusBadge status={client.clientStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-zinc-300 tabular-nums">{client.matchCount}</span>
                    </td>
                    <td className="px-3 py-3 text-zinc-500 text-xs">
                      {client.lastContactedAt ? timeAgo(client.lastContactedAt) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Smart Insights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
              <Sparkles size={16} className="text-fuchsia-400" />
              <h2 className="font-semibold text-zinc-200">Smart Insights</h2>
            </div>
            <div className="p-4 space-y-3">
              {insights.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">All caught up! 🎉</p>
              )}
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border text-sm ${
                    insight.type === "warning"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : insight.type === "success"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-sky-500/5 border-sky-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {insight.type === "warning" ? (
                      <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    ) : insight.type === "success" ? (
                      <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <Clock size={14} className="text-sky-400 mt-0.5 shrink-0" />
                    )}
                    <p className="text-zinc-300 leading-snug">{insight.message}</p>
                  </div>
                  {insight.action && (
                    <button
                      className="mt-2 text-xs text-fuchsia-400 hover:text-fuchsia-300 font-medium"
                      onClick={() => router.push("/clients")}
                    >
                      {insight.action} →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">Pipeline Overview</h3>
            {[
              { label: "Active", count: clients.filter((c) => c.clientStatus === "active").length, color: "bg-emerald-500" },
              { label: "Paused", count: clients.filter((c) => c.clientStatus === "paused").length, color: "bg-amber-500" },
              { label: "Matched", count: clients.filter((c) => c.clientStatus === "matched").length, color: "bg-fuchsia-500" },
              { label: "Onboarding", count: clients.filter((c) => c.clientStatus === "onboarding").length, color: "bg-sky-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-sm text-zinc-400 flex-1">{label}</span>
                <span className="text-sm font-medium text-zinc-200 tabular-nums">{count}</span>
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${(count / clients.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
