// src/app/(main)/tasks/page.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import TaskList from "@/components/task/TaskList";

export default function TasksPage() {
  return (
    <AuthGuard allowedRoles={["admin", "inspector", "pic", "viewer"]}>
      <main className="min-h-[calc(100vh-4rem)] bg-page pb-14 pt-6 md:min-h-[calc(100vh-4.5rem)] md:pt-8">
        <TaskList />
      </main>
    </AuthGuard>
  );
}
