"use client";

import { Dispatch, SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";

type MobileNavProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isAuthenticated: boolean;
  displayName: string;
  displayRole: string;
  onNavigateSection: (href: string) => void;
  onLogin: () => void; // kalau sudah login → dipakai sebagai logout
  onReport: () => void;
  onDashboard: () => void;
};

const navLinks = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#insight", label: "Insight" },
];

export function MobileNav({
  open,
  setOpen,
  isAuthenticated,
  displayName,
  displayRole,
  onNavigateSection,
  onLogin,
  onReport,
  onDashboard,
}: MobileNavProps) {
  const handleClickSection = (href: string) => {
    onNavigateSection(href);
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

              {/* Nav links */}
              <nav className="flex flex-col gap-2 text-sm">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleClickSection(link.href)}
                    className="w-full rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* User / actions */}
              <div className="mt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">
                      {displayName}
                      {displayRole && ` · ${displayRole}`}
                    </div>
                    <button
                      className="btn btn-outline w-full h-9 text-[11px]"
                      onClick={() => {
                        onDashboard();
                        setOpen(false);
                      }}
                    >
                      Buka Dashboard
                    </button>
                    <button
                      className="btn btn-primary w-full h-9 text-[11px]"
                      onClick={() => {
                        onLogin(); // logout
                        setOpen(false);
                      }}
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-outline w-full h-9 text-[11px]"
                      onClick={() => {
                        onLogin(); // login
                        setOpen(false);
                      }}
                    >
                      Masuk Sistem
                    </button>
                    <button
                      className="btn btn-primary w-full h-9 text-[11px]"
                      onClick={() => {
                        onReport();
                        setOpen(false);
                      }}
                    >
                      Laporkan Temuan
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
