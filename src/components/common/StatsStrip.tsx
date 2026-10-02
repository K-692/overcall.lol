import { Trophy, TrendingUp, MousePointerClick, Users, Flame } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import type { PlatformStats } from "@/types";

interface StatsStripProps {
  stats: PlatformStats;
}

export function StatsStrip({ stats }: StatsStripProps) {
  if (!stats) return null;

  return (
    <div className="w-full my-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
              Artists Listed
            </span>
            <span className="text-xl sm:text-2xl font-black text-[var(--foreground)]">
              {stats.totalArtists.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
              Total Volume
            </span>
            <span className="text-xl sm:text-2xl font-black text-[var(--primary)]">
              {formatCurrency(stats.totalVolumeMinor)}
            </span>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <MousePointerClick className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
              Public Clicks
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-500">
              {stats.totalClicks.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
              Highest Bid
            </span>
            <span className="text-xl sm:text-2xl font-black text-[var(--secondary)]">
              {formatCurrency(stats.highestBidMinor)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
