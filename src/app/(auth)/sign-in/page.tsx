"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/db";

type UserRole = Database["public"]["Enums"]["user_role"];

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("inspector@injourney.com");
  const [password, setPassword] = useState("pass1234");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Email dan kata sandi wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      // 1. login dulu
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase signIn error:", error);
        setErrorMsg(error.message || "Gagal masuk ke sistem.");
        setLoading(false);
        return;
      }

      // 2. kalau URL punya ?redirect=... → selalu pakai itu
      if (redirectParam && redirectParam.startsWith("/")) {
        router.replace(redirectParam);
        return;
      }

      // 3. Kalau TIDAK ada redirect → cek role dari tabel profiles
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let target: string = "/findings"; // fallback default

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const role = profile?.role as UserRole | null;

        if (role === "admin") {
          target = "/admin";
        } else {
          // viewer / inspector / lainnya → ke halaman temuan
          target = "/findings";
        }
      }

      router.replace(target);
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(15,23,42,1))]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/80 shadow-[0_40px_120px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          {/* PANEL KIRI */}
          <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-800 p-10 text-sky-50 lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <span className="text-sm font-semibold">K3</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-100/80">
                  Injurney K3
                </p>
                <p className="text-[13px] font-medium text-sky-50/90">
                  Incident &amp; Findings Reporting
                </p>
              </div>
            </div>

            <div className="mt-10 space-y-5">
              <h1 className="text-2xl font-semibold leading-snug text-white">
                Masuk ke sistem K3 bandara
              </h1>
              <p className="max-w-md text-sm text-sky-100/90">
                Pantau temuan K3, status penanganan, dan pemenuhan SLA secara
                real time pada satu dashboard terintegrasi.
              </p>

              <div className="mt-6 space-y-3 text-xs text-sky-50/90">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-900/40 px-3 py-1 ring-1 ring-sky-200/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]" />
                  <span className="font-medium">
                    Terhubung langsung dengan Supabase Auth internal
                  </span>
                </div>

                <ul className="space-y-1.5">
                  <li>
                    • Akses khusus akun internal yang terdaftar di Supabase.
                  </li>
                  <li>• Otentikasi aman dengan email &amp; kata sandi.</li>
                  <li>• Role / peran terhubung dengan tabel profiles.</li>
                  <li>• Data temuan otomatis ke dashboard monitoring K3.</li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-[11px] text-sky-100/70">
              Sistem ini digunakan untuk kebutuhan internal K3 &amp; safety.
              Hubungi admin bila membutuhkan akun.
            </p>
          </div>

          {/* PANEL KANAN – FORM */}
          <div className="flex w-full flex-col justify-center bg-slate-950/90 px-6 py-8 sm:px-10 lg:w-1/2 lg:px-12 lg:py-10">
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-sky-500/10 text-xs font-semibold text-sky-400">
                K3
              </div>
              <div>
                <p className="text-xs font-medium text-slate-300">
                  Injurney K3 – Internal
                </p>
                <p className="text-[11px] text-slate-500">
                  Incident &amp; Findings Reporting
                </p>
              </div>
            </div>

            <div className="mb-6 space-y-1">
              <p className="text-xs font-medium text-emerald-500">
                • Terhubung ke Supabase Auth
              </p>
              <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
                Masuk ke sistem K3
              </h2>
              <p className="text-xs text-slate-400">
                Gunakan akun internal yang sudah terdaftar di Supabase. Email
                &amp; kata sandi sama dengan yang tercatat pada dashboard admin.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium text-slate-200"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40 placeholder:text-slate-500"
                    placeholder="nama@injurney.co.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    @
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-medium text-slate-200"
                >
                  Kata sandi
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40 placeholder:text-slate-500"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2 text-[11px] text-red-300">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-sky-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-400/60"
              >
                {loading ? "Memproses..." : "Masuk Sistem"}
              </button>
            </form>

            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              Hanya untuk akun internal K3 &amp; safety. Kata sandi bisa
              di-reset melalui dashboard Supabase oleh admin sistem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
