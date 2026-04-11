export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-soft-gradient text-ink font-sans antialiased">{children}</div>
  );
}
