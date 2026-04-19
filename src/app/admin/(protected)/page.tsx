import Link from "next/link";

const CARDS = [
  {
    href: "/admin/tracks",
    icon: "🎵",
    color: "from-saffron/10 to-saffron/5",
    border: "border-saffron/20",
    title: "Audio Tracks",
    desc: "Add, reorder, and publish bhajans for the 24/7 synchronized radio.",
  },
  {
    href: "/admin/books",
    icon: "📖",
    color: "from-gold-soft/15 to-gold-soft/5",
    border: "border-gold-soft/25",
    title: "Books",
    desc: "Manage covers, descriptions, and PDF Drive links.",
  },
  {
    href: "/admin/live",
    icon: "📡",
    color: "from-emerald-50 to-white/30",
    border: "border-emerald-200/60",
    title: "Live Stream",
    desc: "Set YouTube Live ID, toggle the live indicator, and add chat embed.",
    wide: true,
  },
];

export default function AdminHomePage() {
  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-serif text-2xl md:text-3xl text-ink mb-1">Overview</h1>
        <p className="text-ink/60 font-sans text-sm md:text-base leading-relaxed">
          Welcome to the KarVicharTohPamm admin dashboard. Manage audio, books, and live satsang.
        </p>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`glass-panel p-5 bg-gradient-to-br ${c.color} border ${c.border}
              hover:shadow-glow transition-all active:scale-[.98] group
              ${c.wide ? "sm:col-span-2" : ""}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
              <div>
                <h2 className="font-serif text-base md:text-lg text-ink mb-0.5">{c.title}</h2>
                <p className="text-xs md:text-sm text-ink/60 font-sans leading-relaxed">{c.desc}</p>
              </div>
              <span className="ml-auto text-ink/25 group-hover:text-saffron-dim text-lg transition-colors shrink-0">›</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Status strip */}
      <div className="mt-6 glass-panel p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft shrink-0" />
        <p className="text-xs text-ink/55 font-sans">
          All systems operational · Zero-cost timestamp radio active
        </p>
      </div>

    </div>
  );
}
