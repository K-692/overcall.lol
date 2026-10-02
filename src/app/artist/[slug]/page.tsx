import { notFound } from "next/navigation";
import Link from "next/link";
import { getListingBySlug } from "@/lib/ranking";
import { formatCurrency } from "@/lib/config";
import { ClaimWidget } from "@/components/claim/ClaimWidget";
import { ExternalLink, ArrowLeft, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    return { title: "Artist Not Found — overcall.lol" };
  }

  return {
    title: `${listing.display_name} — #${listing.rank || "—"} on overcall.lol | ${listing.category_name}`,
    description: `${listing.display_name} is ranked #${listing.rank || "—"} on overcall.lol. Total spend: ${formatCurrency(listing.total_paid_minor)}.`,
  };
}

export const dynamic = "force-dynamic";

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-[var(--foreground)]">
      {/* Back Link */}
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      {/* Artist Header */}
      <div className="border border-[var(--card-border)] rounded-2xl p-6 bg-[var(--card-bg)] space-y-4 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                {listing.display_name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-[var(--subtle-bg)] text-[var(--text-muted)] border border-[var(--card-border)] font-medium">
                {listing.category_name}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] mt-1">
              <a
                href={`/go/${listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--brand-blue)] flex items-center gap-1 transition"
              >
                <span>{listing.destination_url.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <span>{listing.click_count} public clicks</span>
            </div>
          </div>

          {/* Large Rank Pill */}
          <div className="text-left sm:text-right">
            <span className="text-xs text-[var(--text-dim)] block">Current Rank</span>
            <span className="text-3xl font-mono font-black text-[var(--brand-orange)]">
              #{listing.rank || "—"}
            </span>
          </div>
        </div>

        {/* Minimal Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--card-border)] text-xs">
          <div className="p-3.5 bg-[var(--subtle-bg)] border border-[var(--card-border)] rounded-xl">
            <span className="text-[var(--text-dim)] block text-[11px]">Total Paid</span>
            <span className="font-mono font-bold text-[var(--foreground)] text-base">
              {formatCurrency(listing.total_paid_minor)}
            </span>
          </div>
          <div className="p-3.5 bg-[var(--subtle-bg)] border border-[var(--card-border)] rounded-xl">
            <span className="text-[var(--text-dim)] block text-[11px]">Category Rank</span>
            <span className="font-mono font-bold text-[var(--brand-blue)] text-base">
              #{listing.category_rank || "—"}
            </span>
          </div>
          <div className="p-3.5 bg-[var(--subtle-bg)] border border-[var(--card-border)] rounded-xl">
            <span className="text-[var(--text-dim)] block text-[11px]">Today&apos;s Spend</span>
            <span className="font-mono font-bold text-[var(--foreground)] text-base">
              {formatCurrency(listing.today_spend_minor || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Raise Rank Form */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Raise this listing</h2>
        <ClaimWidget
          initialUrl={listing.canonical_identity}
          initialCategory={listing.category_slug}
          compact
        />
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--foreground)]">Public Transaction History</h2>
        <div className="border border-[var(--card-border)] rounded-2xl overflow-hidden bg-[var(--card-bg)] divide-y divide-[var(--card-border)] shadow-xs">
          {listing.history && listing.history.length > 0 ? (
            listing.history.map((tx: any, idx: number) => (
              <div key={idx} className="px-4 py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[var(--foreground)] capitalize block">
                    {tx.transaction_type === "raise" ? "Raise" : "Initial Claim"}
                  </span>
                  <span className="text-[var(--text-dim)] text-[11px]">
                    {new Date(tx.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className="font-mono font-bold text-[var(--brand-blue)]">
                  +{formatCurrency(tx.amount_minor)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-[var(--text-dim)]">
              No transactions recorded.
            </div>
          )}
        </div>
      </div>

      <div className="text-right">
        <Link
          href={`/report?listing_id=${listing.id}`}
          className="text-xs text-[var(--text-dim)] hover:text-red-500 inline-flex items-center gap-1 transition"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report listing</span>
        </Link>
      </div>
    </div>
  );
}
