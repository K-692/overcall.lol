import Link from "next/link";
import { Crown, ExternalLink, ArrowUpRight, Flame, MousePointerClick, Music } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import type { Listing } from "@/types";

interface PodiumCardsProps {
  topListings: Listing[];
  timeframe: "all-time" | "today";
}

export function PodiumCards({ topListings, timeframe }: PodiumCardsProps) {
  if (!topListings || topListings.length === 0) {
    return null;
  }

  const first = topListings[0];
  const second = topListings[1];
  const third = topListings[2];

  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold tracking-tight text-white">
            {timeframe === "today" ? "Today's Top Performers" : "Top of the Leaderboard"}
          </h2>
        </div>
        <span className="text-xs text-white/50">
          Positions #1 – #3
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Rank #2 (Silver) */}
        {second ? (
          <div className="order-2 md:order-1 glass-panel rounded-3xl p-6 border-slate-400/30 hover:border-slate-300 transition duration-300 relative group flex flex-col justify-between h-[360px]">
            <div className="flex justify-between items-start">
              <span className="w-10 h-10 rounded-2xl bg-slate-400/20 text-slate-200 border border-slate-400/40 flex items-center justify-center font-black text-lg">
                #2
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/70">
                {second.category_name}
              </span>
            </div>

            <div className="text-center my-auto">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800/80 border-2 border-slate-400/30 overflow-hidden mb-3 shadow-lg group-hover:scale-105 transition transform">
                {second.image_url ? (
                  <img src={second.image_url} alt={second.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Music className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition truncate">
                {second.display_name}
              </h3>
              <p className="text-xs text-white/50 line-clamp-2 mt-1 px-2">
                {second.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Total Volume:</span>
                <span className="font-bold text-white text-sm">
                  {formatCurrency(timeframe === "today" ? (second.today_spend_minor || 0) : second.total_paid_minor)}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/go/${second.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit</span>
                </a>
                <Link
                  href={`/artist/${second.slug}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/30 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <span>Outcall</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 glass-panel rounded-3xl p-6 border-dashed border-white/10 h-[360px] flex items-center justify-center text-center text-white/40 text-xs">
            Position #2 Available
          </div>
        )}

        {/* Rank #1 (Hero Gold) */}
        {first && (
          <div className="order-1 md:order-2 glass-panel rounded-3xl p-6 sm:p-8 gold-glow bg-gradient-to-b from-amber-500/10 via-[#13131e] to-[#0c0c14] border-amber-400/50 relative group flex flex-col justify-between h-[420px] transform md:-translate-y-4 shadow-2xl">
            {/* Top Crown Ribbon */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30">
                  <Crown className="w-7 h-7 text-black fill-black" />
                </span>
                <span className="text-xs font-black tracking-wider uppercase text-amber-400">
                  Rank #1 Champion
                </span>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {first.category_name}
              </span>
            </div>

            <div className="text-center my-auto">
              <div className="w-28 h-28 mx-auto rounded-3xl bg-black/60 border-2 border-amber-400/60 overflow-hidden mb-3 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition transform">
                {first.image_url ? (
                  <img src={first.image_url} alt={first.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-400">
                    <Music className="w-12 h-12" />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition truncate">
                {first.display_name}
              </h3>
              <p className="text-xs text-white/60 line-clamp-2 mt-1 px-4">
                {first.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50 font-medium">Authoritative Total:</span>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 text-xl">
                  {formatCurrency(timeframe === "today" ? (first.today_spend_minor || 0) : first.total_paid_minor)}
                </span>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/go/${first.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                  <span>Visit Artist</span>
                </a>
                <Link
                  href={`/artist/${first.slug}`}
                  className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-pink-500/25 transition flex items-center justify-center gap-1.5"
                >
                  <span>Challenge #1</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Rank #3 (Bronze) */}
        {third ? (
          <div className="order-3 glass-panel rounded-3xl p-6 border-amber-800/30 hover:border-amber-700 transition duration-300 relative group flex flex-col justify-between h-[340px]">
            <div className="flex justify-between items-start">
              <span className="w-10 h-10 rounded-2xl bg-amber-800/20 text-amber-400 border border-amber-800/40 flex items-center justify-center font-black text-lg">
                #3
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/5 text-white/70">
                {third.category_name}
              </span>
            </div>

            <div className="text-center my-auto">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-950/40 border-2 border-amber-700/30 overflow-hidden mb-3 shadow-lg group-hover:scale-105 transition transform">
                {third.image_url ? (
                  <img src={third.image_url} alt={third.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-700">
                    <Music className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition truncate">
                {third.display_name}
              </h3>
              <p className="text-xs text-white/50 line-clamp-2 mt-1 px-2">
                {third.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40">Total Volume:</span>
                <span className="font-bold text-white text-sm">
                  {formatCurrency(timeframe === "today" ? (third.today_spend_minor || 0) : third.total_paid_minor)}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/go/${third.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit</span>
                </a>
                <Link
                  href={`/artist/${third.slug}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/30 text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <span>Outcall</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="order-3 glass-panel rounded-3xl p-6 border-dashed border-white/10 h-[340px] flex items-center justify-center text-center text-white/40 text-xs">
            Position #3 Available
          </div>
        )}
      </div>
    </div>
  );
}
