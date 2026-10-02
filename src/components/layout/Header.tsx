"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search, Eye } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dailyVisitors, setDailyVisitors] = useState<number>(14850);
  const [onlineCount, setOnlineCount] = useState<number>(42);

  // Poll live stats every 8 seconds
  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch("/api/v1/live-stats");
        const data = await res.json();
        if (data.dailyVisitors) setDailyVisitors(data.dailyVisitors);
        if (data.onlineCount) setOnlineCount(data.onlineCount);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo / Brand + Visitors Count + Online Count */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2.5 font-bold text-[var(--foreground)] tracking-tight text-lg group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-xs border border-[var(--card-border)] bg-white p-1 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="overcall.lol logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="font-black tracking-tight text-lg sm:text-xl">
                overcall<span className="text-[var(--brand-blue)]">.lol</span>
              </span>
            </Link>

            {/* Visitors Count & Online Count placed at Left right after logo */}
            <div className="hidden md:flex items-center space-x-2 text-xs">
              {/* Daily Visitors Count */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--subtle-bg)] border border-[var(--card-border)] text-[var(--text-muted)] font-mono text-[11px]">
                <Eye className="w-3 h-3 text-zinc-400" />
                <span>{dailyVisitors.toLocaleString()} today</span>
              </div>

              {/* Live Online Count with Pulsing Green Dot */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--subtle-bg)] border border-[var(--card-border)] text-[var(--text-muted)] font-mono text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{onlineCount} online</span>
              </div>
            </div>
          </div>

          {/* Right: Navigation Tabs + Search + Theme Toggle */}
          <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
            {/* Navigation Tabs at Right (Leaderboard, Daily, About, Rules) */}
            <nav className="flex items-center space-x-1 text-sm font-medium text-[var(--text-muted)]">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] transition"
              >
                Leaderboard
              </Link>
              <Link
                href="/daily"
                className="px-3 py-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] transition"
              >
                Daily
              </Link>
              <Link
                href="/about"
                className="px-3 py-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] transition"
              >
                About
              </Link>
              <Link
                href="/rules"
                className="px-3 py-1.5 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] transition"
              >
                Rules
              </Link>
            </nav>

            {/* Separator */}
            <div className="h-4 w-px bg-[var(--card-border)]" />

            {/* Swapped: Search icon first, then ThemeToggle */}
            <div className="flex items-center space-x-1.5">
              <Link
                href="/search"
                aria-label="Search leaderboard"
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)] transition"
                title="Search listings"
              >
                <Search className="w-4 h-4" />
              </Link>

              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex sm:hidden items-center space-x-2">
            {/* Mobile Online Dot */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--subtle-bg)] text-[10px] text-[var(--text-muted)] font-mono border border-[var(--card-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{onlineCount}</span>
            </div>

            <Link
              href="/search"
              aria-label="Search"
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <Search className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--foreground)] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[var(--card-border)] bg-[var(--background)] px-4 py-3 space-y-1 text-sm text-[var(--text-muted)]">
          <div className="flex items-center justify-between py-2 px-3 border-b border-[var(--card-border)] text-xs font-mono mb-2">
            <span>👁 {dailyVisitors.toLocaleString()} visits today</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {onlineCount} online
            </span>
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded hover:bg-[var(--subtle-bg)] hover:text-[var(--foreground)]"
          >
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-[var(--card-border)] bg-white p-0.5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="overcall.lol logo" className="w-full h-full object-contain rounded-md" />
            </div>
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/daily"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded hover:bg-[var(--subtle-bg)] hover:text-[var(--foreground)]"
          >
            Daily Archive
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded hover:bg-[var(--subtle-bg)] hover:text-[var(--foreground)]"
          >
            About
          </Link>
          <Link
            href="/rules"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded hover:bg-[var(--subtle-bg)] hover:text-[var(--foreground)]"
          >
            Rules
          </Link>
        </div>
      )}
    </header>
  );
}
