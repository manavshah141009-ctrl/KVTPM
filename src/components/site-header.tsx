"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/listen", label: "Listen" },
  { href: "/books", label: "Books" },
  { href: "/live", label: "Live" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-saffron/15 bg-parchment/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-saffron/20 shadow-glow-sm flex items-center justify-center text-saffron font-serif text-lg">
            ॐ
          </span>
          <div className="leading-tight">
            <span className="font-serif text-lg md:text-xl text-ink tracking-tight block group-hover:text-saffron-dim transition-colors">
              KarVicharTohPamm
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink/45 hidden sm:block">
              Wisdom · Bhakti · Satsang
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 md:gap-4" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} className="relative px-2 py-1 md:px-3">
                <span
                  className={`font-sans text-sm md:text-[15px] ${
                    active ? "text-saffron-dim font-semibold" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {l.label}
                </span>
                {active && (
                  <motion.span
                    layoutId="navdot"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-saffron/80"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
