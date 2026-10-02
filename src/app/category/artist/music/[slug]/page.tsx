import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug } from "@/lib/categories";
import { getAllTimeLeaderboard } from "@/lib/ranking";
import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import { ClaimWidget } from "@/components/claim/ClaimWidget";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found — overcall.lol" };
  }

  return {
    title: `${category.name} Leaderboard — overcall.lol`,
    description: `Public pay-to-rank leaderboard for ${category.name} artists on overcall.lol.`,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryLeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const leaderboardData = getAllTimeLeaderboard({
    timeframe: "all-time",
    categorySlug: slug,
    page: 1,
    limit: 50,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6 text-[var(--foreground)]">
      <Link
        href="/categories"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All categories
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {category.name} Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Pay more to rank higher in {category.name}.
        </p>
      </div>

      {/* Quick Claim Bar prefilled with this category */}
      <div>
        <ClaimWidget initialCategory={category.slug} compact />
      </div>

      {/* Sequential Spreadsheet Table */}
      <LeaderboardView
        listings={leaderboardData.items}
        timeframe="all-time"
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}
