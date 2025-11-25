"use client";

type KpiCardsProps = {
  totalFindings?: number;
  openCount?: number;
  inProgressCount?: number;
  closedCount?: number;
  slaAverageHours?: number;
};

export function KpiCards({
  totalFindings = 0,
  openCount = 0,
  inProgressCount = 0,
  closedCount = 0,
  slaAverageHours = 72,
}: KpiCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total temuan"
        value={totalFindings}
        subtitle="Seluruh area bandara"
      />
      <KpiCard
        label="Open"
        value={openCount}
        subtitle="Menunggu penanganan"
        tone="danger"
      />
      <KpiCard
        label="In progress"
        value={inProgressCount}
        subtitle="Sedang dikerjakan"
        tone="warning"
      />
      <KpiCard
        label="Closed"
        value={closedCount}
        subtitle={`Rata-rata SLA ${slaAverageHours} jam`}
        tone="success"
      />
    </section>
  );
}

type Tone = "default" | "danger" | "warning" | "success";

type KpiCardProps = {
  label: string;
  value: number | string;
  subtitle?: string;
  tone?: Tone;
};

const toneClass: Record<Tone, string> = {
  default: "bg-slate-50 text-slate-900",
  danger: "bg-rose-50 text-rose-700",
  warning: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
};

function KpiCard({ label, value, subtitle, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-semibold text-slate-900">{value}</span>
      </div>
      {subtitle && (
        <div
          className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${toneClass[tone]}`}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
