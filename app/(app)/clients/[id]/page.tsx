"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, Heart, Users, MessageSquare,
  Sparkles, Settings, Copy, CheckCheck
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { ClientStatusBadge } from "@/components/ui/badge";
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
  { id: "overview",     label: "Overview",     icon: User         },
  { id: "family",       label: "Family",        icon: Users        },
  { id: "preferences",  label: "Preferences",  icon: Settings     },
  { id: "notes",        label: "Notes",         icon: MessageSquare },
  { id: "matches",      label: "Matches",       icon: Heart        },
  { id: "ai",           label: "AI Insights",   icon: Sparkles     },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getClient, setCopilotOpen, setCopilotContext } = useAppStore();
  const client = getClient(id);
  const [tab, setTab] = useState<TabId>("overview");
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        Client not found.{" "}
        <Button variant="link" size="md" onClick={() => router.push("/clients")} className="ml-1">
          Back to clients
        </Button>
      </div>
    );
  }

  async function generateSummary() {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/ai/profile-summary", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: client }),
      });
      const data = await res.json();
      setAiSummary(data.summary || fallback());
    } catch { setAiSummary(fallback()); }
    setLoadingSummary(false);
  }

  function fallback() {
    return `${client!.firstName} ${client!.lastName} is a ${client!.age}-year-old ${client!.designation} at ${client!.currentCompany} based in ${client!.city}. ${client!.gender === "male" ? "He" : "She"} earns ${formatCurrency(client!.annualIncomeINR)} LPA and holds a ${client!.degree} from ${client!.undergraduateCollege}.\n\nFamily background: ${client!.familyValues} ${client!.familyType}, ${client!.religion}. Wants kids: ${client!.wantKids}. Open to relocate: ${client!.openToRelocate}.\n\nRelationship readiness score: ${client!.relationshipReadinessScore}/100. Profile: ${client!.profileCompleteness}% complete.`;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => router.push("/clients")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={14} /> Clients
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"
            onClick={() => { setCopilotContext({ clientId: client.id }); setCopilotOpen(true); }}
          >
            <Sparkles size={13} className="text-blue-500" /> AI Assistant
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setTab("matches")}>
            <Heart size={13} /> Matches
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-start gap-4">
            <Avatar id={client.id} name={`${client.firstName} ${client.lastName}`} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg font-semibold text-gray-900">{client.firstName} {client.lastName}</h1>
                <ClientStatusBadge status={client.clientStatus} />
              </div>
              <p className="text-sm text-gray-600 mt-0.5">
                {client.age}y · {client.gender === "male" ? "Male" : "Female"} · {client.city}, {client.state}
              </p>
              <p className="text-sm text-gray-500">
                {client.designation} at {client.currentCompany} · {formatCurrency(client.annualIncomeINR)} LPA
              </p>
              <p className="text-sm text-gray-500">{client.religion} · {client.caste} · {client.maritalStatus.replace("_", " ")}</p>

              {/* Quick stats */}
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <CircularProgress value={client.profileCompleteness} size={30} strokeWidth={3} />
                  <div>
                    <p className="text-[10px] text-gray-400 leading-none">Profile</p>
                    <p className="text-xs font-medium text-gray-700">{client.profileCompleteness}%</p>
                  </div>
                </div>
                <Stat label="Matches" value={client.matchCount} />
                <Stat label="Readiness" value={client.relationshipReadinessScore} />
                <Stat label="Joined" value={formatDate(client.joinedAt)} />
                {client.lastContactedAt && <Stat label="Last Contact" value={timeAgo(client.lastContactedAt)} />}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-0 -mb-px overflow-x-auto">
            {TABS.map(({ id: tid, label, icon: Icon }) => (
              <button
                key={tid}
                onClick={() => setTab(tid)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tab === tid
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6 max-w-5xl">
          {tab === "overview" && <ProfileOverview profile={client} />}
          {tab === "family" && <ProfileFamily profile={client} />}
          {tab === "preferences" && <ProfilePreferences profile={client} />}
          {tab === "notes" && <NotesTimeline clientId={client.id} />}
          {tab === "matches" && <MatchesTab client={client} />}
          {tab === "ai" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">AI Profile Summary</h3>
                  <Button variant="secondary" size="sm" onClick={generateSummary} loading={loadingSummary}>
                    <Sparkles size={12} className="text-blue-500" />
                    {aiSummary ? "Regenerate" : "Generate"}
                  </Button>
                </div>
                {aiSummary ? (
                  <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{aiSummary}</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(aiSummary); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    >
                      {copied ? <CheckCheck size={13} className="text-green-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 border-dashed rounded-lg p-8 text-center">
                    <Sparkles size={20} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Generate an AI-powered matchmaker brief for this profile</p>
                  </div>
                )}
              </div>

              {/* Readiness breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Readiness Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Profile Completeness",  score: client.profileCompleteness },
                    { label: "Preferences Clarity",   score: client.partnerReligionPref.length > 0 ? 80 : 40 },
                    { label: "Engagement",            score: client.matchCount > 5 ? 90 : client.matchCount > 2 ? 65 : 40 },
                    { label: "Last Contacted",        score: client.lastContactedAt ? 85 : 30 },
                    { label: "Overall Readiness",     score: client.relationshipReadinessScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
                      <div className="flex items-end gap-1">
                        <span className={`text-xl font-bold ${
                          score >= 80 ? "text-green-700" : score >= 60 ? "text-amber-700" : "text-red-600"
                        }`}>{score}</span>
                        <span className="text-xs text-gray-400 mb-0.5">/100</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 leading-none">{label}</p>
      <p className="text-xs font-medium text-gray-700 mt-0.5">{value}</p>
    </div>
  );
}
