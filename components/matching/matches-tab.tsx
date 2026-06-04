"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitCompare, X, SortAsc } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { MatchCard } from "./match-card";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types";

const SORT_OPTIONS = [
  { value: "score", label: "Compatibility" },
  { value: "age", label: "Age" },
  { value: "income", label: "Income" },
] as const;

export function MatchesTab({ client }: { client: Profile }) {
  const { getMatchesForClient, getProfileById } = useAppStore();
  const matches = getMatchesForClient(client.id);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "age" | "income">("score");

  const sorted = useMemo(() => {
    return [...matches].sort((a, b) => {
      if (sortBy === "score") return b.totalScore - a.totalScore;
      const pa = getProfileById(a.candidateId);
      const pb = getProfileById(b.candidateId);
      if (!pa || !pb) return 0;
      if (sortBy === "age") return pa.age - pb.age;
      if (sortBy === "income") return pb.annualIncomeINR - pa.annualIncomeINR;
      return 0;
    });
  }, [matches, sortBy, getProfileById]);

  function toggleCompare(candidateId: string) {
    setCompareIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : prev.length < 3
        ? [...prev, candidateId]
        : prev
    );
  }

  const compareProfiles = compareIds
    .map((id) => ({ id, candidate: getProfileById(id), match: matches.find((m) => m.candidateId === id) }))
    .filter((x) => x.candidate && x.match);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">{matches.length} matches found for {client.firstName}</p>
          {compareIds.length > 0 && (
            <p className="text-xs text-fuchsia-400 mt-0.5">
              {compareIds.length} selected for comparison
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-8 px-3 bg-zinc-800/60 border border-zinc-700 text-zinc-300 text-xs rounded-lg focus:outline-none focus:border-fuchsia-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
          {compareIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>
              <X size={12} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Comparison Panel */}
      {compareIds.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/40 border border-fuchsia-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <GitCompare size={15} className="text-fuchsia-400" />
            <p className="text-sm font-semibold text-zinc-200">Comparing {compareIds.length} candidates</p>
          </div>
          <div className={`grid gap-4 ${compareProfiles.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {compareProfiles.map(({ id, candidate, match }) => (
              <div key={id} className="bg-zinc-900/60 rounded-xl border border-zinc-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-zinc-200">
                    {candidate!.firstName} {candidate!.lastName}
                  </p>
                  <span className={`text-sm font-bold ${
                    match!.totalScore >= 80 ? "text-emerald-400" :
                    match!.totalScore >= 60 ? "text-amber-400" : "text-rose-400"
                  }`}>{match!.totalScore}%</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(match!.breakdown).map(([key, score]) => {
                    const labels: Record<string, string> = {
                      kidsPreference: "Kids", locationCompatibility: "Location",
                      educationCompatibility: "Education", religionAlignment: "Religion",
                      lifestyleCompatibility: "Lifestyle", careerCompatibility: "Career",
                      familyValues: "Family", incomeExpectations: "Income", personalityFit: "Personality"
                    };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-zinc-600 w-20 shrink-0">{labels[key]}</span>
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400 tabular-nums w-6 text-right">{score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Match Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((match, i) => (
          <MatchCard
            key={match.candidateId}
            match={match}
            client={client}
            index={i}
            compareMode
            onCompare={toggleCompare}
            isComparing={compareIds.includes(match.candidateId)}
          />
        ))}
      </div>
    </div>
  );
}
