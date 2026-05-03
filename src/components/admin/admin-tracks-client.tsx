"use client";

import { useEffect, useState } from "react";
import { gdriveAudioUrl, gdriveFileId, gdriveFolderId, isGdriveUrl } from "@/lib/gdrive";
import { DirectUpload } from "./direct-upload";

type TrackRow = {
  _id: string;
  title: string;
  artist?: string;
  description?: string;
  audioUrl: string;
  durationSec?: number;
  order: number;
  published: boolean;
  scheduleType: "rotation" | "fixed";
  fixedTime?: string;
  isRepeating: boolean;
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
  const [scheduleType, setScheduleType] = useState<"rotation" | "fixed">("rotation");
  const [fixedTime, setFixedTime] = useState("");
  const [isRepeating, setIsRepeating] = useState(true);
  const [busy, setBusy] = useState(false);

  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [folderFiles, setFolderFiles] = useState<any[]>([]);

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
          scheduleType,
          fixedTime: scheduleType === "fixed" ? fixedTime : undefined,
          isRepeating,
        }),
      });
      if (!res.ok) { setMsg("Could not save track."); return; }
      setTitle(""); setArtist(""); setDescription(""); setOrder(0);
      setAudioLink(""); setDurationMin(0); setDurationSec(0);
      setScheduleType("rotation"); setFixedTime(""); setIsRepeating(true);
      await refresh();
      setMsg("✓ Track added.");
      setFormOpen(false);
    } finally { setBusy(false); }
  }

  async function addBulkTracks(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const links = (bulkText || "").split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (!links.length) { setMsg("Paste at least one link."); return; }
    
    setBusy(true);
    let successCount = 0;
    try {
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const fileId = gdriveFileId(link);
        const defaultTitle = fileId ? `Track (${fileId.slice(0, 6)}...)` : `Unknown Track ${i + 1}`;
        
        const res = await fetch("/api/admin/tracks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: defaultTitle,
            artist: artist.trim() || undefined,
            audioUrl: link,
            order: order + i, 
            published: true,
            scheduleType: "rotation",
            isRepeating: true,
          }),
        });
        if (res.ok) successCount++;
      }
      setBulkText(""); setArtist(""); setOrder(0);
      await refresh();
      setMsg(`✓ ${successCount} tracks added. You can rename them below.`);
      setFormOpen(false);
      setBulkMode(false);
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
          onSubmit={bulkMode ? addBulkTracks : addTrack}
          className="glass-panel p-5 space-y-4 border border-saffron/15"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">New Track(s)</h2>
            <div className="flex bg-saffron/10 rounded-full p-1 text-xs font-sans">
              <button type="button" onClick={() => setBulkMode(false)}
                className={`py-1 px-3 rounded-full transition-all ${!bulkMode ? "bg-saffron text-white shadow" : "text-ink/60 hover:text-ink"}`}>
                Single
              </button>
              <button type="button" onClick={() => { setBulkMode(true); setBulkText(""); }}
                className={`py-1 px-3 rounded-full transition-all ${bulkMode && typeof bulkText === "string" ? "bg-saffron text-white shadow" : "text-ink/60 hover:text-ink"}`}>
                Bulk Paste
              </button>
              <button type="button" onClick={() => { setBulkMode(true); setBulkText(null as any); }}
                className={`py-1 px-3 rounded-full transition-all ${bulkMode && bulkText === null ? "bg-saffron text-white shadow" : "text-ink/60 hover:text-ink"}`}>
                Folder Sync
              </button>
            </div>
          </div>

          {!bulkMode ? (
            <>
              <Field label="Title" required>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Jai Shri Ram Bhajan" className={inputCls} />
              </Field>

              <Field label="Artist" hint="(optional)">
                <input value={artist} onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Anup Jalota" className={inputCls} />
              </Field>

              <Field label="Audio" required hint="(Drive link or direct upload)">
                <div className="flex gap-2">
                  <input value={audioLink} onChange={(e) => setAudioLink(e.target.value)}
                    placeholder="https://drive.google.com/..." className={monoCls + " flex-1"} />
                  <DirectUpload folder="audio" onUploadComplete={(url) => setAudioLink(url)} label="Upload" accept="audio/*" />
                </div>
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

              <div className="space-y-4 pt-2 border-t border-ink/5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-ink/80">Play Mode</label>
                  <div className="flex bg-ink/5 rounded-lg p-1 text-[11px] font-sans">
                    <button type="button" onClick={() => setScheduleType("rotation")}
                      className={`py-1 px-3 rounded-md transition-all ${scheduleType === "rotation" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"}`}>
                      Rotation
                    </button>
                    <button type="button" onClick={() => setScheduleType("fixed")}
                      className={`py-1 px-3 rounded-md transition-all ${scheduleType === "fixed" ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"}`}>
                      Fixed Time
                    </button>
                  </div>
                </div>

                {scheduleType === "fixed" ? (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Field label="Play at (Time)" required hint="24h format">
                      <input type="time" step="1" value={fixedTime}
                        onChange={(e) => setFixedTime(e.target.value)}
                        className={inputCls} />
                    </Field>
                    <label className="flex flex-col justify-end pb-2 cursor-pointer">
                      <div className="flex items-center gap-2 text-sm font-sans text-ink/70">
                        <input type="checkbox" checked={isRepeating}
                          onChange={(e) => setIsRepeating(e.target.checked)}
                          className="w-4 h-4 accent-saffron" />
                        Repeat Daily
                      </div>
                    </label>

                    {(() => {
                      const existingFixed = rows.filter(r => r.scheduleType === "fixed" && r.fixedTime && r.durationSec);
                      if (existingFixed.length === 0) return null;
                      
                      const formatTime = (secs: number) => {
                        const h = Math.floor(secs / 3600).toString().padStart(2, "0");
                        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
                        const s = Math.floor(secs % 60).toString().padStart(2, "0");
                        return `${h}:${m}:${s}`;
                      };
                      
                      return (
                        <div className="col-span-2 pt-2 border-t border-ink/5">
                          <label className="block text-xs font-medium text-ink/70 mb-2">Auto-Queue After Existing Tracks (10s gap)</label>
                          <div className="flex flex-wrap gap-2">
                            {existingFixed.map(t => {
                              const [h, m, s] = t.fixedTime!.split(":").map(Number);
                              const endSecs = (h * 3600) + (m * 60) + (s || 0) + (t.durationSec || 0) + 10;
                              const normalized = endSecs % 86400; // Handle midnight wrap
                              const timeStr = formatTime(normalized);
                              return (
                                <button key={t._id} type="button" 
                                  onClick={() => setFixedTime(timeStr)}
                                  className="text-[11px] px-2.5 py-1.5 rounded-md bg-saffron/10 text-saffron-dim border border-saffron/20 hover:bg-saffron hover:text-white transition-colors"
                                >
                                  After "{t.title.length > 15 ? t.title.substring(0, 15) + '...' : t.title}" ({timeStr})
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <Field label="Order" hint="(lower = plays first)">
                    <input type="number" value={order}
                      onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                      className={inputCls + " w-28"} />
                  </Field>
                )}
              </div>
            </>
          ) : bulkText === null ? (
            <div className="space-y-4">
              <p className="text-sm text-ink/70 font-sans">
                Paste a Google Drive Folder link. The system will scan the folder for all audio files and add them to your rotation.
              </p>
              
              <div className="space-y-3">
                <Field label="Google Drive Folder Link" required hint={folderFiles.length > 0 ? "Review files below" : ""}>
                  <div className="flex gap-2">
                    <input 
                      placeholder="https://drive.google.com/drive/folders/..." 
                      className={monoCls + " flex-1"} 
                      id="folder-sync-url"
                      disabled={busy || folderFiles.length > 0}
                    />
                    {folderFiles.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => { setFolderFiles([]); setMsg(null); }}
                        className="rounded-xl bg-ink/5 text-ink/60 px-4 py-2 font-sans font-semibold text-xs border border-ink/10 hover:bg-ink/10 transition-all"
                      >
                        Reset
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          const url = (document.getElementById("folder-sync-url") as HTMLInputElement).value;
                          const folderId = gdriveFolderId(url);
                          if (!folderId) { setMsg("Invalid folder link."); return; }
                          
                          setBusy(true);
                          setMsg("Scanning folder...");
                          try {
                            const res = await fetch(`/api/admin/gdrive/folder?id=${folderId}`);
                            if (!res.ok) {
                              const err = await res.json();
                              throw new Error(err.error || "Fetch failed");
                            }
                            const files = await res.json();
                            
                            // Helper to clean titles for fuzzy matching
                            const clean = (s: string) => s.toLowerCase()
                              .replace(/^\d+[\s.)-]*\s*/, "") // Remove leading "1) ", "01 - ", etc.
                              .replace(/\.[^/.]+$/, "")       // Remove extension
                              .replace(/\s+/g, "")            // Remove spaces
                              .trim();

                            const existingCleanTitles = rows.map(r => clean(r.title || ""));
                            
                            const audioFiles = files
                              .filter((f: any) => f.mimeType.startsWith("audio/"))
                              .map((f: any) => {
                                const fileIdMatch = rows.some(r => r.audioUrl.includes(f.id));
                                const titleMatch = existingCleanTitles.includes(clean(f.name));
                                const alreadyAdded = fileIdMatch || titleMatch;
                                return { ...f, selected: !alreadyAdded, alreadyAdded };
                              });
                            
                            if (audioFiles.length === 0) {
                              setMsg("No audio files found in this folder.");
                            } else {
                              setFolderFiles(audioFiles);
                              const count = audioFiles.filter(f => !f.alreadyAdded).length;
                              setMsg(`Found ${audioFiles.length} files (${count} new). Select tracks to import.`);
                            }
                          } catch (err) {
                            setMsg(`Error: ${err instanceof Error ? err.message : "Sync failed"}. Check your .env key.`);
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="rounded-xl bg-saffron text-white px-4 py-2 font-sans font-semibold text-xs shadow-sm hover:bg-saffron-dim transition-all disabled:opacity-50"
                      >
                        {busy ? "Scanning..." : "Fetch Files"}
                      </button>
                    )}
                  </div>
                </Field>

                {folderFiles.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-60 overflow-y-auto border border-ink/10 rounded-xl bg-white/50 p-2 space-y-1">
                      {folderFiles.map((f, i) => (
                        <label key={f.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors border border-transparent ${
                          f.alreadyAdded ? "opacity-60 cursor-not-allowed bg-ink/5" : "hover:bg-white cursor-pointer hover:border-ink/5"
                        }`}>
                          <input 
                            type="checkbox" 
                            disabled={f.alreadyAdded}
                            checked={f.selected} 
                            onChange={(e) => {
                              const next = [...folderFiles];
                              next[i].selected = e.target.checked;
                              setFolderFiles(next);
                            }}
                            className="w-4 h-4 accent-saffron" 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-ink truncate">{f.name}</p>
                              {f.alreadyAdded && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold uppercase tracking-wider">
                                  Already Added
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-ink/40 font-mono uppercase">{f.mimeType.split("/")[1]} • {f.id.slice(0, 8)}...</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <Field label="Artist Name" hint="(for selected tracks)">
                      <input value={artist} onChange={(e) => setArtist(e.target.value)}
                        placeholder="e.g. Anup Jalota" className={inputCls} />
                    </Field>

                    <button
                      type="button"
                      disabled={busy || !folderFiles.some(f => f.selected)}
                      onClick={async () => {
                        const toImport = folderFiles.filter(f => f.selected);
                        setBusy(true);
                        setMsg(`Importing ${toImport.length} tracks...`);
                        let successCount = 0;

                        for (let i = 0; i < toImport.length; i++) {
                          const file = toImport[i];
                          try {
                            const trackRes = await fetch("/api/admin/tracks", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: file.name.split(".").slice(0, -1).join("."),
                                artist: artist.trim() || undefined,
                                audioUrl: `https://drive.google.com/file/d/${file.id}/view`,
                                order: order + i,
                                published: true,
                                scheduleType: "rotation",
                                isRepeating: true,
                              }),
                            });
                            if (trackRes.ok) successCount++;
                            setMsg(`Importing ${i + 1}/${toImport.length}...`);
                          } catch (e) { console.error(e); }
                        }

                        await refresh();
                        setMsg(`✓ ${successCount} tracks imported.`);
                        setFolderFiles([]);
                        setFormOpen(false);
                        setBusy(false);
                      }}
                      className="w-full rounded-xl bg-ink text-white py-2.5 font-sans font-semibold text-sm shadow-md hover:bg-ink/90 transition-all active:scale-[0.98]"
                    >
                      {busy ? "Importing..." : `Import ${folderFiles.filter(f => f.selected).length} Selected Tracks`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink/70 font-sans">
                Paste multiple Google Drive links below (one per line). Temporary titles will be assigned, allowing you to edit them exactly as you want in the main list.
              </p>
              
              <Field label="Links" required>
                <textarea rows={6} value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                  placeholder="https://drive.google.com/...&#10;https://drive.google.com/..."
                  className={monoCls + " resize-y"} />
              </Field>

              <Field label="Artist" hint="(optional, applies to all)">
                <input value={artist} onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Anup Jalota" className={inputCls} />
              </Field>
              
              <Field label="Starting Order" hint="(increments for each track)">
                <input type="number" value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                  className={inputCls + " w-28"} />
              </Field>
            </>
          )}

          {msg && (
            <p className={`text-sm font-sans ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
              {msg}
            </p>
          )}

          <button type="submit" disabled={busy}
            className="w-full rounded-2xl bg-saffron text-white py-3 font-semibold font-sans
              shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50 active:scale-95 transition-all">
            {busy ? "Saving…" : (bulkMode ? "Save All Tracks" : "Save Track")}
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
                  <div className="flex gap-2 items-center mb-1">
                    <input 
                      defaultValue={r.title} 
                      onBlur={(e) => patch(r._id, { title: e.target.value.trim() })}
                      className="font-semibold text-ink w-full max-w-[200px] bg-transparent border-b border-transparent hover:border-ink/20 focus:border-saffron focus:outline-none text-sm px-1 py-0.5 rounded transition-colors"
                      placeholder="Track Title"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      defaultValue={r.artist || ""} 
                      onBlur={(e) => patch(r._id, { artist: e.target.value.trim() })}
                      className="text-xs text-ink/60 bg-transparent border-b border-transparent hover:border-ink/20 focus:border-saffron focus:outline-none px-1 py-0.5 rounded transition-colors max-w-[150px]"
                      placeholder="Optional Artist"
                    />
                    {r.durationSec ? <span className="shrink-0 text-xs text-saffron-dim/80">{fmtDur(r.durationSec)}</span> : null}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <DriveStatus url={r.audioUrl} />
                    {r.scheduleType === "fixed" && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full border border-saffron/30 bg-saffron/5 text-saffron-dim font-sans flex items-center gap-1">
                        🔔 {r.fixedTime}
                      </span>
                    )}
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
                  <div className="flex gap-2 mt-1">
                    <input
                      defaultValue={r.audioUrl}
                      placeholder="URL..."
                      className={monoCls + " flex-1"}
                      onBlur={(e) => patch(r._id, { audioUrl: e.target.value.trim() })}
                    />
                    <DirectUpload folder="audio" onUploadComplete={(url) => patch(r._id, { audioUrl: url })} label="Upload" accept="audio/*" />
                  </div>
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

                  <div className="h-4 w-[1px] bg-ink/10 mx-1" />

                  <select 
                    defaultValue={r.scheduleType}
                    className="text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2 py-1.5 focus:outline-none"
                    onChange={(e) => patch(r._id, { scheduleType: e.target.value as any })}
                  >
                    <option value="rotation">Rotation</option>
                    <option value="fixed">Fixed Time</option>
                  </select>

                  {r.scheduleType === "fixed" && (
                    <>
                      <input type="time" step="1" defaultValue={r.fixedTime}
                        className="text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2 py-1.5 focus:outline-none"
                        onBlur={(e) => patch(r._id, { fixedTime: e.target.value })} />
                      
                      <label className="flex items-center gap-2 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={r.isRepeating}
                          className="w-3.5 h-3.5 accent-saffron"
                          onChange={(e) => patch(r._id, { isRepeating: e.target.checked })} />
                        Repeat
                      </label>
                    </>
                  )}
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
