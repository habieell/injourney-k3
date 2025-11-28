// src/features/findings/pages/FindingDetailPageView.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

import { useFindingDetail } from "@/hooks/useFindingDetail";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { can, getRoleFromProfile } from "@/lib/auth/permission";

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "closed":
      return "Closed";
    default:
      return status ?? "-";
  }
}

type TaskStatus = "open" | "in_progress" | "done";

function mapFindingStatusToTaskStatus(
  newStatus: "open" | "in_progress" | "closed"
): TaskStatus {
  if (newStatus === "closed") return "done";
  if (newStatus === "in_progress") return "in_progress";
  return "open";
}

export function FindingDetailPageView() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";

  const { profile } = useAuth();
  const role = getRoleFromProfile(profile);

  const { finding, loading, error } = useFindingDetail(id);
  const supabase = getSupabaseBrowserClient();

  const [updating, setUpdating] = useState(false);
  const [hasAnyTask, setHasAnyTask] = useState(false);

  const createdAtLabel = finding?.createdAt
    ? new Date(finding.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const closedAtLabel = finding?.closedAt
    ? new Date(finding.closedAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const severityLabel =
    finding?.severity && finding.severity.length > 0
      ? finding.severity.toUpperCase()
      : "-";

  // ===== PERMISSION =====
  const canUpdateAny = can.updateAnyFinding(role);
  const canUpdateAssigned = can.updateAssignedFinding(role);
  const canUpdateStatus = canUpdateAny || canUpdateAssigned;

  // id temuan yang stabil
  const findingId: string | null = finding?.id ?? null;

  // ===== CEK APAKAH SUDAH ADA TASK UNTUK FINDING INI =====
  useEffect(() => {
    if (!findingId) {
      setHasAnyTask(false);
      return;
    }

    let cancelled = false;

    async function checkTasks() {
      try {
        const idForQuery = findingId as string;

        const { data, error: tasksError } = await supabase
          .from("tasks")
          .select("id")
          .eq("finding_id", idForQuery)
          .limit(1);

        if (tasksError) {
          console.error("[FindingDetail] checkTasks error:", tasksError);
          return;
        }

        if (!cancelled) {
          setHasAnyTask(!!data && data.length > 0);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[FindingDetail] checkTasks unexpected error:", err);
        }
      }
    }

    void checkTasks();

    return () => {
      cancelled = true;
    };
  }, [findingId, supabase]);

  // === UPDATE STATUS KE SUPABASE (FINDING + TASKS) ===
  const handleUpdateStatus = async (
    newStatus: "open" | "in_progress" | "closed"
  ) => {
    if (!finding || !findingId) return;
    if (!canUpdateStatus) {
      alert(
        "Peran kamu saat ini tidak memiliki akses untuk mengubah status temuan ini. Silakan hubungi admin K3."
      );
      return;
    }

    try {
      setUpdating(true);

      const { error: updateError } = await supabase
        .from("findings")
        .update({
          status: newStatus,
          closed_at: newStatus === "closed" ? new Date().toISOString() : null,
        })
        .eq("id", findingId);

      if (updateError) {
        throw updateError;
      }

      const mappedTaskStatus = mapFindingStatusToTaskStatus(newStatus);
      const { error: tasksError } = await supabase
        .from("tasks")
        .update({ status: mappedTaskStatus })
        .eq("finding_id", findingId);

      if (tasksError) {
        console.error(
          "[FindingDetail] update related tasks status error:",
          tasksError
        );
      }

      window.location.reload();
    } catch (err: unknown) {
      console.error("Update status error:", err);
      alert("Gagal mengupdate status temuan.");
    } finally {
      setUpdating(false);
    }
  };

  const sheetOrId = finding?.sheetRowId ?? finding?.id ?? "Detail temuan";

  const canCreateTaskFromFinding =
    finding &&
    !hasAnyTask &&
    (finding.status === "open" || finding.status === "in_progress");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-page pb-14 pt-6 md:pt-8 md:min-h-[calc(100vh-4.5rem)]">
      <section className="container-page">
        {/* Breadcrumb + back */}
        <div className="mb-4 flex items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/findings" className="hover:text-slate-900">
              Daftar temuan
            </Link>
            <span>/</span>
            <span className="font-medium text-slate-900">{sheetOrId}</span>
          </div>

          <Link
            href="/findings"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50"
          >
            ← Kembali
          </Link>
        </div>

        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Detail temuan K3
            </div>
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
              {finding?.title ?? "Temuan tanpa judul"}
            </h1>
            <p className="max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
              Lihat detail lokasi, kronologi, rekomendasi, dan status penanganan
              temuan ini.
            </p>
          </div>

          {/* Status chip + action buttons */}
          <div className="flex flex-col items-start gap-2 text-xs md:items-end">
            <div>
              {finding && (
                <>
                  {finding.status === "open" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/5 px-3 py-1 text-[11px] font-medium text-danger">
                      <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                      {statusLabel(finding.status)}
                    </span>
                  )}
                  {finding.status === "in_progress" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/5 px-3 py-1 text-[11px] font-medium text-warning">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                      {statusLabel(finding.status)}
                    </span>
                  )}
                  {finding.status === "closed" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/5 px-3 py-1 text-[11px] font-medium text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {statusLabel(finding.status)}
                    </span>
                  )}
                </>
              )}
            </div>

            {finding && (
              <>
                <div className="text-[11px] text-slate-500">
                  ID Laporan:{" "}
                  <span className="font-mono font-medium text-slate-800">
                    {sheetOrId}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {canUpdateStatus && (
                    <>
                      <button
                        disabled={updating || finding.status === "open"}
                        onClick={() => handleUpdateStatus("open")}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Tandai Open
                      </button>
                      <button
                        disabled={updating || finding.status === "in_progress"}
                        onClick={() => handleUpdateStatus("in_progress")}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Tandai In Progress
                      </button>
                      <button
                        disabled={updating || finding.status === "closed"}
                        onClick={() => handleUpdateStatus("closed")}
                        className="rounded-full border border-emerald-500 bg-emerald-500 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-600 disabled:opacity-40"
                      >
                        Tandai Selesai
                      </button>
                    </>
                  )}

                  {canCreateTaskFromFinding && (
                    <Link
                      href={`/tasks/add?finding_id=${
                        finding.id
                      }&finding_code=${encodeURIComponent(sheetOrId)}`}
                      className="rounded-full border border-sky-500 bg-white px-3 py-1 text-[11px] font-medium text-sky-700 hover:bg-sky-50"
                    >
                      + Buat task dari temuan ini
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loading / error / content */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-6 text-xs text-slate-500 shadow-sm sm:px-5">
            Memuat detail temuan dari Supabase…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-danger/30 bg-danger/5 px-4 py-4 text-xs text-danger shadow-sm sm:px-5">
            {error}
          </div>
        )}

        {!loading && !error && finding && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
            {/* Kolom kiri */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4 md:space-y-5"
            >
              {/* Lokasi */}
              <div className="card rounded-3xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-700 shadow-sm sm:px-5 sm:py-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-900">
                    Lokasi & area bandara
                  </span>
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] text-slate-400">Bandara</dt>
                    <dd className="text-xs font-medium text-slate-900">
                      {finding.airportName ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-400">Terminal</dt>
                    <dd className="text-xs font-medium text-slate-900">
                      {finding.terminalName ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-400">Zona</dt>
                    <dd className="text-xs font-medium text-slate-900">
                      {finding.zoneName ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-slate-400">
                      Lokasi detail
                    </dt>
                    <dd className="text-xs font-medium text-slate-900">
                      {finding.locationName ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Kronologi */}
              <div className="card rounded-3xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-700 shadow-sm sm:px-5 sm:py-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-900">
                    Kronologi & temuan
                  </span>
                </div>

                <dl className="space-y-3">
                  <div>
                    <dt className="mb-0.5 text-[11px] text-slate-400">
                      Deskripsi singkat
                    </dt>
                    <dd className="whitespace-pre-wrap">
                      {finding.description ?? "-"}
                    </dd>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="mb-0.5 text-[11px] text-slate-400">
                        Tanggal inspeksi
                      </dt>
                      <dd>
                        {finding.inspectionDate
                          ? new Date(finding.inspectionDate).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="mb-0.5 text-[11px] text-slate-400">
                        Shift & waktu
                      </dt>
                      <dd>
                        {finding.shift ?? "-"}{" "}
                        {finding.startTime && finding.endTime
                          ? `· ${finding.startTime}–${finding.endTime}`
                          : ""}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="mb-0.5 text-[11px] text-slate-400">
                      Dampak potensi
                    </dt>
                    <dd className="whitespace-pre-wrap">
                      {finding.impact ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Rekomendasi */}
              <div className="card rounded-3xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-700 shadow-sm sm:px-5 sm:py-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-900">
                    Rekomendasi & tindak lanjut
                  </span>
                </div>

                <dl className="space-y-3">
                  <div>
                    <dt className="mb-0.5 text-[11px] text-slate-400">
                      Rekomendasi
                    </dt>
                    <dd className="whitespace-pre-wrap">
                      {finding.recommendation ?? "-"}
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-0.5 text-[11px] text-slate-400">
                      Tindakan mitigasi
                    </dt>
                    <dd className="whitespace-pre-wrap">
                      {finding.mitigation ?? "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </motion.div>

            {/* Kolom kanan */}
            <motion.aside
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
              className="space-y-4 md:space-y-5"
            >
              <div className="card rounded-3xl border border-slate-200 bg-white px-4 py-4 text-xs text-slate-700 shadow-sm sm:px-5 sm:py-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-900">
                    Ringkasan status
                  </span>
                </div>

                <dl className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[11px] text-slate-400">Severity</dt>
                    <dd className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium text-slate-50">
                      {severityLabel}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[11px] text-slate-400">
                      Unit penanggung jawab
                    </dt>
                    <dd className="max-w-[55%] text-right">
                      {finding.unitPic ?? "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[11px] text-slate-400">SLA target</dt>
                    <dd>
                      {finding.slaHours
                        ? `${finding.slaHours} jam`
                        : "Belum diatur"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[11px] text-slate-400">Dibuat pada</dt>
                    <dd>{createdAtLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[11px] text-slate-400">Ditutup pada</dt>
                    <dd>{closedAtLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[11px] text-slate-400">Sumber</dt>
                    <dd>{finding.source ?? "-"}</dd>
                  </div>
                </dl>
              </div>
            </motion.aside>
          </div>
        )}
      </section>
    </main>
  );
}
