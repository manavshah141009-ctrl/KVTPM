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
const LS_ID = "kvtp_tid";

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracksState] = useState<TrackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.85);

  const current = tracks[currentIndex] ?? null;

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

  const setTracks = useCallback((t: TrackItem[]) => {
    setTracksState(t);
  }, []);

  const persistIndex = useCallback((idx: number, list: TrackItem[]) => {
    setCurrentIndex(idx);
    const item = list[idx];
    if (item) localStorage.setItem(LS_ID, item.id);
  }, []);

  const loadPlaylist = useCallback(
    (items: TrackItem[], startIndex = 0) => {
      setTracksState(items);
      const savedId = localStorage.getItem(LS_ID);
      let idx = startIndex;
      if (savedId) {
        const found = items.findIndex((x) => x.id === savedId);
        if (found >= 0) idx = found;
      }
      persistIndex(Math.min(idx, Math.max(0, items.length - 1)), items);
    },
    [persistIndex]
  );

  const playIndex = useCallback(
    (i: number) => {
      if (!tracks.length) return;
      const ni = ((i % tracks.length) + tracks.length) % tracks.length;
      persistIndex(ni, tracks);
      setPlaying(true);
      queueMicrotask(() => {
        void audioRef.current?.play().catch(() => setPlaying(false));
      });
    },
    [tracks, persistIndex]
  );

  const playNext = useCallback(() => {
    if (!tracks.length) return;
    playIndex(currentIndex + 1);
  }, [tracks.length, currentIndex, playIndex]);

  const playPrev = useCallback(() => {
    if (!tracks.length) return;
    playIndex(currentIndex - 1);
  }, [tracks.length, currentIndex, playIndex]);

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
    if (isPlaying) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
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
