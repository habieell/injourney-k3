// src/components/layout/MainNavbar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "./MobileNav";
import { getNavItemsForRole } from "@/lib/auth/permission";

export function MainNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { profile, role, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = isAuthenticated ? getNavItemsForRole(role) : [];

  const handleClickNav = (href: string) => {
    setOpenMobile(false);
    router.push(href);
  };

  const goHome = () => {
    router.push("/");
  };

  const goLogin = () => {
    router.push("/sign-in");
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  const displayName = profile?.full_name || "User";
  const displayRole = role ?? "";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/findings");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-40 ${
        scrolled
          ? "backdrop-blur bg-white/80 border-b border-slate-200/70"
          : "bg-white"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo - klik ke home / */}
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-slate-100"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-xl bg-sky-600 shadow-sm">
            <Image
              src="/logo-nav.png"
              alt="Injourney K3"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight text-left">
            <div className="text-xs font-semibold text-slate-900">
              Injourney K3
            </div>
            <div className="text-[11px] text-slate-500">
              Incident &amp; Findings Reporting
            </div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {isAuthenticated &&
            navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleClickNav(item.href)}
                className={`group text-xs font-medium transition ${
                  isActive(item.href)
                    ? "text-slate-900"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-1 border-b-2 pb-0.5 ${
                    isActive(item.href)
                      ? "border-slate-900"
                      : "border-transparent group-hover:border-slate-300"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            ))}

          {isAuthenticated ? (
            <>
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
            <button
              className="btn btn-primary rounded-full px-3 py-1.5 text-xs"
              onClick={goLogin}
            >
              Masuk Sistem
            </button>
          )}
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (
            <button
              className="btn btn-primary rounded-full px-3 py-1.5 text-[11px]"
              onClick={() => handleClickNav("/")}
            >
              Dashboard
            </button>
          )}

          <MobileNav
            open={openMobile}
            setOpen={setOpenMobile}
            isAuthenticated={isAuthenticated}
            displayName={displayName}
            displayRole={displayRole}
            navItems={navItems}
            onNavigate={handleClickNav}
            onLogin={isAuthenticated ? handleLogout : goLogin}
          />
        </div>
      </div>
    </motion.header>
  );
}
