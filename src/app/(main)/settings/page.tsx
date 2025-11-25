// src/app/(main)/settings/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { profile, role, isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // kalau mau langsung balik ke landing
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-page pt-6 md:pt-8">
        <section className="container-page">
          <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">
              Anda belum masuk. Silakan login terlebih dahulu.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-page pb-12 pt-6 md:pt-8">
      <section className="container-page">
        <div className="mx-auto max-w-2xl space-y-6 rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-slate-900">
              Pengaturan Akun
            </h1>
            <p className="text-xs text-slate-500">
              Kelola profil dan sesi login Anda di sistem Injourney K3.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="text-[11px] font-medium text-slate-500">
                Nama lengkap
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {profile?.full_name ?? "-"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
              <div className="text-[11px] font-medium text-slate-500">
                Peran di sistem
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {role ?? "-"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-400">
              Anda dapat keluar dari sesi ini kapan saja.
            </p>
            <button
              onClick={handleLogout}
              className="btn btn-outline rounded-full px-4 py-1.5 text-xs"
            >
              Keluar dari sistem
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
