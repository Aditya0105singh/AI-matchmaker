"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import type { MatchScore } from "@/types";

const LABELS: Record<keyof MatchScore["breakdown"], string> = {
  kidsPreference:         "Family Planning",
  locationCompatibility:  "Location",
  educationCompatibility: "Education",
  religionAlignment:      "Religion",
  lifestyleCompatibility: "Lifestyle",
  careerCompatibility:    "Career",
  familyValues:           "Family Values",
  incomeExpectations:     "Income",
  personalityFit:         "Personality",
};

export function CompatibilityRadar({ match }: { match: MatchScore }) {
  const data = Object.entries(match.breakdown).map(([key, val]) => ({
    subject: LABELS[key as keyof typeof LABELS],
    score: val,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
          <Radar
            name="Score" dataKey="score"
            stroke="#374151" fill="#374151" fillOpacity={0.08} strokeWidth={1.5}
          />
          <Tooltip
            contentStyle={{
              background: "#fff", border: "1px solid #E5E7EB",
              borderRadius: "6px", fontSize: "12px", color: "#111827",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            formatter={(v) => [`${v ?? 0}`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
