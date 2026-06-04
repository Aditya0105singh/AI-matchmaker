"use client";
import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { MatchCard } from "./match-card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Progress } from "@/components/ui/progress";
import type { Profile } from "@/types";

export function MatchesTab({ client }: { client: Profile }) {
  const { getMatchesForClient, getProfileById } = useAppStore();
  const matches = getMatchesForClient(client.id);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [sort, setSort] = useState<"score" | "age" | "income">("score");

  const sorted = useMemo(() => {
    return [...matches].sort((a, b) => {
      if (sort === "score") return b.totalScore - a.totalScore;
      const pa = getProfileById(a.candidateId);
      const pb = getProfileById(b.candidateId);
      if (!pa || !pb) return 0;
      if (sort === "age")    return pa.age - pb.age;
      if (sort === "income") return pb.annualIncomeINR - pa.annualIncomeINR;
      return 0;
    });
  }, [matches, sort, getProfileById]);

  function toggleCompare(id: string) {
    setCompareIds((p) => p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p);
  }

  const compareData = compareIds
    .map((id) => ({ id, p: getProfileById(id), m: matches.find((m) => m.candidateId === id) }))
    .filter((x) => x.p && x.m);

  const DIM = {
    kidsPreference: "Kids", locationCompatibility: "Location",
    educationCompatibility: "Education", religionAlignment: "Religion",
    lifestyleCompatibility: "Lifestyle", careerCompatibility: "Career",
    familyValues: "Family", incomeExpectations: "Income", personalityFit: "Personality",
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{matches.length} candidates for {client.firstName}</p>
        <div className="flex items-center gap-2">
          {compareIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>
              <X size={12} /> Clear compare
            </Button>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-7 px-2 text-xs border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="score">Sort: Compatibility</option>
            <option value="age">Sort: Age</option>
            <option value="income">Sort: Income</option>
          </select>
        </div>
      </div>

      {/* Comparison table */}
      {compareIds.length >= 2 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-700">Comparison — {compareIds.length} candidates</p>
          </div>
          <div className={`grid divide-x divide-gray-100 ${compareData.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {compareData.map(({ id, p, m }) => (
              <div key={id} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Avatar id={p!.id} name={`${p!.firstName} ${p!.lastName}`} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{p!.firstName}</p>
                    <ScoreBadge score={m!.totalScore} size="sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {Object.entries(m!.breakdown).map(([key, score]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 w-16 shrink-0 truncate">{DIM[key as keyof typeof DIM]}</span>
                      <Progress value={score} className="flex-1" />
                      <span className="text-[10px] text-gray-600 tabular-nums w-5 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sorted.map((m, i) => (
          <MatchCard
            key={m.candidateId}
            match={m} client={client} index={i}
            onCompare={toggleCompare}
            isComparing={compareIds.includes(m.candidateId)}
          />
        ))}
      </div>
    </div>
  );
}
