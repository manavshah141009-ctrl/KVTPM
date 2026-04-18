"use client";

import { useAudio } from "@/contexts/audio-context";
import { useLanguage } from "@/contexts/language-context";
import { motion } from "framer-motion";
import Link from "next/link";

export function AudioPlayerBar() {
  const {
    current, isPlaying, togglePlay, volume, setVolume,
    playNext, playPrev, tracks, radioTracks, isSyncedRadio, radioPosition,
  } = useAudio();
  const { tr } = useLanguage();

  const hasContent = tracks.length > 0 || radioTracks.length > 0 || Boolean(current);
  if (!hasContent) return null;

  const radioTrack = isSyncedRadio && radioPosition ? radioTracks[radioPosition.trackIdx] : null;
  const displayTitle  = radioTrack?.title  ?? current?.title  ?? (radioTracks[0]?.title ?? "—");
  const displayArtist = radioTrack?.artist ?? current?.artist;
  const subLabel = isSyncedRadio
    ? tr("player.liveLabel")
    : "KarVicharTohPamm · continuous listen";

  return (
    <motion.div
      layout
      className="fixed bottom-0 inset-x-0 z-50
        border-t border-saffron/20 bg-parchment/95 backdrop-blur-xl
        shadow-[0_-4px_24px_rgba(44,36,22,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      initial={false}
    >
      {/* ── Main bar content ── */}
      <div className="max-w-6xl mx-auto px-3 md:px-4 h-16 md:h-[4.5rem] flex items-center gap-3">

        {/* Track info — takes remaining space */}
        <Link
          href="/listen"
          className="min-w-0 flex-1 flex flex-col justify-center group"
        >
          <p className="font-serif text-ink truncate text-sm md:text-base flex items-center gap-2 group-hover:text-saffron-dim transition-colors">
            {isSyncedRadio && isPlaying && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
            )}
            {displayTitle}
          </p>
          <p className="text-[11px] md:text-xs truncate font-sans mt-0.5
            text-ink/50 group-hover:text-ink/70 transition-colors"
          >
            {displayArtist ?? subLabel}
          </p>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">

          {/* Prev — only in playlist mode */}
          {!isSyncedRadio && (
            <button
              type="button"
              aria-label="Previous"
              onClick={playPrev}
              disabled={!tracks.length}
              className="w-9 h-9 rounded-full flex items-center justify-center
                text-ink/60 hover:text-ink hover:bg-white/60
                disabled:opacity-30 transition-all active:scale-90 text-lg"
            >
              ‹
            </button>
          )}

          {/* Play / Pause — main big CTA */}
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            disabled={!current && !isSyncedRadio && radioTracks.length === 0}
            className="w-12 h-12 rounded-full bg-saffron text-white
              shadow-glow-sm flex items-center justify-center
              hover:bg-saffron-dim disabled:opacity-40
              transition-all active:scale-90 text-xl"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          {/* Next — only in playlist mode */}
          {!isSyncedRadio && (
            <button
              type="button"
              aria-label="Next"
              onClick={playNext}
              disabled={!tracks.length}
              className="w-9 h-9 rounded-full flex items-center justify-center
                text-ink/60 hover:text-ink hover:bg-white/60
                disabled:opacity-30 transition-all active:scale-90 text-lg"
            >
              ›
            </button>
          )}

          {/* Live badge chip — visible on mobile instead of volume slider */}
          {isSyncedRadio && isPlaying && (
            <span className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-red-50 border border-red-200 text-red-500 text-[10px] font-sans font-semibold
              tracking-wider uppercase shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-soft" />
              Live
            </span>
          )}
        </div>

        {/* Volume slider — hidden on mobile, visible ≥ sm */}
        <label className="hidden sm:flex items-center gap-2 w-28 md:w-36 shrink-0">
          <span className="sr-only">Volume</span>
          <span className="text-ink/40 text-xs shrink-0">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-saffron cursor-pointer"
          />
        </label>

        {/* Queue/Live link — hidden on mobile */}
        <Link
          href="/listen"
          className="text-xs font-sans text-saffron-dim hover:text-saffron hidden sm:inline shrink-0"
        >
          {isSyncedRadio ? "Live" : "Queue"}
        </Link>
      </div>
    </motion.div>
  );
}
