import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminFromCookies } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/logout-button";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tracks", label: "Audio" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/live", label: "Live" },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminFromCookies();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 shrink-0 border-r border-saffron/15 bg-white/40 backdrop-blur-md p-4 flex flex-col gap-6">
        <div>
          <p className="font-serif text-lg text-ink">KVTP Admin</p>
          <p className="text-xs text-ink/50 truncate">{admin.email}</p>
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-xl px-3 py-2 text-sm text-ink/80 hover:bg-saffron/10 hover:text-saffron-dim"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-ink/10">
          <Link href="/" className="text-xs text-saffron-dim hover:underline block mb-3">
            ← Public site
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-auto">{children}</main>
    </div>
  );
}
