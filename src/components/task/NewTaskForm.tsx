"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";
import type { FindingOption } from "@/types/finding-options";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type TaskPriority = Database["public"]["Enums"]["task_priority"];

type Props = {
  findingOptions: FindingOption[];
  findingLoading: boolean;
  findingError: string | null;
};

export function NewTaskForm({
  findingOptions,
  findingLoading,
  findingError,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  // ==== default from URL (kalau datang dari halaman temuan) ====
  const findingIdFromUrl = searchParams.get("finding_id");
  const findingCodeFromUrl = searchParams.get("finding_code");

  // ==== form state ====
  const [selectedFindingId, setSelectedFindingId] = useState<string | "">(
    findingIdFromUrl ?? ""
  );
  const [selectedFindingCode, setSelectedFindingCode] = useState<string | null>(
    findingCodeFromUrl
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [areaText, setAreaText] = useState("");
  const [ownerUnit, setOwnerUnit] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status] = useState<TaskStatus>("open");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ==== options dengan label yang enak dibaca ====
  const optionsWithLabel = useMemo(
    () =>
      findingOptions.map((opt) => {
        const base =
          opt.title?.trim().length ?? 0
            ? opt.title
            : opt.location ?? "Temuan tanpa judul";
        const codeLabel = opt.code ? ` · ${opt.code}` : "";
        return {
          ...opt,
          label: `${base}${codeLabel}`,
        };
      }),
    [findingOptions]
  );

  // ==== handler pilih temuan ====
  const handleChangeFinding = (value: string) => {
    if (!value) {
      setSelectedFindingId("");
      setSelectedFindingCode(null);
      return;
    }

    setSelectedFindingId(value);

    const opt = optionsWithLabel.find((o) => o.id === value);
    setSelectedFindingCode(opt?.code ?? null);
  };

  // ==== submit ====
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Judul task wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);

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
        finding_id: selectedFindingId || null,
        finding_code: selectedFindingCode,
      });

      if (error) {
        console.error("[NewTaskForm] create task error:", error);
        setErrorMsg("Gagal membuat task. Coba lagi beberapa saat lagi.");
        return;
      }

      router.push("/tasks");
      router.refresh();
    } catch (err) {
      console.error("[NewTaskForm] unexpected error:", err);
      setErrorMsg("Terjadi kesalahan tak terduga. Coba beberapa saat lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==== render ====
  return (
    <section className="container-page max-w-3xl pb-14 pt-6 md:pt-8">
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
        Catat pekerjaan yang harus dilakukan oleh unit terkait sebagai tindak
        lanjut dari temuan K3.
      </p>

      {/* Info jika datang dari temuan */}
      {findingIdFromUrl && findingCodeFromUrl && (
        <div className="mb-4 rounded-2xl bg-sky-50 px-3 py-2 text-[11px] text-sky-800 sm:text-xs">
          Form ini dibuka dari temuan{" "}
          <a
            href={`/findings/${findingIdFromUrl}`}
            className="font-mono font-semibold underline-offset-2 hover:underline"
          >
            {findingCodeFromUrl}
          </a>
          . Kamu tetap bisa mengganti atau melepas keterhubungan temuan di
          dropdown di bawah.
        </div>
      )}

      {/* Error loading finding options */}
      {findingError && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 sm:text-xs">
          {findingError} Kamu masih bisa membuat task tanpa menghubungkannya ke
          temuan manapun.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 text-xs shadow-sm sm:p-6 sm:text-sm"
      >
        {/* Terhubung ke temuan */}
        <div className="space-y-1">
          <label className="font-medium text-slate-800">
            Terhubung ke temuan
          </label>
          <select
            value={selectedFindingId}
            onChange={(e) => handleChangeFinding(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="">(Tidak terhubung dengan temuan manapun)</option>
            {findingLoading && (
              <option value="" disabled>
                Memuat daftar temuan…
              </option>
            )}
            {!findingLoading &&
              optionsWithLabel.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Pilih temuan yang menjadi sumber task ini (opsional).
          </p>
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
            <label className="font-medium text-slate-800">Target selesai</label>
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
              onChange={(e) =>
                setPriority(
                  e.target.value as Database["public"]["Enums"]["task_priority"]
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="rounded-xl bg-danger/5 px-3 py-2 text-[11px] text-danger sm:text-xs">
            {errorMsg}
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
  );
}

export default NewTaskForm;
