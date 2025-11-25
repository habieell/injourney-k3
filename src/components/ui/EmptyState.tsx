"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul di sini setelah ada laporan yang tersimpan.",
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center text-slate-500",
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon ?? <span className="text-lg">📭</span>}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="max-w-sm text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default EmptyState;
