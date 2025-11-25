"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#insight", label: "Insight" },
];

export function MainNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const router = useRouter();
  const { profile, role, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpenMobile(false);
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (el) {
      const y =
        (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const goLogin = () => {
    router.push("/sign-in");
  };

  const goDashboard = () => {
    router.push("/findings");
  };

  const goReport = () => {
    router.push("/report");
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const displayName = profile?.full_name || "User";
  const displayRole = role ?? "";

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 ${
        scrolled
          ? "backdrop-blur bg-white/80 border-b border-slate-200/70"
          : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-xs font-semibold text-white shadow-sm">
            K3
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-slate-900">
              Injourney K3
            </div>
            <div className="text-[11px] text-slate-500">
              Incident &amp; Findings Reporting
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-xs font-medium text-slate-600 transition hover:text-slate-900"
            >
              {link.label}
            </button>
          ))}

          {isAuthenticated ? (
            <>
              <button
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={goDashboard}
              >
                Dashboard
              </button>
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">
                <span>{displayName}</span>
                {displayRole && (
                  <>
                    <span>·</span>
                    <span>{displayRole}</span>
                  </>
                )}
              </span>
              <button
                className="rounded-full border border-slate-800 px-4 py-1.5 text-xs font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
                onClick={handleLogout}
              >
                Keluar
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                className="btn btn-outline hidden rounded-full px-3 py-1.5 text-xs md:inline-flex"
                onClick={goLogin}
              >
                Masuk Sistem
              </button>
              <button
                className="btn btn-primary rounded-full px-3 py-1.5 text-xs"
                onClick={goReport}
              >
                Laporkan Temuan
              </button>
            </div>
          )}
        </nav>

        {/* Mobile actions (pakai MobileNav) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            className="btn btn-primary rounded-full px-3 py-1.5 text-[11px]"
            onClick={isAuthenticated ? goDashboard : goReport}
          >
            {isAuthenticated ? "Dashboard" : "Laporkan"}
          </button>

          <MobileNav
            open={openMobile}
            setOpen={setOpenMobile}
            isAuthenticated={isAuthenticated}
            displayName={displayName}
            displayRole={displayRole}
            onNavigateSection={handleNavClick}
            onLogin={isAuthenticated ? handleLogout : goLogin}
            onReport={goReport}
            onDashboard={goDashboard}
          />
        </div>
      </div>
    </motion.header>
  );
}
