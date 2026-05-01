import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import mongoose from "mongoose";
import { gdrivePdfPreviewUrl, gdriveDownloadUrl, isGdriveUrl } from "@/lib/gdrive";

type Props = { params: Promise<{ id: string }> };

import { ReadBookContent } from "./read-book-content";

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
    <ReadBookContent
      id={id}
      bookTitle={b.title}
      iframeSrc={iframeSrc}
      downloadHref={downloadHref}
    />
  );
}
