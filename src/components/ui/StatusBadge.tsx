// src/components/ui/StatusBadge.tsx
import type { FindingStatus } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export type StatusBadgeProps = {
  status: FindingStatus | "open" | "in_progress" | "closed";
  className?: string;
};

function getStatusConfig(status: StatusBadgeProps["status"]) {
  switch (status) {
    case "open":
      return {
        label: "Open",
        className: "border-danger/30 bg-danger/5 text-danger",
        dotClass: "bg-danger",
      };
    case "in_progress":
      return {
        label: "In Progress",
        className: "border-warning/30 bg-warning/5 text-warning",
        dotClass: "bg-warning",
      };
    case "closed":
      return {
        label: "Closed",
        className: "border-success/30 bg-success/5 text-success",
        dotClass: "bg-success",
      };
    default:
      return {
        label: status,
        className: "border-slate-300/60 bg-slate-50 text-slate-700",
        dotClass: "bg-slate-400",
      };
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = getStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        cfg.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dotClass)} />
      {cfg.label}
    </span>
  );
}
