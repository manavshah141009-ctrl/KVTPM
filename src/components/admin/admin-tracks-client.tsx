"use client";

import { useEffect, useState } from "react";
import { gdriveFileId, isGdriveUrl } from "@/lib/gdrive";

type TrackRow = {
  _id: string;
  title: string;
  artist?: string;
  description?: string;
  audioUrl: string;
  durationSec?: number;
  order: number;
  published: boolean;
};

function DriveStatus({ url }: { url: string }) {
  if (!url) return null;
  const id = gdriveFileId(url);
  if (isGdriveUrl(url) && id) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
        <span>✓</span> Google Drive link detected
      </span>
    );
  }
  if (url.startsWith("http")) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
        <span>✓</span> Direct URL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
      ⚠ Paste a valid URL
    </span>
  );
}

export function AdminTracksClient() {
  const [rows, setRows] = useState<TrackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [audioLink, setAudioLink] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/tracks");
    if (!res.ok) return;
    const d = (await res.json()) as TrackRow[];
    setRows(d);
  }

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addTrack(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim()) {
      setMsg("Title is required.");
      return;
    }
    if (!audioLink.trim()) {
      setMsg("Paste a Google Drive link or a direct audio URL.");
      return;
    }
    setBusy(true);
    try {
      const cr = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim() || undefined,
          description: description.trim() || undefined,
          audioUrl: audioLink.trim(),
          order,
          published: true,
        }),
      });
      if (!cr.ok) {
        setMsg("Could not create track.");
        return;
      }
      setTitle("");
      setArtist("");
      setDescription("");
      setOrder(0);
      setAudioLink("");
      await refresh();
      setMsg("✓ Track added.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this track?")) return;
    await fetch(`/api/admin/tracks/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function patch(id: string, partial: Partial<TrackRow>) {
    await fetch(`/api/admin/tracks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    await refresh();
  }

  if (loading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="space-y-10">

      {/* Google Drive help banner */}
      <div className="glass-panel p-4 border-l-4 border-saffron/60 max-w-xl">
        <p className="font-sans font-medium text-sm text-ink mb-1">📁 How to get a Google Drive link</p>
        <ol className="text-xs text-ink/65 font-sans space-y-1 list-decimal list-inside">
          <li>Upload your MP3 to Google Drive</li>
          <li>Right-click the file → <strong>Share</strong></li>
          <li>Set access to <strong>"Anyone with the link"</strong> → Viewer</li>
          <li>Click <strong>Copy link</strong> and paste it below</li>
        </ol>
        <p className="text-xs text-ink/50 mt-2 font-sans">Links are automatically converted for browser playback — no extra steps needed.</p>
      </div>

      {/* Add track form */}
      <form onSubmit={addTrack} className="glass-panel p-6 grid gap-4 max-w-xl">
        <h2 className="font-serif text-lg text-ink">Add track</h2>

        <label className="block text-sm">
          Title <span className="text-red-500">*</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            placeholder="e.g. Jai Shri Ram Bhajan"
          />
        </label>

        <label className="block text-sm">
          Artist <span className="text-ink/40">(optional)</span>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            placeholder="e.g. Anup Jalota"
          />
        </label>

        <label className="block text-sm">
          Description <span className="text-ink/40">(optional)</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            placeholder="Short description shown in the player"
          />
        </label>

        <div>
          <label className="block text-sm mb-1">
            Google Drive Audio Link <span className="text-red-500">*</span>
          </label>
          <input
            value={audioLink}
            onChange={(e) => setAudioLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2 text-sm font-mono"
          />
          <div className="mt-1.5">
            <DriveStatus url={audioLink} />
          </div>
        </div>

        <label className="block text-sm">
          Order <span className="text-ink/40">(lower plays first)</span>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
            className="mt-1 w-28 rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
          />
        </label>

        {msg && (
          <p className={`text-sm ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-saffron text-white py-2.5 font-medium disabled:opacity-50 w-fit px-8 hover:bg-saffron-dim transition-colors"
        >
          {busy ? "Saving…" : "Add track"}
        </button>
      </form>

      {/* Track list */}
      <div>
        <h2 className="font-serif text-lg text-ink mb-3">
          All tracks{" "}
          <span className="text-sm font-sans text-ink/45">({rows.length})</span>
        </h2>
        {rows.length === 0 && (
          <p className="text-ink/50 text-sm font-sans">No tracks yet. Add one above.</p>
        )}
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r._id} className="glass-panel p-4 flex flex-col gap-3">
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-ink/50 truncate">{r.artist ?? ""}</p>
                  <DriveStatus url={r.audioUrl} />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="text-xs flex items-center gap-1">
                    Order
                    <input
                      type="number"
                      defaultValue={r.order}
                      className="w-16 rounded border border-ink/15 px-1 bg-white/70"
                      onBlur={(e) =>
                        patch(r._id, { order: parseInt(e.target.value, 10) || 0 })
                      }
                    />
                  </label>
                  <label className="text-xs flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={r.published}
                      onChange={(e) => patch(r._id, { published: e.target.checked })}
                    />
                    Published
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(r._id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Audio link edit */}
              <label className="text-xs text-ink/60">
                Google Drive / Audio URL
                <input
                  defaultValue={r.audioUrl}
                  className="mt-1 w-full rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-xs font-mono"
                  placeholder="https://drive.google.com/file/d/.../view"
                  onBlur={(e) => patch(r._id, { audioUrl: e.target.value.trim() })}
                />
              </label>

              {/* Audio preview */}
              {r.audioUrl && isGdriveUrl(r.audioUrl) && gdriveFileId(r.audioUrl) && (
                <div className="text-xs text-ink/50 font-sans">
                  <span className="text-emerald-700">▶ Drive file ID: </span>
                  <code className="bg-white/60 px-1 rounded text-[10px]">
                    {gdriveFileId(r.audioUrl)}
                  </code>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
