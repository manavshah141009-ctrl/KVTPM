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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type TrackItem = {
  id: string;
  title: string;
  artist?: string;
  description?: string;
  audioUrl: string;
  durationSec?: number;
  order: number;
  scheduleType?: "rotation" | "fixed";
  fixedTime?: string;
  isRepeating?: boolean;
  createdAt?: string | Date;
};

export type RadioPosition = {
  trackIdx: number;
  offsetSec: number;       // seconds into the current track
  remainingSec: number;    // seconds left in the current track
  elapsed: number;         // total seconds elapsed across full playlist
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
  // Virtual radio
  radioTracks: TrackItem[];
  startEpoch: number | null;
  totalDuration: number;
  isSyncedRadio: boolean;
  radioPosition: RadioPosition | null;
  toggleRadio: () => void;
  needsGesture: boolean;
  // Legacy aliases
  isLiveStream: boolean;
  streamUrl: string | null;
  toggleLiveStream: () => void;
};

const Ctx = createContext<AudioCtx | null>(null);
const LS_VOL = "kvtp_vol";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function resolveAudioUrl(url: string): string {
  return isGdriveUrl(url) ? gdriveAudioUrl(url) : url;
}

function toAbsolute(src: string): string {
  if (src.startsWith("http")) return src;
  return `${typeof window !== "undefined" ? window.location.origin : ""}${src.startsWith("/") ? "" : "/"}${src}`;
}

/**
 * Calculate which track is "live" right now and its playback offset.
 */
function calcRadioPosition(
  tracks: TrackItem[],
  startEpoch: number,
  totalDuration: number
): RadioPosition | null {
  if (!tracks.length || !startEpoch) return null;

  const nowMs = Date.now();
  const nowSec = nowMs / 1000;
  const nowDates = new Date(nowMs);

  // 1. Check if any fixed track is CURRENTLY playing
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    if (t.scheduleType !== "fixed" || !t.fixedTime || !t.durationSec) continue;

    const [fh, fm] = t.fixedTime.split(":").map(Number);
    // Determine absolute start time for TODAY
    const startOfToday = new Date(nowDates);
    startOfToday.setHours(fh, fm, 0, 0);
    const startMs = startOfToday.getTime();

    if (t.isRepeating === false) {
      // If not repeating, it only plays on the first occurrence after createdAt
      const createdMs = new Date(t.createdAt || 0).getTime();
      const firstOccurrenceMs = new Date(createdMs);
      firstOccurrenceMs.setHours(fh, fm, 0, 0);
      if (firstOccurrenceMs.getTime() < createdMs) {
        firstOccurrenceMs.setDate(firstOccurrenceMs.getDate() + 1);
      }
      if (startMs !== firstOccurrenceMs.getTime()) continue;
    }

    const startSec = startMs / 1000;
    const endSec = startSec + t.durationSec;

    if (nowSec >= startSec && nowSec < endSec) {
      // THIS fixed track is currently playing!
      return {
        trackIdx: i,
        offsetSec: nowSec - startSec,
        remainingSec: endSec - nowSec,
        elapsed: 0,
      };
    }
  }

  // 2. If no fixed track is playing, compute rotation
  const rotationTracks = tracks.filter((t) => t.scheduleType !== "fixed");
  if (!rotationTracks.length || !totalDuration) return null;

  const elapsed = (nowSec - startEpoch) % totalDuration;
  let acc = 0;
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    if (t.scheduleType === "fixed") continue;

    const dur = t.durationSec ?? 0;
    if (elapsed < acc + dur) {
      return {
        trackIdx: i,
        offsetSec: elapsed - acc,
        remainingSec: acc + dur - elapsed,
        elapsed,
      };
    }
    acc += dur;
  }
  
  // Fallback
  const firstRotIdx = tracks.findIndex(t => t.scheduleType !== "fixed");
  return { trackIdx: firstRotIdx >= 0 ? firstRotIdx : 0, offsetSec: 0, remainingSec: 0, elapsed };
}

/**
 * Core seek-and-play helper.
 * Properly handles seeking AFTER metadata loads (for range-request streams).
 * Returns a cancel function.
 */
