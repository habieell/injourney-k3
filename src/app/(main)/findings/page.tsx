"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FindingsPageView } from "@/features/findings/pages/FindingsPageView";

export default function FindingsPage() {
  return (
    <AuthGuard allowedRoles={["admin", "inspector", "pic", "viewer"]}>
      <FindingsPageView />
    </AuthGuard>
  );
}
