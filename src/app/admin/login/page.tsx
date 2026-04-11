"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
          // If the backend threw and Next returned HTML, show status for debugging.
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

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-panel p-8 shadow-glow">
        <h1 className="font-serif text-2xl text-ink mb-1">Admin sign in</h1>
        <p className="text-sm text-ink/60 mb-6 font-sans">KarVicharTohPamm dashboard</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-ink/50">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-sm"
              required
            />
          </label>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-saffron text-white py-2.5 font-medium shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
