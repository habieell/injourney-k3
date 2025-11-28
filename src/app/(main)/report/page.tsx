// src/app/(main)/report/page.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import ReportPageView from "@/features/report/pages/ReportPageView";

export default function ReportRoutePage() {
  return (
    <AuthGuard requireAuth allowedRoles={["admin", "inspector"]}>
      <ReportPageView />
    </AuthGuard>
  );
}
