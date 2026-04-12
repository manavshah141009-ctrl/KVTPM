import { AdminBooksClient } from "@/components/admin/admin-books-client";

export default function AdminBooksPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink mb-2">Books</h1>
      <p className="text-ink/65 text-sm mb-8 max-w-xl">
        Paste Google Drive links (shared as &quot;Anyone with the link&quot;) for covers and PDFs — they are
        automatically converted so covers display and PDFs open in the built-in reader.
      </p>
      <AdminBooksClient />
    </div>
  );
}
