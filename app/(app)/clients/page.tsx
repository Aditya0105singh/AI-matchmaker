"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, SortAsc, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { Badge, ClientStatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/progress";
import { formatCurrency, timeAgo, getScoreColor } from "@/lib/utils";
import type { Profile } from "@/types";

const STATUS_FILTERS = ["all", "active", "paused", "matched", "onboarding"] as const;

export default function ClientsPage() {
  const router = useRouter();
  const { clients } = useAppStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "age" | "joinedAt" | "completeness">("joinedAt");

  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const name = `${c.firstName} ${c.lastName}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || c.clientStatus === statusFilter;
        const matchGender = genderFilter === "all" || c.gender === genderFilter;
        return matchSearch && matchStatus && matchGender;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.firstName.localeCompare(b.firstName);
        if (sortBy === "age") return a.age - b.age;
        if (sortBy === "completeness") return b.profileCompleteness - a.profileCompleteness;
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      });
  }, [clients, search, statusFilter, genderFilter, sortBy]);

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Clients</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{clients.length} total clients assigned to you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Input
          placeholder="Search by name or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
          className="w-64"
        />

        <div className="flex items-center gap-1 bg-zinc-800/60 rounded-lg p-1 border border-zinc-700">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-fuchsia-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-zinc-800/60 rounded-lg p-1 border border-zinc-700">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                genderFilter === g
                  ? "bg-fuchsia-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-9 px-3 bg-zinc-800/60 border border-zinc-700 text-zinc-300 text-xs rounded-lg focus:outline-none focus:border-fuchsia-500"
        >
          <option value="joinedAt">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="age">Sort: Age</option>
          <option value="completeness">Sort: Profile %</option>
        </select>

        <span className="text-xs text-zinc-500 ml-auto">{filtered.length} results</span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.02, 0.3) }}
          >
            <ClientCard client={client} onClick={() => router.push(`/clients/${client.id}`)} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No clients found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Profile; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <Avatar id={client.id} name={`${client.firstName} ${client.lastName}`} size="md" />
        <ClientStatusBadge status={client.clientStatus} />
      </div>

      <div className="mb-3">
        <h3 className="font-semibold text-zinc-200 group-hover:text-fuchsia-300 transition-colors">
          {client.firstName} {client.lastName}
        </h3>
        <p className="text-xs text-zinc-500">
          {client.age}y · {client.city} · {client.gender === "male" ? "Male" : "Female"}
        </p>
      </div>

      <div className="text-xs text-zinc-500 space-y-1 mb-3">
        <p className="truncate">{client.designation} @ {client.currentCompany}</p>
        <p>{formatCurrency(client.annualIncomeINR)} LPA</p>
        <p>{client.religion} · {client.maritalStatus.replace("_", " ")}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-1.5">
          <CircularProgress value={client.profileCompleteness} size={28} strokeWidth={3} />
          <span className="text-xs text-zinc-500">profile</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500">{client.matchCount} matches</span>
          <ArrowRight size={12} className="text-zinc-600 group-hover:text-fuchsia-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}
