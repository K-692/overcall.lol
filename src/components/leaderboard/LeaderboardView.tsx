"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";
import { ExternalLink, Music, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { getFaviconUrl } from "@/lib/identity/normalizer";
import type { Listing } from "@/types";

interface LeaderboardViewProps {
  listings: Listing[];
  timeframe: "all-time" | "today";
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

function getPaginationItems(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // When near the start (matches screenshot: < (1) 2 3 4 ... 61 >)
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "...", totalPages];
  }

  // When near the end
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

function LeaderboardAvatar({
  imageUrl,
  destinationUrl,
  canonicalIdentity,
  displayName,
  isFirst,
}: {
  imageUrl?: string | null;
  destinationUrl?: string;
  canonicalIdentity?: string;
  displayName: string;
  isFirst: boolean;
}) {
  const autoFavicon = getFaviconUrl(destinationUrl || canonicalIdentity || "");
  const initialSrc = imageUrl || autoFavicon || "";
  const [src, setSrc] = useState(initialSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(imageUrl || autoFavicon || "");
    setFailed(false);
  }, [imageUrl, autoFavicon]);

  const isFavicon = Boolean(src && (src.includes("google.com/s2/favicons") || src.includes("favicon")));

  return (
    <div
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-2xs border relative z-10 bg-transparent ${
        isFirst
          ? "border-[#E5CA68] shadow-xs shadow-amber-500/20"
          : "border-[var(--card-border)]"
      }`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={displayName}
          onError={() => {
            if (src !== autoFavicon && autoFavicon) {
              setSrc(autoFavicon);
            } else {
              setFailed(true);
            }
          }}
          className={
            isFavicon
              ? "w-7 h-7 sm:w-8 sm:h-8 object-contain p-0.5 rounded-lg"
              : "w-full h-full object-cover"
          }
        />
      ) : (
        <Music
          className={`w-5 h-5 ${
            isFirst ? "text-amber-500" : "text-[var(--text-dim)]"
          }`}
        />
      )}
    </div>
  );
}

export function LeaderboardView({
  listings,
  timeframe,
  currentPage,
  totalPages,
  totalCount,
  pageSize = 50,
  onPageChange,
  loading = false,
}: LeaderboardViewProps) {
  return (
    <div className="w-full space-y-3">
      {loading ? (
        <div className="py-20 text-center text-[var(--text-dim)] text-xs bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
          Loading standings...
        </div>
      ) : listings.length === 0 ? (
        <div className="py-20 text-center space-y-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
          <p className="text-[var(--text-muted)] text-sm">No listings found in this category.</p>
          <Link
            href="/claim"
            className="inline-block text-xs text-[#FF5E1A] font-semibold hover:underline"
          >
            Be the first to claim #1
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((item) => {
            const isFirst = item.rank === 1;

            const cardClasses = isFirst
              ? "relative overflow-hidden bg-transparent border-2 border-amber-300/90 dark:border-amber-400/80 shadow-[0_0_24px_rgba(250,204,21,0.4)] animate-yellow-glow hover:border-amber-400 dark:hover:border-amber-300"
              : "bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--text-dim)]/50 hover:bg-[var(--subtle-bg)] shadow-2xs";

            const amountMinor =
              timeframe === "today"
                ? (item.today_spend_minor ?? item.total_paid_minor)
                : item.total_paid_minor;

            const domain = item.destination_url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

            return (
              <a
                key={item.id}
                href={`/go/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${item.display_name} (${domain}) in new tab`}
                className={`p-4 sm:p-5 rounded-2xl transition flex items-center justify-between gap-3 sm:gap-4 group cursor-pointer block ${cardClasses}`}
              >
                {/* Continuous Shimmer Light Beam on #1 */}
                {isFirst && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                    <div className="absolute -inset-y-12 left-0 w-1/3 bg-gradient-to-r from-transparent via-yellow-200/50 dark:via-yellow-300/25 to-transparent blur-[3px] animate-gold-shimmer" />
                  </div>
                )}

                {/* Left Area: Rank + Avatar + Details */}
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1 relative z-10">
                  {/* Rank Number / Offset Orange #1 Badge with Glowing Yellow Border */}
                  {isFirst ? (
                    <div className="w-11 sm:w-14 shrink-0 flex items-center justify-center">
                      <span className="font-mono font-black text-lg sm:text-2xl px-2.5 sm:px-3 py-1 rounded-xl bg-transparent text-[#FF5E1A] shadow-[0_0_16px_rgba(250,204,21,0.45)] border-2 border-amber-300 dark:border-amber-400 tracking-tight">
                        #1
                      </span>
                    </div>
                  ) : (
                    <div className="w-9 sm:w-11 text-center shrink-0">
                      <span className="font-mono block tracking-tight text-[var(--text-dim)] font-bold text-lg sm:text-xl group-hover:text-[var(--foreground)] transition">
                        #{item.rank}
                      </span>
                    </div>
                  )}

                  {/* Thumbnail Avatar with Favicon Fallback */}
                  <LeaderboardAvatar
                    imageUrl={item.image_url}
                    destinationUrl={item.destination_url}
                    canonicalIdentity={item.canonical_identity}
                    displayName={item.display_name}
                    isFirst={isFirst}
                  />

                  {/* Content Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Title + External Link icon */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="font-bold text-sm sm:text-base tracking-tight truncate text-[var(--foreground)] group-hover:text-[#FF5E1A] transition inline-flex items-center gap-1.5"
                      >
                        <span>{item.display_name}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:text-[#FF5E1A] transition" />
                      </span>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1 leading-normal">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata Line */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] text-[var(--text-dim)] flex-wrap pt-0.5">
                      <span className="inline-flex items-center gap-1 font-medium text-[var(--text-muted)]">
                        <Tag className="w-3 h-3 text-[var(--text-dim)]" />
                        {item.category_name}
                      </span>
                      <span>·</span>
                      <span className="truncate max-w-[150px] font-mono text-[var(--text-dim)] group-hover:text-[var(--foreground)] transition">
                        {domain}
                      </span>
                      <span>·</span>
                      <span>{item.click_count.toLocaleString()} clicks</span>
                    </div>
                  </div>
                </div>

                {/* Right Area: Paid Amount */}
                <div className="text-right shrink-0 pl-2 relative z-10">
                  <span
                    className={`font-mono block tracking-tight ${
                      isFirst
                        ? "text-[#FF5E1A] font-black text-base sm:text-xl drop-shadow-xs"
                        : "text-[#FF5E1A] font-bold text-sm sm:text-lg"
                    }`}
                  >
                    {formatCurrency(amountMinor)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Screenshot-Accurate Orange Page Navigation Footer */}
      {!loading && listings.length > 0 && (
        <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-2.5">
          {/* Page Navigation Row */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 font-mono text-sm sm:text-base">
            {/* Left Chevron */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="p-1 text-[#D96B52] dark:text-[#FF5E1A] hover:opacity-75 disabled:text-zinc-300 dark:disabled:text-zinc-700 disabled:hover:opacity-100 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>

            {/* Page Numbers */}
            {getPaginationItems(currentPage, totalPages).map((item, idx) => {
              if (item === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-zinc-400 dark:text-zinc-500 font-sans px-0.5 select-none"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = item as number;
              const isActive = pageNum === currentPage;

              if (isActive) {
                return (
                  <span
                    key={`page-${pageNum}`}
                    className="w-8 h-8 rounded-full bg-[#D96B52] dark:bg-[#FF5E1A] text-white font-bold flex items-center justify-center shadow-xs"
                  >
                    {pageNum}
                  </span>
                );
              }

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className="text-[#D96B52] dark:text-[#FF5E1A] font-semibold hover:opacity-80 px-1 py-0.5 transition cursor-pointer"
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Right Chevron */}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="p-1 text-[#D96B52] dark:text-[#FF5E1A] hover:opacity-75 disabled:text-zinc-300 dark:disabled:text-zinc-700 disabled:hover:opacity-100 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Range Counter (e.g. 1 - 50 of 3,026) */}
          {(() => {
            const displayTotal = totalCount !== undefined ? totalCount : listings.length;
            const effectivePageSize = pageSize || 50;
            const displayStart = displayTotal === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;
            const displayEnd = Math.min(currentPage * effectivePageSize, displayTotal);
            return (
              <div className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-sans tracking-normal font-normal">
                {displayStart} - {displayEnd} of {displayTotal.toLocaleString()}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
