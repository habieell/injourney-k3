"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth, type UserRole } from "@/hooks/useAuth";

export type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
};

export function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles,
}: AuthGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (loading) return;

    // kalau nggak butuh auth, gak usah cek apa2
    if (!requireAuth) return;

    // belum login → lempar ke /sign-in dengan redirect
    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      const redirect = encodeURIComponent(currentPath || "/");
      router.replace(`/sign-in?redirect=${redirect}`);
      return;
    }

    // sudah login, tapi ada batasan role
    if (allowedRoles && allowedRoles.length > 0) {
      if (!role || !allowedRoles.includes(role)) {
        // role tidak sesuai → arahkan ke halaman umum (misal /findings)
        router.replace("/findings");
      }
    }
  }, [
    loading,
    requireAuth,
    isAuthenticated,
    allowedRoles,
    role,
    router,
    searchParams,
  ]);

  if (requireAuth && (loading || !isAuthenticated)) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Memeriksa sesi login…
      </main>
    );
  }

  if (
    requireAuth &&
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
