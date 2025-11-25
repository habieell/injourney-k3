"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLandingStats } from "@/hooks/useLandingStats";

export function PreviewFormCard() {
  const { stats, loading } = useLandingStats();

  const newOpen = stats?.todayNewOpen ?? 0;
  const badgeText = loading
    ? "Menghitung temuan…"
    : `Open · ${newOpen} temuan baru`;

  const completionRate = stats?.completionRate30d ?? 0;
  const progress = Math.min(Math.max(Math.round(completionRate), 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative w-full max-w-md rounded-[26px] bg-slate-950/80 px-4 pb-4 pt-3 text-xs text-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.85)] ring-1 ring-slate-800/70 backdrop-blur-2xl sm:px-5 sm:pt-4"
    >
      {/* badge status di pojok kanan atas */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-slate-400">
            Preview Sistem
          </p>
          <p className="text-sm font-semibold text-slate-50">Form Laporan K3</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-400/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>{badgeText}</span>
        </div>
      </div>

      {/* lokasi temuan */}
      <div className="mb-3 space-y-1.5">
        <label className="text-[10px] text-slate-400">Lokasi Temuan</label>
        <button className="flex w-full items-center justify-between rounded-2xl bg-slate-900/70 px-3 py-2 text-[11px] text-slate-100 ring-1 ring-slate-700/80">
          <span>Apron area · Terminal 3</span>
          <span className="text-[9px] text-slate-500">Ganti lokasi ▾</span>
        </button>
      </div>

      {/* jenis temuan */}
      <div className="mb-3 space-y-1.5">
        <label className="text-[10px] text-slate-400">Jenis Temuan</label>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium text-amber-300 ring-1 ring-amber-400/40">
            Housekeeping
          </span>
          <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-medium text-rose-300 ring-1 ring-rose-500/40">
            Potensi Jatuh
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
            APD
          </span>
        </div>
      </div>

      {/* upload */}
      <div className="mb-4 space-y-1.5">
        <label className="text-[10px] text-slate-400">Foto pendukung</label>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/report"
            className="flex h-9 items-center justify-center rounded-2xl bg-sky-500/15 text-[11px] font-medium text-sky-300 ring-1 ring-sky-400/40"
          >
            + Upload
          </Link>
          <div className="flex h-9 items-center justify-center rounded-2xl bg-slate-900/80 text-[10px] text-slate-500 ring-1 ring-slate-700/70">
            Preview 1
          </div>
          <div className="flex h-9 items-center justify-center rounded-2xl bg-slate-900/80 text-[10px] text-slate-500 ring-1 ring-slate-700/70">
            Preview 2
          </div>
        </div>
      </div>

      {/* SLA & progress */}
      <div className="mb-4 flex items-center justify-between gap-2 text-[10px] text-slate-400">
        <div>
          <p className="mb-0.5">SLA penanganan</p>
          <p className="text-[11px] font-semibold text-slate-100">3 × 24 jam</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p>Progress penyelesaian</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-emerald-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">
              {loading ? "…" : `${Math.round(progress)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col text-[10px] text-slate-400">
          <span className="mb-0.5">Form diisi oleh</span>
          <span className="text-[11px] font-medium text-slate-100">
            Petugas K3 lapangan
          </span>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow-lg shadow-sky-500/40 hover:bg-sky-400"
        >
          Kirim laporan
        </Link>
      </div>
    </motion.div>
  );
}

export default PreviewFormCard;
