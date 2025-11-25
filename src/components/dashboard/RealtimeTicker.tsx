"use client";

import { useMemo } from "react";

export type TickerItem = {
  id: string | number;
  message: string;
  createdAt?: string | Date | null;
};

type RealtimeTickerProps = {
  items?: TickerItem[];
  title?: string;
};

export function RealtimeTicker({
  items = [],
  title = "Aktivitas realtime temuan",
}: RealtimeTickerProps) {
  const displayItems = useMemo(
    () =>
      items.slice(0, 6).map((item) => ({
        ...item,
        createdLabel: item.createdAt
          ? new Date(item.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      })),
    [items]
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 text-[11px] text-slate-600 shadow-sm sm:px-5 sm:py-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-900">{title}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {displayItems.length === 0 ? (
        <p className="text-[11px] text-slate-400">
          Belum ada aktivitas terbaru. Temuan baru akan muncul di sini secara
          realtime.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {displayItems.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2"
            >
              <p className="text-[11px] leading-snug text-slate-700">
                {item.message}
              </p>
              {item.createdLabel && (
                <span className="shrink-0 text-[10px] text-slate-400">
                  {item.createdLabel}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
