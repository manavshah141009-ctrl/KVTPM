import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-saffron-dim uppercase tracking-[0.2em] text-xs mb-4 font-sans">You are offline</p>
      <h1 className="font-serif text-3xl text-ink mb-3">Stillness has no signal</h1>
      <p className="text-ink/70 font-sans max-w-md mb-8 leading-relaxed">
        KarVicharTohPamm keeps a light shell available without the network. Reconnect to resume
        listening and reading.
      </p>
      <Link
        href="/"
        className="rounded-2xl bg-saffron text-white px-6 py-3 font-sans font-medium shadow-glow-sm"
      >
        Try again
      </Link>
    </div>
  );
}
