"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import type { Category, ValidateIdentityResponse } from "@/types";
import { OutbidConflictModal } from "@/components/common/OutbidConflictModal";

interface ClaimWidgetProps {
  categories?: Category[];
  initialCategory?: string;
  initialUrl?: string;
  bidDollars?: number;
  initialBidDollars?: number;
  onCategoryChange?: (categorySlug: string) => void;
  compact?: boolean;
}

export function ClaimWidget({
  categories = [],
  initialCategory = "electronic",
  initialUrl = "",
  bidDollars = 1,
  initialBidDollars,
  onCategoryChange,
  compact = false,
}: ClaimWidgetProps) {
  const router = useRouter();

  const identityInputId = useId();

  const [url, setUrl] = useState(initialUrl);
  const [displayName, setDisplayName] = useState("");
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(categories);
  const effectiveBidDollars = initialBidDollars ?? bidDollars ?? 1;

  useEffect(() => {
    if (initialCategory) {
      setCategorySlug(initialCategory);
    }
  }, [initialCategory]);


  const [validating, setValidating] = useState(false);
  const [quote, setQuote] = useState<ValidateIdentityResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (availableCategories.length === 0) {
      fetch("/api/v1/categories")
        .then((r) => r.json())
        .then((data) => {
          if (data.items) setAvailableCategories(data.items);
        })
        .catch(console.error);
    }
  }, [availableCategories.length]);

  useEffect(() => {
    if (!url.trim()) {
      setQuote(null);
      setValidationError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setValidating(true);
      setValidationError(null);
      try {
        const res = await fetch("/api/v1/listings/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identity: url.trim(),
            desiredTotalDollars: effectiveBidDollars,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setValidationError(data.error || "Validation check failed.");
          if (data.quote) setQuote(data.quote);
        } else {
          setQuote(data);
          if (data.existing) {
            if (data.displayName && !displayName) setDisplayName(data.displayName);
            if (data.categorySlug) {
              setCategorySlug(data.categorySlug);
              onCategoryChange?.(data.categorySlug);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setValidating(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [url, effectiveBidDollars, displayName, onCategoryChange]);

  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{
    amountDollars: number;
    categoryName: string;
    message?: string;
  }>({
    amountDollars: effectiveBidDollars,
    categoryName: initialCategory,
  });

  const handleCategorySelectChange = (newSlug: string) => {
    setCategorySlug(newSlug);
    onCategoryChange?.(newSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setValidationError("Please enter an artist URL or profile link.");
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      const res = await fetch("/api/v1/listings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: url.trim(),
          displayName:
            displayName.trim() ||
            new URL(url.startsWith("http") ? url : `https://${url}`).hostname,
          description: "",
          categorySlug,
          desiredTotalDollars: effectiveBidDollars,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || data.conflict) {
          const selectedCat = availableCategories.find((c) => c.slug === categorySlug);
          setConflictData({
            amountDollars: data.amountDollars || effectiveBidDollars,
            categoryName: data.categoryName || selectedCat?.name || "Music",
            message: data.message,
          });
          setConflictOpen(true);
          setSubmitting(false);
          return;
        }
        throw new Error(data.error || "Unable to proceed to checkout.");
      }

      router.push(data.checkoutUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setValidationError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Inline Row: URL + Category + Claim Rank Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
          {/* Artist URL Input with Globe Icon */}
          <div className="sm:col-span-6 relative">
            <Globe className="w-4 h-4 text-[var(--text-dim)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id={identityInputId}
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Your artist URL or profile link"
              className="w-full pl-10 pr-3.5 py-3 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[#FF5E1A] focus:ring-1 focus:ring-[#FF5E1A]/40 rounded-full text-[var(--foreground)] text-xs sm:text-sm placeholder-[var(--text-dim)] outline-none transition shadow-2xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-4 relative">
            <select
              value={categorySlug}
              onChange={(e) => handleCategorySelectChange(e.target.value)}
              className="w-full appearance-none px-4 py-3 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[#FF5E1A] focus:ring-1 focus:ring-[#FF5E1A]/40 rounded-full text-[var(--foreground)] text-xs sm:text-sm outline-none cursor-pointer transition shadow-2xs pr-9"
            >
              {availableCategories.map((cat) => (
                <option
                  key={cat.slug}
                  value={cat.slug}
                  className="bg-[var(--card-bg)] text-[var(--foreground)]"
                >
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[var(--text-dim)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Claim Rank Button (renamed, amount textbox removed) */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting || validating}
              className="w-full py-3 px-5 bg-[var(--brand-orange)] hover:bg-[var(--brand-orange-hover)] text-white font-bold text-xs sm:text-sm rounded-full shadow-xs shadow-orange-500/25 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer text-center whitespace-nowrap"
            >
              {submitting ? "Opening..." : "Claim rank"}
            </button>
          </div>
        </div>

        {validationError && (
          <div className="text-[11px] text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 font-medium animate-in fade-in duration-150">
            {validationError}
          </div>
        )}
      </form>

      {/* Outbid Conflict Modal */}
      <OutbidConflictModal
        isOpen={conflictOpen}
        amountDollars={conflictData.amountDollars}
        categoryName={conflictData.categoryName}
        message={conflictData.message}
        onClose={() => setConflictOpen(false)}
      />
    </div>
  );
}
