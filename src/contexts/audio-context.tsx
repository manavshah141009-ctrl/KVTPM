"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gdriveAudioUrl, isGdriveUrl } from "@/lib/gdrive";

export type TrackItem = {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  audioUrl: string;
  durationSec?: number;
  order: number;
};

type AudioCtx = {
  tracks: TrackItem[];
  setTracks: (t: TrackItem[]) => void;
  current: TrackItem | null;
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  loadPlaylist: (items: TrackItem[], startIndex?: number) => void;
  playIndex: (i: number) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  playNext: () => void;
  playPrev: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

const Ctx = createContext<AudioCtx | null>(null);

const LS_VOL = "kvtp_vol";

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracksState] = useState<TrackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.85);

  const current = tracks[currentIndex] ?? null;
  const radioStartOffset = useRef<number | null>(null);

  useEffect(() => {
    const v = localStorage.getItem(LS_VOL);
    if (v != null) {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) setVolumeState(Math.min(1, Math.max(0, n)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_VOL, String(volume));
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  const syncRadioToNow = useCallback((items: TrackItem[]) => {
    if (!items.length) return { index: 0, offset: 0 };
    // Only use tracks that have a duration for the time calculation.
    // If a track lacks duration, it breaks the maths.
    const validItems = items.filter((i) => (i.durationSec ?? 0) > 0);
    if (!validItems.length) return { index: 0, offset: 0 };

    const total = validItems.reduce((acc, t) => acc + (t.durationSec || 0), 0);
    const nowSec = Math.floor(Date.now() / 1000);
    const loopPos = nowSec % total;

    let acc = 0;
    for (let i = 0; i < validItems.length; i++) {
      const d = validItems[i].durationSec || 0;
      if (acc + d > loopPos) {
        const originalIndex = items.findIndex((orig) => orig.id === validItems[i].id);
        return { index: originalIndex >= 0 ? originalIndex : 0, offset: loopPos - acc };
      }
      acc += d;
    }
    return { index: 0, offset: 0 };
  }, []);

  const setTracks = useCallback((t: TrackItem[]) => {
    setTracksState(t);
  }, []);

  const loadPlaylist = useCallback(
    (items: TrackItem[]) => {
      setTracksState(items);
      const { index, offset } = syncRadioToNow(items);
      radioStartOffset.current = offset;
      setCurrentIndex(index);
    },
    [syncRadioToNow]
  );

  const playIndex = useCallback(
    () => {
      // Disabled specific index playing for Radio mode. 
      // Instead, we just sync to live.
      if (!tracks.length) return;
      const { index, offset } = syncRadioToNow(tracks);
      
      const el = audioRef.current;
      if (index === currentIndex && el) {
        el.currentTime = offset;
        setPlaying(true);
        void el.play().catch(() => setPlaying(false));
      } else {
        radioStartOffset.current = offset;
        setCurrentIndex(index);
        setPlaying(true);
      }
    },
    [tracks, currentIndex, syncRadioToNow]
  );

  // Play next just resyncs naturally based on the new clock time.
  const playNext = useCallback(() => {
    if (!tracks.length) return;
    const { index, offset } = syncRadioToNow(tracks);
    radioStartOffset.current = offset;
    setCurrentIndex(index);
  }, [tracks, syncRadioToNow]);

  const playPrev = useCallback(() => {
    // Disabled in radio mode, just resync
    playNext();
  }, [playNext]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    if (isPlaying) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [current, isPlaying]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !current) return;
    el.pause();
    el.src = isGdriveUrl(current.audioUrl)
      ? gdriveAudioUrl(current.audioUrl)
      : current.audioUrl;
    el.load();

    const applyOffset = () => {
      if (radioStartOffset.current !== null) {
        el.currentTime = radioStartOffset.current;
        radioStartOffset.current = null;
      }
      if (isPlaying) {
        void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
      el.removeEventListener("canplay", applyOffset);
    };

    el.addEventListener("canplay", applyOffset);

    return () => {
      el.removeEventListener("canplay", applyOffset);
    };
  }, [current?.id, current?.audioUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => playNext();
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [playNext]);

  const value = useMemo(
    () => ({
      tracks,
      setTracks,
      current,
      currentIndex,
      isPlaying,
      volume,
      loadPlaylist,
      playIndex,
      togglePlay,
      setVolume,
      playNext,
      playPrev,
      audioRef,
    }),
    [
      tracks,
      setTracks,
      current,
      currentIndex,
      isPlaying,
      volume,
      loadPlaylist,
      playIndex,
      togglePlay,
      setVolume,
      playNext,
      playPrev,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      <audio ref={audioRef} preload="metadata" className="hidden" />
      {children}
    </Ctx.Provider>
  );
}

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio requires AudioProvider");
  return c;
}
