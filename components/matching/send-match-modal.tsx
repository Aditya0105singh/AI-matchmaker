"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Copy, CheckCheck, Mail } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { formatHeight, formatCurrency, getScoreLabel } from "@/lib/utils";
import type { MatchScore, Profile } from "@/types";
import toast from "react-hot-toast";

interface SendMatchModalProps {
  open: boolean;
  onClose: () => void;
  client: Profile;
  candidate: Profile;
  matchScore: MatchScore;
}

export function SendMatchModal({ open, onClose, client, candidate, matchScore }: SendMatchModalProps) {
  const { markMatchSent } = useAppStore();
  const [intro, setIntro] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  async function generateIntro() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/match-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, candidate, matchScore }),
      });
      const data = await res.json();
      if (data.intro) setIntro(data.intro);
      else setIntro(getFallbackIntro(client, candidate, matchScore));
    } catch {
      setIntro(getFallbackIntro(client, candidate, matchScore));
    }
    setGenerating(false);
  }

  async function handleSend() {
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    markMatchSent(client.id, candidate.id);
    setSending(false);
    setSent(true);
    toast.success(`Match sent to ${client.firstName}!`, { icon: "💌" });
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  }

  function copyIntro() {
    navigator.clipboard.writeText(intro);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Send Match" description={`Sending ${candidate.firstName} ${candidate.lastName} to ${client.firstName}`}>
      <div className="space-y-5">
        {/* Candidate summary */}
        <div className="flex items-start gap-4 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
          <Avatar id={candidate.id} name={`${candidate.firstName} ${candidate.lastName}`} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-zinc-100">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <div className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                matchScore.totalScore >= 80 ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" :
                matchScore.totalScore >= 60 ? "bg-amber-500/15 text-amber-300 border-amber-500/30" :
                "bg-rose-500/15 text-rose-300 border-rose-500/30"
              }`}>
                {matchScore.totalScore}% · {getScoreLabel(matchScore.totalScore)}
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">
              {candidate.age}y · {formatHeight(candidate.heightCm)} · {candidate.city}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {candidate.designation} @ {candidate.currentCompany} · {formatCurrency(candidate.annualIncomeINR)} LPA
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {matchScore.compatibilityTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="brand" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* AI Intro */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-300">Personalized Introduction</label>
            <Button
              variant="secondary"
              size="sm"
              onClick={generateIntro}
              loading={generating}
            >
              <Sparkles size={13} className="text-fuchsia-400" />
              {generating ? "Generating…" : "Generate with AI"}
            </Button>
          </div>
          <Textarea
            rows={6}
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="Click 'Generate with AI' to create a personalized introduction, or write your own…"
          />
          {intro && (
            <button
              onClick={copyIntro}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mt-2 transition-colors"
            >
              {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {sent ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex-1 h-10 bg-emerald-600/20 border border-emerald-600/30 rounded-lg flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium"
            >
              <CheckCheck size={15} />
              Match Sent!
            </motion.div>
          ) : (
            <Button className="flex-1" onClick={handleSend} loading={sending}>
              <Mail size={14} />
              Send Match to {client.firstName}
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

function getFallbackIntro(client: Profile, candidate: Profile, match: MatchScore): string {
  return `Dear ${client.firstName},

I'm excited to share a match I've carefully selected for you — ${candidate.firstName} ${candidate.lastName}.

${candidate.firstName} is a ${candidate.age}-year-old ${candidate.designation} at ${candidate.currentCompany}, based in ${candidate.city}. With a background from ${candidate.undergraduateCollege}, ${candidate.gender === "female" ? "she" : "he"} shares your values around ${match.compatibilityTags.slice(0, 2).join(" and ").toLowerCase()}.

What makes this a strong potential match: ${match.compatibilityTags.slice(0, 3).join(", ")}.

I'd love to share more details and facilitate an introduction if you're interested. Please let me know your thoughts!

Warm regards,
Riya Kapoor
The Date Crew`;
}
