import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";
import { LiveView } from "./live-view";

export const revalidate = 30;

export default async function LivePage() {
  let cfg: {
    title: string;
    provider: string;
    streamKeyOrUrl: string;
    isLive: boolean;
    chatEmbedHtml?: string;
  } | null = null;
  try {
    await dbConnect();
    const doc = await LiveStream.findOne().sort({ updatedAt: -1 }).lean();
    if (doc) {
      cfg = {
        title: doc.title,
        provider: doc.provider,
        streamKeyOrUrl: doc.streamKeyOrUrl,
        isLive: doc.isLive,
        chatEmbedHtml: doc.chatEmbedHtml,
      };
    }
  } catch {
    cfg = null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">Live satsang</h1>
        <p className="text-ink/70 font-sans leading-relaxed">
          Gather in real time for teaching, kirtan, and shared silence. When the stream is active, the
          lamp below glows softly — a small reminder that something sacred is unfolding.
        </p>
      </header>

      <LiveView initial={cfg} />
    </div>
  );
}
