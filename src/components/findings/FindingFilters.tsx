"use client";

import { useState, useMemo } from "react";

type StatusFilter = "all" | "open" | "in_progress" | "closed";

export type FindingFiltersProps = {
  /**
   * Kalau dikirim dari parent → jadi controlled.
   * Kalau tidak dikirim → komponen pakai state internal sendiri.
   */
  search?: string;
  statusFilter?: StatusFilter;

  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: StatusFilter) => void;
};

export function FindingFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: FindingFiltersProps) {
  // state internal (fallback kalau props tidak dikirim)
  const [internalSearch, setInternalSearch] = useState("");
  const [internalStatus, setInternalStatus] = useState<StatusFilter>("all");

  const effectiveSearch = useMemo(
    () => (typeof search === "string" ? search : internalSearch),
    [search, internalSearch]
  );

  const effectiveStatus = useMemo(
    () => statusFilter ?? internalStatus,
    [statusFilter, internalStatus]
  );

  function handleSearchChange(value: string) {
    if (onSearchChange) onSearchChange(value);
    if (typeof search === "undefined") {
      setInternalSearch(value);
    }
  }

  function handleStatusChange(value: StatusFilter) {
    if (onStatusFilterChange) onStatusFilterChange(value);
    if (typeof statusFilter === "undefined") {
      setInternalStatus(value);
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between">
      {/* Status tabs */}
      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-slate-50 px-1.5 py-1 text-[11px] ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => handleStatusChange("all")}
          className={`rounded-full px-3 py-1 font-medium ${
            effectiveStatus === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:bg-white hover:text-slate-900"
          }`}
        >
          Semua
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("open")}
          className={`rounded-full px-3 py-1 ${
            effectiveStatus === "open"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:bg-white hover:text-slate-900"
          }`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("in_progress")}
          className={`rounded-full px-3 py-1 ${
            effectiveStatus === "in_progress"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:bg-white hover:text-slate-900"
          }`}
        >
          In Progress
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("closed")}
          className={`rounded-full px-3 py-1 ${
            effectiveStatus === "closed"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:bg-white hover:text-slate-900"
          }`}
        >
          Closed
        </button>
      </div>

      {/* Search + placeholder filter lanjutan */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
          <span className="text-slate-400">🔎</span>
          <input
            type="text"
            placeholder="Cari ID, lokasi, atau unit..."
            value={effectiveSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-[170px] bg-transparent text-[11px] outline-none placeholder:text-slate-400 sm:w-[220px]"
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
        >
          <span>Filter lanjutan</span>
          <span className="text-xs">▾</span>
        </button>
      </div>
    </div>
  );
}

export default FindingFilters;
