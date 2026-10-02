"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RefreshCw, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { ClaimWidget } from "@/components/claim/ClaimWidget";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { SidebarRanking } from "@/components/leaderboard/SidebarRanking";
import { formatCurrency, APP_CONFIG } from "@/lib/config";
import type { Listing, Category, PlatformStats } from "@/types";
import { OutbidConflictModal } from "@/components/common/OutbidConflictModal";

function HomeContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "today" ? "today" : "all-time";

  const [timeframe, setTimeframe] = useState<"all-time" | "today">(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const conflictParam = searchParams.get("conflict");
  const conflictAmount = parseInt(searchParams.get("amount") || "0", 10);
  const conflictCategory = searchParams.get("category") || "All Genres";
  const [conflictOpen, setConflictOpen] = useState(Boolean(conflictParam));

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Category horizontal scroll ref
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategory = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Countdown timer until UTC midnight
  const [countdownText, setCountdownText] = useState("");
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const utcMidnight = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
      );
      const diffMs = Math.max(0, utcMidnight.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setCountdownText(
        `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} left`
      );
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Browser Tab Title based on active timeframe
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title =
        timeframe === "today"
          ? "Today - overcall.lol"
          : "overcall.lol - Claim a rank on the public leaderboard";
    }
  }, [timeframe]);

  // Fetch Board
  const fetchBoard = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      try {
        const endpoint =
          timeframe === "today" ? "/api/v1/leaderboards/today" : "/api/v1/leaderboards/all-time";
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: "50",
        });
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());

        const res = await fetch(`${endpoint}?${params.toString()}`);
        const data = await res.json();

        if (data.items) {
          setListings(data.items);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalCount(data.pagination?.total ?? data.items.length);
        }
      } catch (err) {
        console.error("Failed to fetch board:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeframe, selectedCategory, currentPage, searchQuery]
  );

  useEffect(() => {
    fetchBoard();

    fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.items) setCategories(d.items);
      })
      .catch(console.error);

    fetch("/api/v1/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(console.error);

    const pollInterval = setInterval(() => {
      fetchBoard(true);
    }, APP_CONFIG.pollingIntervalMs);

    return () => clearInterval(pollInterval);
  }, [fetchBoard]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
  };

  const handleTimeframeChange = (tf: "all-time" | "today") => {
    setTimeframe(tf);
    setCurrentPage(1);
  };

  // Find selected category object
  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);
  const categoryDisplayName = selectedCategory === "all" ? "" : selectedCategoryObj?.name || "";

  // Current #1 calculation based on selected category & timeframe
  const currentNumberOneMinor =
    selectedCategory === "all"
      ? timeframe === "today"
        ? listings.length > 0
          ? (listings[0].today_spend_minor ?? listings[0].total_paid_minor)
          : 0
        : stats?.highestBidMinor || (listings.length > 0 ? listings[0].total_paid_minor : 0)
      : listings.length > 0
      ? timeframe === "today"
        ? (listings[0].today_spend_minor ?? listings[0].total_paid_minor)
        : listings[0].total_paid_minor
      : 0;

  const initialMinBid = Math.max(1, Math.floor(currentNumberOneMinor / 100) + 1);
  const [bidDollars, setBidDollars] = useState<number>(initialMinBid);
  const [bidInputText, setBidInputText] = useState<string>(String(initialMinBid));

  useEffect(() => {
    const calculated = Math.max(1, Math.floor(currentNumberOneMinor / 100) + 1);
    setBidDollars(calculated);
    setBidInputText(String(calculated));
  }, [currentNumberOneMinor, selectedCategory, timeframe]);

  // Calculate what rank the user will obtain on the leaderboard for bidDollars
  // Late-to-bid rule: If same amount is used in an existing rank, the user ranks below it.
  const calculatePredictedRank = (dollars: number): number => {
    if (listings.length === 0) return 1;

    let higherOrEqualCount = 0;
    for (const item of listings) {
      const spendMinor =
        timeframe === "today"
          ? (item.today_spend_minor ?? item.total_paid_minor)
          : item.total_paid_minor;
      const itemDollars = Math.floor(spendMinor / 100);

      if (itemDollars >= dollars) {
        higherOrEqualCount++;
      }
    }

    return higherOrEqualCount + 1;
  };

  const predictedRank = calculatePredictedRank(bidDollars);

  const handleBidInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
    setBidInputText(digitsOnly);
    const val = parseInt(digitsOnly, 10);
    if (!isNaN(val) && val >= 1) {
      setBidDollars(val);
    }
  };

  const handleBidInputBlur = () => {
    const val = parseInt(bidInputText, 10);
    if (isNaN(val) || val < 1) {
      setBidDollars(1);
      setBidInputText("1");
    } else {
      setBidDollars(val);
      setBidInputText(String(val));
    }
  };

  const handleDecrement = () => {
    const next = Math.max(1, bidDollars - 1);
    setBidDollars(next);
    setBidInputText(String(next));
  };

  const handleIncrement = () => {
    const next = bidDollars + 1;
    setBidDollars(next);
    setBidInputText(String(next));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 sm:pt-6 pb-12 space-y-6 sm:space-y-8">
      {/* Category Selection Bar with Left & Right Scroll Arrows */}
      <div className="border-b border-[var(--card-border)] pb-3">
        <div className="relative flex items-center">
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollCategory("left")}
            className="p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--subtle-bg)] text-[var(--foreground)] transition cursor-pointer shadow-xs shrink-0 z-10 mr-1"
            title="Scroll categories left"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={categoryScrollRef}
            className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none py-1 scroll-smooth flex-1"
          >
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap text-xs font-semibold cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[var(--brand-blue)] text-white shadow-xs"
                  : "border border-[var(--card-border)] bg-[var(--subtle-bg)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--brand-blue)]"
              }`}
            >
              All Genres
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap text-xs font-semibold cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-[var(--brand-blue)] text-white shadow-xs"
                    : "border border-[var(--card-border)] bg-[var(--subtle-bg)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[var(--brand-blue)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollCategory("right")}
            className="p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--subtle-bg)] text-[var(--foreground)] transition cursor-pointer shadow-xs shrink-0 z-10 ml-1"
            title="Scroll categories right"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Section: Centered Switcher + Headline + Claim Row */}
      <div className="text-center space-y-4 pt-1 sm:pt-2 max-w-3xl mx-auto">
        {/* Centered Switcher Pill matching Image 1 & 2 */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="inline-flex items-center p-1 rounded-full bg-[var(--subtle-bg)] border border-[var(--card-border)] text-xs shadow-2xs">
            <button
              onClick={() => handleTimeframeChange("all-time")}
              className={`px-4 py-1.5 rounded-full font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                timeframe === "all-time"
                  ? "bg-[#D96B52] dark:bg-[#FF5E1A] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>All-time</span>
            </button>
            <button
              onClick={() => handleTimeframeChange("today")}
              className={`px-4 py-1.5 rounded-full font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
                timeframe === "today"
                  ? "bg-[#D96B52] dark:bg-[#FF5E1A] text-white shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-xs shadow-red-500/80 animate-pulse" />
              <span>Today</span>
            </button>
          </div>

          {/* Countdown Subtitle (visible when Today is active, as in Image 2) */}
          {timeframe === "today" && (
            <p className="text-xs text-[var(--text-dim)] font-medium text-center animate-in fade-in duration-150">
              Resets every day at midnight UTC ·{" "}
              <span className="font-mono font-semibold text-[var(--foreground)]">
                {countdownText}
              </span>
            </p>
          )}
        </div>

        {/* Dynamic Centered Headline with (-) and (+) buttons & editable amount */}
        <div className="pt-1">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-2">
            <span>
              Claim{" "}
              <span className="text-[#FF5E1A]">
                {timeframe === "today" ? `today's #${predictedRank}` : `#${predictedRank}`}
              </span>{" "}
              in {selectedCategory === "all" ? "All Genres" : categoryDisplayName} for
            </span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2">
              {/* Minus Button */}
              <button
                type="button"
                onClick={handleDecrement}
                disabled={bidDollars <= 1}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-transparent hover:bg-orange-500/10 text-[#FF5E1A] dark:text-[#FF7A3D] font-black border border-orange-300/60 dark:border-orange-500/40 flex items-center justify-center transition text-base sm:text-lg cursor-pointer active:scale-95 disabled:opacity-25 disabled:pointer-events-none"
                title="Decrease bid amount"
              >
                -
              </button>

              {/* Editable Amount Field in Orange (Transparent background) */}
              <span className="inline-flex items-center bg-transparent px-1 py-0.5 border-b-2 border-transparent hover:border-orange-300/60 focus-within:border-[#FF5E1A] transition">
                <span className="text-[#FF5E1A] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight font-mono select-none">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={bidInputText}
                  onChange={handleBidInputChange}
                  onBlur={handleBidInputBlur}
                  className="text-[#FF5E1A] font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight font-mono bg-transparent outline-none border-none p-0 m-0 focus:ring-0 text-left"
                  style={{ width: `${Math.max(1, bidInputText.length) * 0.65}em`, minWidth: "1.2ch" }}
                  aria-label="Target bid amount"
                />
              </span>

              {/* Plus Button */}
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-transparent hover:bg-orange-500/10 text-[#FF5E1A] dark:text-[#FF7A3D] font-black border border-orange-300/60 dark:border-orange-500/40 flex items-center justify-center transition text-base sm:text-lg cursor-pointer active:scale-95"
                title="Increase bid amount"
              >
                +
              </button>
            </span>
          </h1>
        </div>

        {/* Centered Quick-Claim Row (URL + Category + Claim Rank button) */}
        <div className="pt-2">
          <ClaimWidget
            categories={categories}
            initialCategory={selectedCategory === "all" ? "electronic" : selectedCategory}
            bidDollars={bidDollars}
            onCategoryChange={(catSlug) => setSelectedCategory(catSlug)}
          />
        </div>
      </div>

      {/* 2-Column Section: Main Board (Left) & Sidebar Ranking (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
        {/* Main Leaderboard Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Stretched Search Bar directly above the listings */}
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search ${categoryDisplayName || "artists"}, tracks, or links across the board...`}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[#FF5E1A] focus:ring-1 focus:ring-[#FF5E1A]/40 rounded-xl text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--text-dim)] outline-none shadow-2xs transition"
              />
            </div>

            <button
              onClick={() => fetchBoard()}
              disabled={refreshing || loading}
              className="p-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--subtle-bg)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:border-[#FF5E1A] transition cursor-pointer shrink-0"
              title="Refresh board"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Central Cards Leaderboard (Only #1 given special peach styling, #2+ normal) */}
          <LeaderboardView
            listings={listings}
            timeframe={timeframe}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={50}
            onPageChange={(p) => setCurrentPage(p)}
            loading={loading}
          />
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 sticky top-20">
          <SidebarRanking
            currentTimeframe={timeframe}
            onSwitchTimeframe={(tf) => handleTimeframeChange(tf)}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>

      {/* Minimal Bottom Platform Stats */}
      {stats && (
        <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)] gap-2">
          <div>
            Total Volume:{" "}
            <strong className="text-[var(--foreground)] font-mono">
              {formatCurrency(stats.totalVolumeMinor)}
            </strong>{" "}
            across{" "}
            <strong className="text-[var(--foreground)] font-mono">{stats.totalArtists}</strong>{" "}
            artists
          </div>
          <div>
            Today:{" "}
            <strong className="text-[var(--foreground)] font-mono">
              {formatCurrency(stats.todayVolumeMinor)}
            </strong>{" "}
            · Total Clicks:{" "}
            <strong className="text-[var(--foreground)] font-mono">{stats.totalClicks}</strong>
          </div>
        </div>
      )}

      {/* Outbid Conflict Popup Modal if redirected with conflict param */}
      <OutbidConflictModal
        isOpen={conflictOpen}
        amountDollars={conflictAmount}
        categoryName={conflictCategory}
        onClose={() => setConflictOpen(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12 text-zinc-500 text-xs">Loading board...</div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
