"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Eye, GitCompare, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SendMatchModal } from "./send-match-modal";
import { CompatibilityRadar } from "./compatibility-radar";
import { formatHeight, formatCurrency, getScoreColor, getScoreLabel } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { MatchScore, Profile } from "@/types";

interface MatchCardProps {
  match: MatchScore;
  client: Profile;
  index: number;
  compareMode?: boolean;
  onCompare?: (candidateId: string) => void;
  isComparing?: boolean;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  kidsPreference: "Family Planning",
  locationCompatibility: "Location",
  educationCompatibility: "Education",
  religionAlignment: "Religion",
  lifestyleCompatibility: "Lifestyle",
  careerCompatibility: "Career",
  familyValues: "Family Values",
  incomeExpectations: "Income",
  personalityFit: "Personality",
};

export function MatchCard({ match, client, index, compareMode, onCompare, isComparing }: MatchCardProps) {
  const { getProfileById, sentMatches } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(match.aiExplanation);

  const candidate = getProfileById(match.candidateId);
  const alreadySent = sentMatches[client.id]?.includes(match.candidateId);

  if (!candidate) return null;

  async function loadAIExplanation() {
    if (aiExplanation) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/match-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, candidate, matchScore: match }),
      });
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch {}
    setLoadingAI(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-zinc-900/60 border rounded-xl overflow-hidden transition-all ${
          isComparing ? "border-fuchsia-500/50 ring-1 ring-fuchsia-500/20" : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        {/* Header */}
        <div className="p-4">
          {/* Rank + score */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-600 font-mono w-5">#{index + 1}</span>
              <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
                match.totalScore >= 80 ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                match.totalScore >= 60 ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                "bg-rose-500/10 text-rose-300 border-rose-500/20"
              }`}>
                {match.totalScore}%
              </div>
              <span className="text-xs text-zinc-500">{getScoreLabel(match.totalScore)}</span>
            </div>
            {alreadySent && <Badge variant="success" className="text-xs">Sent ✓</Badge>}
          </div>

          {/* Profile info */}
          <div className="flex items-start gap-3">
            <Avatar id={candidate.id} name={`${candidate.firstName} ${candidate.lastName}`} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-200">{candidate.firstName} {candidate.lastName}</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {candidate.age}y · {formatHeight(candidate.heightCm)} · {candidate.city}
              </p>
              <p className="text-xs text-zinc-500">
                {candidate.designation} @ {candidate.currentCompany}
              </p>
              <p className="text-xs text-zinc-500">
                {formatCurrency(candidate.annualIncomeINR)} LPA · {candidate.religion}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {match.compatibilityTags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="brand" className="text-xs">{tag}</Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              variant={alreadySent ? "secondary" : "primary"}
              size="sm"
              onClick={() => !alreadySent && setShowSendModal(true)}
              disabled={alreadySent}
              className="flex-1"
            >
              <Send size={12} />
              {alreadySent ? "Sent" : "Send Match"}
            </Button>
            {onCompare && (
              <Button
                variant={isComparing ? "brand" as "primary" : "secondary"}
                size="icon"
                onClick={() => onCompare(candidate.id)}
                title="Compare"
              >
                <GitCompare size={14} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setExpanded(!expanded);
                if (!expanded && !aiExplanation) loadAIExplanation();
              }}
              title="Details"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </div>

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-800 p-4 space-y-4"
          >
            {/* Score breakdown */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Score Breakdown</p>
              <div className="space-y-2">
                {Object.entries(match.breakdown).map(([key, score]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500 w-32 shrink-0">{BREAKDOWN_LABELS[key]}</span>
                    <Progress value={score} className="flex-1" />
                    <span className={`text-xs font-medium w-8 text-right tabular-nums ${getScoreColor(score)}`}>{score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Compatibility Radar</p>
              <CompatibilityRadar match={match} />
            </div>

            {/* AI Explanation */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-fuchsia-400" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Analysis</p>
                {loadingAI && <span className="text-xs text-zinc-500 animate-pulse">Analyzing…</span>}
              </div>

              {aiExplanation ? (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">{aiExplanation.summary}</p>
                  {aiExplanation.strengths.length > 0 && (
                    <div>
                      <p className="text-xs text-emerald-400 font-medium mb-1">Strengths</p>
                      <ul className="space-y-1">
                        {aiExplanation.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex gap-2">
                            <span className="text-emerald-500 shrink-0">+</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiExplanation.concerns.length > 0 && (
                    <div>
                      <p className="text-xs text-amber-400 font-medium mb-1">Considerations</p>
                      <ul className="space-y-1">
                        {aiExplanation.concerns.map((c, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex gap-2">
                            <span className="text-amber-500 shrink-0">!</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiExplanation.conversationStarters.length > 0 && (
                    <div>
                      <p className="text-xs text-sky-400 font-medium mb-1">Conversation Starters</p>
                      <ul className="space-y-1">
                        {aiExplanation.conversationStarters.map((q, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex gap-2">
                            <span className="text-sky-500 shrink-0">?</span> {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                !loadingAI && (
                  <p className="text-xs text-zinc-500">
                    Expand this section to load AI analysis.
                  </p>
                )
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <SendMatchModal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        client={client}
        candidate={candidate}
        matchScore={match}
      />
    </>
  );
}
