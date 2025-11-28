"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { FindingsPageView } from "@/features/findings/pages/FindingsPageView";

export default function FindingsPage() {
  console.log("findings");
  return (
    <AuthGuard allowedRoles={["admin", "inspector", "pic", "viewer"]}>
      <FindingsPageView />
    </AuthGuard>
  );
}
