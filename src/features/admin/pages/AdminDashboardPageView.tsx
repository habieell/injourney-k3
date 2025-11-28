"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type TerminalRow = Database["public"]["Tables"]["terminals"]["Row"];
type ZoneRow = Database["public"]["Tables"]["zones"]["Row"];
type LocationRow = Database["public"]["Tables"]["locations"]["Row"];

export function AdminDashboardPageView() {
  const supabase = getSupabaseBrowserClient();

  const [terminals, setTerminals] = useState<TerminalRow[]>([]);
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadMasterData = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const [
          { data: tData, error: tErr },
          { data: zData, error: zErr },
          { data: lData, error: lErr },
        ] = await Promise.all([
          supabase
            .from("terminals")
            .select("*")
            .order("name", { ascending: true }),
          supabase.from("zones").select("*").order("name", { ascending: true }),
          supabase
            .from("locations")
            .select("*")
            .order("name", { ascending: true }),
        ]);

        if (cancelled) return;

        if (tErr || zErr || lErr) {
          console.error("[AdminDashboard] Failed load master data", {
            tErr,
            zErr,
            lErr,
          });
          setErrorMsg(
            "Gagal memuat master data area. Coba refresh beberapa saat lagi."
          );
        }

        setTerminals(tData ?? []);
        setZones(zData ?? []);
        setLocations(lData ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error(
          "[AdminDashboard] Unexpected error load master data:",
          err
        );
        setErrorMsg(
          "Terjadi kesalahan saat memuat data. Coba refresh beberapa saat lagi."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMasterData();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const totalMaster = terminals.length + zones.length + locations.length;

  return (
    <main className="container-page space-y-8 py-8">
      {/* Header */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
            Admin · Master data area K3
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900">
            Pengaturan area bandara
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Kelola master data seperti terminal, zona, dan lokasi detail yang
            dipakai di laporan temuan K3. Akses ini hanya tersedia untuk
            pengguna dengan peran <span className="font-medium">admin</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => alert("Nanti diarahkan ke halaman manajemen user.")}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kelola user
          </button>
          <button
            type="button"
            onClick={() => alert("Nanti diarahkan ke halaman konfigurasi SLA.")}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Pengaturan SLA
          </button>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium tracking-wide text-slate-500">
            TERMINAL TERDAFTAR
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {terminals.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Terminal penumpang, kargo, dan fasilitas lain yang aktif.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium tracking-wide text-slate-500">
            ZONA &amp; LOKASI
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {zones.length}{" "}
            <span className="text-sm font-normal text-slate-500">zona</span>
            {" · "}
            {locations.length}{" "}
            <span className="text-sm font-normal text-slate-500">lokasi</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dipakai untuk tagging lokasi temuan K3 di seluruh bandara.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-medium tracking-wide text-slate-500">
            TOTAL MASTER DATA AREA
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {totalMaster}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Kombinasi dari terminal, zona, dan lokasi aktif.
          </p>
        </div>
      </section>

      {/* Error / loading state */}
      {loading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
          Memuat master data area...
        </div>
      )}

      {errorMsg && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Main content: 2 kolom */}
      {!loading && (
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Kiri: terminals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Terminal
                </h2>
                <p className="text-xs text-slate-500">
                  Master terminal penumpang, kargo, dan fasilitas lainnya.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  alert("Aksi tambah terminal belum di-implement.")
                }
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
              >
                + Terminal
              </button>
            </div>

            <div className="max-h-80 space-y-1 overflow-auto rounded-xl border border-slate-100 bg-slate-50/40 p-2">
              {terminals.length === 0 && (
                <p className="px-2 py-3 text-center text-[11px] text-slate-500">
                  Belum ada terminal terdaftar.
                </p>
              )}

              {terminals.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {t.name ?? "Tanpa nama"}
                    </p>
                    {t.code && (
                      <p className="text-[11px] text-slate-500">
                        Kode: {t.code}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Nanti buka modal edit untuk terminal ${t.name ?? t.id}`
                      )
                    }
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Kelola
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tengah: zones */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Zona</h2>
                <p className="text-xs text-slate-500">
                  Zona area di dalam terminal (contoh: check-in, boarding,
                  apron).
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Aksi tambah zona belum di-implement.")}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
              >
                + Zona
              </button>
            </div>

            <div className="max-h-80 space-y-1 overflow-auto rounded-xl border border-slate-100 bg-slate-50/40 p-2">
              {zones.length === 0 && (
                <p className="px-2 py-3 text-center text-[11px] text-slate-500">
                  Belum ada zona terdaftar.
                </p>
              )}

              {zones.map((z) => (
                <div
                  key={z.id}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {z.name ?? "Tanpa nama"}
                    </p>
                    {z.terminal_id && (
                      <p className="text-[11px] text-slate-500">
                        Terminal: {z.terminal_id}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Nanti buka modal edit untuk zona ${z.name ?? z.id}`
                      )
                    }
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Kelola
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: locations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-1">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Lokasi detail
                </h2>
                <p className="text-xs text-slate-500">
                  Titik lokasi spesifik (contoh: gate, belt bagasi, toilet,
                  dll).
                </p>
              </div>
              <button
                type="button"
                onClick={() => alert("Aksi tambah lokasi belum di-implement.")}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
              >
                + Lokasi
              </button>
            </div>

            <div className="max-h-80 space-y-1 overflow-auto rounded-xl border border-slate-100 bg-slate-50/40 p-2">
              {locations.length === 0 && (
                <p className="px-2 py-3 text-center text-[11px] text-slate-500">
                  Belum ada lokasi detail terdaftar.
                </p>
              )}

              {locations.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {l.name ?? "Tanpa nama"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Zona: {l.zone_id ?? "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        `Nanti buka modal edit untuk lokasi ${l.name ?? l.id}`
                      )
                    }
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Kelola
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
