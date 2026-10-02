"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Trophy, CheckCircle2, ArrowRight, Share2, Music, ExternalLink, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import type { Listing } from "@/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing_id");

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#fbbf24"],
    });

    if (listingId) {
      // Fetch latest listing state from API
      fetch(`/api/v1/leaderboards/all-time?limit=100`)
        .then((r) => r.json())
        .then((data) => {
          const found = data.items?.find((item: Listing) => item.id === listingId);
          if (found) {
            setListing(found);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [listingId]);

  const handleShare = () => {
    const url = listing ? `${window.location.origin}/artist/${listing.slug}` : window.location.origin;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[var(--secondary)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl text-center relative z-10">
        {/* Animated Check icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 mb-6 shadow-xl">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--foreground)] mb-2">
          Rank Locked In!
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-8">
          Your payment was confirmed. The leaderboard has been updated in real-time.
        </p>

        {loading ? (
          <div className="py-8 text-[var(--text-muted)] text-sm">Calculating your authoritative rank...</div>
        ) : listing ? (
          <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 mb-8 text-left space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--card-border)] flex items-center justify-center text-[var(--primary)] overflow-hidden">
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--foreground)] leading-tight">{listing.display_name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)]">
                    {listing.category_name}
                  </span>
                </div>
              </div>

              {/* Current Rank Badge */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-[var(--text-muted)] font-medium">Global Rank</span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--secondary)]/15 border border-[var(--secondary)]/30 text-[var(--secondary)] font-black text-xl">
                  <Trophy className="w-4 h-4 text-[var(--secondary)]" />
                  #{listing.rank || "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--card-border)] text-xs">
              <div className="p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
                <span className="text-[var(--text-muted)] block mb-1">Total Paid Volume</span>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {formatCurrency(listing.total_paid_minor)}
                </span>
              </div>
              <div className="p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl">
                <span className="text-[var(--text-muted)] block mb-1">Public Clicks</span>
                <span className="text-lg font-bold text-emerald-500">
                  {listing.click_count}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-2xl p-6 mb-8 text-sm text-[var(--text-muted)]">
            Payment successfully processed and applied to the public board!
          </div>
        )}

        {/* Action CTAs */}
        <div className="space-y-3">
          {listing && (
            <Link
              href={`/artist/${listing.slug}`}
              className="w-full py-3.5 px-4 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>View Public Artist Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/10 border border-[var(--card-border)] text-[var(--foreground)] font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[var(--primary)]" />
              <span>{copied ? "Link Copied!" : "Share Position"}</span>
            </button>

            <Link
              href="/"
              className="flex-1 py-3 px-4 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/10 border border-[var(--card-border)] text-[var(--foreground)] font-medium text-xs transition flex items-center justify-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-[var(--secondary)]" />
              <span>Full Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--foreground)]">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
