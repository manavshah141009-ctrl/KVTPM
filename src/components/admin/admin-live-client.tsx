"use client";

import { useEffect, useState } from "react";

type LiveRow = {
  _id: string;
  title: string;
  streamKeyOrUrl: string;
  provider: "youtube" | "embed" | "hls";
  isLive: boolean;
  chatEmbedHtml?: string;
};

const inputCls = "w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 font-sans";
const monoCls  = inputCls + " font-mono text-xs";

export function AdminLiveClient() {
  const [row,    setRow]    = useState<LiveRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg,    setMsg]    = useState<string | null>(null);
  const [busy,   setBusy]   = useState(false);

  const [title,          setTitle]          = useState("Live Satsang");
  const [streamKeyOrUrl, setStreamKeyOrUrl] = useState("");
  const [provider,       setProvider]       = useState<LiveRow["provider"]>("youtube");
  const [isLive,         setIsLive]         = useState(false);
  const [chatEmbedHtml,  setChatEmbedHtml]  = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/live");
        if (!res.ok) return;
        const d = (await res.json()) as LiveRow;
        setRow(d);
        setTitle(d.title);
        setStreamKeyOrUrl(d.streamKeyOrUrl);
        setProvider(d.provider);
        setIsLive(d.isLive);
        setChatEmbedHtml(d.chatEmbedHtml ?? "");
      } finally { setLoading(false); }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/live", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), streamKeyOrUrl: streamKeyOrUrl.trim(),
          provider, isLive, chatEmbedHtml: chatEmbedHtml.trim() || null,
        }),
      });
      if (!res.ok) { setMsg("Save failed."); return; }
      const d = (await res.json()) as LiveRow;
      setRow(d);
      setMsg("✓ Saved successfully!");
    } finally { setBusy(false); }
  }

  if (loading) return (
    <div className="flex items-center gap-3 py-8">
      <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-soft" />
      <p className="text-ink/50 font-sans text-sm">Loading live settings…</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-ink">Live Stream</h1>
        <p className="text-sm text-ink/55 font-sans mt-0.5">
          Configure the YouTube Live or custom stream shown on the public Live page.
        </p>
      </div>

      {/* Live status toggle card */}
      <div className={`glass-panel p-4 flex items-center justify-between gap-4 ${
        isLive ? "border border-red-200 bg-red-50/30" : "border border-ink/10"
      }`}>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full shrink-0 ${
            isLive ? "bg-red-500 animate-pulse-soft shadow-[0_0_10px_rgba(239,68,68,0.6)]" : "bg-ink/20"
          }`} />
          <div>
            <p className="font-semibold text-sm text-ink">
              {isLive ? "🔴 Currently Live" : "⚫ Off Air"}
            </p>
            <p className="text-xs text-ink/50 font-sans">Toggle to show &quot;Live now&quot; indicator</p>
          </div>
        </div>
        {/* iOS-style toggle */}
        <button
          type="button"
          onClick={() => setIsLive((v) => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            isLive ? "bg-red-500" : "bg-ink/20"
          }`}
          aria-pressed={isLive}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
            isLive ? "translate-x-6" : "translate-x-0"
          }`} />
        </button>
      </div>

      {/* Settings form */}
      <form onSubmit={save} className="glass-panel p-5 space-y-5">
        <h2 className="font-serif text-lg text-ink">Stream Configuration</h2>

        {/* Title */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink/80">Stream Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>

        {/* Provider selector — segmented control style */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink/80">Provider</label>
          <div className="grid grid-cols-3 gap-1.5 bg-ink/5 p-1 rounded-xl">
            {(["youtube", "embed", "hls"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
                  provider === p
                    ? "bg-white shadow text-saffron-dim"
                    : "text-ink/50 hover:text-ink"
                }`}
              >
                {p === "youtube" ? "YouTube" : p === "embed" ? "Embed" : "HLS"}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink/40 font-sans">
            {provider === "youtube"
              ? "Paste a full YouTube watch URL or 11-character video ID"
              : provider === "embed"
              ? "Paste the iframe src URL from your streaming platform"
              : "Paste a .m3u8 HLS stream URL (best in Safari)"}
          </p>
        </div>

        {/* Stream URL */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink/80">Stream URL / ID</label>
          <textarea
            value={streamKeyOrUrl} onChange={(e) => setStreamKeyOrUrl(e.target.value)}
            rows={3} placeholder="https://www.youtube.com/watch?v=..."
            className={monoCls}
          />
        </div>

        {/* Chat embed */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink/80">
            Chat Embed HTML
            <span className="ml-1.5 text-[11px] font-normal text-ink/40">(optional)</span>
          </label>
          <textarea
            value={chatEmbedHtml} onChange={(e) => setChatEmbedHtml(e.target.value)}
            rows={4} placeholder='<iframe src="https://..." ...></iframe>'
            className={monoCls}
          />
        </div>

        {row && (
          <p className="text-xs text-ink/35 font-sans font-mono">Doc ID: {String(row._id)}</p>
        )}

        {msg && (
          <p className={`text-sm font-sans ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
            {msg}
          </p>
        )}

        <button
          type="submit" disabled={busy}
          className="w-full rounded-2xl bg-saffron text-white py-3 font-semibold font-sans
            shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50 active:scale-95 transition-all"
        >
          {busy ? "Saving…" : "Save Settings"}
        </button>
      </form>

    </div>
  );
}
