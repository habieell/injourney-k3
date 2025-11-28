// src/app/(auth)/layout.tsx

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <main className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
