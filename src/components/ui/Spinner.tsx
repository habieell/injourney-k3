"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
} & HTMLAttributes<HTMLDivElement>;

const sizeMap: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-[2px]",
  md: "h-5 w-5 border-[2.5px]",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({ size = "md", className, ...rest }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("inline-flex items-center justify-center", className)}
      {...rest}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-slate-300 border-t-sky-500",
          sizeMap[size]
        )}
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default Spinner;
