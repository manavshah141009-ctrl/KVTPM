"use client";

import { useAudio, type TrackItem } from "@/contexts/audio-context";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ListenPage() {
  const { tracks, loadPlaylist, playIndex, currentIndex, isPlaying, current } = useAudio();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/tracks");
        if (!res.ok) throw new Error("Could not load tracks");
        const data = (await res.json()) as TrackItem[];
        if (cancel) return;
        loadPlaylist(data);
        setErr(data.length ? null : "No tracks yet — check back soon.");
      } catch {
        if (!cancel) setErr("Unable to load audio. You may be offline.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [loadPlaylist]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 md:mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">Listen</h1>
        <p className="text-ink/70 font-sans max-w-2xl leading-relaxed">
          Continuous listening in the spirit of a gentle radio. Tracks play in order; when one ends,
          the next begins. Use the player at the bottom of the screen — it travels with you.
        </p>
      </header>

      {loading && <p className="font-sans text-ink/60">Loading playlist…</p>}
      {err && <p className="font-sans text-saffron-dim">{err}</p>}

      <ul className="space-y-2">
        {tracks.map((t, i) => {
          const active = i === currentIndex;
          return (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                active
                  ? "border-saffron/50 bg-saffron/5 shadow-glow-sm"
                  : "border-ink/10 bg-white/40 hover:bg-white/60"
              }`}
            >
              <div className="min-w-0">
                <p className="font-serif text-ink truncate">
                  {i + 1}. {t.title}
                </p>
                {t.artist && <p className="text-sm text-ink/55 truncate font-sans">{t.artist}</p>}
              </div>
              <button
                type="button"
                onClick={() => playIndex(i)}
                className="shrink-0 rounded-xl bg-saffron/90 text-white px-4 py-2 text-sm font-sans hover:bg-saffron"
              >
                {active && isPlaying ? "Playing" : "Play"}
              </button>
            </motion.li>
          );
        })}
      </ul>

      {!loading && tracks.length > 0 && current && (
        <p className="mt-8 text-sm text-ink/50 font-sans text-center">
          Now aligned with: <span className="text-ink/70">{current.title}</span>
        </p>
      )}
    </div>
  );
}
