"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Music, Trophy, ChevronRight, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import { ClaimWidget } from "@/components/claim/ClaimWidget";
import type { Category, Listing } from "@/types";

interface CategoryWithStats extends Category {
  listing_count: number;
  top_artist_name?: string;
  top_bid_minor?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);

  // Load categories
  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setCategories(data.items);
          // Default selection is the first category
          setSelectedCategory(data.items[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch listings whenever selectedCategory changes
  useEffect(() => {
    if (!selectedCategory) return;
    setLoadingListings(true);
    fetch(`/api/v1/leaderboards/all-time?category=${selectedCategory.slug}&limit=25`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setListings(data.items);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingListings(false));
  }, [selectedCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-[var(--foreground)]">
      {/* Back to Leaderboard */}
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Music Categories</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          List view of independent pay-to-rank charts by genre. Default selection is the first category.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-[var(--text-dim)] animate-pulse">
          Loading categories...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Categories List View (Left Column) */}
          <div className="lg:col-span-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-xs divide-y divide-[var(--card-border)]">
            <div className="p-3 bg-[var(--subtle-bg)] text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              All Genres ({categories.length})
            </div>

            <div className="divide-y divide-[var(--card-border)] max-h-[560px] overflow-y-auto">
              {categories.map((cat, idx) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left p-3.5 flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? "bg-[var(--brand-blue)] text-white font-semibold"
                        : "hover:bg-[var(--subtle-bg)] text-[var(--foreground)]"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isSelected ? "bg-white/20 text-white" : "bg-[var(--subtle-bg)] text-[var(--text-dim)]"
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs sm:text-sm truncate block">
                          {cat.name}
                        </span>
                      </div>

                      <div className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-white/80" : "text-[var(--text-dim)]"}`}>
                        {cat.top_artist_name ? (
                          <span>#1 {cat.top_artist_name}</span>
                        ) : (
                          <span className="italic">Spot #1 open</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-1">
                      <span className={`text-xs font-mono font-bold ${isSelected ? "text-white" : "text-[var(--brand-orange)]"}`}>
                        {formatCurrency(cat.top_bid_minor || 0)}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-[var(--text-dim)]"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Category Leaderboard List View (Right Column) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedCategory && (
              <>
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-blue)]" />
                      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                        {selectedCategory.name}
                      </h2>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Top ranking artists in {selectedCategory.name}. Submit your music to compete.
                    </p>
                  </div>

                  <Link
                    href={`/category/artist/music/${selectedCategory.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-[var(--subtle-bg)] hover:bg-[var(--card-border)] text-xs font-semibold border border-[var(--card-border)] text-[var(--foreground)] transition text-center shrink-0"
                  >
                    View dedicated page →
                  </Link>
                </div>

                {/* Inline Claim for this Category */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block px-1">
                    Claim #1 in {selectedCategory.name}
                  </span>
                  <ClaimWidget
                    categories={categories}
                    initialCategory={selectedCategory.slug}
                    compact
                  />
                </div>

                {/* Category Rankings List View Table */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-[var(--subtle-bg)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--card-border)]">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-7">Artist</div>
                    <div className="col-span-3 text-right">Total Paid</div>
                  </div>

                  {loadingListings ? (
                    <div className="py-10 text-center text-xs text-[var(--text-dim)] animate-pulse">
                      Loading {selectedCategory.name} rankings...
                    </div>
                  ) : listings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[var(--text-dim)] space-y-2">
                      <Music className="w-6 h-6 mx-auto opacity-30" />
                      <p>No artists listed in {selectedCategory.name} yet.</p>
                      <p className="text-[11px] text-[var(--brand-blue)] font-semibold">
                        Be the first to claim #1 for $1!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--card-border)]">
                      {listings.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-[var(--subtle-bg)] transition text-xs"
                        >
                          <div className="col-span-2 text-center font-mono font-bold">
                            {item.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-orange-subtle)] text-[var(--brand-orange)] font-bold text-xs border border-[var(--brand-orange)]/30">
                                #1
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold text-xs border border-[var(--brand-blue)]/30">
                                #2
                              </span>
                            ) : item.rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold text-xs border border-[var(--brand-blue)]/20">
                                #3
                              </span>
                            ) : (
                              <span className="text-[var(--text-dim)]">#{item.rank}</span>
                            )}
                          </div>

                          <div className="col-span-7 min-w-0 pr-2">
                            <Link
                              href={`/artist/${item.slug}`}
                              className="font-bold text-[var(--foreground)] hover:text-[var(--brand-blue)] truncate block transition"
                            >
                              {item.display_name}
                            </Link>
                            <a
                              href={`/go/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[var(--text-dim)] hover:text-[var(--brand-blue)] flex items-center gap-1 truncate mt-0.5"
                            >
                              <span className="truncate">{item.destination_url.replace(/^https?:\/\//, "")}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                            </a>
                          </div>

                          <div className="col-span-3 text-right font-mono font-bold text-[var(--foreground)]">
                            {formatCurrency(item.total_paid_minor)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
