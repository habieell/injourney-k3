"use client";

import Link from "next/link";
import type { FindingListItem } from "@/hooks/useFindings";
import { StatusBadge } from "@/components/ui/StatusBadge";

type FindingRowProps = {
  item: FindingListItem;
};

/**
 * Satu baris temuan untuk dipakai di tabel / list.
 * Dibuat reusable supaya bisa dipakai di halaman lain (mis. dashboard ringkasan).
 */
export function FindingRow({ item }: FindingRowProps) {
  const displayId = item.code ?? item.id;

  const createdAtLabel = item.createdAt
    ? new Date(item.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <Link
      href={`/findings/${item.id}`}
      className="block transition-colors hover:bg-slate-50/60"
    >
      <div className="px-4 py-3 text-xs sm:px-5 md:grid md:grid-cols-[0.9fr_1.6fr_0.8fr_0.8fr_0.9fr] md:items-center md:gap-3">
        {/* ID laporan */}
        <div className="mb-1.5 flex items-center justify-between gap-2 md:mb-0 md:block">
          <div className="font-mono text-[11px] font-semibold text-slate-800">
            {displayId}
          </div>
          {/* status mini utk mobile */}
          <span className="inline-flex md:hidden">
            <StatusBadge status={item.status} />
          </span>
        </div>

        {/* Lokasi + kategori */}
        <div className="mb-2 space-y-1 md:mb-0">
          <div className="text-[11px] font-medium text-slate-900 sm:text-xs">
            {item.location ?? "-"}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {item.category && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {item.category}
              </span>
            )}
            {item.severity && (
              <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-50">
                Severity: {item.severity}
              </span>
            )}
          </div>
        </div>

        {/* Unit penanggung jawab */}
        <div className="mb-2 text-[11px] text-slate-600 md:mb-0">
          <div className="font-medium text-slate-800">{item.unit ?? "-"}</div>
          <div className="text-[10px] text-slate-400">
            Penanggung jawab utama
          </div>
        </div>

        {/* Status (desktop) */}
        <div className="hidden md:block">
          <StatusBadge status={item.status} />
        </div>

        {/* Dibuat & SLA */}
        <div className="flex flex-col items-start justify-center gap-0.5 text-[11px] text-slate-500 md:items-end">
          <span>{createdAtLabel}</span>
          <span className="text-[10px] text-slate-400">
            Target SLA: 3 x 24 jam
          </span>
        </div>
      </div>
    </Link>
  );
}

export default FindingRow;
