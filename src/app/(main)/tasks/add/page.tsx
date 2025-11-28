// src/app/(main)/tasks/add/page.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { TaskAddPageView } from "@/features/tasks/pages/TaskAddPageView";

export default function TaskAddRoutePage() {
  return (
    <AuthGuard allowedRoles={["admin", "inspector", "pic"]}>
      <TaskAddPageView />
    </AuthGuard>
  );
}
