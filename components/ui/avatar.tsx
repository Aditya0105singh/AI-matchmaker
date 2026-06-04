import { cn, getInitials } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-slate-600", "bg-gray-600", "bg-zinc-600",
  "bg-stone-600", "bg-neutral-600", "bg-blue-600",
  "bg-indigo-600", "bg-violet-600", "bg-purple-600",
  "bg-teal-600",  "bg-cyan-600",   "bg-sky-600",
];

function avatarBg(id: string): string {
  return AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
}

const SIZE_MAP = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-sm",
  xl: "h-14 w-14 text-lg",
};

interface AvatarProps {
  id: string;
  name: string;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function Avatar({ id, name, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0",
        avatarBg(id),
        SIZE_MAP[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
