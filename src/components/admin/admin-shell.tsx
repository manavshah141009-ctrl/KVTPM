"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";

const NAV = [
  { href: "/admin",        label: "Overview", icon: "⬡" },
  { href: "/admin/tracks",    label: "Audio",      icon: "🎵" },
  { href: "/admin/books",     label: "Books",      icon: "📖" },
  { href: "/admin/broadcast", label: "Broadcast",  icon: "🎙️" },
  { href: "/admin/live",      label: "Live Config", icon: "📡" },
  { href: "/admin/leads",     label: "Leads",      icon: "👥" },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-parchment flex flex-col md:flex-row">

      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-saffron/15 bg-white/50 backdrop-blur-md">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-saffron/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-full bg-saffron/20 flex items-center justify-center text-saffron font-serif text-sm">
              ॐ
            </span>
            <p className="font-serif text-base text-ink">KVTP Admin</p>
          </div>
          <p className="text-[11px] text-ink/45 truncate font-sans pl-9">{email}</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-sans transition-colors ${
                  active
                    ? "bg-saffron/12 text-saffron-dim font-semibold"
                    : "text-ink/65 hover:bg-saffron/6 hover:text-ink"
                }`}
              >
                <span className="text-base w-5 text-center">{n.icon}</span>
                {n.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-saffron" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-ink/8 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-saffron-dim hover:text-saffron font-sans"
          >
            <span>←</span> Public site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between
        px-4 h-12 border-b border-saffron/15 bg-parchment/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-saffron/20 flex items-center justify-center text-saffron font-serif text-sm">ॐ</span>
          <span className="font-serif text-sm text-ink">KVTP Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-saffron-dim font-sans">← Site</Link>
          <LogoutButton />
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40
        border-t border-saffron/15 bg-parchment/97 backdrop-blur-lg
        flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Admin navigation"
      >
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5
                text-[10px] font-sans font-medium transition-colors active:scale-95 ${
                active
                  ? "text-saffron-dim"
                  : "text-ink/45 hover:text-ink/70"
              }`}
            >
              <span className={`text-xl leading-none ${active ? "scale-110" : ""} transition-transform`}>
                {n.icon}
              </span>
              <span>{n.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-saffron mt-0.5" />}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
