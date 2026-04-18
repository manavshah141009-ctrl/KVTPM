"use client";

import { useAudio } from "@/contexts/audio-context";
import { useEffect, useState } from "react";

export default function ListenPage() {
  const { 
    isPlaying, 
    togglePlay,
    isLiveStream,
    streamUrl
  } = useAudio();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 md:mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">Live Radio</h1>
        <p className="text-ink/70 font-sans max-w-2xl leading-relaxed">
          Experience our continuous 24/7 live radio broadcast. Always playing, completely uninterrupted.
        </p>
      </header>

      {loading && <p className="font-sans text-ink/60">Connecting to station…</p>}
      {!loading && !streamUrl && <p className="font-sans text-saffron-dim">Live stream URL is missing in the configuration.</p>}

      {!loading && streamUrl && (
        <div className="mb-8 p-6 rounded-3xl bg-white border border-ink/10 shadow-glow max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-saffron/10 border border-saffron/20">
              <div className={`w-3 h-3 rounded-full ${isPlaying ? "bg-red-500 animate-pulse-soft" : "bg-ink/20"}`}></div>
            </div>
            <div>
              <h2 className="font-serif text-xl md:text-2xl text-ink">KarVicharTohPamm Broadcast</h2>
              <p className="text-sm font-sans text-ink/60">24/7 Spiritual Audio</p>
            </div>
          </div>
          
          <button
            onClick={() => togglePlay()}
            className={`w-full rounded-2xl py-4 font-medium font-sans text-lg transition-colors shadow-sm ${
              isPlaying
                ? "bg-ink/5 text-ink hover:bg-ink/10"
                : "bg-saffron text-white hover:bg-saffron-dim shadow-glow-sm"
            }`}
          >
            {isPlaying ? "Pause Radio" : "Listen Live"}
          </button>
        </div>
      )}
    </div>
  );
}
