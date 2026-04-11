"use client";

import { useEffect, useState } from "react";
import { gdriveFileId, gdriveThumbnailUrl, isGdriveUrl } from "@/lib/gdrive";

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
  if (isGdriveUrl(url) && gdriveFileId(url)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
        ✓ {label ?? "Google Drive"} link detected
      </span>
    );
  }
  if (url.startsWith("http")) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
        ✓ Direct URL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
      ⚠ Paste a valid URL
    </span>
  );
}

function CoverPreview({ url }: { url: string }) {
  if (!url) return null;
  const src = isGdriveUrl(url) ? gdriveThumbnailUrl(url, 200) : url;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="cover preview"
      className="mt-2 w-20 h-28 object-cover rounded-xl border border-ink/10 shadow-sm"
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}

export function AdminBooksClient() {
  const [rows, setRows] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [coverLink, setCoverLink] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/admin/books");
    if (!res.ok) return;
    setRows(await res.json());
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

  async function createBook(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!title.trim() || !description.trim()) {
      setMsg("Title and description are required.");
      return;
    }
    setBusy(true);
    try {
      const cr = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim() || undefined,
          description: description.trim(),
          coverUrl: coverLink.trim() || undefined,
          pdfUrl: pdfLink.trim() || undefined,
          featured,
          order,
          published: true,
        }),
      });
      if (!cr.ok) {
        setMsg("Could not create book.");
        return;
      }
      setTitle("");
      setAuthor("");
      setDescription("");
      setOrder(0);
      setFeatured(false);
      setCoverLink("");
      setPdfLink("");
      await refresh();
      setMsg("✓ Book added.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this book?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function patch(id: string, partial: Record<string, unknown>) {
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    await refresh();
  }

  if (loading) return <p className="text-ink/60">Loading…</p>;

  return (
    <div className="space-y-10">

      {/* Drive help banner */}
      <div className="glass-panel p-4 border-l-4 border-saffron/60 max-w-xl">
        <p className="font-sans font-medium text-sm text-ink mb-1">📁 How to get Google Drive links</p>
        <ol className="text-xs text-ink/65 font-sans space-y-1 list-decimal list-inside">
          <li>Upload your PDF or cover image to Google Drive</li>
          <li>Right-click the file → <strong>Share</strong></li>
          <li>Set access to <strong>"Anyone with the link"</strong> → Viewer</li>
          <li>Click <strong>Copy link</strong> and paste it in the fields below</li>
        </ol>
        <p className="text-xs text-ink/50 mt-2 font-sans">
          Cover images use Drive thumbnails · PDFs open in Drive&apos;s built-in viewer — all automatic.
        </p>
      </div>

      {/* Add book form */}
      <form onSubmit={createBook} className="glass-panel p-6 grid gap-5 max-w-xl">
        <h2 className="font-serif text-lg text-ink">Add book</h2>

        <label className="block text-sm">
          Title <span className="text-red-500">*</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            placeholder="e.g. Gita Rahasya"
            required
          />
        </label>

        <label className="block text-sm">
          Author <span className="text-ink/40">(optional)</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            placeholder="e.g. Bal Gangadhar Tilak"
          />
        </label>

        <label className="block text-sm">
          Description <span className="text-red-500">*</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            placeholder="A short description of the book shown on the books page…"
            required
          />
        </label>

        {/* Cover link */}
        <div>
          <label className="block text-sm mb-1">
            Cover Image — Google Drive Link <span className="text-ink/40">(optional)</span>
          </label>
          <input
            value={coverLink}
            onChange={(e) => setCoverLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2 text-sm font-mono"
          />
          <div className="mt-1.5 flex items-center gap-3">
            <DriveStatus url={coverLink} label="Cover" />
            <CoverPreview url={coverLink} />
          </div>
        </div>

        {/* PDF link */}
        <div>
          <label className="block text-sm mb-1">
            PDF — Google Drive Link <span className="text-ink/40">(optional)</span>
          </label>
          <input
            value={pdfLink}
            onChange={(e) => setPdfLink(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            className="w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2 text-sm font-mono"
          />
          <div className="mt-1.5">
            <DriveStatus url={pdfLink} label="PDF" />
          </div>
          {pdfLink && (
            <p className="text-xs text-ink/45 mt-1 font-sans">
              Readers will see "Read online" (in-browser viewer) + "Download PDF" buttons.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Order <span className="text-ink/40">(lower = first)</span>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-full rounded-xl border border-ink/15 bg-white/80 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4"
            />
            Feature on homepage
          </label>
        </div>

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
          {busy ? "Saving…" : "Add book"}
        </button>
      </form>

      {/* Book list */}
      <div>
        <h2 className="font-serif text-lg text-ink mb-3">
          All books{" "}
          <span className="text-sm font-sans text-ink/45">({rows.length})</span>
        </h2>
        {rows.length === 0 && (
          <p className="text-ink/50 text-sm font-sans">No books yet. Add one above.</p>
        )}
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r._id} className="glass-panel p-5 space-y-4">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <div className="flex gap-4 items-start">
                  {r.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={isGdriveUrl(r.coverUrl) ? gdriveThumbnailUrl(r.coverUrl, 120) : r.coverUrl}
                      alt=""
                      className="w-12 h-16 object-cover rounded-lg border border-ink/10 shrink-0"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div>
                    <p className="font-medium">{r.title}</p>
                    {r.author && <p className="text-xs text-ink/50">{r.author}</p>}
                    <p className="text-xs text-ink/50 line-clamp-1 max-w-xs">{r.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(r._id)}
                  className="text-xs text-red-600 self-start hover:underline shrink-0"
                >
                  Delete
                </button>
              </div>

              {/* Link editors */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-ink/60 block mb-1">Cover image (Drive link)</label>
                  <input
                    defaultValue={r.coverUrl ?? ""}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-xs font-mono"
                    onBlur={(e) => patch(r._id, { coverUrl: e.target.value.trim() || "" })}
                  />
                  <div className="mt-1"><DriveStatus url={r.coverUrl ?? ""} label="Cover" /></div>
                </div>
                <div>
                  <label className="text-xs text-ink/60 block mb-1">PDF (Drive link)</label>
                  <input
                    defaultValue={r.pdfUrl ?? ""}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-xs font-mono"
                    onBlur={(e) => patch(r._id, { pdfUrl: e.target.value.trim() || "" })}
                  />
                  <div className="mt-1"><DriveStatus url={r.pdfUrl ?? ""} label="PDF" /></div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 text-xs items-center">
                <label className="flex items-center gap-1">
                  Order
                  <input
                    type="number"
                    defaultValue={r.order}
                    className="w-16 rounded border border-ink/15 px-1 bg-white/70"
                    onBlur={(e) => patch(r._id, { order: parseInt(e.target.value, 10) || 0 })}
                  />
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={r.featured}
                    onChange={(e) => patch(r._id, { featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={r.published}
                    onChange={(e) => patch(r._id, { published: e.target.checked })}
                  />
                  Published
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
