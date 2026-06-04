"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile, MatchScore, Note, CopilotMessage } from "@/types";
import { allClients, femalePool, malePool, sampleNotes, matchmaker } from "@/lib/seed-data";
import { getTopMatches } from "@/lib/matching-engine";

interface AppState {
  // Auth
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Clients
  clients: Profile[];
  getClient: (id: string) => Profile | undefined;

  // Match pool
  femalePool: Profile[];
  malePool: Profile[];

  // Computed matches cache
  matchCache: Record<string, MatchScore[]>;
  getMatchesForClient: (clientId: string) => MatchScore[];
  getProfileById: (id: string) => Profile | undefined;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  getNotesForClient: (clientId: string) => Note[];

  // Sent matches tracker
  sentMatches: Record<string, string[]>; // clientId -> candidateId[]
  markMatchSent: (clientId: string, candidateId: string) => void;

  // Copilot
  copilotOpen: boolean;
  copilotContext: { clientId?: string };
  copilotMessages: CopilotMessage[];
  setCopilotOpen: (open: boolean) => void;
  setCopilotContext: (ctx: { clientId?: string }) => void;
  addCopilotMessage: (msg: CopilotMessage) => void;
  clearCopilotMessages: () => void;

  // UI state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const CREDENTIALS = { username: "matchmaker", password: "tdc2024" };

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,

      login: (username, password) => {
        if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isAuthenticated: false }),

      clients: allClients,
      getClient: (id) => get().clients.find((c) => c.id === id),

      femalePool,
      malePool,

      matchCache: {},
      getMatchesForClient: (clientId) => {
        const cache = get().matchCache;
        if (cache[clientId]) return cache[clientId];

        const client = get().getClient(clientId);
        if (!client) return [];

        const pool = client.gender === "male" ? get().femalePool : get().malePool;
        const matches = getTopMatches(client, pool, 20);

        set((state) => ({
          matchCache: { ...state.matchCache, [clientId]: matches },
        }));
        return matches;
      },

      getProfileById: (id) => {
        const all = [
          ...get().clients,
          ...get().femalePool,
          ...get().malePool,
        ];
        return all.find((p) => p.id === id);
      },

      notes: sampleNotes,
      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: `NOTE_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
      },
      getNotesForClient: (clientId) =>
        get().notes.filter((n) => n.clientId === clientId),

      sentMatches: {},
      markMatchSent: (clientId, candidateId) => {
        set((state) => ({
          sentMatches: {
            ...state.sentMatches,
            [clientId]: [...(state.sentMatches[clientId] || []), candidateId],
          },
        }));
      },

      copilotOpen: false,
      copilotContext: {},
      copilotMessages: [],
      setCopilotOpen: (open) => set({ copilotOpen: open }),
      setCopilotContext: (ctx) => set({ copilotContext: ctx }),
      addCopilotMessage: (msg) =>
        set((state) => ({ copilotMessages: [...state.copilotMessages, msg] })),
      clearCopilotMessages: () => set({ copilotMessages: [] }),

      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "tdc-store",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        notes: state.notes,
        sentMatches: state.sentMatches,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
