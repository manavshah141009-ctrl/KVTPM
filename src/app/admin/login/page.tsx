"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [err,      setErr]      = useState<string | null>(null);
  const [busy,     setBusy]     = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let msg = "Login failed";
        try {
          const j = JSON.parse(text) as { error?: string };
          msg = j.error || msg;
        } catch {
          msg = text?.trim()?.slice(0, 180) || `${res.status} ${res.statusText}` || msg;
        }
        setErr(msg);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "mt-1.5 w-full rounded-xl border border-ink/15 bg-white/80 px-4 py-3 text-sm font-sans " +
    "focus:outline-none focus:ring-2 focus:ring-saffron/30 placeholder:text-ink/30";

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-parchment"
      style={{ background: "radial-gradient(ellipse 100% 80% at 50% -20%, rgba(255,153,51,0.12), transparent 55%), linear-gradient(180deg, #f5f5dc, #faf6ea)" }}
    >
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-white/60 border border-saffron/20 shadow-glow-sm flex items-center justify-center text-3xl font-serif text-saffron">
          ॐ
        </div>
        <p className="font-serif text-xl text-ink">KarVicharTohPamm</p>
        <p className="text-xs text-ink/45 tracking-widest uppercase font-sans">Admin Dashboard</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass-panel p-6 shadow-glow">
        <h1 className="font-serif text-2xl text-ink mb-0.5">Sign in</h1>
        <p className="text-sm text-ink/50 mb-6 font-sans">Enter your admin credentials below</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50 font-sans">Email</span>
            <input
              type="email" autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls} placeholder="admin@example.com" required
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50 font-sans">Password</span>
            <input
              type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputCls} placeholder="••••••••" required
            />
          </label>

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700 font-sans">{err}</p>
            </div>
          )}

          <button
            type="submit" disabled={busy}
            className="w-full rounded-2xl bg-saffron text-white py-3.5 font-semibold font-sans
              shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50
              active:scale-95 transition-all text-base mt-2"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-ink/30 font-sans text-center">
        KarVicharTohPamm · Admin Area Only
      </p>
    </div>
  );
}
