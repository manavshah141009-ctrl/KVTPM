"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { parseYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";

type LiveCfg = {
  title: string;
  provider: string;
  streamKeyOrUrl: string;
  isLive: boolean;
  chatEmbedHtml?: string;
};

export function LiveView({ initial }: { initial: LiveCfg | null }) {
  const [cfg, setCfg] = useState<LiveCfg | null>(initial);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    const poll = async () => {
      try {
        const res = await fetch("/api/live");
        if (!res.ok) return;
        const j = (await res.json()) as LiveCfg;
        setCfg(j);
      } catch {
        /* ignore */
      }
    };
    t = setInterval(poll, 45000);
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
    <div className="space-y-8">
      <div className="flex justify-center">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm border ${
            cfg?.isLive
              ? "border-saffron/50 bg-saffron/10 text-saffron-dim shadow-glow-sm animate-pulse-soft"
              : "border-ink/10 bg-white/40 text-ink/55"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              cfg?.isLive ? "bg-saffron shadow-[0_0_12px_rgba(255,153,51,0.8)]" : "bg-ink/25"
            }`}
            aria-hidden
          />
          {cfg?.isLive ? "Live now" : "Not live at the moment"}
        </div>
      </div>

      <motion.div
        layout
        className="glass-panel overflow-hidden aspect-video max-w-4xl mx-auto relative rounded-2xl"
      >
        {!cfg?.streamKeyOrUrl ? (
          <div className="absolute inset-0 flex items-center justify-center text-ink/50 font-sans p-6 text-center">
            The stream will appear here when configured by the administrators.
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
          <div className="absolute inset-0 flex items-center justify-center text-ink/50 font-sans p-6 text-center">
            Could not parse stream URL. For YouTube, paste a full watch URL or the 11-character video
            ID.
          </div>
        )}
      </motion.div>

      {cfg?.chatEmbedHtml && (
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-xl text-ink mb-3 text-center">Sangat chat</h2>
          <div
            className="glass-panel overflow-hidden min-h-[320px] rounded-2xl"
            // Admin-controlled trusted embed only
            dangerouslySetInnerHTML={{ __html: cfg.chatEmbedHtml }}
          />
        </div>
      )}
    </div>
  );
}
