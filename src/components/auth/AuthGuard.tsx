// src/components/auth/AuthGuard.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import type { AppRole as Role } from "@/lib/auth/permission";

export type AuthGuardProps = {
  children: React.ReactNode;
  /**
   * Kalau false, halaman tetap bisa diakses tanpa login.
   * allowedRoles diabaikan.
   */
  requireAuth?: boolean;
  /**
   * List role yang boleh akses halaman ini.
   * Kalau kosong / undefined = semua role yang sudah login boleh.
   */
  allowedRoles?: Role[];
};

export function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles,
}: AuthGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { loading, isAuthenticated, role } = useAuth();

  const hasRoleRestriction = !!allowedRoles && allowedRoles.length > 0;

  useEffect(() => {
    if (!requireAuth) return;

    // 1. Selama auth masih loading → jangan redirect apa pun
    if (loading) return;

    // 2. Kalau halaman butuh role tertentu tapi role dari profile belum
    //    sempat kebaca, treat sebagai “masih loading” juga.
    if (hasRoleRestriction && isAuthenticated && !role) {
      return;
    }

    // 3. Belum login → redirect ke sign-in dengan param redirect
    if (!isAuthenticated) {
      const targetPath =
        (pathname ?? "/") +
        (searchParams && searchParams.toString()
          ? `?${searchParams.toString()}`
          : "");

      const redirect = encodeURIComponent(targetPath);
      router.replace(`/sign-in?redirect=${redirect}`);
      return;
    }

    // 4. Sudah login tapi role tidak diizinkan → lempar ke dashboard
    if (hasRoleRestriction && role && !allowedRoles!.includes(role)) {
      router.replace("/");
    }
  }, [
    requireAuth,
    loading,
    isAuthenticated,
    role,
    hasRoleRestriction,
    allowedRoles,
    router,
    pathname,
    searchParams,
  ]);

  // ---------- RENDER STATE ----------

  // Halaman public, tidak butuh auth sama sekali
  if (!requireAuth) {
    return <>{children}</>;
  }

  // State sementara: auth masih loading
  if (loading || (hasRoleRestriction && isAuthenticated && !role)) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Memeriksa sesi login…
      </main>
    );
  }

  // Fallback ekstra: kalau tetap belum login
  if (!isAuthenticated) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Mengarahkan ke halaman masuk…
      </main>
    );
  }

  // Fallback ekstra: login tapi role tidak diizinkan
  if (hasRoleRestriction && role && !allowedRoles!.includes(role)) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Anda tidak memiliki akses ke halaman ini.
      </main>
    );
  }

  return <>{children}</>;
}
