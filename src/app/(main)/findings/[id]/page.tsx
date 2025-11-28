"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FindingDetailPageView } from "@/features/findings/pages/FindingDetailPageView";

export default function FindingDetailPage() {
  return (
    <AuthGuard
      requireAuth
      allowedRoles={["admin", "inspector", "pic", "viewer"]}
    >
      <FindingDetailPageView />
    </AuthGuard>
  );
}
