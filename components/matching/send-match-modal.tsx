"use client";
import { useState } from "react";
import { Sparkles, Copy, CheckCheck, Mail } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { formatHeight, formatCurrency } from "@/lib/utils";
import type { MatchScore, Profile } from "@/types";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  client: Profile;
  candidate: Profile;
  matchScore: MatchScore;
}

export function SendMatchModal({ open, onClose, client, candidate, matchScore }: Props) {
  const { markMatchSent } = useAppStore();
  const [intro, setIntro] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/match-explanation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, candidate, matchScore }),
      });
      const data = await res.json();
      setIntro(data.intro || fallback());
    } catch { setIntro(fallback()); }
    setGenerating(false);
  }

  async function sendMatch() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 600));
    markMatchSent(client.id, candidate.id);
    setSending(false);
    setDone(true);
    toast.success(`Match sent to ${client.firstName}`);
    setTimeout(() => { setDone(false); onClose(); }, 1200);
  }

  function fallback() {
    return `Dear ${client.firstName},\n\nI'm pleased to share a match I've selected for you — ${candidate.firstName} ${candidate.lastName}.\n\n${candidate.firstName} is a ${candidate.age}-year-old ${candidate.designation} at ${candidate.currentCompany}, based in ${candidate.city}. This match scores ${matchScore.totalScore}% on compatibility, with particular alignment on ${matchScore.compatibilityTags.slice(0, 2).join(" and ").toLowerCase()}.\n\nPlease let me know your thoughts and I'll coordinate an introduction.\n\nWarm regards,\nRiya Kapoor\nThe Date Crew`;
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title={`Send match to ${client.firstName}`}
      description={`Proposing ${candidate.firstName} ${candidate.lastName} as a potential match`}>
      <div className="space-y-4">
        {/* Candidate summary */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Avatar id={candidate.id} name={`${candidate.firstName} ${candidate.lastName}`} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">{candidate.firstName} {candidate.lastName}</p>
              <ScoreBadge score={matchScore.totalScore} showLabel />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {candidate.age}y · {formatHeight(candidate.heightCm)} · {candidate.city}
            </p>
            <p className="text-xs text-gray-500">
              {candidate.designation} at {candidate.currentCompany} · {formatCurrency(candidate.annualIncomeINR)} LPA
            </p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {matchScore.compatibilityTags.slice(0, 3).map((t) => (
                <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Intro */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-700">Introduction Email</label>
            <Button variant="ghost" size="sm" onClick={generate} loading={generating}>
              <Sparkles size={11} className="text-blue-500" />
              {generating ? "Generating…" : "Generate with AI"}
            </Button>
          </div>
          <Textarea
            rows={7}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="Click 'Generate with AI' for a personalised introduction, or write your own…"
          />
          {intro && (
            <button
              onClick={() => { navigator.clipboard.writeText(intro); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-1.5 transition-colors"
            >
              {copied ? <CheckCheck size={11} className="text-green-600" /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          {done ? (
            <div className="flex-1 h-8 bg-green-50 border border-green-200 rounded-md flex items-center justify-center gap-1.5 text-xs text-green-700 font-medium">
              <CheckCheck size={13} /> Sent successfully
            </div>
          ) : (
            <Button variant="primary" className="flex-1" onClick={sendMatch} loading={sending}>
              <Mail size={13} /> Send to {client.firstName}
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
