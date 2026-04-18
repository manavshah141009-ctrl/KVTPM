import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import { Track } from "@/models/Track";
import { HomeContent } from "./home-content";

export const revalidate = 120;

async function getFeatured() {
  try {
    await dbConnect();
    const [books, tracks] = await Promise.all([
      Book.find({ published: true, featured: true }).sort({ order: 1 }).limit(3).lean(),
      Track.find({ published: true }).sort({ order: 1 }).limit(5).lean(),
    ]);
    return {
      books: books.map((b) => ({ _id: String(b._id), title: b.title as string })),
      tracks: tracks.map((t) => ({
        _id: String(t._id),
        title: t.title as string,
        artist: (t.artist as string | undefined) ?? undefined,
      })),
    };
  } catch {
    return { books: [], tracks: [] };
  }
}

export default async function HomePage() {
  const { books, tracks } = await getFeatured();
  return <HomeContent books={books} tracks={tracks} />;
}
