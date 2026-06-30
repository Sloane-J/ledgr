// src/Landing/sections/Navbar.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Store } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Floating Pill Island Header Wrap */}
      <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full max-w-5xl mt-4 sm:mt-5 transition-all duration-300 pointer-events-auto rounded-full ${
            isScrolled || mobileOpen
              ? "bg-white/85 backdrop-blur-md border border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              : "bg-white/40 backdrop-blur-[2px] border border-neutral-200/40"
          }`}
        >
          <nav
            className="px-5 sm:px-6 h-14 sm:h-16 flex items-center justify-between"
            aria-label="Main navigation"
          >
            {/* ── Logo ── */}
            <a
              href="/"
              className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-full"
              aria-label="Ledgr home"
            >
              <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center shrink-0">
                <Store className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-[15px] font-bold tracking-tight text-neutral-900">
                Ledgr
              </span>
            </a>

            {/* ── Desktop Links ── */}
            <ul className="hidden md:flex items-center gap-1 bg-neutral-900/[0.03] border border-neutral-200/40 p-1 rounded-full" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="px-4 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-white rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* ── Desktop CTAs ── */}
            <div className="hidden md:flex items-center gap-1.5">
              <a
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-900"
              >
                Log in
              </a>

              <a
                href="mailto:samueldorkeyjr@gmail.com?subject=Ledgr Demo Request"
                className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-all duration-150 shadow-sm shadow-neutral-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                Get a Demo
              </a>
            </div>

            {/* ── Mobile Menu Toggle ── */}
            <button
              type="button"
              className="md:hidden p-2 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </nav>
        </motion.header>
      </div>

      {/* ── Mobile Overlay Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-20 z-40 p-5 bg-white/98 backdrop-blur-md rounded-3xl border border-neutral-200/80 shadow-xl flex flex-col md:hidden max-w-lg mx-auto"
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-neutral-100">
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-center text-sm font-semibold text-neutral-700 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Log in
                </a>

                <a
                  href="mailto:samueldorkeyjr@gmail.com?subject=Ledgr Demo Request"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-center text-sm font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Get a Demo
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
