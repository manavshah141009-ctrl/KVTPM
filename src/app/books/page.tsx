import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import { gdriveThumbnailUrl, isGdriveUrl } from "@/lib/gdrive";

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
      <header className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-2">Books</h1>
        <p className="text-ink/70 font-sans max-w-2xl leading-relaxed">
          Sacred texts and published works shared with care. Open a title to read online when a PDF
          is available, or save a copy for quiet offline reading.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="font-sans text-ink/60">New volumes are being prepared. Please visit again.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {books.map((b) => (
            <li key={String(b._id)}>
              <Link
                href={`/books/${String(b._id)}`}
                className="group block glass-panel overflow-hidden h-full hover:shadow-glow transition-shadow"
              >
                <div className="aspect-[3/4] relative bg-saffron/10 overflow-hidden">
                  {b.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={isGdriveUrl(b.coverUrl) ? gdriveThumbnailUrl(b.coverUrl, 600) : b.coverUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-serif text-4xl text-saffron/30">
                      ॐ
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-xl text-ink group-hover:text-saffron-dim line-clamp-2">
                    {b.title}
                  </h2>
                  {b.author && <p className="text-sm text-ink/55 mt-1 font-sans">{b.author}</p>}
                  <p className="text-sm text-ink/60 mt-2 line-clamp-3 font-sans">{b.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
