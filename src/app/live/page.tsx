import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";
import { LiveContent } from "./live-content";

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

  return <LiveContent initial={cfg} />;
}
