import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(lpa: number): string {
  if (lpa >= 100) return `₹${(lpa / 100).toFixed(1)}Cr`;
  return `₹${lpa}L`;
}

export function formatHeight(cm: number): string {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}" (${cm}cm)`;
}

export function calculateAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-amber-400";
  return "text-rose-400";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/20 border-emerald-500/30";
  if (score >= 60) return "bg-amber-500/20 border-amber-500/30";
  return "bg-rose-500/20 border-rose-500/30";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Exceptional Match";
  if (score >= 75) return "High Potential";
  if (score >= 65) return "Good Match";
  if (score >= 50) return "Moderate Match";
  return "Low Compatibility";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function avatarColor(id: string): string {
  const colors = [
    "from-violet-500 to-purple-700",
    "from-rose-500 to-pink-700",
    "from-amber-500 to-orange-700",
    "from-emerald-500 to-teal-700",
    "from-sky-500 to-blue-700",
    "from-fuchsia-500 to-pink-700",
  ];
  const idx = id.charCodeAt(0) % colors.length;
  return colors[idx];
}
