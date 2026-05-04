import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color?: "orange" | "amber" | "green" | "red";
}

const colorMap = {
  orange: {
    bg: "bg-primary-light",
    icon: "text-orange-600",
    value: "text-primary",
  },
  amber: {
    bg: "bg-amber-100",
    icon: "text-amber-600",
    value: "text-amber-700",
  },
  green: {
    bg: "bg-green-100",
    icon: "text-green-600",
    value: "text-green-700",
  },
  red: {
    bg: "bg-red-100",
    icon: "text-red-600",
    value: "text-red-700",
  },
};

export function StatCard({ title, value, icon, color = "orange" }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-gray-500 sm:text-sm">{title}</p>
          <p className={cn("mt-1 text-2xl font-bold sm:text-3xl", c.value)}>{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10", c.bg)}>
          <div className={c.icon}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
