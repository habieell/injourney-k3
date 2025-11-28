// src/app/(main)/tasks/add/page.tsx

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";
import { useFindingOptions } from "@/hooks/useFindingOptions";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  // ==== query dari URL (kalau datang dari detail temuan) ====
  const findingIdFromUrl = searchParams.get("finding_id");
  const findingCodeFromUrl = searchParams.get("finding_code");

  // ==== state form ====
  const [selectedFindingId, setSelectedFindingId] = useState<string | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaText, setAreaText] = useState("");
  const [ownerUnit, setOwnerUnit] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status] = useState<TaskStatus>("open");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==== options temuan open ====
  const {
    options: findingOptions,
    loading: loadingFindings,
    error: findingError,
  } = useFindingOptions();

  // kalau datang dari URL, set default selectedFindingId
  useEffect(() => {
    if (findingIdFromUrl) {
      setSelectedFindingId(findingIdFromUrl);
    }
  }, [findingIdFromUrl]);

  // cari code temuan dari option yang kepilih (fallback ke query)
  const selectedFindingCode = useMemo(() => {
    if (!selectedFindingId) return null;

    const opt = findingOptions.find((o) => o.id === selectedFindingId);
    if (opt) return opt.code;

    // fallback: kalau datang dari URL tapi options belum ada
    if (findingIdFromUrl === selectedFindingId && findingCodeFromUrl) {
      return findingCodeFromUrl;
    }

    return null;
  }, [selectedFindingId, findingOptions, findingIdFromUrl, findingCodeFromUrl]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const isoDue =
        dueAt && dueAt.length > 0
          ? new Date(dueAt + "T00:00:00").toISOString()
          : null;

      const { error } = await supabase.from("tasks").insert({
        title: title.trim(),
        description: description.trim() || null,
        area_text: areaText.trim() || null,
        owner_unit: ownerUnit.trim() || null,
        due_at: isoDue,
        priority,
        status,
        // relasi ke temuan (boleh null)
        finding_id: selectedFindingId || null,
        finding_code: selectedFindingCode,
      });

      if (error) {
        console.error("[NewTaskPage] insert error", error);
        throw error;
      }

      router.push("/tasks");
      router.refresh();
    } catch (err) {
      console.error("[NewTaskPage] failed create task", err);
      setError("Gagal membuat task. Coba lagi beberapa saat lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-[calc(100vh-4rem)] bg-page pb-14 pt-6 md:pt-8 md:min-h-[calc(100vh-4.5rem)]">
        <section className="container-page max-w-3xl">
          {/* Breadcrumb */}
          <div className="mb-4 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => router.push("/tasks")}
              className="hover:text-slate-900"
            >
              Daftar task
            </button>{" "}
            / <span className="font-medium text-slate-900">Buat task baru</span>
          </div>

          <h1 className="mb-2 text-lg font-semibold text-slate-900 md:text-xl">
            Buat task tindak lanjut K3
          </h1>
          <p className="mb-4 text-xs leading-relaxed text-slate-500 sm:text-sm">
            Catat pekerjaan yang harus dilakukan oleh unit terkait sebagai
            tindak lanjut dari temuan K3.
          </p>

          {/* Info kalau datang dari halaman temuan */}
          {findingIdFromUrl && findingCodeFromUrl && (
            <div className="mb-4 rounded-2xl bg-sky-50 px-3 py-2 text-[11px] text-sky-800 sm:text-xs">
              Form ini dibuka dari temuan{" "}
              <a
                href={`/findings/${findingIdFromUrl}`}
                className="font-mono font-semibold underline-offset-2 hover:underline"
              >
                {findingCodeFromUrl}
              </a>
              . Kamu masih bisa mengganti atau melepaskan keterhubungan di
              dropdown di bawah.
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 text-xs shadow-sm sm:p-6 sm:text-sm"
          >
            {/* === Terhubung ke temuan === */}
            <div className="space-y-1">
              <label className="font-medium text-slate-800">
                Terhubung ke temuan
              </label>
              <select
                value={selectedFindingId}
                onChange={(e) => setSelectedFindingId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="">
                  (Tidak terhubung dengan temuan manapun)
                </option>

                {findingOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.code} — {opt.location}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Pilih temuan K3 yang menjadi dasar task ini. Hanya menampilkan
                temuan dengan status <span className="font-semibold">Open</span>
                .
              </p>
              {loadingFindings && (
                <p className="text-[11px] text-slate-400">
                  Memuat daftar temuan open…
                </p>
              )}
              {findingError && (
                <p className="text-[11px] text-danger">
                  Gagal memuat daftar temuan open.
                </p>
              )}
            </div>

            {/* Judul */}
            <div className="space-y-1">
              <label className="font-medium text-slate-800">
                Judul task <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Contoh: Perbaiki penutup manhole yang longgar"
              />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <label className="font-medium text-slate-800">
                Deskripsi singkat
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                placeholder="Detail pekerjaan, lokasi lebih rinci, catatan tambahan…"
              />
            </div>

            {/* Area & Unit */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="font-medium text-slate-800">
                  Area / lokasi singkat
                </label>
                <input
                  type="text"
                  value={areaText}
                  onChange={(e) => setAreaText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Misal: Apron · Terminal 3"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-slate-800">
                  Unit penanggung jawab
                </label>
                <input
                  type="text"
                  value={ownerUnit}
                  onChange={(e) => setOwnerUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Misal: Unit Facility & Asset"
                />
              </div>
            </div>

            {/* Target & Prioritas */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="font-medium text-slate-800">
                  Target selesai
                </label>
                <input
                  type="date"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-800">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="low">Rendah</option>
                  <option value="medium">Sedang</option>
                  <option value="high">Tinggi</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-danger/5 px-3 py-2 text-[11px] text-danger sm:text-xs">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                onClick={() => router.push("/tasks")}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
              >
                {submitting ? "Menyimpan…" : "Simpan task"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </AuthGuard>
  );
}
