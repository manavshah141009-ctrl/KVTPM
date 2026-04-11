import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import mongoose from "mongoose";
import { gdrivePdfPreviewUrl, gdriveDownloadUrl, isGdriveUrl } from "@/lib/gdrive";

type Props = { params: Promise<{ id: string }> };

export default async function ReadBookPage({ params }: Props) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await dbConnect();
  const b = await Book.findOne({ _id: id, published: true }).lean();
  if (!b?.pdfUrl) notFound();

  // Convert Drive share links to embeddable/downloadable forms
  const iframeSrc = isGdriveUrl(b.pdfUrl)
    ? gdrivePdfPreviewUrl(b.pdfUrl)
    : b.pdfUrl;
  const downloadHref = isGdriveUrl(b.pdfUrl)
    ? gdriveDownloadUrl(b.pdfUrl)
    : b.pdfUrl;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 min-h-[80vh] flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <Link href={`/books/${id}`} className="text-sm font-sans text-saffron-dim hover:underline">
          ← Back to book
        </Link>
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-sans text-ink/60 hover:text-saffron-dim"
        >
          Open in new tab
        </a>
      </div>
      <div className="flex-1 glass-panel overflow-hidden min-h-[70vh]">
        <iframe
          title={b.title}
          src={iframeSrc}
          className="w-full h-[75vh] md:h-[80vh] border-0"
          allow="autoplay"
        />
      </div>
    </div>
  );
}
