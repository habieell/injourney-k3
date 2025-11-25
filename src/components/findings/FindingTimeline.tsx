"use client";

import { useMemo } from "react";
import type { FindingStatus, FindingSeverity } from "@/hooks/useFindings";
import { StatusBadge } from "@/components/ui/StatusBadge";

export type FindingTimelineItem = {
  id: string;
  createdAt: string; // ISO string / tanggal
  title: string;
  location?: string | null;
  status: FindingStatus;
  severity?: FindingSeverity | null;
  unit?: string | null;
};

type FindingTimelineProps = {
  /**
   * Data histori temuan, urut dari terbaru ke terlama
   * (kalau mau sebaliknya, tinggal di-sort sebelum di-pass ke komponen ini).
   */
  items?: FindingTimelineItem[];
  className?: string;
};

/**
 * Vertical timeline sederhana untuk menampilkan histori temuan.
 * Tidak ambil data sendiri – cukup presentational saja.
 */
export function FindingTimeline({ items, className }: FindingTimelineProps) {
  const timelineItems = useMemo(() => items ?? [], [items]);

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm sm:px-5 sm:py-5 ${
        className ?? ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-900">
          Timeline temuan terbaru
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          {timelineItems.length} aktivitas
        </span>
      </div>

      {timelineItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-3 text-[11px] text-slate-500">
          Belum ada histori temuan yang terekam di timeline. Laporan baru yang
          masuk dan update status akan muncul di sini secara kronologis.
        </div>
      ) : (
        <ol className="relative mt-1 space-y-4 border-l border-slate-200 pl-4 text-[11px] text-slate-600">
          {timelineItems.map((item, index) => {
            const isLatest = index === 0;
            const dateLabel = item.createdAt
              ? new Date(item.createdAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-";

            return (
              <li key={item.id} className="relative pl-2">
                {/* Bullet */}
                <span
                  className={`absolute -left-[9px] mt-1.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                    isLatest
                      ? "bg-emerald-500"
                      : item.status === "closed"
                      ? "bg-slate-400"
                      : item.status === "in_progress"
                      ? "bg-amber-400"
                      : "bg-red-500"
                  }`}
                />

                <div className="flex flex-col gap-1 rounded-2xl bg-slate-50/70 px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-medium text-slate-900">
                        {item.title}
                      </span>
                      {item.location && (
                        <span className="text-[10px] text-slate-500">
                          Lokasi: {item.location}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.severity && (
                        <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-50">
                          Severity: {item.severity}
                        </span>
                      )}
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span>{dateLabel}</span>
                    {item.unit && <span>Unit PIC: {item.unit}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default FindingTimeline;
