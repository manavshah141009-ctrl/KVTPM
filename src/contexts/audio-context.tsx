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
  // Live Radio extensions
  streamUrl: string | null;
  isLiveStream: boolean;
  toggleLiveStream: () => void;
};

const Ctx = createContext<AudioCtx | null>(null);

const LS_VOL = "kvtp_vol";

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tracks, setTracksState] = useState<TrackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.85);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLiveStream, setIsLiveStream] = useState(true);

  const current = tracks[currentIndex] ?? null;
  const radioStartOffset = useRef<number | null>(null);

  useEffect(() => {
    fetch("/api/radio")
      .then((r) => r.json())
      .then((d) => {
        setStreamUrl(d.streamUrl || null);
        if (d.streamUrl) setIsLiveStream(true);
      })
      .catch((err) => console.error("Failed to load stream url:", err));

    const v = localStorage.getItem(LS_VOL);
    if (v != null) {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) setVolumeState(Math.min(1, Math.max(0, n)));
    }
  }, []);

  // Browser Autoplay Workaround (play on first interaction)
  useEffect(() => {
    const handleFirstInteraction = () => {
      const el = audioRef.current;
      if (el && isLiveStream && streamUrl && !isPlaying) {
         void el.play().then(() => {
           setPlaying(true);
           document.removeEventListener("click", handleFirstInteraction);
           document.removeEventListener("keydown", handleFirstInteraction);
         }).catch(() => {
           // Silently ignore till next interaction if restricted
         });
      }
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [isPlaying, isLiveStream, streamUrl]);

  useEffect(() => {
    localStorage.setItem(LS_VOL, String(volume));
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  const syncRadioToNow = useCallback((items: TrackItem[]) => {
    if (!items.length) return { index: 0, offset: 0 };
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
      if (isLiveStream) {
        setIsLiveStream(false);
      }
      if (!tracks.length) return;
      const { index, offset } = syncRadioToNow(tracks);
      
      const el = audioRef.current;
      if (index === currentIndex && el && !isLiveStream) {
        el.currentTime = offset;
        setPlaying(true);
        void el.play().catch(() => setPlaying(false));
      } else {
        radioStartOffset.current = offset;
        setCurrentIndex(index);
        setPlaying(true);
      }
    },
    [tracks, currentIndex, syncRadioToNow, isLiveStream]
  );

  const playNext = useCallback(() => {
    if (isLiveStream || !tracks.length) return;
    const { index, offset } = syncRadioToNow(tracks);
    radioStartOffset.current = offset;
    setCurrentIndex(index);
  }, [tracks, syncRadioToNow, isLiveStream]);

  const playPrev = useCallback(() => {
    playNext();
  }, [playNext]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el || (!current && !isLiveStream && !streamUrl)) return;
    if (isPlaying) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [current, isPlaying, isLiveStream, streamUrl]);

  const toggleLiveStream = useCallback(() => {
    if (!streamUrl) return;
    setIsLiveStream((prev) => {
      const next = !prev;
      setPlaying(next);
      return next;
    });
  }, [streamUrl]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }, []);

  // Sync Audio Element standard Logic (Tracks)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    
    if (isLiveStream && streamUrl) {
      el.pause();
      el.src = streamUrl;
      el.load();
      if (isPlaying) {
        void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
      return;
    }

    if (!current) return;
    el.pause();
    el.src = isGdriveUrl(current.audioUrl)
      ? gdriveAudioUrl(current.audioUrl)
      : current.audioUrl;
    el.load();

    const applyOffset = () => {
      if (radioStartOffset.current !== null && !isLiveStream) {
        el.currentTime = radioStartOffset.current;
        radioStartOffset.current = null;
      }
      if (isPlaying && !isLiveStream) {
        void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
      el.removeEventListener("canplay", applyOffset);
    };

    el.addEventListener("canplay", applyOffset);

    return () => {
      el.removeEventListener("canplay", applyOffset);
    };
  }, [current?.id, current?.audioUrl, isLiveStream, streamUrl]);

  // Handle Event listeners
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => {
      if (!isLiveStream) playNext();
    };
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
  }, [playNext, isLiveStream]);

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
      streamUrl,
      isLiveStream,
      toggleLiveStream,
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
      streamUrl,
      isLiveStream,
      toggleLiveStream,
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
