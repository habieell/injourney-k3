// src/app/(main)/report/page.tsx

"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";
import { useAuth } from "@/hooks/useAuth";
import { can, getRoleFromProfile } from "@/lib/auth/permission";

// ====== Supabase typed helpers ======
type Tables = Database["public"]["Tables"];

// aslinya dari Supabase:
type FindingInsertDb = Tables["findings"]["Insert"];

// override: izinkan location_id = string | null
type FindingInsert = Omit<FindingInsertDb, "location_id"> & {
  location_id: string | null;
};

type FindingPhotoInsert = Tables["finding_photos"]["Insert"];

type ShiftOption = NonNullable<FindingInsert["shift"]>;
type SeverityOption = NonNullable<FindingInsert["severity"]>;
type StatusOption = NonNullable<FindingInsert["status"]>;

type AirportRow = Tables["airports"]["Row"];
type TerminalRow = Tables["terminals"]["Row"];
type ZoneRow = Tables["zones"]["Row"];

// ====== Form state type ======
type ReportFormState = {
  title: string;
  location_text: string; // bebas (titik lokasi di-merge ke sini)
  description: string;
  impact: string;
  recommendation: string;
  mitigation: string;
  unit_pic: string;
  source: string;
  inspection_date: string; // YYYY-MM-DD
  shift: ShiftOption | "";
  start_time: string; // HH:MM
  end_time: string;
  severity: SeverityOption;
  status: StatusOption;
  airport_id: string;
  terminal_id: string;
  zone_id: string;
};

// Helper string cleaner
function cleanOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

const defaultFormState: ReportFormState = {
  title: "",
  location_text: "",
  description: "",
  impact: "",
  recommendation: "",
  mitigation: "",
  unit_pic: "",
  source: "",
  inspection_date: "",
  shift: "",
  start_time: "",
  end_time: "",
  severity: "medium",
  status: "open",
  airport_id: "",
  terminal_id: "",
  zone_id: "",
};

