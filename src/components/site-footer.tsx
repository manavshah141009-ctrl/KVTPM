import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-saffron/15 bg-parchment/60">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div>
          <p className="font-serif text-xl text-ink">KarVicharTohPamm</p>
          <p className="text-sm text-ink/60 mt-1 max-w-md font-sans">
            A gentle space for reflection — sacred sound, timeless books, and shared satsang.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm font-sans">
          <Link href="/listen" className="text-saffron-dim hover:text-saffron">
            24/7 Listen
          </Link>
          <Link href="/books" className="text-saffron-dim hover:text-saffron">
            Books
          </Link>
          <Link href="/live" className="text-saffron-dim hover:text-saffron">
            Live Satsang
          </Link>
          <Link href="/admin/login" className="text-ink/40 hover:text-ink/60 text-xs mt-2">
            Admin
          </Link>
        </div>
      </div>
      <div className="text-center text-xs text-ink/40 py-4 border-t border-ink/5 font-sans">
        © {new Date().getFullYear()} KarVicharTohPamm. Made with calm intent.
      </div>
    </footer>
  );
}
