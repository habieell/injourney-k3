"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type TaskStatus = "open" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  relatedFinding?: string;
  area: string;
  owner: string;
  dueDate: string; // ISO string
  status: TaskStatus;
  priority: TaskPriority;
};

/**
 * Untuk sekarang masih dummy data.
 * Nanti gampang diganti pakai data dari Supabase (tabel tasks).
 */
const MOCK_TASKS: Task[] = [
  {
    id: "TASK-001",
    title: "Perbaiki penutup manhole yang longgar",
    relatedFinding: "FND-2024-0012",
    area: "Apron · Terminal 3",
    owner: "Unit Facility & Asset",
    dueDate: "2025-02-20T10:00:00.000Z",
    status: "open",
    priority: "high",
  },
  {
    id: "TASK-002",
    title: "Update signage jalur evakuasi lantai 2",
    relatedFinding: "FND-2024-0007",
    area: "Departure Hall · T2",
    owner: "Unit K3 Bandara",
    dueDate: "2025-02-22T10:00:00.000Z",
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "TASK-003",
    title: "Penggantian APAR kadaluarsa di gate 5",
    relatedFinding: "FND-2024-0003",
    area: "Gate 5 · Terminal 1C",
    owner: "Unit Fire & Rescue",
    dueDate: "2025-02-18T10:00:00.000Z",
    status: "done",
    priority: "high",
  },
  {
    id: "TASK-004",
    title: "Perapihan kabel ekstensi area kantor maskapai",
    relatedFinding: "FND-2024-0015",
    area: "Office Area · T3",
    owner: "Unit Engineering",
    dueDate: "2025-02-25T10:00:00.000Z",
    status: "open",
    priority: "low",
  },
];

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function statusLabel(status: TaskStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Selesai";
  }
}

function statusClass(status: TaskStatus) {
  if (status === "open") {
    return "bg-danger/5 text-danger border-danger/30";
  }
  if (status === "in_progress") {
    return "bg-warning/5 text-warning border-warning/30";
  }
  return "bg-success/5 text-success border-success/30";
}

function priorityLabel(priority: TaskPriority) {
  switch (priority) {
    case "low":
      return "Rendah";
    case "medium":
      return "Sedang";
    case "high":
      return "Tinggi";
  }
}

function priorityClass(priority: TaskPriority) {
  if (priority === "high") {
    return "bg-rose-500/10 text-rose-300 border-rose-400/40";
  }
  if (priority === "medium") {
    return "bg-amber-400/10 text-amber-200 border-amber-300/40";
  }
  return "bg-slate-500/10 text-slate-200 border-slate-400/40";
}

export function TaskList() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_TASKS;

    const q = search.toLowerCase();
    return MOCK_TASKS.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.area.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <section className="container-page pb-14 pt-6 md:pt-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Daftar tugas tindak lanjut K3
          </div>
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            Task penanganan temuan K3
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
            Pantau progress tindakan perbaikan dari setiap temuan K3, lengkap
            dengan penanggung jawab, prioritas, dan target penyelesaian.
          </p>
        </div>

        <button className="btn btn-primary rounded-full px-4 py-2 text-xs sm:text-sm">
          + Buat task baru
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 md:mb-5">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs">
          <span className="text-slate-400">🔎</span>
          <input
            type="text"
            placeholder="Cari ID task, judul, area, atau unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px] bg-transparent text-[11px] outline-none placeholder:text-slate-400 sm:w-[260px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-medium text-slate-900">
                Daftar task aktif
              </div>
              <div className="text-[11px] text-slate-500">
                {filtered.length} task ditampilkan
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-500">
              Dummy data – belum terhubung ke Supabase
            </span>
          </div>
        </div>

        {/* Header kolom desktop */}
        <div className="hidden border-b border-slate-100 px-5 py-2.5 text-[11px] text-slate-400 md:grid md:grid-cols-[0.8fr_1.6fr_1fr_0.9fr_0.7fr_0.6fr] md:gap-3">
          <div>ID Task</div>
          <div>Judul & area</div>
          <div>Penanggung jawab</div>
          <div>Jatuh tempo</div>
          <div>Status</div>
          <div className="text-right">Prioritas</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-xs text-slate-400 sm:px-5">
              Tidak ada task yang cocok dengan pencarian.
            </div>
          )}

          {filtered.map((task) => (
            <div
              key={task.id}
              className="px-4 py-3 text-xs sm:px-5 md:grid md:grid-cols-[0.8fr_1.6fr_1fr_0.9fr_0.7fr_0.6fr] md:items-center md:gap-3"
            >
              {/* ID + finding */}
              <div className="mb-2 flex items-center justify-between gap-2 md:mb-0 md:block">
                <div className="font-mono text-[11px] font-semibold text-slate-800">
                  {task.id}
                </div>
                {task.relatedFinding && (
                  <Link
                    href={`/findings/${task.relatedFinding}`}
                    className="text-[10px] text-sky-600 hover:underline md:block"
                  >
                    {task.relatedFinding}
                  </Link>
                )}
              </div>

              {/* Title + area */}
              <div className="mb-2 space-y-1 md:mb-0">
                <div className="text-[11px] font-medium text-slate-900 sm:text-xs">
                  {task.title}
                </div>
                <div className="text-[11px] text-slate-500">{task.area}</div>
              </div>

              {/* Owner */}
              <div className="mb-2 text-[11px] text-slate-600 md:mb-0">
                <div className="font-medium text-slate-800">{task.owner}</div>
                <div className="text-[10px] text-slate-400">
                  PIC penanggung jawab
                </div>
              </div>

              {/* Due date */}
              <div className="mb-2 text-[11px] text-slate-600 md:mb-0">
                <div>{formatDate(task.dueDate)}</div>
                <div className="text-[10px] text-slate-400">
                  Target penyelesaian
                </div>
              </div>

              {/* Status */}
              <div className="mb-2 md:mb-0">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusClass(
                    task.status
                  )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {statusLabel(task.status)}
                </span>
              </div>

              {/* Priority */}
              <div className="flex justify-start md:justify-end">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${priorityClass(
                    task.priority
                  )}`}
                >
                  ⚡ {priorityLabel(task.priority)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Biar bisa di-import sebagai default ataupun named
export default TaskList;
