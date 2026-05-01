"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { gdriveThumbnailUrl, gdriveDownloadUrl, isGdriveUrl } from "@/lib/gdrive";

interface Props {
  book: any;
}

export function BookDetailContent({ book }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <Link href="/books" className="text-sm font-sans text-saffron-dim hover:underline mb-6 inline-block">
        {tr("books.back")}
      </Link>

      <div className="grid md:grid-cols-[260px_1fr] gap-8 md:gap-12 items-start">
        <div className="glass-panel overflow-hidden max-w-xs mx-auto md:mx-0 w-full">
          <div className="aspect-[3/4] relative bg-saffron/10 overflow-hidden">
            {book.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={isGdriveUrl(book.coverUrl) ? gdriveThumbnailUrl(book.coverUrl, 600) : book.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-serif text-6xl text-saffron/25">
                ॐ
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">{book.title}</h1>
          {book.author && <p className="text-ink/60 font-sans mb-4">{tr("books.by")} {book.author}</p>}
          <p className="text-ink/80 font-sans leading-relaxed whitespace-pre-line">{book.description}</p>

          <div className="flex flex-wrap gap-3 mt-8">
            {book.pdfUrl && (
              <>
                <a
                  href={isGdriveUrl(book.pdfUrl) ? gdriveDownloadUrl(book.pdfUrl) : book.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-2xl bg-saffron text-white px-5 py-2.5 font-sans font-medium shadow-glow-sm hover:bg-saffron-dim"
                >
                  {tr("books.download")}
                </a>
                <Link
                  href={`/books/${String(book._id)}/read`}
                  className="inline-flex rounded-2xl border border-saffron/40 text-saffron-dim px-5 py-2.5 font-sans font-medium hover:bg-white/50"
                >
                  {tr("books.readOnline")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
