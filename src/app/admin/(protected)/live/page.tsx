import { AdminLiveClient } from "@/components/admin/admin-live-client";

export default function AdminLivePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-ink mb-2">Live satsang</h1>
      <p className="text-ink/65 text-sm mb-8 max-w-xl">
        Point visitors to YouTube Live, a hosted embed, or HLS. Chat can be injected as trusted HTML
        from your streaming vendor (YouTube live chat, third-party widgets, etc.).
      </p>
      <AdminLiveClient />
    </div>
  );
}
