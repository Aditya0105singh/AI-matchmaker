"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Heart, Users, MessageSquare,
  Sparkles, Settings, Bot, Copy, CheckCheck
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge, ClientStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/progress";
import { ProfileOverview } from "@/components/profile/profile-overview";
import { ProfileFamily } from "@/components/profile/profile-family";
import { ProfilePreferences } from "@/components/profile/profile-preferences";
import { NotesTimeline } from "@/components/notes/notes-timeline";
import { MatchesTab } from "@/components/matching/matches-tab";
import { formatDate, timeAgo, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "family", label: "Family & Lifestyle", icon: Users },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "notes", label: "Notes", icon: MessageSquare },
  { id: "matches", label: "Matches", icon: Heart },
  { id: "ai", label: "AI Insights", icon: Sparkles },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getClient, setCopilotOpen, setCopilotContext } = useAppStore();
  const client = getClient(id);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Client not found.
        <Button variant="ghost" size="sm" onClick={() => router.push("/clients")} className="ml-2">
          Back
        </Button>
      </div>
    );
  }

  async function generateAISummary() {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/ai/profile-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: client }),
      });
      const data = await res.json();
      setAiSummary(data.summary || getFallbackSummary());
    } catch {
      setAiSummary(getFallbackSummary());
    }
    setLoadingSummary(false);
  }

  function getFallbackSummary() {
    return `${client!.firstName} ${client!.lastName} is a ${client!.age}-year-old ${client!.designation} at ${client!.currentCompany} based in ${client!.city}.

They are from a ${client!.familyValues} ${client!.familyType} family background with ${client!.religion} values. ${client!.gender === "male" ? "He" : "She"} earns ${formatCurrency(client!.annualIncomeINR)} LPA and has studied at ${client!.undergraduateCollege}.

Key compatibility preferences: looking for someone between ${client!.partnerAgeMin}–${client!.partnerAgeMax} years, ${client!.openToRelocate === "yes" ? "open to relocation" : "prefers to stay in " + client!.city}, and ${client!.wantKids === "yes" ? "wants children" : client!.wantKids === "no" ? "does not want children" : "is open to having children"}.

Relationship readiness score: ${client!.relationshipReadinessScore}/100. Profile is ${client!.profileCompleteness}% complete.`;
  }

  function openCopilotForClient() {
    setCopilotContext({ clientId: client!.id });
    setCopilotOpen(true);
  }

  return (
    <div className="max-w-[1200px] p-6 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
        <ArrowLeft size={14} /> Back to Clients
      </Button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar id={client.id} name={`${client.firstName} ${client.lastName}`} size="xl" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-zinc-100">
                    {client.firstName} {client.lastName}
                  </h1>
                  <ClientStatusBadge status={client.clientStatus} />
                </div>
                <p className="text-zinc-400 mt-0.5">
                  {client.age}y · {client.gender === "male" ? "Male" : "Female"} · {client.city}, {client.state}
                </p>
                <p className="text-zinc-500 text-sm mt-1">
                  {client.designation} @ {client.currentCompany} · {formatCurrency(client.annualIncomeINR)} LPA
                </p>
                <p className="text-zinc-500 text-sm">
                  {client.religion} · {client.caste} · {client.maritalStatus.replace("_", " ")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={openCopilotForClient}>
                  <Bot size={13} className="text-fuchsia-400" /> AI Copilot
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setActiveTab("matches"); }}
                >
                  <Heart size={13} /> View Matches
                </Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CircularProgress value={client.profileCompleteness} size={36} strokeWidth={3} />
                <span className="text-xs text-zinc-500">Profile</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">{client.matchCount}</p>
                <p className="text-xs text-zinc-500">Matches</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-fuchsia-300">{client.relationshipReadinessScore}</p>
                <p className="text-xs text-zinc-500">Readiness</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-200">{formatDate(client.joinedAt)}</p>
                <p className="text-xs text-zinc-500">Joined</p>
              </div>
              {client.lastContactedAt && (
                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-200">{timeAgo(client.lastContactedAt)}</p>
                  <p className="text-xs text-zinc-500">Last Contact</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/40 border border-zinc-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tabId
                ? "bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-600/20"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6"
      >
        {activeTab === "overview" && <ProfileOverview profile={client} />}
        {activeTab === "family" && <ProfileFamily profile={client} />}
        {activeTab === "preferences" && <ProfilePreferences profile={client} />}
        {activeTab === "notes" && <NotesTimeline clientId={client.id} />}
        {activeTab === "matches" && <MatchesTab client={client} />}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-fuchsia-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">AI Profile Summary</h3>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateAISummary}
                  loading={loadingSummary}
                >
                  <Sparkles size={12} className="text-fuchsia-400" />
                  {aiSummary ? "Regenerate" : "Generate Summary"}
                </Button>
              </div>
              {aiSummary ? (
                <div className="relative bg-zinc-800/30 rounded-xl border border-zinc-700/30 p-4">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{aiSummary}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiSummary);
                      setCopiedSummary(true);
                      setTimeout(() => setCopiedSummary(false), 2000);
                    }}
                    className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {copiedSummary ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              ) : (
                <div className="bg-zinc-800/20 border border-zinc-800 rounded-xl p-6 text-center">
                  <Sparkles size={24} className="text-fuchsia-500/50 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Generate an AI-powered summary of this profile</p>
                </div>
              )}
            </div>

            {/* Relationship Readiness Breakdown */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-3">Relationship Readiness Score</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Profile Completeness", score: client.profileCompleteness },
                  { label: "Clarity of Preferences", score: client.partnerReligionPref.length > 0 ? 80 : 40 },
                  { label: "Communication", score: client.lastContactedAt ? 85 : 30 },
                  { label: "Match Engagement", score: client.matchCount > 5 ? 90 : client.matchCount > 2 ? 65 : 40 },
                  { label: "Overall Readiness", score: client.relationshipReadinessScore },
                ].map(({ label, score }) => (
                  <div key={label} className="bg-zinc-800/30 rounded-xl border border-zinc-700/20 p-3">
                    <p className="text-xs text-zinc-500 mb-2">{label}</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-2xl font-bold ${score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"}`}>
                        {score}
                      </span>
                      <span className="text-xs text-zinc-600 mb-1">/100</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Copilot CTA */}
            <div
              onClick={openCopilotForClient}
              className="bg-gradient-to-r from-fuchsia-900/20 to-violet-900/20 border border-fuchsia-700/20 rounded-xl p-5 cursor-pointer hover:border-fuchsia-600/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-fuchsia-600/20 flex items-center justify-center">
                  <Bot size={18} className="text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Ask AI Copilot about {client.firstName}</p>
                  <p className="text-xs text-zinc-500">Get instant insights, match recommendations, or risk analysis</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
