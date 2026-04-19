"use client";

import { useEffect, useState } from "react";
import { gdriveAudioUrl, gdriveFileId, isGdriveUrl } from "@/lib/gdrive";

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

function fmtDur(s: number) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${ss.toString().padStart(2, "0")}`;
}

function DriveStatus({ url }: { url: string }) {
  if (!url) return null;
  const id = gdriveFileId(url);
  if (isGdriveUrl(url) && id)
    return <Chip color="green">✓ Google Drive</Chip>;
  if (url.startsWith("http"))
    return <Chip color="blue">✓ Direct URL</Chip>;
  return <Chip color="amber">⚠ Paste a valid URL</Chip>;
}

function Chip({ color, children }: { color: "green" | "blue" | "amber"; children: React.ReactNode }) {
  const cls = {
    green: "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue:  "text-blue-700 bg-blue-50 border-blue-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
  }[color];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-sans border rounded-full px-2 py-0.5 ${cls}`}>
      {children}
    </span>
  );
}

/* ─── Input / Field helpers ─────────────────────────────────────── */
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-ink/80">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="ml-1 text-[11px] font-normal text-ink/40">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 font-sans";
const monoCls  = inputCls + " font-mono text-xs";

/* ─── Main component ────────────────────────────────────────────── */
export function AdminTracksClient() {
  const [rows, setRows]     = useState<TrackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [title,       setTitle]       = useState("");
  const [artist,      setArtist]      = useState("");
  const [description, setDescription] = useState("");
  const [order,       setOrder]       = useState(0);
  const [audioLink,   setAudioLink]   = useState("");
  const [durationMin, setDurationMin] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/tracks");
    if (res.ok) setRows(await res.json());
  }

  useEffect(() => {
    (async () => { try { await refresh(); } finally { setLoading(false); } })();
  }, []);

  // Auto-detect duration from audio metadata
  useEffect(() => {
    if (!audioLink) return;
    const url = isGdriveUrl(audioLink) ? gdriveAudioUrl(audioLink) : audioLink;
    if (!url.startsWith("http") && !url.startsWith("/")) return;
    const a = new Audio(url);
    a.preload = "metadata";
    const onLoad = () => {
      if (a.duration && !isNaN(a.duration) && a.duration !== Infinity) {
        const total = Math.floor(a.duration);
        setDurationMin(Math.floor(total / 60));
        setDurationSec(total % 60);
        setMsg("✓ Duration auto-detected");
      }
    };
    a.addEventListener("loadedmetadata", onLoad);
    return () => a.removeEventListener("loadedmetadata", onLoad);
  }, [audioLink]);

  async function addTrack(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim()) { setMsg("Title is required."); return; }
    if (!audioLink.trim()) { setMsg("Paste a Google Drive link or direct audio URL."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), artist: artist.trim() || undefined,
          description: description.trim() || undefined,
          audioUrl: audioLink.trim(),
          durationSec: durationMin * 60 + durationSec > 0 ? durationMin * 60 + durationSec : undefined,
          order, published: true,
        }),
      });
      if (!res.ok) { setMsg("Could not save track."); return; }
      setTitle(""); setArtist(""); setDescription(""); setOrder(0);
      setAudioLink(""); setDurationMin(0); setDurationSec(0);
      await refresh();
      setMsg("✓ Track added.");
      setFormOpen(false);
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this track?")) return;
    await fetch(`/api/admin/tracks/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function patch(id: string, partial: Partial<TrackRow>) {
    await fetch(`/api/admin/tracks/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    await refresh();
  }

  if (loading) return (
    <div className="flex items-center gap-3 py-8">
      <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-soft" />
      <p className="text-ink/50 font-sans text-sm">Loading tracks…</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-ink">Audio Tracks</h1>
          <p className="text-sm text-ink/55 font-sans mt-0.5">
            {rows.length} track{rows.length !== 1 ? "s" : ""} in the radio playlist
          </p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="shrink-0 rounded-2xl bg-saffron text-white px-4 py-2.5 font-sans font-semibold text-sm
            shadow-glow-sm hover:bg-saffron-dim transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">{formOpen ? "✕" : "+"}</span>
          {formOpen ? "Cancel" : "Add Track"}
        </button>
      </div>

      {/* ── Google Drive help banner ── */}
      <div className="glass-panel p-4 border-l-4 border-saffron/50">
        <p className="font-sans font-semibold text-sm text-ink mb-1.5">📁 How to get a Google Drive audio link</p>
        <ol className="text-xs text-ink/65 font-sans space-y-1 list-decimal list-inside">
          <li>Upload your MP3 to Google Drive</li>
          <li>Right-click → <strong>Share</strong> → set to <strong>&quot;Anyone with link&quot;</strong></li>
          <li>Click <strong>Copy link</strong> and paste below</li>
        </ol>
      </div>

      {/* ── Add form (collapsible) ── */}
      {formOpen && (
        <form
          onSubmit={addTrack}
          className="glass-panel p-5 space-y-4 border border-saffron/15"
        >
          <h2 className="font-serif text-lg text-ink">New Track</h2>

          <Field label="Title" required>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Jai Shri Ram Bhajan" className={inputCls} />
          </Field>

          <Field label="Artist" hint="(optional)">
            <input value={artist} onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Anup Jalota" className={inputCls} />
          </Field>

          <Field label="Google Drive Audio Link" required>
            <input value={audioLink} onChange={(e) => setAudioLink(e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
              className={monoCls} />
            <div className="mt-1.5"><DriveStatus url={audioLink} /></div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duration Min" required hint="(auto-detected)">
              <input type="number" value={durationMin}
                onChange={(e) => setDurationMin(parseInt(e.target.value, 10) || 0)}
                className={inputCls} placeholder="Min" />
            </Field>
            <Field label="Seconds" required>
              <input type="number" value={durationSec}
                onChange={(e) => setDurationSec(parseInt(e.target.value, 10) || 0)}
                className={inputCls} placeholder="Sec" />
            </Field>
          </div>

          <Field label="Order" hint="(lower = plays first)">
            <input type="number" value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className={inputCls + " w-28"} />
          </Field>

          {msg && (
            <p className={`text-sm font-sans ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
              {msg}
            </p>
          )}

          <button type="submit" disabled={busy}
            className="w-full rounded-2xl bg-saffron text-white py-3 font-semibold font-sans
              shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50 active:scale-95 transition-all">
            {busy ? "Saving…" : "Save Track"}
          </button>
        </form>
      )}

      {/* Feedback when form is closed */}
      {!formOpen && msg && (
        <p className={`text-sm font-sans px-1 ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
          {msg}
        </p>
      )}

      {/* ── Track list ── */}
      {rows.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-3xl mb-3">🎵</p>
          <p className="font-serif text-lg text-ink mb-1">No tracks yet</p>
          <p className="text-sm text-ink/55 font-sans">Tap &quot;+ Add Track&quot; above to begin</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r, idx) => (
            <li key={r._id} className="glass-panel overflow-hidden">
              {/* Card header */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-saffron/10 text-saffron flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate text-sm">{r.title}</p>
                  <p className="text-xs text-ink/50 font-sans mt-0.5 flex items-center gap-2">
                    {r.artist && <span className="truncate">{r.artist}</span>}
                    {r.durationSec ? <span className="shrink-0 text-saffron-dim/80">{fmtDur(r.durationSec)}</span> : null}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                    <DriveStatus url={r.audioUrl} />
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-sans ${
                      r.published
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-ink/5 border-ink/15 text-ink/45"
                    }`}>
                      {r.published ? "Published" : "Hidden"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(r._id)}
                  className="shrink-0 w-8 h-8 rounded-full bg-red-50 border border-red-100 text-red-500
                    flex items-center justify-center text-sm hover:bg-red-100 active:scale-90 transition-all">
                  ✕
                </button>
              </div>

              {/* Editable fields */}
              <div className="px-4 pb-4 space-y-3 border-t border-ink/6 pt-3">
                {/* Audio URL */}
                <label className="block">
                  <span className="text-[11px] text-ink/50 uppercase tracking-wider font-sans">Audio URL</span>
                  <input
                    defaultValue={r.audioUrl}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className={monoCls + " mt-1"}
                    onBlur={(e) => patch(r._id, { audioUrl: e.target.value.trim() })}
                  />
                </label>

                {/* Inline controls row */}
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-1.5 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-1.5">
                    <span className="shrink-0">Ord</span>
                    <input type="number" defaultValue={r.order}
                      className="w-12 bg-transparent border-none outline-none text-center text-ink font-semibold"
                      onBlur={(e) => patch(r._id, { order: parseInt(e.target.value, 10) || 0 })} />
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-1.5 cursor-pointer">
                    <span>Dur(s)</span>
                    <input type="number" defaultValue={r.durationSec || 0}
                      className="w-14 bg-transparent border-none outline-none text-center text-ink font-semibold"
                      onBlur={(e) => patch(r._id, { durationSec: parseInt(e.target.value, 10) || undefined })} />
                  </label>

                  <label className="flex items-center gap-2 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={r.published}
                      className="w-3.5 h-3.5 accent-saffron"
                      onChange={(e) => patch(r._id, { published: e.target.checked })} />
                    Published
                  </label>
                </div>

                {/* Drive file ID
                {isGdriveUrl(r.audioUrl) && gdriveFileId(r.audioUrl) && (
                  <p className="text-[10px] text-ink/40 font-sans">
                    Drive ID: <code className="bg-white/60 px-1 rounded">{gdriveFileId(r.audioUrl)}</code>
                  </p>
                )} */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
