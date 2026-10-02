import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--background)] text-[var(--text-dim)] py-8 px-4 text-xs transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg overflow-hidden border border-[var(--card-border)] bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="overcall.lol logo" className="w-full h-full object-contain rounded-md" />
          </div>
          <span className="font-bold text-[var(--foreground)]">overcall<span className="text-[var(--brand-blue)]">.lol</span></span>
          <span>— Pay more to rank higher. Public by default. © {currentYear}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--brand-blue)] transition">Leaderboard</Link>
          <Link href="/daily" className="hover:text-[var(--brand-blue)] transition">Daily</Link>
          <Link href="/about" className="hover:text-[var(--brand-blue)] transition">About</Link>
          <Link href="/rules" className="hover:text-[var(--brand-blue)] transition">Rules</Link>
          <Link href="/terms" className="hover:text-[var(--brand-blue)] transition">Terms</Link>
          <Link href="/privacy" className="hover:text-[var(--brand-blue)] transition">Privacy</Link>
          <Link href="/report" className="hover:text-red-500 transition">Report</Link>
        </div>
      </div>
    </footer>
  );
}
