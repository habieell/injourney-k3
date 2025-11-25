// src/app/(main)/layout.tsx
"use client";

import type { ReactNode } from "react";
import { MainNavbar } from "@/components/layout/MainNavbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

type MainLayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthGuard requireAuth>
      <div className="min-h-screen bg-slate-50">
        <MainNavbar />
        {children}
      </div>
    </AuthGuard>
  );
}
