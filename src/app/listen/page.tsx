"use client";

import { useAudio } from "@/contexts/audio-context";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, useState } from "react";
import Image from "next/image";

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

export default function ListenPage() {
  const {
    radioTracks, startEpoch, totalDuration,
    isSyncedRadio, radioPosition, toggleRadio, isPlaying,
  } = useAudio();
  const { tr } = useLanguage();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(t);
  }, []);

  const noTracks = ready && radioTracks.length === 0;
  const currentTrack = radioPosition ? radioTracks[radioPosition.trackIdx] : null;
  const nextTrack =
    radioPosition && radioTracks.length > 1
      ? radioTracks[(radioPosition.trackIdx + 1) % radioTracks.length]
      : null;

  const progressPct =
    currentTrack && radioPosition
      ? Math.min(100, (radioPosition.offsetSec / (currentTrack.durationSec ?? 1)) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-14 pb-player">

      {/* ── Page header ──────────────────────────────────────────── */}
      <header className="mb-6 md:mb-10 flex items-center gap-4 md:gap-6">
        {/* Shrimad image — hidden on very small screens to save space */}
        <div className="hidden sm:block flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-saffron/15 blur-2xl scale-125 pointer-events-none" />
            <Image
              src="/images/shrimad-rajchandra.png"
              alt="Shrimad Rajchandra"
              width={80}
              height={96}
              className="relative z-10 drop-shadow-lg"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl md:text-4xl text-ink mb-1 md:mb-2">
            {tr("listen.title")}
          </h1>
          <p className="text-ink/65 font-sans text-sm md:text-base leading-relaxed">
            {tr("listen.desc")}
          </p>
        </div>
      </header>

      {/* ── Loading ────────────────────────────────────────────────── */}
      {!ready && (
        <div className="flex items-center gap-3 py-4">
          <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-soft" />
          <p className="font-sans text-ink/50 text-sm animate-pulse">
            {tr("listen.loading")}
          </p>
        </div>
      )}

      {/* ── No tracks ─────────────────────────────────────────────── */}
      {ready && noTracks && (
        <div className="p-5 rounded-3xl bg-white border border-ink/10 shadow-glow max-w-xl">
          <p className="font-sans text-saffron-dim font-semibold mb-1 text-base">
            {tr("listen.noTracks")}
          </p>
          <p className="font-sans text-ink/60 text-sm leading-relaxed">
            {tr("listen.noTracksDesc")}
          </p>
        </div>
      )}

      {/* ── Radio player ───────────────────────────────────────────── */}
      {ready && radioTracks.length > 0 && (
        <div className="max-w-xl space-y-3 md:space-y-4">

          {/* ── Main card ── */}
          <div className="p-5 md:p-6 rounded-3xl bg-white border border-ink/10 shadow-glow">

            {/* ON AIR badge */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isSyncedRadio && isPlaying ? "bg-red-500 animate-pulse-soft" : "bg-ink/20"
                }`}
              />
              <span className="text-xs font-sans font-semibold tracking-widest text-ink/50 uppercase">
                {isSyncedRadio && isPlaying ? tr("listen.onAir") : tr("listen.offAir")}
              </span>
            </div>

            {/* Current track */}
            <div className="mb-4">
              <p className="text-[10px] font-sans text-ink/40 mb-1.5 uppercase tracking-widest">
                {tr("listen.nowPlaying")}
              </p>
              <p className="font-serif text-xl md:text-2xl text-ink leading-snug">
                {isSyncedRadio && currentTrack
                  ? currentTrack.title
                  : radioTracks[0]?.title ?? "—"}
              </p>
              {(isSyncedRadio ? currentTrack?.artist : radioTracks[0]?.artist) && (
                <p className="text-sm font-sans text-ink/60 mt-1">
                  {isSyncedRadio ? currentTrack?.artist : radioTracks[0]?.artist}
                </p>
              )}
            </div>

            {/* Progress bar */}
            {isSyncedRadio && radioPosition && currentTrack && (
              <div className="mb-5">
                <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
                  <div
                    className="h-full bg-saffron rounded-full transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-xs font-sans text-ink/40">
                  <span>{formatTime(radioPosition.offsetSec)}</span>
                  <span>−{formatTime(radioPosition.remainingSec)}</span>
                  <span>{formatTime(currentTrack.durationSec ?? 0)}</span>
                </div>
              </div>
            )}

            {/* Tune In / Pause — big touch target */}
            <button
              type="button"
              onClick={toggleRadio}
              className={`w-full rounded-2xl py-4 md:py-4 font-semibold font-sans text-lg transition-all active:scale-95 ${
                isSyncedRadio && isPlaying
                  ? "bg-ink/6 text-ink hover:bg-ink/10 border border-ink/10"
                  : "bg-saffron text-white hover:bg-saffron-dim shadow-glow-sm"
              }`}
            >
              {isSyncedRadio && isPlaying
                ? tr("listen.pause")
                : isSyncedRadio
                ? tr("listen.syncing")
                : tr("listen.tuneIn")}
            </button>
          </div>

          {/* ── Up Next card ── */}
          {nextTrack && (
            <div className="px-5 py-4 rounded-2xl bg-white/70 border border-ink/8 flex items-start gap-3">
              <span className="mt-1 text-saffron/60 text-xs shrink-0">▶</span>
              <div className="min-w-0">
                <p className="text-[10px] font-sans text-ink/40 uppercase tracking-widest mb-0.5">
                  {tr("listen.upNext")}
                </p>
                <p className="font-serif text-base text-ink leading-snug truncate">{nextTrack.title}</p>
                {nextTrack.artist && (
                  <p className="text-xs font-sans text-ink/50 mt-0.5 truncate">{nextTrack.artist}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Collapsible playlist ── */}
          {radioTracks.length > 1 && (
            <details className="group glass-panel overflow-hidden">
              <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between text-sm font-sans text-saffron-dim hover:text-saffron">
                <span>
                  {tr("listen.playlist")} · {radioTracks.length} {tr("listen.tracks")} · {formatTime(totalDuration)}
                </span>
                <span className="text-ink/40 group-open:rotate-180 transition-transform duration-200 text-xs">▼</span>
              </summary>
              <ol className="px-4 pb-4 space-y-1 border-t border-ink/6 pt-3">
                {radioTracks.map((t, i) => (
                  <li
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans ${
                      isSyncedRadio && radioPosition?.trackIdx === i
                        ? "bg-saffron/10 text-ink font-semibold"
                        : "text-ink/65"
                    }`}
                  >
                    <span className="text-ink/30 tabular-nums w-5 text-right shrink-0 text-xs">
                      {i + 1}
                    </span>
                    {isSyncedRadio && radioPosition?.trackIdx === i && (
                      <span className="w-1.5 h-1.5 rounded-full bg-saffron shrink-0" />
                    )}
                    <span className="flex-1 truncate">{t.title}</span>
                    {t.durationSec && (
                      <span className="text-ink/35 tabular-nums shrink-0 text-xs">
                        {formatTime(t.durationSec)}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </details>
          )}

          {/* ── Stats chip ── */}
          <p className="text-xs font-sans text-ink/40 px-1 flex items-center gap-1.5 flex-wrap">
            <span>{radioTracks.length} {tr("listen.tracks")}</span>
            <span>·</span>
            <span>{formatTime(totalDuration)} {tr("listen.loop")}</span>
            <span>·</span>
            <span className="text-saffron-dim/80">✓ {tr("listen.zeroCost")}</span>
          </p>

        </div>
      )}
    </div>
  );
}
