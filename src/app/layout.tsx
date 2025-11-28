// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { Geist, Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Injourney K3",
  description: "Aplikasi monitoring temuan K3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
