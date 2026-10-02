import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rules — overcall.lol",
  description: "Learn the official rules of the overcall.lol public pay-to-rank leaderboard. Simple, transparent, and deterministic.",
};

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 text-[var(--foreground)]">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[#FF5E1A] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          overcall.lol Rules
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl">
          overcall.lol is a public, deterministic pay-to-rank leaderboard. No black-box algorithms, no editorial gatekeeping, and no follower games.
        </p>
      </div>

      {/* The Core Formula */}
      <div className="rounded-3xl p-8 border border-[var(--card-border)] bg-[var(--card-bg)] text-center space-y-3 shadow-xs">
        <span className="text-xs uppercase tracking-wider text-[#FF5E1A] font-bold">The Core Principle</span>
        <div className="text-2xl sm:text-4xl font-black text-[var(--foreground)] font-mono">
          Pay More → Rank Higher
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
          Your cumulative confirmed spend determines your standing. That is the only ranking rule on the platform.
        </p>
      </div>

      {/* Detailed Steps */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold">The Three-Step Loop</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 border border-[var(--card-border)] bg-[var(--card-bg)] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-[var(--foreground)] text-base">Submit a Link</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Provide any public destination link: Spotify, SoundCloud, YouTube, personal site, or product page. Select your category.
            </p>
          </div>

          <div className="rounded-2xl p-6 border border-[var(--card-border)] bg-[var(--card-bg)] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF5E1A] font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-[var(--foreground)] text-base">Select Your Bid</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Choose your cumulative bid amount (minimum $1). If you already have a listing, our system charges only the difference to reach your new target!
            </p>
          </div>

          <div className="rounded-2xl p-6 border border-[var(--card-border)] bg-[var(--card-bg)] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-[var(--foreground)] text-base">Instant Real-Time Placement</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              As soon as payment confirms, your listing takes its calculated rank immediately on public charts. No review queue delay.
            </p>
          </div>
        </div>
      </div>

      {/* Rules of Engagement */}
      <div className="rounded-3xl p-8 border border-[var(--card-border)] bg-[var(--subtle-bg)] space-y-6">
        <h2 className="text-xl font-bold">Rules of the Board</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] space-y-1">
            <h4 className="font-bold text-[var(--foreground)]">Pay the Difference</h4>
            <p className="text-[var(--text-muted)]">
              Already have a $50 bid? To climb to an $80 rank, you pay only $30. Your cumulative spend increases automatically.
            </p>
          </div>
          <div className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] space-y-1">
            <h4 className="font-bold text-[var(--foreground)]">Deterministic Tie-Breaks</h4>
            <p className="text-[var(--text-muted)]">
              Equal bids are resolved by timestamp order. The listing confirmed earlier stays above the newcomer.
            </p>
          </div>
          <div className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] space-y-1">
            <h4 className="font-bold text-[var(--foreground)]">Midnight UTC Daily Resets</h4>
            <p className="text-[var(--text-muted)]">
              Today&apos;s board resets at 00:00 UTC daily. All-Time board never resets and accumulates lifetime volume.
            </p>
          </div>
          <div className="p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] space-y-1">
            <h4 className="font-bold text-[var(--foreground)]">All Payments Final</h4>
            <p className="text-[var(--text-muted)]">
              Rankings change immediately upon payment confirmation. No refunds are granted for being subsequently outranked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
