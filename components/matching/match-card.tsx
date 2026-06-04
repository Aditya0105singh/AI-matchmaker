"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Send, GitCompare, Sparkles, CheckCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreBadge } from "@/components/ui/score-badge";
import { SendMatchModal } from "./send-match-modal";
import { CompatibilityRadar } from "./compatibility-radar";
import { formatHeight, formatCurrency, getScoreLabel } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { MatchScore, Profile } from "@/types";

const DIM_LABELS: Record<string, string> = {
  kidsPreference: "Family Planning", locationCompatibility: "Location",
  educationCompatibility: "Education", religionAlignment: "Religion",
  lifestyleCompatibility: "Lifestyle", careerCompatibility: "Career",
  familyValues: "Family Values", incomeExpectations: "Income", personalityFit: "Personality",
};

interface MatchCardProps {
  match: MatchScore;
  client: Profile;
  index: number;
  onCompare?: (id: string) => void;
  isComparing?: boolean;
}

export function MatchCard({ match, client, index, onCompare, isComparing }: MatchCardProps) {
  const { getProfileById, sentMatches } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [ai, setAi] = useState(match.aiExplanation);

  const candidate = getProfileById(match.candidateId);
  const sent = sentMatches[client.id]?.includes(match.candidateId);

  if (!candidate) return null;

  async function loadAI() {
    if (ai) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/ai/match-explanation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, candidate, matchScore: match }),
      });
      const data = await res.json();
      if (data.explanation) setAi(data.explanation);
    } catch {}
    setLoadingAI(false);
  }

  return (
    <>
      <div className={`bg-white border rounded-lg overflow-hidden transition-colors ${
        isComparing ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200"
      }`}>
        <div className="p-4">
          {/* Rank + score */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-mono">#{index + 1}</span>
              <ScoreBadge score={match.totalScore} showLabel />
            </div>
            {sent && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle size={11} /> Sent
              </span>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-start gap-3">
            <Avatar id={candidate.id} name={`${candidate.firstName} ${candidate.lastName}`} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{candidate.firstName} {candidate.lastName}</p>
              <p className="text-xs text-gray-500">{candidate.age}y · {formatHeight(candidate.heightCm)} · {candidate.city}</p>
              <p className="text-xs text-gray-500">{candidate.designation} at {candidate.currentCompany}</p>
              <p className="text-xs text-gray-400">{formatCurrency(candidate.annualIncomeINR)} LPA · {candidate.religion}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {match.compatibilityTags.slice(0, 3).map((t) => (
              <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 mt-3">
            <Button
              variant={sent ? "success" : "primary"}
              size="sm"
              onClick={() => !sent && setShowModal(true)}
              disabled={sent}
              className="flex-1"
            >
              <Send size={11} />
              {sent ? "Match sent" : "Send match"}
            </Button>
            {onCompare && (
              <Button
                variant={isComparing ? "outline" : "secondary"}
                size="icon"
                onClick={() => onCompare(candidate.id)}
                title="Compare"
              >
                <GitCompare size={13} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setExpanded(!expanded); if (!expanded) loadAI(); }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </Button>
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
            {/* Breakdown bars */}
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Score Breakdown</p>
              <div className="space-y-1.5">
                {Object.entries(match.breakdown).map(([key, score]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-28 shrink-0">{DIM_LABELS[key]}</span>
                    <Progress value={score} className="flex-1" />
                    <span className="text-[10px] font-medium text-gray-600 tabular-nums w-6 text-right">{score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar */}
            <CompatibilityRadar match={match} />

            {/* AI analysis */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={11} className="text-blue-500" />
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                  AI Analysis {loadingAI && <span className="text-gray-400 normal-case font-normal">Loading…</span>}
                </p>
              </div>
              {ai ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-700 leading-relaxed">{ai.summary}</p>
                  {ai.strengths.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-green-700 mb-1">Strengths</p>
                      <ul className="space-y-0.5">
                        {ai.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-green-600 shrink-0">+</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ai.concerns.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-amber-700 mb-1">Considerations</p>
                      <ul className="space-y-0.5">
                        {ai.concerns.map((c, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-amber-600 shrink-0">·</span>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ai.conversationStarters.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-blue-700 mb-1">Conversation Starters</p>
                      <ul className="space-y-0.5">
                        {ai.conversationStarters.map((q, i) => (
                          <li key={i} className="text-xs text-gray-600 flex gap-1.5"><span className="text-blue-500 shrink-0">?</span>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : !loadingAI && (
                <p className="text-xs text-gray-400">Expand to load AI analysis.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <SendMatchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        client={client}
        candidate={candidate}
        matchScore={match}
      />
    </>
  );
}
