import { AdminTracksClient } from "@/components/admin/admin-tracks-client";

export default function AdminTracksPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink mb-2">Audio tracks</h1>
      <p className="text-ink/65 text-sm mb-8 max-w-xl">
        Paste a Google Drive link (shared as "Anyone with the link") or upload an MP3 directly.
        Drive links are automatically converted for playback — no extra steps needed.
      </p>
      <AdminTracksClient />
    </div>
  );
}
