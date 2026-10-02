"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

interface AboutStats {
  totalVisitors: number;
  totalVisitorsFormatted: string;
  totalRevenueDollars: number;
  totalRevenueFormatted: string;
  highestBidDollars: number;
  highestBidFormatted: string;
  highestRankHolder: string;
  highestRankUrl: string;
  topListingSlug?: string;
  topListingName?: string;
  totalListed: number;
  totalListedFormatted: string;
  productsAddedToday: number;
  revenueTodayDollars: number;
  revenueTodayFormatted: string;
  hoursSinceLaunch: number;
  launchDate: string;
  todayUtc: string;
  timestamp: string;
}

interface TestimonialItem {
  id: string;
  author_name: string;
  author_handle: string;
  author_initials: string;
  quote_text: string;
  date_label: string;
  sort_order: number;
  post_url?: string;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "testi_1",
    author_name: "MakerThrive",
    author_handle: "@MakerThrive",
    author_initials: "MT",
    date_label: "Aug 24",
    sort_order: 1,
    post_url: "https://x.com/MakerThrive",
    quote_text: `this is WILD!!!\nspent $42 on overcall.lol\ndrove 64,000 people to our product\ngenerated $29k in one day.\ninsane ROI!`,
  },
  {
    id: "testi_2",
    author_name: "Lewis ⚡ soc2/acc",
    author_handle: "@lewiscarhart",
    author_initials: "LC",
    date_label: "Aug 21",
    sort_order: 2,
    post_url: "https://x.com/lewiscarhart",
    quote_text: `Update:\nThe sales team at Comp AI approve.\nWe have a 30% win rate across all demos, average 14-day from demo to close, LTV from one win from the ad would be expected to be $40,000+ 🥇`,
  },
  {
    id: "testi_3",
    author_name: "CrowdReply",
    author_handle: "@Crowdreply_io",
    author_initials: "CR",
    date_label: "Aug 23",
    sort_order: 3,
    post_url: "https://x.com/Crowdreply_io",
    quote_text: `Okay, let us summarize the past 48 hours for you\n- We bought the #1 spot on overcall.lol for $12,700\n- Trended on X\n- 6,550+ clicks\n- 1,800 signups\n- 50+ demo calls fully booked for the next 2 weeks\n- $50k/mo currently in the pipeline\nWas it worth it? ABSOLUTELY YES`,
  },
  {
    id: "testi_4",
    author_name: "Tibo",
    author_handle: "@tibo_maker",
    author_initials: "TB",
    date_label: "Aug 24",
    sort_order: 4,
    post_url: "https://x.com/tibo_maker",
    quote_text: `result from my overcall bet - it was successful 🔥\nPaid for the #1 spot.\nHere is what actually happened:\n- 44 trials on Friday\n- 38 trials on Saturday\n- 31 trials on Sunday\nNormal baseline: ~20 trials/day. 53 new trials that would not exist otherwise!`,
  },
];

function useCountUp(target: number, duration: number = 2000): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    setCount(0);
    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return count;
}

