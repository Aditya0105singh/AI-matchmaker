"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronUp, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Avatar } from "@/components/ui/avatar";
import { ClientStatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CircularProgress } from "@/components/ui/progress";
import { formatCurrency, timeAgo } from "@/lib/utils";
import type { Profile } from "@/types";

type SortKey = "name" | "age" | "income" | "matches" | "readiness" | "joined";
type SortDir = "asc" | "desc";

const STATUS_OPTS = ["all", "active", "paused", "matched", "onboarding"] as const;
const GENDER_OPTS = ["all", "male", "female"] as const;

export default function ClientsPage() {
  const router = useRouter();
  const { clients } = useAppStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("joined");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients
      .filter((c) => {
        const nameMatch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
        return nameMatch && (status === "all" || c.clientStatus === status) && (gender === "all" || c.gender === gender);
      })
      .sort((a, b) => {
        let v = 0;
        if (sortKey === "name")      v = a.firstName.localeCompare(b.firstName);
        else if (sortKey === "age")       v = a.age - b.age;
        else if (sortKey === "income")    v = a.annualIncomeINR - b.annualIncomeINR;
        else if (sortKey === "matches")   v = a.matchCount - b.matchCount;
        else if (sortKey === "readiness") v = a.relationshipReadinessScore - b.relationshipReadinessScore;
        else v = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        return sortDir === "asc" ? v : -v;
      });
  }, [clients, search, status, gender, sortKey, sortDir]);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={11} className="text-gray-300" />;
    return sortDir === "asc" ? <ChevronUp size={11} className="text-gray-600" /> : <ChevronDown size={11} className="text-gray-600" />;
  }

  function Th({ children, k, className = "" }: { children: React.ReactNode; k?: SortKey; className?: string }) {
    return (
      <th
        className={`px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap ${k ? "cursor-pointer hover:text-gray-700 select-none" : ""} ${className}`}
        onClick={k ? () => toggleSort(k) : undefined}
      >
        <div className="flex items-center gap-1">
          {children}
          {k && <SortIcon k={k} />}
        </div>
      </th>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Clients</h1>
            <p className="text-xs text-gray-500 mt-0.5">{clients.length} clients · {clients.filter(c => c.clientStatus === "active").length} active</p>
          </div>
          <span className="text-xs text-gray-400 self-center">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          <Input
            placeholder="Search name or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={13} />}
            className="w-full sm:w-52 h-8 text-xs"
          />

          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden self-start sm:self-auto">
            {STATUS_OPTS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-2.5 py-1.5 text-xs capitalize transition-colors ${
                  status === s ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden self-start sm:self-auto">
            {GENDER_OPTS.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-2.5 py-1.5 text-xs capitalize transition-colors ${
                  gender === g ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="min-w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-white border-b border-gray-200">
              <Th k="name">Client</Th>
              <Th>Status</Th>
              <Th k="age" className="hidden sm:table-cell">Age</Th>
              <Th>City</Th>
              <Th k="income" className="hidden md:table-cell">Income</Th>
              <Th className="hidden md:table-cell">Company</Th>
              <Th k="matches" className="hidden sm:table-cell">Matches</Th>
              <Th k="readiness" className="hidden lg:table-cell">Readiness</Th>
              <Th className="hidden lg:table-cell">Profile</Th>
              <Th className="hidden xl:table-cell">Last Contact</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.map((client) => (
              <Row key={client.id} client={client} onClick={() => router.push(`/clients/${client.id}`)} />
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="bg-white text-center py-16 text-sm text-gray-400">No clients match your filters</div>
        )}
      </div>
    </div>
  );
}

function Row({ client, onClick }: { client: Profile; onClick: () => void }) {
  return (
    <tr onClick={onClick} className="hover:bg-gray-50 cursor-pointer transition-colors">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar id={client.id} name={`${client.firstName} ${client.lastName}`} size="sm" />
          <div>
            <p className="text-xs font-medium text-gray-900">{client.firstName} {client.lastName}</p>
            <p className="text-[10px] text-gray-400">{client.religion} · {client.maritalStatus.replace("_", " ")}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-2.5"><ClientStatusBadge status={client.clientStatus} /></td>
      <td className="px-4 py-2.5 text-xs text-gray-700 tabular-nums hidden sm:table-cell">{client.age}</td>
      <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{client.city}</td>
      <td className="px-4 py-2.5 text-xs text-gray-700 whitespace-nowrap hidden md:table-cell">{formatCurrency(client.annualIncomeINR)}</td>
      <td className="px-4 py-2.5 hidden md:table-cell">
        <div>
          <p className="text-xs text-gray-700 max-w-35 truncate">{client.currentCompany}</p>
          <p className="text-[10px] text-gray-400 max-w-35 truncate">{client.designation}</p>
        </div>
      </td>
      <td className="px-4 py-2.5 text-xs text-gray-700 tabular-nums hidden sm:table-cell">{client.matchCount}</td>
      <td className="px-4 py-2.5 hidden lg:table-cell">
        <span className={`text-xs font-semibold tabular-nums ${
          client.relationshipReadinessScore >= 80 ? "text-green-700" :
          client.relationshipReadinessScore >= 60 ? "text-amber-700" : "text-red-600"
        }`}>
          {client.relationshipReadinessScore}
        </span>
      </td>
      <td className="px-4 py-2.5 hidden lg:table-cell">
        <div className="flex items-center gap-1.5">
          <CircularProgress value={client.profileCompleteness} size={24} strokeWidth={2.5} />
          <span className="text-[10px] text-gray-400">{client.profileCompleteness}%</span>
        </div>
      </td>
      <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap hidden xl:table-cell">
        {client.lastContactedAt ? timeAgo(client.lastContactedAt) : "—"}
      </td>
    </tr>
  );
}
