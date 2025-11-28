"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminDashboardPageView } from "@/features/admin/pages/AdminDashboardPageView";

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <AdminDashboardPageView />
    </AuthGuard>
  );
}
