"use client";
import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import type { Profile, MatchScore } from "@/types";

export function useClientMatches(clientId: string) {
  const { getMatchesForClient, getProfileById } = useAppStore();
  const matches = getMatchesForClient(clientId);

  const enriched = useMemo(() =>
    matches.map((m) => ({
      ...m,
      candidate: getProfileById(m.candidateId),
    })).filter((m) => m.candidate !== undefined),
    [matches, getProfileById]
  );

  const topMatch = enriched[0];
  const avgScore = enriched.length > 0
    ? Math.round(enriched.reduce((s, m) => s + m.totalScore, 0) / enriched.length)
    : 0;

  return { matches: enriched, topMatch, avgScore, count: enriched.length };
}

export function useDashboardStats() {
  const clients = useAppStore((s) => s.clients);
  return useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    return {
      total: clients.length,
      active: clients.filter((c) => c.clientStatus === "active").length,
      matched: clients.filter((c) => c.clientStatus === "matched").length,
      newThisWeek: clients.filter((c) => now - new Date(c.joinedAt).getTime() < week).length,
      avgReadiness: Math.round(clients.reduce((s, c) => s + c.relationshipReadinessScore, 0) / (clients.length || 1)),
      avgCompleteness: Math.round(clients.reduce((s, c) => s + c.profileCompleteness, 0) / (clients.length || 1)),
    };
  }, [clients]);
}
