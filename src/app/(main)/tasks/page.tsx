// src/app/(main)/tasks/page.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { TaskList } from "@/components/tasks/TaskList";

export default function TasksPage() {
  return (
    <AuthGuard>
      <main className="container-page py-8">
        <h1 className="mb-4 text-xl font-semibold text-slate-900">
          Daftar Tugas Tindak Lanjut
        </h1>
        <TaskList />
      </main>
    </AuthGuard>
  );
}
