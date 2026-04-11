import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import mongoose from "mongoose";
import type { Metadata } from "next";
import { gdriveThumbnailUrl, gdriveDownloadUrl, isGdriveUrl } from "@/lib/gdrive";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return { title: "Book" };
  try {
    await dbConnect();
    const b = await Book.findOne({ _id: id, published: true }).lean();
    if (!b) return { title: "Book" };
    return { title: b.title, description: b.description.slice(0, 160) };
  } catch {
    return { title: "Book" };
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const b = await Book.findOne({ _id: id, published: true }).lean();
  if (!b) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <Link href="/books" className="text-sm font-sans text-saffron-dim hover:underline mb-6 inline-block">
        ← All books
      </Link>

      <div className="grid md:grid-cols-[260px_1fr] gap-8 md:gap-12 items-start">
        <div className="glass-panel overflow-hidden max-w-xs mx-auto md:mx-0 w-full">
          <div className="aspect-[3/4] relative bg-saffron/10 overflow-hidden">
            {b.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={isGdriveUrl(b.coverUrl) ? gdriveThumbnailUrl(b.coverUrl, 600) : b.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-serif text-6xl text-saffron/25">
                ॐ
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">{b.title}</h1>
          {b.author && <p className="text-ink/60 font-sans mb-4">By {b.author}</p>}
          <p className="text-ink/80 font-sans leading-relaxed whitespace-pre-line">{b.description}</p>

          <div className="flex flex-wrap gap-3 mt-8">
            {b.pdfUrl && (
              <>
                <a
                  href={isGdriveUrl(b.pdfUrl) ? gdriveDownloadUrl(b.pdfUrl) : b.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-2xl bg-saffron text-white px-5 py-2.5 font-sans font-medium shadow-glow-sm hover:bg-saffron-dim"
                >
                  Download PDF
                </a>
                <a
                  href={`/books/${String(b._id)}/read`}
                  className="inline-flex rounded-2xl border border-saffron/40 text-saffron-dim px-5 py-2.5 font-sans font-medium hover:bg-white/50"
                >
                  Read online
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
