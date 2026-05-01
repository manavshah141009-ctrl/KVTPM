import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import { BooksContent } from "./books-content";

export const revalidate = 120;

export default async function BooksPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let books: any[] = [];
  try {
    await dbConnect();
    books = await Book.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean() as any[];
  } catch {
    books = [];
  }

  return <BooksContent books={books} />;
}
