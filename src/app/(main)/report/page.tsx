// src/app/(main)/report/page.tsx
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import ReportPageView from "@/features/report/pages/ReportPageView";

export default function ReportRoutePage() {
  return (
    <AuthGuard allowedRoles={["admin", "inspector"]}>
      <ReportPageView />
    </AuthGuard>
  );
}