export default function ReportPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const { profile } = useAuth(); // profile.id = inspector_id
  const role = getRoleFromProfile(profile);
  const isCreateAllowed = can.createFinding(role);

  const [form, setForm] = useState<ReportFormState>(defaultFormState);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [airports, setAirports] = useState<AirportRow[]>([]);
  const [terminals, setTerminals] = useState<TerminalRow[]>([]);
  const [zones, setZones] = useState<ZoneRow[]>([]);

  // ====== Load master data lokasi ======
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [
          { data: airportsData, error: airportsError },
          { data: terminalsData, error: terminalsError },
          { data: zonesData, error: zonesError },
        ] = await Promise.all([
          supabase.from("airports").select("*").order("code"),
          supabase.from("terminals").select("*").order("code"),
          supabase.from("zones").select("*").order("code"),
        ]);

        if (airportsError) throw airportsError;
        if (terminalsError) throw terminalsError;
        if (zonesError) throw zonesError;

        setAirports(airportsData ?? []);
        setTerminals(terminalsData ?? []);
        setZones(zonesData ?? []);
      } catch (err) {
        console.error("Load master lokasi error:", err);
        setErrorMsg(
          "Gagal memuat data lokasi bandara. Coba refresh halaman atau hubungi admin."
        );
      }
    };

    loadMasterData();
  }, [supabase]);

  // ====== Derived options (filter by parent) ======
  const terminalOptions = useMemo(
    () =>
      terminals.filter(
        (t) => !form.airport_id || t.airport_id === form.airport_id
      ),
    [terminals, form.airport_id]
  );

  const zoneOptions = useMemo(
    () =>
      zones.filter(
        (z) => !form.terminal_id || z.terminal_id === form.terminal_id
      ),
    [zones, form.terminal_id]
  );

  // ====== Handlers ======
  const handleInputChange =
    (field: keyof ReportFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleShiftChange = (value: ShiftOption) => {
    setForm((prev) => ({ ...prev, shift: value }));
  };

  const handleSeverityChange = (value: SeverityOption) => {
    setForm((prev) => ({ ...prev, severity: value }));
  };

  const handleSelectChange =
    (field: keyof ReportFormState) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;

      // Kalau ganti parent, reset anak-anaknya
      setForm((prev) => {
        if (field === "airport_id") {
          return {
            ...prev,
            airport_id: value,
            terminal_id: "",
            zone_id: "",
          };
        }
        if (field === "terminal_id") {
          return {
            ...prev,
            terminal_id: value,
            zone_id: "",
          };
        }
        return { ...prev, [field]: value };
      });
    };

  // For now status selalu "open" dari UI – kalau mau diubah, bisa bikinin toggle.
  const statusLabel = useMemo(() => {
    switch (form.status) {
      case "open":
        return "Open (default)";
      case "in_progress":
        return "In Progress";
      case "closed":
        return "Closed";
      default:
        return form.status;
    }
  }, [form.status]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const newFiles = Array.from(fileList);

    setFiles((prev) => [...prev, ...newFiles]);

    const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ====== Submit ======
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (!profile?.id) {
        throw new Error("Session tidak ditemukan. Silakan login ulang.");
      }

      if (!isCreateAllowed) {
        throw new Error(
          "Peran kamu saat ini tidak memiliki akses untuk membuat laporan temuan. Silakan hubungi admin K3."
        );
      }

      if (!form.airport_id || !form.terminal_id || !form.zone_id) {
        throw new Error(
          "Detail lokasi belum lengkap. Pilih bandara, terminal, dan zona."
        );
      }

      // 1. Siapkan payload temuan
      const inspectionDate =
        form.inspection_date || new Date().toISOString().slice(0, 10); // fallback hari ini

      const findingPayload: FindingInsert = {
        inspector_id: profile.id,
        airport_id: form.airport_id,
        terminal_id: form.terminal_id,
        zone_id: form.zone_id,

        // titik lokasi bebas → taruh di location_text
        location_id: null,

        title: form.title.trim(),
        description: form.description.trim(),
        impact: cleanOrNull(form.impact),
        recommendation: cleanOrNull(form.recommendation),
        mitigation: cleanOrNull(form.mitigation),
        unit_pic: cleanOrNull(form.unit_pic),
        source: cleanOrNull(form.source),

        inspection_date: inspectionDate,
        shift: (form.shift || "pagi") as ShiftOption,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        severity: form.severity,
        status: form.status,
      };

      const { data: finding, error: insertError } = await supabase
        .from("findings")
        .insert(findingPayload as FindingInsertDb)
        .select()
        .single();

      if (insertError || !finding) {
        console.error("Insert finding error:", insertError);
        throw new Error(
          insertError?.message || "Gagal menyimpan laporan temuan."
        );
      }

      const findingId = finding.id as string;

      // 2. Upload foto (jika ada)
      if (files.length > 0) {
        for (const [index, file] of files.entries()) {
          const uniqueId = crypto.randomUUID();
          const filePath = `${findingId}/${uniqueId}-${file.name}`;

          const { error: uploadError } = await supabase.storage
            .from("finding-evidence")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload file error:", uploadError);
            throw new Error(
              `Gagal mengunggah foto ke-${index + 1}: ${uploadError.message}`
            );
          }

          const photoPayload: FindingPhotoInsert = {
            finding_id: findingId,
            storage_path: filePath,
            caption: null,
          };

          const { error: photoInsertError } = await supabase
            .from("finding_photos")
            .insert(photoPayload);

          if (photoInsertError) {
            console.error("Insert finding_photos error:", photoInsertError);
            throw new Error(`Gagal mencatat foto ke-${index + 1} di database.`);
          }
        }
      }

      // sukses → kasih pesan dikit lalu balik ke halaman sebelumnya
      setSuccessMsg(
        "Laporan temuan berhasil disimpan dan akan diproses oleh tim K3."
      );

      // (opsional) kalau mau keliatan sebentar bisa pakai timeout 1–2 detik
      setTimeout(() => {
        router.back();
      }, 800);
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan laporan.";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // ====== UI ======
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-page pb-14 pt-6 md:pt-8 md:min-h-[calc(100vh-4.5rem)]">
      <section className="container-page">
        {/* Header page */}
        <div className="mb-6 space-y-2 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Form Laporan Temuan K3
          </div>
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            Laporkan temuan K3 di area bandara
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
            Isi detail temuan secara lengkap dan jelas agar unit penanggung
            jawab dapat menindaklanjuti sesuai prioritas dan SLA yang berlaku.
          </p>
        </div>

        {/* Alert role tidak boleh create */}
        {!isCreateAllowed && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Akun kamu saat ini memiliki peran{" "}
            <span className="font-semibold">{role}</span>. Peran ini tidak
            memiliki akses untuk membuat laporan baru.
            <br />
            Untuk mengirim laporan temuan, silakan hubungi admin K3 agar akunmu
            diubah menjadi <b>inspector</b> atau <b>admin</b>.
          </div>
        )}

        {/* Alert messages */}
        {successMsg && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            {errorMsg}
          </div>
        )}

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className={`mx-auto max-w-5xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm md:p-7 ${
            !isCreateAllowed ? "opacity-60" : ""
          }`}
        >
          {/* Section 1: Informasi utama */}
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Informasi utama temuan
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Judul */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Judul temuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Misal: Kabel AC melintang di area pejalan kaki"
                  value={form.title}
                  onChange={handleInputChange("title")}
                  required
                  disabled={!isCreateAllowed}
                />
                <p className="text-[11px] text-slate-400">
                  Buat judul singkat yang mudah dipahami.
                </p>
              </div>

              {/* Deskripsi singkat */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Deskripsi temuan <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Uraikan kondisi temuan secara singkat, jelas, dan objektif."
                  value={form.description}
                  onChange={handleInputChange("description")}
                  required
                  disabled={!isCreateAllowed}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Lokasi deskriptif (teks bebas, termasuk titik lokasi) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Lokasi temuan (deskripsi singkat)
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Contoh: Samping pintu masuk Terminal 2, Gate 2F, dekat counter check-in"
                  value={form.location_text}
                  onChange={handleInputChange("location_text")}
                  disabled={!isCreateAllowed}
                />
                <p className="text-[11px] text-slate-400">
                  Tulis area sejelas mungkin: terminal, gate, landmark, atau
                  deskripsi titik lokasi lainnya.
                </p>
              </div>

              {/* Dampak / potensi risiko */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Dampak / potensi risiko
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Contoh: Berpotensi menyebabkan terpeleset, tersengat listrik, terpapar bahan kimia, dll."
                  value={form.impact}
                  onChange={handleInputChange("impact")}
                  disabled={!isCreateAllowed}
                />
              </div>
            </div>

            {/* Detail lokasi terstruktur */}
            <div className="space-y-3 rounded-2xl bg-slate-50/60 p-4">
              <p className="text-xs font-semibold text-slate-800">
                Detail lokasi (bandara → terminal → zona)
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {/* Bandara */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">
                    Bandara <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-emerald-500 focus:ring"
                    value={form.airport_id}
                    onChange={handleSelectChange("airport_id")}
                    required
                    disabled={!isCreateAllowed}
                  >
                    <option value="">Pilih bandara</option>
                    {airports.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terminal */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">
                    Terminal <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-emerald-500 focus:ring"
                    value={form.terminal_id}
                    onChange={handleSelectChange("terminal_id")}
                    disabled={!form.airport_id || !isCreateAllowed}
                    required
                  >
                    <option value="">
                      {form.airport_id
                        ? "Pilih terminal"
                        : "Pilih bandara dulu"}
                    </option>
                    {terminalOptions.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} — {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zona */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-slate-700">
                    Zona <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none ring-emerald-500 focus:ring"
                    value={form.zone_id}
                    onChange={handleSelectChange("zone_id")}
                    disabled={!form.terminal_id || !isCreateAllowed}
                    required
                  >
                    <option value="">
                      {form.terminal_id ? "Pilih zona" : "Pilih terminal dulu"}
                    </option>
                    {zoneOptions.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.code} — {z.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Unit PIC */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Unit penanggung jawab (PIC)
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Misal: Facility Management, Electrical, Cleaning Service"
                  value={form.unit_pic}
                  onChange={handleInputChange("unit_pic")}
                  disabled={!isCreateAllowed}
                />
              </div>

              {/* Sumber temuan */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Sumber temuan
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Inspeksi rutin, laporan penumpang, temuan operasi, dll."
                  value={form.source}
                  onChange={handleInputChange("source")}
                  disabled={!isCreateAllowed}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Waktu & rekomendasi */}
          <div className="space-y-5 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Waktu kejadian & tindak lanjut
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              {/* Tanggal */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Tanggal inspeksi
                </label>
                <input
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  value={form.inspection_date}
                  onChange={handleInputChange("inspection_date")}
                  disabled={!isCreateAllowed}
                />
              </div>

              {/* Shift */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Shift
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  value={form.shift}
                  onChange={(e) =>
                    handleShiftChange(e.target.value as ShiftOption)
                  }
                  disabled={!isCreateAllowed}
                >
                  <option value="">Pilih shift</option>
                  <option value="pagi">Pagi</option>
                  <option value="siang">Siang</option>
                  <option value="malam">Malam</option>
                </select>
              </div>

              {/* Jam mulai / selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Jam mulai
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                    value={form.start_time}
                    onChange={handleInputChange("start_time")}
                    disabled={!isCreateAllowed}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Jam selesai
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                    value={form.end_time}
                    onChange={handleInputChange("end_time")}
                    disabled={!isCreateAllowed}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Rekomendasi */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Rekomendasi tindakan
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Contoh: Pasang cone, alihkan jalur, matikan sumber listrik sementara."
                  value={form.recommendation}
                  onChange={handleInputChange("recommendation")}
                  disabled={!isCreateAllowed}
                />
              </div>

              {/* Mitigasi sementara */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Mitigasi sementara
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring"
                  placeholder="Tindakan sementara yang sudah dilakukan di lapangan."
                  value={form.mitigation}
                  onChange={handleInputChange("mitigation")}
                  disabled={!isCreateAllowed}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Severity & status */}
          <div className="space-y-5 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Penilaian risiko
            </h2>

            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
              {/* Severity */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Severity temuan <span className="text-red-500">*</span>
                </label>
                <div className="inline-flex flex-wrap gap-2">
                  {(
                    ["low", "medium", "high", "critical"] as SeverityOption[]
                  ).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleSeverityChange(level)}
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        form.severity === level
                          ? "bg-slate-900 text-slate-50"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      disabled={!isCreateAllowed}
                    >
                      {level === "low" && "Low"}
                      {level === "medium" && "Medium"}
                      {level === "high" && "High"}
                      {level === "critical" && "Critical"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status awal */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Status awal
                </label>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-[11px] text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {statusLabel}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Status dapat diubah saat penanganan di dashboard admin.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Upload foto */}
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-semibold text-slate-900">
              Foto pendukung
            </h2>

            <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-800">
                    Unggah foto kondisi temuan (opsional)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Maks. 3 file, &lt; 10MB per file. Gunakan foto close-up dan
                    wide area untuk memudahkan verifikasi.
                  </p>
                </div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-medium text-slate-50 shadow-sm hover:bg-slate-800">
                  <span>+ Pilih file</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!isCreateAllowed}
                  />
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-medium text-slate-600">
                    {files.length} file dipilih:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-sm"
                      >
                        <div className="h-9 w-9 overflow-hidden rounded-xl bg-slate-100">
                          {previews[idx] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previews[idx]}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="max-w-[150px]">
                          <div className="truncate font-medium">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="ml-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-red-50 hover:text-red-600"
                          disabled={!isCreateAllowed}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-400">
              Kolom bertanda <span className="text-red-500">*</span> wajib
              diisi. Pastikan data yang diinput benar sebelum dikirim.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                className="btn btn-outline rounded-full px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => router.back()}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !isCreateAllowed}
                className="btn btn-primary rounded-full px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan laporan"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
