"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Search, Music, ArrowLeft, ExternalLink, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import type { Listing } from "@/types";

function SearchContent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/leaderboards/all-time?q=${encodeURIComponent(query.trim())}&limit=20`);
        const data = await res.json();
        if (data.items) {
          setResults(data.items);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 text-[var(--foreground)]">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Leaderboard
      </Link>

      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
          <Search className="w-7 h-7 text-[#FF5E1A]" />
          Search overcall.lol
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Find artists, bands, genres, or canonical web domains on the public board.
        </p>
      </div>

      {/* Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-[var(--text-dim)] absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by artist name, genre, or keyword..."
          className="w-full pl-12 pr-4 py-4 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[var(--brand-blue)] focus:ring-1 focus:ring-[var(--brand-blue)] rounded-2xl text-[var(--foreground)] text-base placeholder-[var(--text-dim)] outline-none shadow-xs transition"
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-[var(--text-dim)] text-xs animate-pulse">
            Searching public listings...
          </div>
        ) : query.trim() && results.length === 0 ? (
          <div className="bg-[var(--card-bg)] rounded-2xl p-10 text-center space-y-2 border border-[var(--card-border)] shadow-xs">
            <Music className="w-8 h-8 text-[var(--text-dim)] mx-auto opacity-40" />
            <h4 className="text-sm font-bold text-[var(--foreground)]">No matching artists found</h4>
            <p className="text-xs text-[var(--text-muted)]">
              Try searching with another keyword or claim this artist on the board.
            </p>
            <Link
              href="/claim"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-[var(--brand-orange)] text-white font-semibold text-xs hover:bg-[var(--brand-orange-hover)] transition shadow-xs"
            >
              Claim a Rank
            </Link>
          </div>
        ) : (
          results.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--card-bg)] rounded-2xl p-4 flex items-center justify-between gap-4 border border-[var(--card-border)] hover:border-[var(--brand-blue)] shadow-xs transition"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-[var(--subtle-bg)] border border-[var(--card-border)] flex items-center justify-center font-bold text-xs text-[var(--brand-orange)] shrink-0">
                  #{item.rank || "—"}
                </span>

                <div className="w-10 h-10 rounded-xl bg-[var(--subtle-bg)] border border-[var(--card-border)] overflow-hidden shrink-0 flex items-center justify-center text-[var(--text-dim)]">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-[var(--text-dim)]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/artist/${item.slug}`}
                      className="font-bold text-[var(--foreground)] hover:text-[var(--brand-blue)] text-sm truncate transition"
                    >
                      {item.display_name}
                    </Link>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--subtle-bg)] text-[var(--text-muted)] border border-[var(--card-border)] font-medium">
                      {item.category_name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-dim)] truncate mt-0.5">
                    {item.destination_url.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-[var(--text-dim)] block uppercase font-semibold">Total Volume</span>
                <span className="font-extrabold text-[var(--foreground)] text-sm font-mono">
                  {formatCurrency(item.total_paid_minor)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-dim)]">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
