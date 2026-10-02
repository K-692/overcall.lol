import { notFound } from "next/navigation";
import Link from "next/link";
import { getDailyArchive } from "@/lib/ranking";
import { formatCurrency } from "@/lib/config";
import { Calendar, ChevronLeft, ChevronRight, Lock, Trophy, Music, ExternalLink, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  return {
    title: `Daily Archive for ${date} — overcall.lol`,
    description: `Immutable historical daily leaderboard snapshot for ${date} on overcall.lol.`,
  };
}

export const dynamic = "force-dynamic";

export default async function DailyArchiveDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  const archive = getDailyArchive(date);

  // Compute previous and next date strings
  const currDate = new Date(`${date}T00:00:00Z`);
  const prevDate = new Date(currDate);
  prevDate.setUTCDate(prevDate.getUTCDate() - 1);
  const prevDateStr = prevDate.toISOString().slice(0, 10);

  const nextDate = new Date(currDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const nextDateStr = nextDate.toISOString().slice(0, 10);
  const isFuture = nextDate.getTime() > Date.now();

  const formattedDate = currDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-[var(--foreground)]">
      {/* Back Link */}
      <Link
        href="/daily"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Daily Archives
      </Link>

      {/* Date Navigation Strip */}
      <div className="flex items-center justify-between">
        <Link
          href={`/daily/${prevDateStr}`}
          className="px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--brand-blue)] text-xs font-semibold text-[var(--foreground)] transition flex items-center gap-1.5 shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{prevDateStr}</span>
        </Link>

        <span className="text-xs px-3 py-1 rounded-full bg-[var(--subtle-bg)] text-[var(--brand-blue)] border border-[var(--card-border)] flex items-center gap-1.5 font-mono font-medium">
          <Lock className="w-3 h-3" /> Immutable Snapshot
        </span>

        {!isFuture ? (
          <Link
            href={`/daily/${nextDateStr}`}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--brand-blue)] text-xs font-semibold text-[var(--foreground)] transition flex items-center gap-1.5 shadow-2xs"
          >
            <span>{nextDateStr}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="w-20" />
        )}
      </div>

      {/* Archive Header */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xs">
        <div>
          <span className="text-xs text-[var(--brand-blue)] font-mono font-semibold block mb-1">
            UTC Calendar Day · {date}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {formattedDate}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Results frozen permanently at 23:59:59 UTC.
          </p>
        </div>

        <div className="flex gap-4 shrink-0">
          <div className="p-3.5 bg-[var(--subtle-bg)] border border-[var(--card-border)] rounded-xl text-center min-w-[110px]">
            <span className="text-[11px] text-[var(--text-dim)] block uppercase font-semibold">Artists</span>
            <span className="text-lg font-black text-[var(--foreground)]">
              {archive.stats.participating_listings}
            </span>
          </div>
          <div className="p-3.5 bg-[var(--subtle-bg)] border border-[var(--card-border)] rounded-xl text-center min-w-[110px]">
            <span className="text-[11px] text-[var(--text-dim)] block uppercase font-semibold">Total Spend</span>
            <span className="text-lg font-black text-[var(--brand-orange)]">
              {formatCurrency(archive.stats.total_daily_spend_minor)}
            </span>
          </div>
        </div>
      </div>

      {/* Standings List */}
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-xs">
        {archive.items.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Calendar className="w-10 h-10 text-[var(--text-dim)] mx-auto opacity-40" />
            <h4 className="text-base font-bold text-[var(--foreground)]">No activity on this date</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              No artists registered spending during this UTC calendar day.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            <div className="grid grid-cols-12 gap-3 px-6 py-2.5 bg-[var(--subtle-bg)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-8">Artist</div>
              <div className="col-span-3 text-right">Daily Spend</div>
            </div>

            {archive.items.map((item, index) => (
              <div
                key={item.listing_id}
                className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-[var(--subtle-bg)] transition items-center text-xs"
              >
                <div className="col-span-1 text-center font-mono font-bold">
                  {index === 0 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--brand-orange-subtle)] text-[var(--brand-orange)] font-bold border border-[var(--brand-orange)]/30">
                      #1
                    </span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold border border-[var(--brand-blue)]/30">
                      #2
                    </span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold border border-[var(--brand-blue)]/20">
                      #3
                    </span>
                  ) : (
                    <span className="text-[var(--text-dim)]">#{index + 1}</span>
                  )}
                </div>

                <div className="col-span-8 flex items-center space-x-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--subtle-bg)] border border-[var(--card-border)] overflow-hidden shrink-0 flex items-center justify-center text-[var(--text-dim)]">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.display_name} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-4 h-4 text-[var(--text-dim)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/artist/${item.slug}`}
                      className="font-bold text-[var(--foreground)] hover:text-[var(--brand-blue)] text-sm truncate block transition"
                    >
                      {item.display_name}
                    </Link>
                    <span className="block text-[11px] text-[var(--text-dim)] truncate mt-0.5">
                      {item.category_name}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 text-right">
                  <span className="font-mono font-bold text-[var(--foreground)] text-sm">
                    {formatCurrency(item.spend_minor)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
