"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface Props {
  id: string;
  bookTitle: string;
  iframeSrc: string;
  downloadHref: string;
}

export function ReadBookContent({ id, bookTitle, iframeSrc, downloadHref }: Props) {
  const { tr } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 min-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href={`/books/${id}`} className="text-sm font-sans text-saffron-dim hover:underline">
          {tr("read.back")}
        </Link>
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-sans text-ink/60 hover:text-saffron-dim"
        >
          {tr("read.openNewTab")}
        </a>
      </div>
      <div className="flex-1 glass-panel overflow-hidden min-h-[70vh]">
        <iframe
          title={bookTitle}
          src={iframeSrc}
          className="w-full h-[75vh] md:h-[80vh] border-0"
          allow="autoplay"
        />
      </div>
    </div>
  );
}
