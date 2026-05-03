"use client";

import { useEffect, useState } from "react";
import { gdriveFileId, gdriveFolderId, gdriveThumbnailUrl, isGdriveUrl } from "@/lib/gdrive";
import { DirectUpload } from "./direct-upload";

type BookRow = {
  _id: string;
  title: string;
  author?: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  featured: boolean;
  order: number;
  published: boolean;
};

function DriveStatus({ url, label }: { url: string; label?: string }) {
  if (!url) return null;
  if (isGdriveUrl(url) && gdriveFileId(url))
    return <Chip color="green">✓ {label ?? "Drive"} link</Chip>;
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

function CoverPreview({ url }: { url: string }) {
  if (!url) return null;
  const src = isGdriveUrl(url) ? gdriveThumbnailUrl(url, 200) : url;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="cover preview"
      className="w-16 h-22 object-cover rounded-xl border border-ink/10 shadow-sm shrink-0"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
  );
}

const inputCls = "w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 font-sans";
const monoCls  = inputCls + " font-mono text-xs";

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

export function AdminBooksClient() {
  const [rows, setRows]     = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [title,       setTitle]       = useState("");
  const [author,      setAuthor]      = useState("");
  const [description, setDescription] = useState("");
  const [order,       setOrder]       = useState(0);
  const [featured,    setFeatured]    = useState(false);
  const [coverLink,   setCoverLink]   = useState("");
  const [pdfLink,     setPdfLink]     = useState("");
  const [bulkMode,    setBulkMode]    = useState(false);
  const [folderFiles, setFolderFiles] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/books");
    if (res.ok) setRows(await res.json());
  }

  useEffect(() => {
    (async () => { try { await refresh(); } finally { setLoading(false); } })();
  }, []);

  async function createBook(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim() || !description.trim()) {
      setMsg("Title and description are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(), author: author.trim() || undefined,
          description: description.trim(),
          coverUrl: coverLink.trim() || undefined, pdfUrl: pdfLink.trim() || undefined,
          featured, order, published: true,
        }),
      });
      if (!res.ok) { setMsg("Could not save book."); return; }
      setTitle(""); setAuthor(""); setDescription(""); setOrder(0);
      setFeatured(false); setCoverLink(""); setPdfLink("");
      await refresh();
      setMsg("✓ Book added.");
      setFormOpen(false);
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this book?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function patch(id: string, partial: Record<string, unknown>) {
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    await refresh();
  }

  if (loading) return (
    <div className="flex items-center gap-3 py-8">
      <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-soft" />
      <p className="text-ink/50 font-sans text-sm">Loading books…</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-ink">Books</h1>
          <p className="text-sm text-ink/55 font-sans mt-0.5">
            {rows.length} book{rows.length !== 1 ? "s" : ""} published
          </p>
        </div>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="shrink-0 rounded-2xl bg-saffron text-white px-4 py-2.5 font-sans font-semibold text-sm
            shadow-glow-sm hover:bg-saffron-dim transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">{formOpen ? "✕" : "+"}</span>
          {formOpen ? "Cancel" : "Add Book"}
        </button>
      </div>

      {/* Drive help */}
      <div className="glass-panel p-4 border-l-4 border-saffron/50">
        <p className="font-sans font-semibold text-sm text-ink mb-1.5">📁 Google Drive links for books</p>
        <ol className="text-xs text-ink/65 font-sans space-y-1 list-decimal list-inside">
          <li>Upload PDF or cover image to Google Drive</li>
          <li>Right-click → <strong>Share</strong> → <strong>&quot;Anyone with link&quot;</strong></li>
          <li>Copy link and paste in the fields below</li>
        </ol>
        <p className="text-xs text-ink/45 mt-2 font-sans">Covers use Drive thumbnails · PDFs open in Drive viewer — automatic.</p>
      </div>

      {/* Add form (collapsible) */}
      {formOpen && (
        <form onSubmit={createBook} className="glass-panel p-5 space-y-4 border border-saffron/15">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink">New Book</h2>
            <div className="flex bg-saffron/10 rounded-full p-1 text-xs font-sans">
              <button type="button" onClick={() => setBulkMode(false)}
                className={`py-1 px-3 rounded-full transition-all ${!bulkMode ? "bg-saffron text-white shadow" : "text-ink/60 hover:text-ink"}`}>
                Single
              </button>
              <button type="button" onClick={() => setBulkMode(true)}
                className={`py-1 px-3 rounded-full transition-all ${bulkMode ? "bg-saffron text-white shadow" : "text-ink/60 hover:text-ink"}`}>
                Folder Sync
              </button>
            </div>
          </div>

          {!bulkMode ? (
            <>
              <Field label="Title" required>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gita Rahasya" className={inputCls} required />
              </Field>

              <Field label="Author" hint="(optional)">
                <input value={author} onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Bal Gangadhar Tilak" className={inputCls} />
              </Field>

              <Field label="Description" required>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={3} placeholder="A short description shown on the books page…"
                  className={inputCls} required />
              </Field>

              <Field label="Cover Image" hint="(Drive link or direct upload)">
                <div className="flex gap-2">
                  <input value={coverLink} onChange={(e) => setCoverLink(e.target.value)}
                    placeholder="https://drive.google.com/..." className={monoCls + " flex-1"} />
                  <DirectUpload folder="covers" onUploadComplete={(url) => setCoverLink(url)} label="Upload" accept="image/*" />
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <DriveStatus url={coverLink} label="Cover" />
                  <CoverPreview url={coverLink} />
                </div>
              </Field>

              <Field label="PDF" hint="(Drive link or direct upload)">
                <div className="flex gap-2">
                  <input value={pdfLink} onChange={(e) => setPdfLink(e.target.value)}
                    placeholder="https://drive.google.com/..." className={monoCls + " flex-1"} />
                  <DirectUpload folder="books" onUploadComplete={(url) => setPdfLink(url)} label="Upload" accept=".pdf" />
                </div>
                <div className="mt-1.5"><DriveStatus url={pdfLink} label="PDF" /></div>
                {pdfLink && (
                  <p className="text-xs text-ink/45 mt-1 font-sans">
                    Readers will see &quot;Read online&quot; + &quot;Download PDF&quot; buttons.
                  </p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Order" hint="(lower = first)">
                  <input type="number" value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    className={inputCls} />
                </Field>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-sans text-ink/75 cursor-pointer">
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 accent-saffron rounded" />
                    Feature on homepage
                  </label>
                </div>
              </div>

              <button type="submit" disabled={busy}
                className="w-full rounded-2xl bg-saffron text-white py-3 font-semibold font-sans
                  shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50 active:scale-95 transition-all">
                {busy ? "Saving…" : "Save Book"}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink/70 font-sans">
                Paste a Google Drive Folder link containing PDF books. Each PDF will be imported as a new book entry.
              </p>
              
              <div className="space-y-3">
                <Field label="Google Drive Folder Link" required hint={folderFiles.length > 0 ? "Review PDFs below" : ""}>
                  <div className="flex gap-2">
                    <input 
                      placeholder="https://drive.google.com/drive/folders/..." 
                      className={monoCls + " flex-1"} 
                      id="book-folder-url"
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
                          const url = (document.getElementById("book-folder-url") as HTMLInputElement).value;
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
                            
                            const pdfFiles = files
                              .filter((f: any) => f.mimeType === "application/pdf")
                              .map((f: any) => {
                                const fileIdMatch = rows.some(r => r.pdfUrl.includes(f.id));
                                const titleMatch = existingCleanTitles.includes(clean(f.name));
                                const alreadyAdded = fileIdMatch || titleMatch;
                                return { ...f, selected: !alreadyAdded, alreadyAdded };
                              });
                            
                            if (pdfFiles.length === 0) {
                              setMsg("No PDF files found in this folder.");
                            } else {
                              setFolderFiles(pdfFiles);
                              const count = pdfFiles.filter(f => !f.alreadyAdded).length;
                              setMsg(`Found ${pdfFiles.length} files (${count} new). Select PDFs to import.`);
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
                            <p className="text-[10px] text-ink/40 font-mono uppercase">PDF • {f.id.slice(0, 8)}...</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={busy || !folderFiles.some(f => f.selected)}
                      onClick={async () => {
                        const toImport = folderFiles.filter(f => f.selected);
                        setBusy(true);
                        setMsg(`Importing ${toImport.length} books...`);
                        let successCount = 0;

                        for (let i = 0; i < toImport.length; i++) {
                          const file = toImport[i];
                          try {
                            const bookRes = await fetch("/api/admin/books", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                title: file.name.split(".").slice(0, -1).join("."),
                                author: author.trim() || undefined,
                                description: `Imported from Drive folder.`,
                                pdfUrl: `https://drive.google.com/file/d/${file.id}/view`,
                                order: order + i,
                                published: true,
                              }),
                            });
                            if (bookRes.ok) successCount++;
                            setMsg(`Importing ${i + 1}/${toImport.length}...`);
                          } catch (e) { console.error(e); }
                        }

                        await refresh();
                        setMsg(`✓ ${successCount} books imported.`);
                        setFolderFiles([]);
                        setFormOpen(false);
                        setBusy(false);
                      }}
                      className="w-full rounded-xl bg-ink text-white py-2.5 font-sans font-semibold text-sm shadow-md hover:bg-ink/90 transition-all active:scale-[0.98]"
                    >
                      {busy ? "Importing..." : `Import ${folderFiles.filter(f => f.selected).length} Selected Books`}
                    </button>
                  </div>
                )}

                <Field label="Author Name" hint="(for selected books)">
                  <input value={author} onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Swami Vivekananda" className={inputCls} />
                </Field>
                <p className="text-[11px] text-ink/40 font-sans">Titles will be set to filenames. Descriptions can be edited later.</p>
              </div>
            </div>
          )}

          {msg && (
            <p className={`text-sm font-sans ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
              {msg}
            </p>
          )}
        </form>
      )}

      {!formOpen && msg && (
        <p className={`text-sm font-sans px-1 ${msg.startsWith("✓") ? "text-emerald-700" : "text-red-600"}`}>
          {msg}
        </p>
      )}

      {/* Book list */}
      {rows.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <p className="text-3xl mb-3">📖</p>
          <p className="font-serif text-lg text-ink mb-1">No books yet</p>
          <p className="text-sm text-ink/55 font-sans">Tap &quot;+ Add Book&quot; to get started</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r._id} className="glass-panel overflow-hidden">
              {/* Book header */}
              <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                {/* Cover thumbnail */}
                {r.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={isGdriveUrl(r.coverUrl) ? gdriveThumbnailUrl(r.coverUrl, 120) : r.coverUrl}
                    alt="" className="w-10 h-14 object-cover rounded-lg border border-ink/10 shrink-0"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-saffron/10 border border-saffron/15 flex items-center justify-center text-xl shrink-0">
                    📖
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm leading-snug">{r.title}</p>
                  {r.author && <p className="text-xs text-ink/50 font-sans mt-0.5">{r.author}</p>}
                  <p className="text-xs text-ink/45 mt-1 font-sans line-clamp-2">{r.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-sans ${
                      r.published ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-ink/5 border-ink/15 text-ink/45"
                    }`}>
                      {r.published ? "Published" : "Hidden"}
                    </span>
                    {r.featured && <Chip color="amber">⭐ Featured</Chip>}
                  </div>
                </div>

                <button onClick={() => remove(r._id)}
                  className="shrink-0 w-8 h-8 rounded-full bg-red-50 border border-red-100 text-red-500
                    flex items-center justify-center text-sm hover:bg-red-100 active:scale-90 transition-all">
                  ✕
                </button>
              </div>

              {/* Editable links */}
              <div className="px-4 pb-4 space-y-3 border-t border-ink/6 pt-3">
                <label className="block">
                  <span className="text-[11px] text-ink/50 uppercase tracking-wider font-sans">Cover image</span>
                  <div className="flex gap-2 mt-1">
                    <input defaultValue={r.coverUrl ?? ""} placeholder="URL..."
                      className={monoCls + " flex-1"}
                      onBlur={(e) => patch(r._id, { coverUrl: e.target.value.trim() || "" })} />
                    <DirectUpload folder="covers" onUploadComplete={(url) => patch(r._id, { coverUrl: url })} label="Upload" accept="image/*" />
                  </div>
                  <div className="mt-1"><DriveStatus url={r.coverUrl ?? ""} label="Cover" /></div>
                </label>

                <label className="block">
                  <span className="text-[11px] text-ink/50 uppercase tracking-wider font-sans">PDF</span>
                  <div className="flex gap-2 mt-1">
                    <input defaultValue={r.pdfUrl ?? ""} placeholder="URL..."
                      className={monoCls + " flex-1"}
                      onBlur={(e) => patch(r._id, { pdfUrl: e.target.value.trim() || "" })} />
                    <DirectUpload folder="books" onUploadComplete={(url) => patch(r._id, { pdfUrl: url })} label="Upload" accept=".pdf" />
                  </div>
                  <div className="mt-1"><DriveStatus url={r.pdfUrl ?? ""} label="PDF" /></div>
                </label>

                {/* Controls row */}
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-1.5 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-1.5">
                    Order
                    <input type="number" defaultValue={r.order}
                      className="w-12 bg-transparent border-none outline-none text-center text-ink font-semibold"
                      onBlur={(e) => patch(r._id, { order: parseInt(e.target.value, 10) || 0 })} />
                  </label>
                  <label className="flex items-center gap-2 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={r.featured}
                      className="w-3.5 h-3.5 accent-saffron"
                      onChange={(e) => patch(r._id, { featured: e.target.checked })} />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-xs font-sans text-ink/70 bg-white/60 border border-ink/10 rounded-lg px-2.5 py-2 cursor-pointer">
                    <input type="checkbox" defaultChecked={r.published}
                      className="w-3.5 h-3.5 accent-saffron"
                      onChange={(e) => patch(r._id, { published: e.target.checked })} />
                    Published
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
