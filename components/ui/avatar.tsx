import { cn, getInitials, avatarColor } from "@/lib/utils";

interface AvatarProps {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

export function Avatar({ id, name, size = "md", className }: AvatarProps) {
  const gradient = avatarColor(id);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 bg-gradient-to-br",
        gradient,
        sizeMap[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
