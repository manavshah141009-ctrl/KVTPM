"use client";

import { useAudio } from "@/contexts/audio-context";
import { motion } from "framer-motion";
import Link from "next/link";

export function AudioPlayerBar() {
  const {
    current,
    isPlaying,
    togglePlay,
    volume,
    setVolume,
    playNext,
    playPrev,
    tracks,
  } = useAudio();

  if (!current && tracks.length === 0) return null;

  return (
    <motion.div
      layout
      className="fixed bottom-0 inset-x-0 z-50 border-t border-saffron/20 bg-parchment/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] shadow-glow"
      initial={false}
    >
      <div className="max-w-6xl mx-auto px-3 py-2 md:py-3 flex items-center gap-3 md:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-ink truncate text-sm md:text-base">{current?.title ?? "—"}</p>
          {current?.artist ? (
            <p className="text-xs text-ink/60 truncate font-sans">{current.artist}</p>
          ) : (
            <p className="text-xs text-ink/45 font-sans">KarVicharTohPamm · continuous listen</p>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <button
            type="button"
            aria-label="Previous"
            onClick={playPrev}
            disabled={!tracks.length}
            className="w-9 h-9 rounded-full border border-ink/10 text-ink/70 hover:bg-white/50 disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            disabled={!current}
            className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-saffron text-white shadow-glow-sm flex items-center justify-center text-xl hover:bg-saffron-dim disabled:opacity-40"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={playNext}
            disabled={!tracks.length}
            className="w-9 h-9 rounded-full border border-ink/10 text-ink/70 hover:bg-white/50 disabled:opacity-40"
          >
            ›
          </button>
        </div>

        <label className="hidden sm:flex items-center gap-2 w-28 md:w-36 shrink-0">
          <span className="sr-only">Volume</span>
          <span className="text-ink/40 text-xs">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-saffron"
          />
        </label>

        <Link
          href="/listen"
          className="text-xs font-sans text-saffron-dim hover:text-saffron hidden sm:inline shrink-0"
        >
          Queue
        </Link>
      </div>
    </motion.div>
  );
}
