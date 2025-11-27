// src/components/layout/MobileNav.tsx
"use client";

import type { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/auth/permission";

type MobileNavProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isAuthenticated: boolean;
  displayName: string;
  displayRole: string;
  navItems: NavItem[];
  onNavigate: (href: string) => void;
  onLogin: () => void; // kalau sudah login → dipakai sebagai logout
};

export function MobileNav({
  open,
  setOpen,
  isAuthenticated,
  displayName,
  displayRole,
  navItems,
  onNavigate,
  onLogin,
}: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/findings");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleClickNav = (href: string) => {
    onNavigate(href);
    setOpen(false);
  };

  return (
    <>
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm"
      >
        <span className="sr-only">Menu</span>
        <div className="space-y-1.5">
          <span className="block h-0.5 w-4 rounded bg-slate-800" />
          <span className="block h-0.5 w-3 rounded bg-slate-800" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="absolute right-4 top-4 w-64 rounded-2xl bg-white p-4 shadow-xl"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 text-xs font-semibold text-slate-500">
                Menu
              </div>

              {isAuthenticated && (
                <div className="mb-3 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">
                  {displayName}
                  {displayRole && ` · ${displayRole}`}
                </div>
              )}

              {/* Nav links */}
              {isAuthenticated && (
                <nav className="mb-4 flex flex-col gap-1 text-sm">
                  {navItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleClickNav(item.href)}
                      className={`w-full rounded-lg px-2 py-2 text-left text-xs font-medium ${
                        isActive(item.href)
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-primary h-9 w-full text-[11px]"
                  onClick={() => {
                    onLogin();
                    setOpen(false);
                  }}
                >
                  {isAuthenticated ? "Keluar" : "Masuk Sistem"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
