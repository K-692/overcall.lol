import Link from "next/link";
import { ClaimWidget } from "@/components/claim/ClaimWidget";
import { Sparkles, Trophy, ShieldCheck, Flame, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim a Rank — overcall.lol",
  description: "Put your artist or band on the public leaderboard. Pay more to rank higher.",
};

export default function ClaimPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 text-[var(--foreground)]">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[#FF5E1A] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-[#FF5E1A] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pay-to-Rank Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          Claim Your Position on overcall.lol
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-lg mx-auto">
          Submit your official music link, pick your subcategory, and enter your bid. Your rank updates in real-time upon confirmed payment.
        </p>
      </div>

      {/* Primary Widget */}
      <div className="max-w-2xl mx-auto">
        <ClaimWidget />
      </div>

      {/* Core Rules Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-[var(--card-border)] text-xs text-[var(--text-muted)]">
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1.5 shadow-xs">
          <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[var(--brand-orange)]" />
            Deterministic Ranks
          </span>
          <p>
            Positions are calculated strictly by confirmed cumulative total. Equal bids are broken by earliest confirmation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1.5 shadow-xs">
          <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[var(--brand-orange)]" />
            Pay-The-Difference
          </span>
          <p>
            Returning artists never pay twice. Bidding again charges only the incremental amount needed to hit your target.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1.5 shadow-xs">
          <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Public & Auditable
          </span>
          <p>
            Every transaction is recorded on public ledgers. Private card details and personal emails are never published.
          </p>
        </div>
      </div>
    </div>
  );
}
