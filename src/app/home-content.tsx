"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

interface Props {
  books: Array<{ _id: string; title: string }>;
  tracks: Array<{ _id: string; title: string; artist?: string }>;
}

export function HomeContent({ books, tracks }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-14 pb-player">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-6 md:flex-row md:gap-16 mb-10 md:mb-24 text-center md:text-left">

        {/* Shrimad image — top on mobile, right on desktop */}
        <div className="order-1 md:order-2 flex-shrink-0 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-saffron/10 blur-3xl scale-110 pointer-events-none" />
            <Image
              src="/images/shrimad-rajchandra.png"
              alt="Shrimad Rajchandra in meditation"
              width={200}
              height={240}
              priority
              className="relative z-10 drop-shadow-xl w-[160px] h-auto md:w-[280px]"
              style={{ objectFit: "contain" }}
            />
          </div>
          <p className="mt-2 text-[10px] font-sans text-ink/40 tracking-widest uppercase">
            Shrimad Rajchandra
          </p>
        </div>

        {/* Text */}
        <div className="order-2 md:order-1 flex-1">
          <p className="text-saffron-dim uppercase tracking-[0.25em] text-[10px] md:text-xs mb-3 font-sans">
            {tr("home.badge")}
          </p>
          <h1 className="font-serif text-3xl md:text-6xl text-ink leading-tight mb-4">
            {tr("home.title")}
          </h1>
          <p className="text-base md:text-xl text-ink/70 font-sans leading-relaxed mb-2 max-w-xl mx-auto md:mx-0">
            {tr("home.desc")}
          </p>
          <p className="text-sm text-saffron-dim font-sans italic mb-6">
            {tr("home.inspiredBy")}
          </p>

          {/* CTA buttons — full-width on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 items-center md:items-start">
            <Link
              href="/listen"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-saffron text-white px-6 py-3.5 font-sans font-semibold shadow-glow-sm hover:bg-saffron-dim transition-colors text-base"
            >
              {tr("home.startListening")}
            </Link>
            <Link
              href="/live"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-saffron/40 text-saffron-dim px-6 py-3.5 font-sans font-medium hover:bg-white/40 transition-colors text-base"
            >
              {tr("home.joinSatsang")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quote strip ─────────────────────────────────────────── */}
      <div className="text-center mb-10 md:mb-16 px-2">
        <blockquote className="font-serif text-lg md:text-2xl text-ink/75 italic max-w-2xl mx-auto leading-relaxed">
          {tr("home.quote")}
        </blockquote>
        <cite className="block mt-2 text-[10px] md:text-xs font-sans text-saffron-dim tracking-widest uppercase not-italic">
          {tr("home.quoteAuthor")}
        </cite>
      </div>

      {/* ── Feature cards — single column on mobile ────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-10 mb-8">

        {/* Audio card */}
        <div className="glass-panel p-5 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔊</span>
            <h2 className="font-serif text-xl md:text-2xl text-ink">{tr("home.audio.title")}</h2>
          </div>
          <p className="text-ink/70 font-sans mb-4 leading-relaxed text-sm md:text-base">
            {tr("home.audio.desc")}
          </p>
          <Link
            href="/listen"
            className="inline-flex items-center gap-1 text-saffron-dim font-sans text-sm font-medium hover:underline"
          >
            {tr("home.audio.link")}
          </Link>
          {tracks.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-ink/55 font-sans border-t border-ink/8 pt-4">
              {tracks.map((t) => (
                <li key={t._id} className="truncate flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-saffron/60 shrink-0" />
                  {t.title}{t.artist ? ` — ${t.artist}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Books card */}
        <div className="glass-panel p-5 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📖</span>
            <h2 className="font-serif text-xl md:text-2xl text-ink">{tr("home.books.title")}</h2>
          </div>
          <p className="text-ink/70 font-sans mb-4 leading-relaxed text-sm md:text-base">
            {tr("home.books.desc")}
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-1 text-saffron-dim font-sans text-sm font-medium hover:underline"
          >
            {tr("home.books.link")}
          </Link>
          {books.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm text-ink/55 font-sans border-t border-ink/8 pt-4">
              {books.map((b) => (
                <li key={b._id} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-saffron/60 shrink-0" />
                  <Link href={`/books/${b._id}`} className="hover:text-saffron-dim truncate">
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Live satsang ──────────────────────────────────────────── */}
      <section className="glass-panel p-5 md:p-10 text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-2xl">📡</span>
          <h2 className="font-serif text-xl md:text-3xl text-ink">{tr("home.live.title")}</h2>
        </div>
        <p className="text-ink/70 font-sans max-w-2xl mx-auto mb-5 text-sm md:text-base">
          {tr("home.live.desc")}
        </p>
        <Link
          href="/live"
          className="inline-flex rounded-2xl bg-gold-soft/90 text-ink px-6 py-3.5 font-sans font-medium shadow-card hover:bg-gold-muted transition-colors text-base"
        >
          {tr("home.live.link")}
        </Link>
      </section>

    </div>
  );
}
