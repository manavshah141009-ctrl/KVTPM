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

export function AdminLiveClient() {
  const [row, setRow] = useState<LiveRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("Live Satsang");
  const [streamKeyOrUrl, setStreamKeyOrUrl] = useState("");
  const [provider, setProvider] = useState<LiveRow["provider"]>("youtube");
  const [isLive, setIsLive] = useState(false);
  const [chatEmbedHtml, setChatEmbedHtml] = useState("");

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
      } finally {
        setLoading(false);
      }
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
          title: title.trim(),
          streamKeyOrUrl: streamKeyOrUrl.trim(),
          provider,
          isLive,
          chatEmbedHtml: chatEmbedHtml.trim() || null,
        }),
      });
      if (!res.ok) {
        setMsg("Save failed");
        return;
      }
      const d = (await res.json()) as LiveRow;
      setRow(d);
      setMsg("Saved.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-ink/60">Loading…</p>;

  return (
    <form onSubmit={save} className="max-w-xl space-y-4 glass-panel p-6">
      <h2 className="font-serif text-lg text-ink">Live stream settings</h2>
      <p className="text-sm text-ink/60">
        For YouTube Live, paste the full URL or the 11-character video ID. For a custom player,
        choose &quot;embed&quot; and paste the iframe <code className="text-xs bg-white/60 px-1 rounded">src</code>{" "}
        URL, or choose &quot;hls&quot; for a direct .m3u8 URL (works best in Safari; other browsers may
        need a player upgrade later).
      </p>
      <label className="block text-sm">
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Provider
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as LiveRow["provider"])}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
        >
          <option value="youtube">YouTube</option>
          <option value="embed">Embed URL (iframe src)</option>
          <option value="hls">HLS (.m3u8)</option>
        </select>
      </label>
      <label className="block text-sm">
        Stream URL / ID
        <textarea
          value={streamKeyOrUrl}
          onChange={(e) => setStreamKeyOrUrl(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2 font-mono text-xs"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} />
        Show “Live now” indicator on public page
      </label>
      <label className="block text-sm">
        Optional chat embed HTML
        <textarea
          value={chatEmbedHtml}
          onChange={(e) => setChatEmbedHtml(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2 font-mono text-xs"
          placeholder='<iframe src="https://..." ...></iframe>'
        />
      </label>
      {row && <p className="text-xs text-ink/40">Document ID: {String(row._id)}</p>}
      {msg && <p className="text-sm text-saffron-dim">{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-2xl bg-saffron text-white py-2 font-medium disabled:opacity-50 px-8"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
