"use client";

import type { ReactNode } from "react";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  label?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  fullscreen?: boolean;
};

export function LoadingScreen({
  label = "Memuat data…",
  description = "Mohon tunggu sebentar, sistem sedang mengambil data dari Supabase.",
  icon,
  className,
  fullscreen = false,
}: LoadingScreenProps) {
  const Wrapper = fullscreen ? "div" : "section";

  return (
    <Wrapper
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center text-slate-500",
        fullscreen &&
          "fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm text-slate-100",
        !fullscreen &&
          "rounded-3xl border border-slate-200 bg-white/80 px-6 py-10 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {icon ?? <Spinner size="md" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {description && (
        <p className="max-w-sm text-xs leading-relaxed opacity-80">
          {description}
        </p>
      )}
    </Wrapper>
  );
}

export default LoadingScreen;