export default function AboutPage() {
  const [stats, setStats] = useState<AboutStats>({
    totalVisitors: 1619702,
    totalVisitorsFormatted: "1,619,702",
    totalRevenueDollars: 263874,
    totalRevenueFormatted: "$263,874",
    highestBidDollars: 2000,
    highestBidFormatted: "$2,000",
    highestRankHolder: "Synthwave Dreams · spotify.com",
    highestRankUrl: "https://open.spotify.com",
    totalListed: 12,
    totalListedFormatted: "12",
    productsAddedToday: 3,
    revenueTodayDollars: 35,
    revenueTodayFormatted: "$35",
    hoursSinceLaunch: 944,
    launchDate: "August 19th, 2026, at 11:08 PM",
    todayUtc: new Date().toISOString().slice(0, 10),
    timestamp: new Date().toISOString(),
  });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [loading, setLoading] = useState(false);
  const [, setLastRefreshed] = useState<string>("just now");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, testiRes] = await Promise.all([
        fetch("/api/v1/about-stats", { cache: "no-store" }),
        fetch("/api/v1/testimonials", { cache: "no-store" }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (testiRes.ok) {
        const testiData = await testiRes.json();
        if (testiData.items && Array.isArray(testiData.items) && testiData.items.length > 0) {
          setTestimonials(testiData.items);
        }
      }

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to load dynamic about data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh dynamic stats and testimonials every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Count-up hooks for "Then it went live" stats (0 -> final value in 2 seconds)
  const animatedVisitors = useCountUp(stats.totalVisitors, 2000);
  const animatedRevenue = useCountUp(stats.totalRevenueDollars, 2000);
  const animatedHighestBid = useCountUp(stats.highestBidDollars, 2000);
  const animatedListed = useCountUp(stats.totalListed, 2000);
  const animatedBidsToday = useCountUp(stats.productsAddedToday, 2000);
  const animatedRevenueToday = useCountUp(stats.revenueTodayDollars, 2000);

  // Split revenue digits for the big display counter
  const revenueDigits = `$${animatedRevenue.toLocaleString()}`.split("");

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 space-y-12 text-[var(--foreground)]">
      {/* Top Bar: Back to Leaderboard & Live Status */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
        </Link>

        <div className="flex items-center space-x-2 text-[11px] text-[var(--text-dim)]">
          <span className="flex items-center gap-1 text-emerald-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live sync
          </span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1 rounded hover:bg-[var(--subtle-bg)] hover:text-[var(--foreground)] transition cursor-pointer"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Title & Intro */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About</h1>
        <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
          overcall.lol started as a simple public experiment: no hidden algorithms, no opaque reviews, no gatekeepers. Just claim #1 with a bid — that&apos;s it.
        </p>
      </div>

      {/* Then it went live */}
      <div className="space-y-6 pt-4 border-t border-[var(--card-border)]">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Then it went live</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            The platform launched on {stats.launchDate}.
          </p>
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          Live real-time performance numbers synced directly with the public ledger:
        </p>

        {/* Dynamic Stats Grid with 2-second Count-Up Effect */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Visitors */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1 relative overflow-hidden group">
            <span className="text-2xl sm:text-3xl font-mono font-bold block text-[var(--foreground)] tracking-tight">
              {animatedVisitors.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)]">visitors</span>
          </div>

          {/* Revenue */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold block text-[var(--foreground)] tracking-tight">
              ${animatedRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)]">revenue</span>
          </div>

          {/* Highest Rank */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1 col-span-2 sm:col-span-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold block text-[#FF5E1A] tracking-tight">
              ${animatedHighestBid.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)] block truncate" title={stats.highestRankHolder}>
              highest rank · {stats.highestRankHolder}
            </span>
          </div>

          {/* Listed Products */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold block text-[var(--foreground)] tracking-tight">
              {animatedListed.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)]">listed items</span>
          </div>

          {/* Products Added Today */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold block text-[var(--foreground)] tracking-tight">
              {animatedBidsToday.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)]">bids placed today</span>
          </div>

          {/* Revenue Today */}
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold block text-[#2563EB] tracking-tight">
              ${animatedRevenueToday.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-muted)]">revenue today</span>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          High volume organic traffic with continuous bidding rounds. Guaranteed visibility: whoever places the highest bid holds the rank until outbid in real-time.
        </p>
      </div>

      {/* From the people who took #1 (2-Column Cards Updated by Admin/Backend) */}
      <div className="space-y-6 pt-6 border-t border-[var(--card-border)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">From the people who took #1</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Live feedback and verified reports from bidders who held the top spot on overcall.lol.
          </p>
        </div>

        {/* 2-Column Cards Grid (Clickable, redirects to original X post in new tab) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => {
            const postUrl = t.post_url || `https://x.com/${t.author_handle.replace(/^@/, "")}`;
            return (
              <a
                key={t.id}
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 sm:p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-3 flex flex-col justify-between hover:border-orange-500/50 hover:bg-[var(--subtle-bg)]/80 transition shadow-2xs group cursor-pointer block"
                title={`Open original post by ${t.author_handle} on X in new tab`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-[#FF5E1A] flex items-center justify-center font-bold text-xs text-white shadow-xs">
                        {t.author_initials || t.author_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-none text-[var(--foreground)] group-hover:text-[#FF5E1A] transition">{t.author_name}</h4>
                        <span className="text-xs text-[var(--text-dim)]">
                          {t.author_handle} · {t.date_label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[var(--text-dim)] group-hover:text-[#FF5E1A] transition">
                      <XIcon />
                      <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--foreground)] whitespace-pre-line leading-relaxed font-sans">
                    {t.quote_text}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Creator Info (Krishnendu Pal) */}
      <div className="space-y-6 pt-8 border-t border-[var(--card-border)]">
        <div className="p-6 sm:p-7 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Circular Photo */}
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/krishnendu.jpg"
              alt="Krishnendu Pal"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover object-[50%_20%] border-2 border-[#FF5E1A] shadow-md ring-4 ring-[#FF5E1A]/15"
            />
          </div>

          {/* Details & Social Links */}
          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                Krishnendu Pal
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                AI Researcher & Creator of <span className="font-semibold text-[var(--foreground)]">overcall.lol</span>.
              </p>
            </div>

            {/* External Profile Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <a
                href="https://github.com/K-692"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--subtle-bg)] hover:bg-zinc-800 hover:text-white border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] transition cursor-pointer"
              >
                <GithubIcon />
                <span>github.com/K-692</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              <a
                href="https://www.linkedin.com/in/krishnendu-pal-3615b4224/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--subtle-bg)] hover:bg-[#0077B5] hover:text-white border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] transition cursor-pointer"
              >
                <LinkedinIcon />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Big Side Project Made Dynamic Counter */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--subtle-bg)] border border-[var(--card-border)] text-center space-y-4">
          <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold block">
            overcall.lol paid my bills worth of
          </span>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 font-mono font-black text-3xl sm:text-5xl text-[var(--foreground)]">
            {revenueDigits.map((char, idx) => (
              <span
                key={idx}
                className={
                  char === "," || char === "$"
                    ? "text-[var(--text-dim)] px-0.5"
                    : "inline-block px-1.5 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs"
                }
              >
                {char}
              </span>
            ))}
          </div>

          <span className="text-xs text-[var(--text-dim)] font-mono block">
            since launch {stats.hoursSinceLaunch.toLocaleString()} hours ago · updated live
          </span>
        </div>

        {/* Footer Sub-links */}
        <div className="text-center text-xs text-[var(--text-dim)]">
          <div>
            Built by <span className="font-semibold text-[var(--foreground)]">Krishnendu Pal</span> · overcall.lol
          </div>
        </div>
      </div>
    </div>
  );
}
