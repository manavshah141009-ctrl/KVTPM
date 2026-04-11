import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-ink mb-3">Overview</h1>
      <p className="text-ink/70 font-sans mb-8 leading-relaxed">
        Welcome to the KarVicharTohPamm admin space. Manage continuous audio, published books, and
        the live satsang connection from the sections on the left.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/tracks" className="glass-panel p-5 hover:shadow-glow transition-shadow">
          <h2 className="font-serif text-lg text-ink mb-1">Audio tracks</h2>
          <p className="text-sm text-ink/60">Upload and order bhajans for the 24/7 player.</p>
        </Link>
        <Link href="/admin/books" className="glass-panel p-5 hover:shadow-glow transition-shadow">
          <h2 className="font-serif text-lg text-ink mb-1">Books</h2>
          <p className="text-sm text-ink/60">Covers, descriptions, and PDF links.</p>
        </Link>
        <Link href="/admin/live" className="glass-panel p-5 hover:shadow-glow transition-shadow sm:col-span-2">
          <h2 className="font-serif text-lg text-ink mb-1">Live stream</h2>
          <p className="text-sm text-ink/60">
            YouTube Live ID or embed URL, optional HLS, and chat embed HTML.
          </p>
        </Link>
      </div>
    </div>
  );
}
