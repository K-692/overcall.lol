"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft, Trophy, ArrowRight, Music, ExternalLink, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/config";

// We can pre-calculate the past 7 days
function getPast7Days(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

interface DailyCardItem {
  id: string;
  rank: number;
  display_name: string;
  slug: string;
  category_name: string;
  spend_minor: number;
  destination_url: string;
}

interface DailyDaySummary {
  date: string;
  formattedDate: string;
  totalSpendMinor: number;
  artistCount: number;
  top3: DailyCardItem[];
}

export default function DailyLeaderboardsPage() {
  const router = useRouter();
  const past7Days = getPast7Days();
  const [selectedPickerDate, setSelectedPickerDate] = useState<string>("");
  const [summaries, setSummaries] = useState<Record<string, DailyDaySummary>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          dateInputRef.current.showPicker();
        } catch {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // Load summary for past 7 days on mount
  useEffect(() => {
    Promise.all(
      past7Days.map(async (dateStr) => {
        try {
          const res = await fetch(`/api/v1/daily/${dateStr}`);
          if (res.ok) {
            const data = await res.json();
            const dateObj = new Date(`${dateStr}T00:00:00Z`);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });

            const top3: DailyCardItem[] = (data.items || []).slice(0, 3).map((it: any, idx: number) => ({
              id: it.id || it.listing_id || `${dateStr}-rank-${idx + 1}`,
              rank: idx + 1,
              display_name: it.display_name,
              slug: it.slug,
              category_name: it.category_name,
              spend_minor: it.spend_minor || it.today_spend_minor || 0,
              destination_url: it.destination_url || "",
            }));

            return {
              date: dateStr,
              formattedDate,
              totalSpendMinor: data.stats?.total_daily_spend_minor || (data.items || []).reduce((acc: number, curr: any) => acc + (curr.spend_minor || 0), 0),
              artistCount: data.items?.length || 0,
              top3,
            };
          }
        } catch (err) {
          console.error(err);
        }
        return null;
      })
    ).then((results) => {
      const map: Record<string, DailyDaySummary> = {};
      results.forEach((r) => {
        if (r) map[r.date] = r;
      });
      setSummaries(map);
      setLoading(false);
    });
  }, []);

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setSelectedPickerDate(val);
      router.push(`/daily/${val}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-[var(--foreground)]">
      {/* Top Navigation Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Global Board
        </Link>

        {/* Interactive Date Picker Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={handleOpenDatePicker}
            className="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#FF5E1A] text-xs font-semibold text-[var(--foreground)] flex items-center gap-2 cursor-pointer shadow-xs transition"
          >
            <Calendar className="w-4 h-4 text-[#FF5E1A]" />
            <span>{selectedPickerDate ? `Jump to: ${selectedPickerDate}` : "Select any date"}</span>
          </button>
          <input
            ref={dateInputRef}
            id="daily-date-picker"
            type="date"
            value={selectedPickerDate}
            onChange={handleDatePickerChange}
            max={new Date().toISOString().slice(0, 10)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer pointer-events-auto"
            aria-label="Select any date"
          />
        </div>
      </div>

      {/* Main Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-7 h-7 text-[var(--brand-blue)]" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Daily Leaderboards
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl">
          Showing daily snapshots for the <strong>last 7 days</strong>. Top 3 ranks are highlighted inside each card with historical audit trails.
        </p>
      </div>

      {/* Last 7 Days Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[var(--text-dim)] animate-pulse">
          Loading past 7 days leaderboards...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {past7Days.map((dateStr, index) => {
            const summary = summaries[dateStr];
            const dateObj = new Date(`${dateStr}T00:00:00Z`);
            const formatted = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });
            const isToday = index === 0;

            return (
              <div
                key={dateStr}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--brand-blue)] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                        {formatted}
                      </span>
                      {isToday && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-[var(--text-dim)] mt-0.5 block">
                      UTC: {dateStr}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-dim)] block uppercase font-semibold">Total Volume</span>
                    <span className="font-mono font-bold text-xs sm:text-sm text-[var(--brand-orange)]">
                      {formatCurrency(summary?.totalSpendMinor || 0)}
                    </span>
                  </div>
                </div>

                {/* Top 3 inside Card */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Top 3 Rankings
                  </span>

                  {summary && summary.top3.length > 0 ? (
                    <div className="space-y-1.5">
                      {summary.top3.map((item, idx) => (
                        <div
                          key={`${dateStr}-top3-${item.id || item.slug || idx}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--subtle-bg)] border border-[var(--card-border)] text-xs"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                            {item.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-orange-subtle)] text-[var(--brand-orange)] font-bold text-xs shrink-0 border border-[var(--brand-orange)]/30">
                                #1
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold text-xs shrink-0 border border-[var(--brand-blue)]/30">
                                #2
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--brand-blue-subtle)] text-[var(--brand-blue)] font-bold text-xs shrink-0 border border-[var(--brand-blue)]/20">
                                #3
                              </span>
                            )}

                            <div className="min-w-0">
                              <span className="font-bold text-[var(--foreground)] truncate block">
                                {item.display_name}
                              </span>
                              <span className="text-[10px] text-[var(--text-dim)] truncate block">
                                {item.category_name}
                              </span>
                            </div>
                          </div>

                          <span className="font-mono font-bold text-[var(--foreground)] shrink-0">
                            {formatCurrency(item.spend_minor)}
                          </span>
                        </div>
                      ))}

                      {/* Fill empty spots if less than 3 */}
                      {summary.top3.length < 3 &&
                        Array.from({ length: 3 - summary.top3.length }).map((_, emptyIdx) => (
                          <div
                            key={`${dateStr}-empty-${emptyIdx}`}
                            className="flex items-center justify-between p-2 rounded-xl bg-[var(--subtle-bg)]/40 border border-dashed border-[var(--card-border)] text-[11px] text-[var(--text-dim)] italic"
                          >
                            <span>#{summary.top3.length + emptyIdx + 1} Open Spot</span>
                            <span>$0.00</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-[var(--text-dim)] bg-[var(--subtle-bg)] rounded-xl border border-[var(--card-border)]">
                      No bids confirmed for this date yet.
                    </div>
                  )}
                </div>

                {/* Actions: Claim a rank on Today + Show all ranks */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  {isToday && (
                    <Link
                      href="/?tab=today"
                      className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#FF5E1A] hover:bg-[#E54E0E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                    >
                      <span>Claim a rank</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <Link
                    href={`/daily/${dateStr}`}
                    className={`w-full ${isToday ? "sm:flex-1" : ""} py-2.5 px-4 rounded-xl bg-[var(--subtle-bg)] hover:bg-[#FF5E1A] hover:text-white border border-[var(--card-border)] text-[var(--foreground)] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs`}
                  >
                    <span>Show all ranks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
