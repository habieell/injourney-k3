// src/app/(main)/tasks/page.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { TasksPageView } from "@/features/tasks/pages/TasksPageView";

export default function TasksRoutePage() {
  return (
    <AuthGuard allowedRoles={["admin", "inspector", "pic", "viewer"]}>
      <TasksPageView />
    </AuthGuard>
  );
}
