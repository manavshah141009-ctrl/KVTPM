"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/contexts/audio-context";
import { parseYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";
import { LiveKitAudioPlayer } from "./livekit-audio-player";

type LiveCfg = {
  title: string;
  provider: string;
  streamKeyOrUrl: string;
  isLive: boolean;
  chatEmbedHtml?: string;
};

function LiveKitLoader({ roomName }: { roomName: string }) {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/live/token?room=${roomName}`)
      .then(r => r.json())
      .then(d => setToken(d.token))
      .catch(e => console.error("Token error", e));
  }, [roomName]);

  return <LiveKitAudioPlayer token={token} />;
}

export function LiveView({ initial }: { initial: LiveCfg | null }) {
  const [cfg, setCfg] = useState<LiveCfg | null>(initial);
  const { resumeAudio } = useAudio();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const j = (await res.json()) as LiveCfg;
        
        // Auto-resume background music if live ends
        setCfg(prev => {
          if (prev?.isLive && !j.isLive) {
            resumeAudio();
          }
          return j;
        });
      } catch {
        /* ignore */
      }
    };
    const t = setInterval(poll, 45000);
    return () => clearInterval(t);
  }, []);

  const embedSrc = useMemo(() => {
    if (!cfg?.streamKeyOrUrl) return null;
    if (cfg.provider === "youtube") {
      const id = parseYoutubeId(cfg.streamKeyOrUrl);
      return id ? youtubeEmbedUrl(id) : null;
    }
    if (cfg.provider === "embed") return cfg.streamKeyOrUrl;
    if (cfg.provider === "hls") return cfg.streamKeyOrUrl;
    return null;
  }, [cfg]);

  const videoSrc = cfg?.provider === "hls" ? cfg.streamKeyOrUrl : null;

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Status Indicator */}
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-3 rounded-full px-6 py-2.5 font-sans text-xs font-bold tracking-[0.2em] uppercase border transition-all duration-700 ${
            cfg?.isLive
              ? "border-saffron/40 bg-saffron/5 text-saffron-dim shadow-[0_0_20px_rgba(255,153,51,0.15)]"
              : "border-ink/5 bg-white/40 text-ink/40"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cfg?.isLive ? "bg-saffron shadow-[0_0_12px_rgba(255,153,51,0.8)]" : "bg-ink/20"
              }`}
            />
            {cfg?.isLive && (
              <span className="absolute w-2.5 h-2.5 rounded-full bg-saffron animate-ping opacity-75" />
            )}
          </div>
          {cfg?.isLive ? "Transmission Active" : "Sanctuary Offline"}
        </motion.div>
      </div>

      {/* Main Content Area */}
      <motion.div
        layout
        className="relative max-w-4xl mx-auto group"
      >
        {/* Aesthetic Glow (Mobile specific) */}
        {cfg?.isLive && (
          <div className="absolute -inset-4 bg-gradient-to-b from-saffron/20 to-transparent blur-3xl opacity-50 pointer-events-none" />
        )}

        <div 
          className={`glass-panel overflow-hidden relative rounded-[2rem] shadow-2xl border-white/20 flex flex-col ${
            cfg?.provider === "livekit" || !cfg?.streamKeyOrUrl
              ? "min-h-[450px] sm:min-h-[500px]" // Tall enough for the beautiful audio UI
              : "aspect-video" // Standard 16:9 for YouTube/HLS video
          }`}
        >
          {!cfg?.streamKeyOrUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center text-2xl opacity-20">📴</div>
              <p className="text-ink/40 font-sans text-sm leading-relaxed max-w-xs">
                The stream will appear here when the temple administrators begin the divine broadcast.
              </p>
            </div>
          ) : cfg.provider === "livekit" ? (
            <div className="flex-1 w-full h-full relative">
              <LiveKitLoader roomName={cfg.streamKeyOrUrl} />
            </div>
          ) : cfg.provider === "hls" && videoSrc ? (
            <video
              src={videoSrc}
              controls
              className="absolute inset-0 w-full h-full bg-black"
              playsInline
            />
          ) : embedSrc ? (
            <iframe
              src={embedSrc}
              title={cfg.title || "Live"}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-red-400/60 font-sans p-6 text-center text-sm">
              Configuration error: Invalid stream source.
            </div>
          )}
        </div>
      </motion.div>

      {/* Social / Chat Integration */}
      {cfg?.chatEmbedHtml && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
            <h2 className="font-serif text-2xl text-ink/80 italic">Sangat Chat</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
          </div>
          
          <div
            className="glass-panel overflow-hidden min-h-[400px] rounded-[2rem] shadow-xl border-white/40"
            dangerouslySetInnerHTML={{ __html: cfg.chatEmbedHtml }}
          />
          
          <p className="text-center text-[10px] text-ink/30 uppercase tracking-widest px-10">
            Please maintain the sanctity of the space while interacting with the sangat.
          </p>
        </motion.div>
      )}
    </div>
  );
}
