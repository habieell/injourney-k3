"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card component
 * Bisa dipakai untuk wrap konten standar dengan border & padding.
 */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;