function loadAndPlay(
  el: HTMLAudioElement,
  src: string,
  volume: number,
  offsetSec: number,
  onPlay: () => void,
  onFail: () => void
): () => void {
  const absoluteSrc = toAbsolute(src);
  let cancelled = false;
  let cleanupFns: Array<() => void> = [];

  const cleanup = () => cleanupFns.forEach((fn) => fn());

  const doPlay = () => {
    if (cancelled) return;
    el.volume = volume;
    void el.play()
      .then(() => { if (!cancelled) onPlay(); })
      .catch(() => { if (!cancelled) onFail(); });
  };

  const seekAndPlay = () => {
    if (cancelled) return;
    el.volume = volume;

    if (offsetSec <= 0) {
      doPlay();
      return;
    }

    // Helper: attempt seek, then play
    const trySeek = () => {
      if (cancelled) return;
      if (el.seekable.length > 0) {
        el.currentTime = Math.min(offsetSec, el.seekable.end(0));
        const onSeeked = () => { if (!cancelled) doPlay(); };
        el.addEventListener("seeked", onSeeked, { once: true });
        cleanupFns.push(() => el.removeEventListener("seeked", onSeeked));
      } else {
        // Stream doesn't support seeking — play from beginning with visual offset
        console.warn("[radio] seekable range empty — playing from start");
        doPlay();
      }
    };

    // If metadata already loaded, try seeking immediately
    if (el.readyState >= 1) {
      trySeek();
    } else {
      const onMeta = () => { if (!cancelled) trySeek(); };
      el.addEventListener("loadedmetadata", onMeta, { once: true });
      const onCanPlay = () => { if (!cancelled) trySeek(); };
      el.addEventListener("canplay", onCanPlay, { once: true });
      cleanupFns.push(
        () => el.removeEventListener("loadedmetadata", onMeta),
        () => el.removeEventListener("canplay", onCanPlay),
      );
    }
  };

  // Load source only if changed
  if (el.src !== absoluteSrc) {
    el.pause();
    el.src = absoluteSrc;
    el.preload = "auto";
    el.load();
  }

  if (el.readyState >= 2) {
    seekAndPlay();
  } else {
    const onCanPlay = () => {
      cleanupFns = cleanupFns.filter((fn) => fn !== onCanPlay);
      seekAndPlay();
    };
    el.addEventListener("canplay", onCanPlay, { once: true });
    cleanupFns.push(() => el.removeEventListener("canplay", onCanPlay));
  }

  return () => {
    cancelled = true;
    cleanup();
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Browsable playlist state
  const [tracks, setTracksState] = useState<TrackItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.85);

  // Virtual radio state
  const [radioTracks, setRadioTracks] = useState<TrackItem[]>([]);
  const [startEpoch, setStartEpoch] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isSyncedRadio, setIsSyncedRadio] = useState(false);
  const [radioPosition, setRadioPosition] = useState<RadioPosition | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  
  // Keep track of previous radio position to detect hard breaks
  const radioPositionRef = useRef<RadioPosition | null>(null);

  // Stable refs — avoid stale closures in callbacks/effects
  const tracksRef       = useRef(tracks);
  const radioTracksRef  = useRef(radioTracks);
  const startEpochRef   = useRef(startEpoch);
  const totalDurationRef = useRef(totalDuration);
  const currentIndexRef = useRef(currentIndex);
  const volumeRef       = useRef(volume);
  const isSyncedRef     = useRef(isSyncedRadio);
  const isPlayingRef    = useRef(isPlaying);
  const cancelRef       = useRef<(() => void) | null>(null);

  tracksRef.current       = tracks;
  radioTracksRef.current  = radioTracks;
  startEpochRef.current   = startEpoch;
  totalDurationRef.current = totalDuration;
  currentIndexRef.current = currentIndex;
  volumeRef.current       = volume;
  isSyncedRef.current     = isSyncedRadio;
  isPlayingRef.current    = isPlaying;

  const current = isSyncedRadio
    ? (radioTracks[radioPosition?.trackIdx ?? 0] ?? null)
    : (tracks[currentIndex] ?? null);

  // ── Bootstrap: fetch radio data + persisted volume ──────────────────────
  useEffect(() => {
    const fetchRadio = () => {
      fetch("/api/radio")
        .then((r) => {
          // Guard against HTML error pages (404 during SSR cold start)
          const ct = r.headers.get("content-type") ?? "";
          if (!ct.includes("application/json")) throw new Error("non-JSON response");
          return r.json();
        })
        .then((d) => {
          if (d.tracks?.length) {
            setRadioTracks(d.tracks);
            setStartEpoch(d.startEpoch);
            setTotalDuration(d.totalDuration);
          } else {
            // Retry after 3s if no tracks yet (server might be warming up)
            setTimeout(fetchRadio, 3000);
          }
        })
        .catch((e) => {
          console.warn("[audio] radio fetch failed, retrying:", e.message);
          setTimeout(fetchRadio, 3000);  // retry on network / 404 errors
        });
    };
    fetchRadio();

    const v = localStorage.getItem(LS_VOL);
    if (v != null) {
      const n = parseFloat(v);
      if (!Number.isNaN(n)) setVolumeState(Math.min(1, Math.max(0, n)));
    }
  }, []);

  // ── Internal play helper ────────────────────────────────────────────────
  const startPlaying = useCallback((src: string, offsetSec = 0) => {
    const el = audioRef.current;
    if (!el) return;
    if (cancelRef.current) { cancelRef.current(); cancelRef.current = null; }

    const cancel = loadAndPlay(
      el, src, volumeRef.current, offsetSec,
      () => setPlaying(true),
      () => setPlaying(false)
    );
    cancelRef.current = cancel;
  }, []);

  // ── Core: compute timestamp position and start playing ──────────────────
  const syncAndPlay = useCallback(() => {
    const rt    = radioTracksRef.current;
    const epoch = startEpochRef.current;
    const total = totalDurationRef.current;
    if (!rt.length || !epoch || !total) return;

    const pos = calcRadioPosition(rt, epoch, total);
    if (!pos) return;

    setRadioPosition(pos);
    setCurrentIndex(pos.trackIdx);

    const track = rt[pos.trackIdx];
    const src = resolveAudioUrl(track.audioUrl);
    console.log(`[radio] syncAndPlay → track[${pos.trackIdx}] "${track.title}" @ ${pos.offsetSec.toFixed(1)}s`);
    startPlaying(src, pos.offsetSec);
  }, [startPlaying]);

  // ── Auto-play on load: attempt once data arrives ────────────────────────
  const autoPlayTriedRef = useRef(false);
  useEffect(() => {
    if (autoPlayTriedRef.current) return;
    if (!radioTracks.length || !startEpoch) return;
    autoPlayTriedRef.current = true;

    const timer = setTimeout(() => {
      setIsSyncedRadio(true);
      isSyncedRef.current = true;

      const pos = calcRadioPosition(
        radioTracksRef.current,
        startEpochRef.current!,
        totalDurationRef.current
      );
      if (!pos) return;

      setRadioPosition(pos);
      setCurrentIndex(pos.trackIdx);

      const track = radioTracksRef.current[pos.trackIdx];
      const src = resolveAudioUrl(track.audioUrl);
      const absoluteSrc = toAbsolute(src);

      const el = audioRef.current;
      if (!el) return;

      // Set src & load
      if (el.src !== absoluteSrc) {
        el.src = absoluteSrc;
        el.preload = "auto";
        el.load();
      }
      el.volume = volumeRef.current;

      // Attempt play (with correct seek)
      const tryPlay = () => {
        if (el.seekable.length > 0 && pos.offsetSec > 0) {
          el.currentTime = Math.min(pos.offsetSec, el.seekable.end(0));
        }
        void el.play()
          .then(() => {
            setPlaying(true);
            setNeedsGesture(false);
          })
          .catch(() => {
            // Browser blocked autoplay — show "tap to play" prompt
            setNeedsGesture(true);
          });
      };

      if (el.readyState >= 2) {
        tryPlay();
      } else {
        el.addEventListener("canplay", tryPlay, { once: true });
      }
    }, 600);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioTracks, startEpoch]);

  // ── First-gesture: play when user first interacts ───────────────────────
  useEffect(() => {
    if (!needsGesture) return;
    const handler = () => {
      setNeedsGesture(false);
      // Re-calculate position at gesture time so we're accurate
      const rt    = radioTracksRef.current;
      const epoch = startEpochRef.current;
      const total = totalDurationRef.current;
      if (!rt.length || !epoch || !total) return;
      const pos = calcRadioPosition(rt, epoch, total);
      if (!pos) return;
      const el = audioRef.current;
      if (!el) return;
      const src = toAbsolute(resolveAudioUrl(rt[pos.trackIdx].audioUrl));
      if (el.src !== src) {
        el.src = src;
        el.preload = "auto";
        el.load();
      }
      el.volume = volumeRef.current;
      if (el.seekable.length > 0 && pos.offsetSec > 0) {
        el.currentTime = Math.min(pos.offsetSec, el.seekable.end(0));
      }
      void el.play().then(() => setPlaying(true));
    };
    document.addEventListener("click",     handler, { once: true });
    document.addEventListener("touchend",  handler, { once: true });
    document.addEventListener("keydown",   handler, { once: true });
    return () => {
      document.removeEventListener("click",    handler);
      document.removeEventListener("touchend", handler);
      document.removeEventListener("keydown",  handler);
    };
  }, [needsGesture]);

  // ── Persist volume ──────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_VOL, String(volume));
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  // ── Public track API ────────────────────────────────────────────────────
  const setTracks = useCallback((t: TrackItem[]) => setTracksState(t), []);

  const loadPlaylist = useCallback(
    (items: TrackItem[], startIndex = 0) => {
      setTracksState(items);
      setCurrentIndex(Math.max(0, Math.min(items.length - 1, startIndex)));
    }, []
  );

  const playAtIndex = useCallback(
    (idx: number) => {
      const t = tracksRef.current;
      if (!t.length) return;
      const safeIdx = Math.max(0, Math.min(t.length - 1, idx));
      setIsSyncedRadio(false);
      isSyncedRef.current = false;
      setCurrentIndex(safeIdx);
      startPlaying(resolveAudioUrl(t[safeIdx].audioUrl));
    }, [startPlaying]
  );

  const playNext = useCallback(() => {
    if (isSyncedRef.current) return;
    const t = tracksRef.current;
    if (!t.length) return;
    playAtIndex((currentIndexRef.current + 1) % t.length);
  }, [playAtIndex]);

  const playPrev = useCallback(() => {
    const t = tracksRef.current;
    if (!t.length || isSyncedRef.current) return;
    playAtIndex((currentIndexRef.current - 1 + t.length) % t.length);
  }, [playAtIndex]);

  const playIndex = useCallback(
    (targetIndex?: number) => {
      const t = tracksRef.current;
      if (!t.length) return;
      const idx = targetIndex !== undefined ? targetIndex : currentIndexRef.current;
      playAtIndex(idx);
    }, [playAtIndex]
  );

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (isPlayingRef.current) {
      if (cancelRef.current) { cancelRef.current(); cancelRef.current = null; }
      el.pause();
      setPlaying(false);
    } else {
      if (isSyncedRef.current) {
        syncAndPlay();
        return;
      }
      const hasSource = el.readyState > 0 || el.networkState === 2;
      if (!hasSource) {
        const t = tracksRef.current;
        if (t.length) startPlaying(resolveAudioUrl(t[currentIndexRef.current].audioUrl));
        return;
      }
      el.volume = volumeRef.current;
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [syncAndPlay, startPlaying]);

  /**
   * toggleRadio — Tune In / Stop. Must be called inside a user gesture.
   */
  const toggleRadio = useCallback(() => {
    if (isSyncedRef.current) {
      // Stop
      if (cancelRef.current) { cancelRef.current(); cancelRef.current = null; }
      audioRef.current?.pause();
      setPlaying(false);
      setIsSyncedRadio(false);
      isSyncedRef.current = false;
      setRadioPosition(null);
    } else {
      // Tune in
      setIsSyncedRadio(true);
      isSyncedRef.current = true;
      syncAndPlay();
    }
  }, [syncAndPlay]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }, []);

  // ── Track-end handler ───────────────────────────────────────────────────
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onEnded = () => {
      if (isSyncedRef.current) {
        syncAndPlay(); // recalculate from wall clock (handles drift)
      } else {
        playNext();
      }
    };
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      console.error("[audio] element error:", audioRef.current?.error?.message);
      setPlaying(false);
      // Auto-retry radio after error
      if (isSyncedRef.current) {
        setTimeout(() => {
          if (isSyncedRef.current) syncAndPlay();
        }, 3000);
      }
    };

    el.addEventListener("ended",  onEnded);
    el.addEventListener("play",   onPlay);
    el.addEventListener("pause",  onPause);
    el.addEventListener("error",  onError);
    return () => {
      el.removeEventListener("ended",  onEnded);
      el.removeEventListener("play",   onPlay);
      el.removeEventListener("pause",  onPause);
      el.removeEventListener("error",  onError);
    };
  }, [syncAndPlay, playNext]);

  // ── Periodic drift correction every 30 s ───────────────────────────────
  useEffect(() => {
    if (!isSyncedRadio) return;
    const id = setInterval(() => {
      const el = audioRef.current;
      if (!el || !isSyncedRef.current || !isPlayingRef.current) return;
      const rt    = radioTracksRef.current;
      const epoch = startEpochRef.current;
      const total = totalDurationRef.current;
      if (!rt.length || !epoch || !total) return;

      const pos = calcRadioPosition(rt, epoch, total);
      if (!pos) return;
      const targetTrack  = rt[pos.trackIdx];
      const currentTrack = rt[currentIndexRef.current];

      setRadioPosition(pos);

      if (targetTrack.id !== currentTrack?.id) {
        // Track boundary crossed — load next track
        syncAndPlay();
      } else {
        // Correct time drift > 4 s
        const drift = Math.abs(el.currentTime - pos.offsetSec);
        if (drift > 4) {
          console.log(`[radio] correcting drift of ${drift.toFixed(1)}s`);
          el.currentTime = Math.min(pos.offsetSec, el.seekable.end?.(0) ?? pos.offsetSec);
        }
      }
    }, 30_000);   // every 30 s instead of 60 s
    return () => clearInterval(id);
  }, [isSyncedRadio, syncAndPlay]);

  // ── UI position ticker — update every second ────────────────────────────
  useEffect(() => {
    if (!isSyncedRadio) return;
    const id = setInterval(() => {
      const rt    = radioTracksRef.current;
      const epoch = startEpochRef.current;
      const total = totalDurationRef.current;
      if (rt.length && epoch) {
        const newPos = calcRadioPosition(rt, epoch, total);
        const oldPos = radioPositionRef.current;
        
        if (newPos && oldPos && newPos.trackIdx !== oldPos.trackIdx) {
          // Track changed during the 1s interval (e.g., Hard Break or normal boundary missed by drift checker)
          console.log(`[radio] Track changed via ticker to index ${newPos.trackIdx}`);
          radioPositionRef.current = newPos;
          setRadioPosition(newPos);
          syncAndPlay();
        } else {
          radioPositionRef.current = newPos;
          setRadioPosition(newPos);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isSyncedRadio, syncAndPlay]);

  // ── Context value ───────────────────────────────────────────────────────
  const value = useMemo(
    () => ({
      tracks,
      setTracks,
      current,
      currentIndex: isSyncedRadio ? (radioPosition?.trackIdx ?? 0) : currentIndex,
      isPlaying,
      volume,
      loadPlaylist,
      playIndex,
      togglePlay,
      setVolume,
      playNext,
      playPrev,
      audioRef,
      radioTracks,
      startEpoch,
      totalDuration,
      isSyncedRadio,
      radioPosition,
      toggleRadio,
      needsGesture,
      isLiveStream:    isSyncedRadio,
      streamUrl:       radioTracks.length ? "synced" : null,
      toggleLiveStream: toggleRadio,
    }),
    [
      tracks, setTracks, current, currentIndex, isPlaying, volume,
      loadPlaylist, playIndex, togglePlay, setVolume, playNext, playPrev,
      radioTracks, startEpoch, totalDuration, isSyncedRadio, radioPosition,
      toggleRadio, needsGesture,
    ]
  );

  return (
    <Ctx.Provider value={value}>
      {/* preload="auto" so the browser buffers the stream immediately */}
      <audio ref={audioRef} preload="auto" className="hidden" crossOrigin="anonymous" />
      {children}
    </Ctx.Provider>
  );
}

export function useAudio() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudio requires AudioProvider");
  return c;
}
