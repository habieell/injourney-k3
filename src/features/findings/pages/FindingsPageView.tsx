// src/features/findings/pages/FindingsPageView.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { FindingTimeline } from "@/components/findings/FindingTimeline";
import { useFindings } from "@/hooks/useFindings";
import { useAuth } from "@/hooks/useAuth";
import { can, getRoleFromProfile } from "@/lib/auth/permission";

type StatusFilter = "all" | "open" | "in_progress" | "closed";
type SeverityFilter = "" | "low" | "medium" | "high" | "critical";

function statusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export function FindingsPageView() {
  const { profile } = useAuth();
  const role = getRoleFromProfile(profile);

  const canCreateFinding = can.createFinding(role);
  const canExportFinding = can.exportFinding(role);

  const { findings, loading, error } = useFindings();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredFindings = useMemo(
    () =>
      findings.filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) {
          return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const matchText =
            (item.code ?? "").toLowerCase().includes(q) ||
            (item.location ?? "").toLowerCase().includes(q) ||
            (item.unit ?? "").toLowerCase().includes(q);

          if (!matchText) return false;
        }

        if (severityFilter && item.severity !== severityFilter) {
          return false;
        }

        if ((dateFrom || dateTo) && item.createdAt) {
          const created = new Date(item.createdAt);
          if (dateFrom && created < new Date(dateFrom)) return false;
          if (dateTo && created > new Date(dateTo)) return false;
        }

        return true;
      }),
    [findings, search, statusFilter, severityFilter, dateFrom, dateTo]
  );

  const { openCount, progressCount, closedCount } = useMemo(
    () =>
      findings.reduce(
        (acc, item) => {
          if (item.status === "open") acc.openCount += 1;
          if (item.status === "in_progress") acc.progressCount += 1;
          if (item.status === "closed") acc.closedCount += 1;
          return acc;
        },
        { openCount: 0, progressCount: 0, closedCount: 0 }
      ),
    [findings]
  );

  const handleExport = async () => {
    if (!canExportFinding) {
      alert(
        "Peran kamu saat ini tidak memiliki akses untuk export laporan temuan. Silakan hubungi admin K3."
      );
      return;
    }

    try {
      const params = new URLSearchParams();

      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      if (severityFilter) params.set("severity", severityFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await fetch(`/api/findings/export?${params.toString()}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error("Gagal export laporan");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "laporan-temuan-k3.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Findings] Export error:", err);
      alert("Terjadi kesalahan saat export laporan.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-page pb-14 pt-6 md:min-h-[calc(100vh-4.5rem)] md:pt-8">
      <section className="container-page">
        {/* Header + CTA */}
        <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Monitoring Temuan K3
            </div>
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
              Daftar temuan K3 di area bandara
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
              Pantau status laporan, unit penanggung jawab, dan pemenuhan SLA
              penanganan temuan K3 di seluruh area bandara.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canCreateFinding && (
              <Link
                href="/report"
                className="btn btn-primary rounded-full px-4 py-2 text-xs sm:text-sm"
              >
                + Buat laporan baru
              </Link>
            )}

            {canExportFinding && (
              <button
                onClick={handleExport}
                type="button"
                className="btn btn-outline rounded-full px-3 py-2 text-xs sm:text-sm"
              >
                Export laporan
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-col gap-3 md:mb-5 md:flex-row md:items-center md:justify-between">
          {/* Status tabs */}
          <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full bg-slate-50 px-1.5 py-1 text-[11px] ring-1 ring-slate-200">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-full px-3 py-1 font-medium ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter("open")}
              className={`rounded-full px-3 py-1 ${
                statusFilter === "open"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`rounded-full px-3 py-1 ${
                statusFilter === "in_progress"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter("closed")}
              className={`rounded-full px-3 py-1 ${
                statusFilter === "closed"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              Closed
            </button>
          </div>

          {/* Search + advanced filter */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
              <span className="text-slate-400">🔎</span>
              <input
                type="text"
                placeholder="Cari ID, lokasi, atau unit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[170px] bg-transparent text-[11px] outline-none placeholder:text-slate-400 sm:w-[220px]"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
              >
                <span>Filter lanjutan</span>
                <span className="text-xs">{showAdvanced ? "▴" : "▾"}</span>
              </button>

              {showAdvanced && (
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-[11px] text-slate-700 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      Filter lanjutan
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSeverityFilter("");
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Severity */}
                  <div className="mb-3 space-y-1">
                    <label className="text-[10px] text-slate-400">
                      Severity
                    </label>
                    <select
                      value={severityFilter}
                      onChange={(e) =>
                        setSeverityFilter(e.target.value as SeverityFilter)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] outline-none"
                    >
                      <option value="">Semua</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Date range */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">
                      Tanggal dibuat (created_at)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] outline-none"
                      />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAdvanced(false)}
                    className="mt-3 w-full rounded-xl bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-600"
                  >
                    Terapkan filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table + side summary */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          {/* Tabel temuan */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="card rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm"
          >
            <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-900">
                    Daftar temuan aktif
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {loading
                      ? "Memuat data temuan…"
                      : `${filteredFindings.length} temuan ditampilkan`}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  92% laporan selesai
                </span>
              </div>
            </div>

            {error && (
              <div className="px-5 py-3 text-xs text-danger">{error}</div>
            )}

            <div className="hidden border-b border-slate-100 px-5 py-2.5 text-[11px] text-slate-400 md:grid md:grid-cols-[0.9fr_1.6fr_0.8fr_0.8fr_0.9fr] md:gap-3">
              <div>ID Laporan</div>
              <div>Lokasi & kategori</div>
              <div>Unit</div>
              <div>Status</div>
              <div className="text-right">Dibuat · SLA</div>
            </div>

            <div className="divide-y divide-slate-100">
              {loading && (
                <div className="px-4 py-6 text-center text-xs text-slate-400 sm:px-5">
                  Memuat data temuan dari Supabase…
                </div>
              )}

              {!loading && filteredFindings.length === 0 && !error && (
                <div className="px-4 py-6 text-center text-xs text-slate-400 sm:px-5">
                  Tidak ada temuan yang cocok dengan filter / pencarian.
                </div>
              )}

              {!loading &&
                filteredFindings.map((item) => {
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
                      key={item.id}
                      href={`/findings/${item.id}`}
                      className="block transition-colors hover:bg-slate-50/60"
                    >
                      <div className="px-4 py-3 text-xs sm:px-5 md:grid md:grid-cols-[0.9fr_1.6fr_0.8fr_0.8fr_0.9fr] md:items-center md:gap-3">
                        {/* ID */}
                        <div className="mb-1.5 flex items-center justify-between gap-2 md:mb-0 md:block">
                          <div className="font-mono text-[11px] font-semibold text-slate-800">
                            {displayId}
                          </div>
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 md:hidden">
                            {statusLabel(item.status)}
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

                        {/* Unit */}
                        <div className="mb-2 text-[11px] text-slate-600 md:mb-0">
                          <div className="font-medium text-slate-800">
                            {item.unit ?? "-"}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Penanggung jawab utama
                          </div>
                        </div>

                        {/* Status */}
                        <div className="mb-2 md:mb-0">
                          {item.status === "open" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/5 px-2.5 py-0.5 text-[11px] font-medium text-danger">
                              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                              {statusLabel(item.status)}
                            </span>
                          )}
                          {item.status === "in_progress" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/5 px-2.5 py-0.5 text-[11px] font-medium text-warning">
                              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                              {statusLabel(item.status)}
                            </span>
                          )}
                          {item.status === "closed" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/5 px-2.5 py-0.5 text-[11px] font-medium text-success">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />
                              {statusLabel(item.status)}
                            </span>
                          )}
                        </div>

                        {/* Created + SLA */}
                        <div className="flex flex-col items-start justify-center gap-0.5 text-[11px] text-slate-500 md:items-end">
                          <span>{createdAtLabel}</span>
                          <span className="text-[10px] text-slate-400">
                            Target SLA: 3 x 24 jam
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          </motion.div>

          {/* Ringkasan samping */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="space-y-4 md:space-y-5"
          >
            <div className="card rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm sm:px-5 sm:py-5">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-900">
                  Ringkasan status
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                  30 hari terakhir
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-[11px] sm:text-xs">
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-danger">
                    {openCount}
                  </div>
                  <div className="text-slate-500">Open</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-warning">
                    {progressCount}
                  </div>
                  <div className="text-slate-500">In Progress</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-lg font-semibold text-success">
                    {closedCount}
                  </div>
                  <div className="text-slate-500">Closed</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600">
                <div className="mb-1 flex items-center justify-between">
                  <span>Compliance SLA</span>
                  <span className="font-semibold text-emerald-600">89%</span>
                </div>
                <p>
                  Mayoritas laporan selesai sebelum target SLA. Open yang
                  tersisa difokuskan pada area risiko tinggi.
                </p>
              </div>
            </div>

            <div className="card rounded-3xl border border-slate-200 bg-white/95 px-4 py-4 text-[11px] text-slate-600 shadow-sm sm:px-5 sm:py-5">
              <div className="mb-2 text-xs font-medium text-slate-900">
                Timeline temuan
              </div>

              <FindingTimeline />

              <p className="mt-2 text-[10px] text-slate-400">
                Data timeline diambil dari tabel temuan &amp; bisa dihubungkan
                ke grafik per hari.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
