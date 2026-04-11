"use client";

import { useAudio, type TrackItem } from "@/contexts/audio-context";
import { useEffect, useRef } from "react";

export function StreamBootstrap() {
  const { loadPlaylist } = useAudio();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let cancel = false;
    (async () => {
      try {
        const res = await fetch("/api/tracks");
        if (!res.ok || cancel) return;
        const data = (await res.json()) as TrackItem[];
        if (cancel || !data.length) return;
        loadPlaylist(data);
      } catch {
        /* offline / API */
      }
    })();
    return () => {
      cancel = true;
    };
  }, [loadPlaylist]);

  return null;
}
