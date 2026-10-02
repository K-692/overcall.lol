import Link from "next/link";
import { formatCurrency } from "@/lib/config";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <h2 className="font-semibold text-zinc-300">Browse by Genre</h2>
        <Link href="/categories" className="hover:text-white">View all</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/category/artist/music/${cat.slug}`}
            className="p-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg flex flex-col justify-between text-xs transition"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-zinc-200 truncate">{cat.name}</span>
              <span className="text-[10px] text-zinc-500 font-mono">({cat.listing_count || 0})</span>
            </div>

            <div className="text-[11px] text-zinc-500 pt-2 truncate">
              {cat.top_artist_name ? (
                <span>#1 {cat.top_artist_name} ({formatCurrency(cat.top_bid_minor || 0)})</span>
              ) : (
                <span className="italic text-zinc-600">Open #1</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
