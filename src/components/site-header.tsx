"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const pathname = usePathname();
  const { tr } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/",       label: tr("nav.home")   },
    { href: "/listen", label: tr("nav.listen") },
    { href: "/books",  label: tr("nav.books")  },
    { href: "/live",   label: tr("nav.live")   },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-saffron/15 bg-parchment/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-2">

          {/* ── Brand ── */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-2 shrink-0 min-w-0"
          >
            <span className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-saffron/20 shadow-glow-sm flex items-center justify-center text-saffron font-serif text-base md:text-lg shrink-0">
              ॐ
            </span>
            <div className="leading-tight min-w-0">
              <span className="font-serif text-base md:text-xl text-ink tracking-tight block group-hover:text-saffron-dim transition-colors truncate">
                KarVicharTohPamm
              </span>
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-ink/45 hidden sm:block truncate">
                {tr("header.tagline")}
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-3" aria-label="Main">
            {links.map((l) => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link key={l.href} href={l.href} className="relative px-3 py-1">
                  <span className={`font-sans text-[15px] ${active ? "text-saffron-dim font-semibold" : "text-ink/70 hover:text-ink"}`}>
                    {l.label}
                  </span>
                  {active && (
                    <motion.span layoutId="navdot" className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-saffron/80" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right side: language + mobile hamburger ── */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl border border-saffron/20 bg-white/30 hover:bg-white/50 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`block w-5 h-[2px] bg-ink/70 rounded-full transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-5 h-[2px] bg-ink/70 rounded-full transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-[2px] bg-ink/70 rounded-full transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-down menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <motion.nav
              key="mobile-nav"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-14 inset-x-0 z-40 bg-parchment/98 backdrop-blur-lg border-b border-saffron/15 shadow-lg"
              aria-label="Mobile navigation"
            >
              <ul className="max-w-6xl mx-auto px-4 py-2 divide-y divide-saffron/10">
                {links.map((l) => {
                  const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 py-4 font-sans text-base transition-colors ${
                          active ? "text-saffron-dim font-semibold" : "text-ink/75"
                        }`}
                      >
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-saffron shrink-0" />}
                        {!active && <span className="w-1.5 h-1.5 shrink-0" />}
                        {l.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
