// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/hooks/useAuth";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
};

export function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles,
}: AuthGuardProps) {
  const { loading, isAuthenticated, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    console.log("[AuthGuard] state", {
      pathname,
      isAuthenticated,
      role,
      allowedRoles,
      requireAuth,
    });

    if (requireAuth && !isAuthenticated) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (
      requireAuth &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      role && // JANGAN cek kalau masih null
      !allowedRoles.includes(role)
    ) {
      router.replace("/"); // atau "/unauthorized"
    }
  }, [
    loading,
    isAuthenticated,
    requireAuth,
    allowedRoles,
    role,
    pathname,
    router,
  ]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Memeriksa sesi login…</p>
      </main>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
