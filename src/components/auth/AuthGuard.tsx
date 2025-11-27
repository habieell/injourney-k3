// src/components/auth/AuthGuard.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole as Role } from "@/lib/auth/permission";

export type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: Role[]; // kalau kosong = semua role yang login boleh
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

  useEffect(() => {
    if (!requireAuth) return;
    if (loading) return;

    // belum login → lempar ke /sign-in dengan redirect
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(
        `${pathname ?? "/"}${
          searchParams?.toString() ? `?${searchParams}` : ""
        }`
      );
      router.replace(`/sign-in?redirect=${redirect}`);
      return;
    }

    // sudah login tapi role nggak boleh
    if (allowedRoles && allowedRoles.length > 0) {
      if (!role || !allowedRoles.includes(role)) {
        router.replace("/"); // lempar ke dashboard
      }
    }
  }, [
    loading,
    requireAuth,
    isAuthenticated,
    allowedRoles,
    role,
    router,
    pathname,
    searchParams,
  ]);

  if (!requireAuth) {
    return <>{children}</>;
  }

  // State sementara saat cek auth
  if (loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Memeriksa sesi login…
      </main>
    );
  }

  // Kalau masih belum login (fallback ekstra)
  if (!isAuthenticated) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Mengarahkan ke halaman masuk…
      </main>
    );
  }

  // Role tidak diizinkan
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    role &&
    !allowedRoles.includes(role)
  ) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Anda tidak memiliki akses ke halaman ini.
      </main>
    );
  }

  return <>{children}</>;
}
