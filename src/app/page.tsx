import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import { Track } from "@/models/Track";

export const revalidate = 120;

async function getFeatured() {
  try {
    await dbConnect();
    const [books, tracks] = await Promise.all([
      Book.find({ published: true, featured: true }).sort({ order: 1 }).limit(3).lean(),
      Track.find({ published: true }).sort({ order: 1 }).limit(5).lean(),
    ]);
    return { books, tracks };
  } catch {
    return { books: [], tracks: [] };
  }
}

export default async function HomePage() {
  const { books, tracks } = await getFeatured();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-14">
      <section className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
        <p className="text-saffron-dim uppercase tracking-[0.25em] text-xs mb-4 font-sans">
          Peace begins within
        </p>
        <h1 className="font-serif text-4xl md:text-6xl text-ink leading-tight mb-6 drop-shadow-sm">
          KarVicharTohPamm
        </h1>
        <p className="text-lg md:text-xl text-ink/75 font-sans leading-relaxed">
          A quiet corner of the web for sacred sound, thoughtful reading, and live satsang — designed
          to feel warm, unhurried, and close to the heart.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            href="/listen"
            className="inline-flex items-center justify-center rounded-2xl bg-saffron text-white px-6 py-3 font-sans font-medium shadow-glow-sm hover:bg-saffron-dim transition-colors"
          >
            Start listening
          </Link>
          <Link
            href="/live"
            className="inline-flex items-center justify-center rounded-2xl border border-saffron/40 text-saffron-dim px-6 py-3 font-sans font-medium hover:bg-white/40 transition-colors"
          >
            Join live satsang
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8 md:gap-10 mb-16">
        <div className="glass-panel p-6 md:p-8">
          <h2 className="font-serif text-2xl text-ink mb-3">24/7 sacred audio</h2>
          <p className="text-ink/70 font-sans mb-4 leading-relaxed">
            Bhajans and reflections stream gently in the background. The player stays with you as
            you browse — pause, resume, and let the next track arrive like a quiet breath.
          </p>
          <Link href="/listen" className="text-saffron-dim font-sans text-sm hover:underline">
            Open the listener →
          </Link>
          {tracks.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-ink/60 font-sans border-t border-ink/10 pt-4">
              {tracks.map((t) => (
                <li key={String(t._id)} className="truncate">
                  {t.title}
                  {t.artist ? ` — ${t.artist}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="glass-panel p-6 md:p-8">
          <h2 className="font-serif text-2xl text-ink mb-3">Books & writings</h2>
          <p className="text-ink/70 font-sans mb-4 leading-relaxed">
            Browse published works with care: rich descriptions, beautiful covers, and reading or
            download when available.
          </p>
          <Link href="/books" className="text-saffron-dim font-sans text-sm hover:underline">
            Explore the library →
          </Link>
          {books.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-ink/60 font-sans border-t border-ink/10 pt-4">
              {books.map((b) => (
                <li key={String(b._id)}>
                  <Link href={`/books/${String(b._id)}`} className="hover:text-saffron-dim">
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="glass-panel p-6 md:p-10 text-center mb-8">
        <h2 className="font-serif text-2xl md:text-3xl text-ink mb-3">Live satsang</h2>
        <p className="text-ink/70 font-sans max-w-2xl mx-auto mb-6">
          When we are live, gather here for video and an optional sangat chat. The page opens clean
          and bright — focused on presence, not distraction.
        </p>
        <Link
          href="/live"
          className="inline-flex rounded-2xl bg-gold-soft/90 text-ink px-6 py-3 font-sans font-medium shadow-card hover:bg-gold-muted transition-colors"
        >
          Go to live stream
        </Link>
      </section>
    </div>
  );
}
