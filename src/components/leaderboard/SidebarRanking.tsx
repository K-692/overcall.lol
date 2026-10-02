"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Music } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import { getFaviconUrl } from "@/lib/identity/normalizer";
import type { Listing } from "@/types";

interface SidebarRankingProps {
  currentTimeframe: "all-time" | "today";
  onSwitchTimeframe: (tf: "all-time" | "today") => void;
  selectedCategory?: string;
}

function SidebarThumbnail({
  imageUrl,
  destinationUrl,
  canonicalIdentity,
  displayName,
}: {
  imageUrl?: string | null;
  destinationUrl?: string;
  canonicalIdentity?: string;
  displayName: string;
}) {
  const autoFavicon = getFaviconUrl(destinationUrl || canonicalIdentity || "");
  const [src, setSrc] = useState(imageUrl || autoFavicon || "");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(imageUrl || autoFavicon || "");
    setFailed(false);
  }, [imageUrl, autoFavicon]);

  const isFavicon = Boolean(src && (src.includes("google.com/s2/favicons") || src.includes("favicon")));

  return (
    <div className="w-7 h-7 rounded-lg overflow-hidden bg-[var(--subtle-bg)] border border-[var(--card-border)] flex items-center justify-center shrink-0">
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
              ? "w-4 h-4 object-contain"
              : "w-full h-full object-cover"
          }
        />
      ) : (
        <Music className="w-3.5 h-3.5 text-[var(--text-dim)]" />
      )}
    </div>
  );
}

export function SidebarRanking({
  currentTimeframe,
  onSwitchTimeframe,
  selectedCategory = "all",
}: SidebarRankingProps) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // When currently in all-time, sidebar shows Today's ranking.
  // When currently in today, sidebar shows All-time ranking.
  const targetTimeframe = currentTimeframe === "all-time" ? "today" : "all-time";
  const title = targetTimeframe === "today" ? "Today's ranking" : "All-time ranking";

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const endpoint =
      targetTimeframe === "today"
        ? "/api/v1/leaderboards/today"
        : "/api/v1/leaderboards/all-time";

    const params = new URLSearchParams({ limit: "10", page: "1" });
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    fetch(`${endpoint}?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.items) {
          setItems(data.items.slice(0, 10));
        }
      })
      .catch((err) => console.error("Sidebar ranking fetch error:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetTimeframe, selectedCategory]);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
        <div className="flex items-center space-x-2">
          {targetTimeframe === "today" ? (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs shadow-red-500/80 animate-pulse" />
          ) : (
            <Trophy className="w-4 h-4 text-[#FF5E1A]" />
          )}
          <h3 className="font-bold text-sm text-[var(--foreground)] tracking-tight">
            {title} (Top 10)
          </h3>
        </div>

        <button
          onClick={() => onSwitchTimeframe(targetTimeframe)}
          className="text-xs text-[#FF5E1A] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer transition"
        >
          <span>See all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-[var(--text-dim)]">
          Loading {title.toLowerCase()}...
        </div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-xs text-[var(--text-muted)]">
          No bids recorded {targetTimeframe === "today" ? "today yet" : "yet"}.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-none">
          {items.map((item, index) => {
            const rank = item.rank || index + 1;
            const amountMinor =
              targetTimeframe === "today"
                ? (item as unknown as { today_spend_minor?: number }).today_spend_minor ?? item.total_paid_minor
                : item.total_paid_minor;

            return (
              <a
                key={item.id || item.slug || index}
                href={`/go/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-[var(--subtle-bg)] transition group cursor-pointer"
                title={`Open ${item.display_name} in new tab`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  {/* Rank */}
                  <span
                    className={`text-xs font-mono w-4 text-center shrink-0 ${
                      rank === 1 ? "text-[#FF5E1A] font-black" : "text-[var(--text-dim)] font-bold"
                    }`}
                  >
                    #{rank}
                  </span>

                  {/* Thumbnail with Favicon Auto-Resolution */}
                  <SidebarThumbnail
                    imageUrl={item.image_url}
                    destinationUrl={item.destination_url}
                    canonicalIdentity={item.canonical_identity}
                    displayName={item.display_name}
                  />

                  {/* Title */}
                  <span
                    className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[#FF5E1A] truncate transition max-w-[130px] sm:max-w-[160px]"
                    title={item.display_name}
                  >
                    {item.display_name}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-bold text-[#FF5E1A] font-mono">
                    {formatCurrency(amountMinor)}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
