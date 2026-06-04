"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import type { MatchScore } from "@/types";

const DIMENSION_LABELS: Record<keyof MatchScore["breakdown"], string> = {
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

export function CompatibilityRadar({ match }: { match: MatchScore }) {
  const data = Object.entries(match.breakdown).map(([key, value]) => ({
    subject: DIMENSION_LABELS[key as keyof typeof DIMENSION_LABELS],
    score: value,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#3f3f46" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#71717a", fontSize: 10 }}
          />
          <Radar
            name="Compatibility"
            dataKey="score"
            stroke="#d946ef"
            fill="#d946ef"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#f4f4f5",
            }}
            formatter={(value) => [`${value ?? 0}`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
