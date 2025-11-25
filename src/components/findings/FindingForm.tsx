// src/components/findings/FindingForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import {
  findingFormSchema,
  type FindingFormValues,
  findingSeverityValues,
} from "@/lib/schemas";

type FieldErrors = Partial<Record<keyof FindingFormValues, string>>;

type FindingFormProps = {
  /** Callback yang bener-bener akan insert ke Supabase (di page /report) */
  onSubmit: (values: FindingFormValues) => Promise<void> | void;
  submitLabel?: string;
  initialValues?: Partial<FindingFormValues>;
};

export function FindingForm({
  onSubmit,
  submitLabel = "Simpan temuan",
  initialValues,
}: FindingFormProps) {
  const [values, setValues] = useState<FindingFormValues>({
    location: initialValues?.location ?? "",
    category: initialValues?.category ?? "",
    unit: initialValues?.unit ?? "",
    severity: initialValues?.severity ?? "Medium",
    status: initialValues?.status ?? "open",
    description: initialValues?.description ?? "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field: keyof FindingFormValues, value: string) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    try {
      // Zod validation
      const parsed = findingFormSchema.parse(values);

      setSubmitting(true);
      await onSubmit(parsed);
    } catch (err: unknown) {
      // Tangani error Zod v4 (issues, bukan errors)
      if (err && typeof err === "object" && "issues" in err) {
        const zodErr = err as import("zod").ZodError<FindingFormValues>;
        const nextErrors: FieldErrors = {};

        for (const issue of zodErr.issues) {
          const pathKey = issue.path[0];
          if (typeof pathKey === "string") {
            nextErrors[pathKey as keyof FindingFormValues] = issue.message;
          }
        }

        setFieldErrors(nextErrors);
      } else {
        console.error("Unexpected form error:", err);
        setFormError("Terjadi kesalahan saat validasi formulir.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-4 shadow-sm sm:px-5 sm:py-5"
    >
      {/* Lokasi */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">
          Lokasi temuan
        </label>
        <input
          type="text"
          value={values.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Contoh: Gate 5, Terminal 3"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        {fieldErrors.location && (
          <p className="text-[11px] text-red-500">{fieldErrors.location}</p>
        )}
      </div>

      {/* Kategori + Unit */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Kategori temuan
          </label>
          <input
            type="text"
            value={values.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="Contoh: Housekeeping, Electrical, Fasilitas"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          {fieldErrors.category && (
            <p className="text-[11px] text-red-500">{fieldErrors.category}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Unit penanggung jawab
          </label>
          <input
            type="text"
            value={values.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            placeholder="Contoh: Facility Management, Aviation Security"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          {fieldErrors.unit && (
            <p className="text-[11px] text-red-500">{fieldErrors.unit}</p>
          )}
        </div>
      </div>

      {/* Severity + Status */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Tingkat keparahan
          </label>
          <select
            value={values.severity}
            onChange={(e) => handleChange("severity", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            {findingSeverityValues.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
          {fieldErrors.severity && (
            <p className="text-[11px] text-red-500">{fieldErrors.severity}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Status awal
          </label>
          <select
            value={values.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
          {fieldErrors.status && (
            <p className="text-[11px] text-red-500">{fieldErrors.status}</p>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">
          Deskripsi singkat
        </label>
        <textarea
          value={values.description ?? ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Jelaskan kondisi temuan, potensi risiko, dan kronologinya."
          rows={4}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
        {fieldErrors.description && (
          <p className="text-[11px] text-red-500">{fieldErrors.description}</p>
        )}
      </div>

      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">
          {formError}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {submitting ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
