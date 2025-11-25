"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PreviewFormCard from "@/components/landing/PreviewFormCard";
import { useLandingStats } from "@/hooks/useLandingStats";

const steps = [
  {
    title: "Tulis Laporan",
    desc: "Catat temuan atau potensi bahaya K3 dengan jelas dan lengkap.",
    icon: "📝",
  },
  {
    title: "Proses Verifikasi",
    desc: "Laporan diverifikasi petugas K3 dan diteruskan ke unit terkait.",
    icon: "✅",
  },
  {
    title: "Tindak Lanjut",
    desc: "Unit terkait melakukan perbaikan dan update status secara berkala.",
    icon: "📍",
  },
  {
    title: "Selesai",
    desc: "Temuan terdokumentasi rapi sebagai bukti pemenuhan K3.",
    icon: "🎉",
  },
];

function formatPercent(value: number | undefined) {
  if (value == null || Number.isNaN(value)) return "–";
  return `${Math.round(value)}%`;
}

function formatAvgSlaDays(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "–";
  const fixed = value.toFixed(1);
  // pakai format Indonesia, koma
  return fixed.replace(".", ",");
}

export default function HomePage() {
  const { stats, loading } = useLandingStats();

  const temuanHariIni = loading ? "…" : stats?.todayTotal ?? 0;
  const completionRate = loading
    ? "…"
    : formatPercent(stats?.completionRate30d);
  const avgSla = loading ? "…" : formatAvgSlaDays(stats?.avgSlaDays30d);

  return (
    <main className="min-h-screen bg-page text-slate-900">
      {/* HERO / FITUR */}
      <section id="fitur" className="hero-bg pb-16 pt-4 md:pt-6 lg:pt-10">
        <div className="container-page">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="max-w-xl space-y-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                Pilot Project – K3 Bandara Soekarno-Hatta
              </span>

              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl md:text-[40px] md:leading-tight">
                  Satu pintu laporan{" "}
                  <span className="text-sky-700">K3 di lingkungan bandara</span>
                </h1>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  Innjurny membantu petugas K3 di landside, airside, apron, dan
                  garbarata untuk mencatat temuan lapangan, memantau tindak
                  lanjut, dan memastikan keselamatan kerja di area bandara
                  secara real-time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/sign-in"
                  className="btn btn-primary rounded-full px-4 text-sm"
                >
                  Masuk sebagai Petugas
                </Link>
                <Link
                  href="/findings"
                  className="btn btn-outline rounded-full px-4 text-sm"
                >
                  Lihat statistik temuan
                </Link>
              </div>

              {/* quick KPI */}
              <div className="mt-4 grid max-w-md grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="card flex flex-col gap-1 px-3 py-3">
                  <span className="text-[11px] text-slate-500">
                    TEMUAN HARI INI
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {temuanHariIni}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    Open &amp; in progress
                  </span>
                </div>
                <div className="card flex flex-col gap-1 px-3 py-3">
                  <span className="text-[11px] text-slate-500">
                    TINGKAT PENYELESAIAN
                  </span>
                  <span className="text-lg font-semibold text-emerald-600">
                    {completionRate}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    30 hari terakhir
                  </span>
                </div>
                <div className="card flex flex-col gap-1 px-3 py-3">
                  <span className="text-[11px] text-slate-500">
                    RATA-RATA SLA
                  </span>
                  <span className="text-lg font-semibold text-slate-900">
                    {avgSla}{" "}
                    {avgSla !== "–" && <span className="text-xs">hari</span>}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    dari laporan masuk
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right preview form */}
            <div className="relative mx-auto w-full lg:max-w-[620px]">
              <PreviewFormCard />
            </div>
          </div>
        </div>
      </section>

      {/* FLOW PROSES / CARA KERJA */}
      <section
        id="cara-kerja"
        className="border-t border-slate-200/60 bg-white py-12 md:py-16"
      >
        <div className="container-page">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="text-xl font-semibold md:text-2xl">
              Alur penanganan laporan K3
            </h2>
            <p className="text-sm text-slate-500">
              Laporan Anda akan diproses melalui empat langkah yang terukur dan
              terdokumentasi.
            </p>
          </div>

          <div className="relative">
            <div className="steps-line" />
            <div className="grid gap-8 md:grid-cols-4">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  className="step-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.3, delay: 0.1 * idx }}
                >
                  <div className="step-icon-wrapper">
                    <div className="step-icon">
                      <span className="text-xl md:text-2xl">{step.icon}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold md:text-base">
                      {step.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-500 md:text-[13px]">
                      {step.desc}
                    </p>
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-sky-700">
                    Langkah {idx + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BAND TOP REPORTER / INSIGHT */}
      <section id="insight" className="band-primary py-10 md:py-14">
        <div className="container-page relative z-[1]">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <h2 className="text-lg font-semibold md:text-2xl">
              Top Reporter Bulan Ini
            </h2>
            <p className="text-sm text-slate-100/80">
              Apresiasi bagi petugas yang konsisten melaporkan temuan dan
              mendorong budaya K3 di area bandara.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6 md:flex-row md:justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card flex items-center gap-4 rounded-2xl bg-white/95 px-4 py-3 text-left text-slate-900 shadow-lg md:min-w-[320px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                👷‍♂️
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500">
                  Petugas K3 Teraktif
                </div>
                <div className="text-sm font-semibold">M. Rizky Pratama</div>
                <div className="text-[11px] text-slate-500">
                  37 laporan, 95% selesai sebelum SLA
                </div>
              </div>
            </motion.div>

            <Link
              href="/tasks"
              className="btn btn-outline border-white/60 bg-white/10 text-xs text-white backdrop-blur hover:bg-white/20"
            >
              Lihat leaderboard lengkap
            </Link>
          </div>
        </div>
      </section>

      {/* RINGKASAN AKTIVITAS */}
      <section className="texture-dots bg-white py-12 md:py-16">
        <div className="container-page relative z-[1]">
          <div className="mx-auto max-w-xl space-y-2 text-center">
            <h2 className="text-lg font-semibold md:text-2xl">
              Ringkasan aktivitas laporan
            </h2>
            <p className="text-sm text-slate-500">
              Monitoring jumlah laporan dan unit yang aktif menggunakan Innjurny
              K3.
            </p>
          </div>

          <div className="mt-8 rounded-3xl bg-white/90 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="space-y-1 text-center md:text-left">
                <div className="text-xs font-medium tracking-wide text-slate-500">
                  JUMLAH LAPORAN TEREKAM
                </div>
                {/* di sini masih dummy, nanti bisa disambungin juga */}
                <div className="text-3xl font-semibold text-sky-700 md:text-4xl">
                  9.214
                </div>
              </div>
              <Link
                href="/findings"
                className="btn btn-outline rounded-full px-4 text-xs"
              >
                Lihat detail per terminal
              </Link>
            </div>

            <div className="grid gap-4 text-center text-sm md:grid-cols-4">
              <div>
                <div className="text-2xl font-semibold text-slate-900">3</div>
                <div className="text-xs text-slate-500">Terminal penumpang</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">1</div>
                <div className="text-xs text-slate-500">Terminal kargo</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">124</div>
                <div className="text-xs text-slate-500">Petugas aktif</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-emerald-600">
                  92%
                </div>
                <div className="text-xs text-slate-500">Laporan selesai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-[11px] text-slate-500">
        <div className="container-page">
          Dibangun sebagai konsep{" "}
          <span className="font-medium text-sky-700">
            Innjurny K3 Reporting
          </span>{" "}
          · Untuk kebutuhan prototype &amp; studi kasus internal.
        </div>
      </footer>
    </main>
  );
}
