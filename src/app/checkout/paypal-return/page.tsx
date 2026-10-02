"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OutbidConflictModal } from "@/components/common/OutbidConflictModal";

function PayPalReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("token") || searchParams.get("order_id") || "";
  const listingId = searchParams.get("listing_id") || "";
  const slotId = searchParams.get("slot_id") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{
    amountDollars: number;
    categoryName: string;
    message?: string;
  }>({
    amountDollars: 0,
    categoryName: "All Genres",
  });

  useEffect(() => {
    if (!orderId) {
      setError("Missing PayPal order confirmation identifier.");
      setLoading(false);
      return;
    }

    const captureOrder = async () => {
      try {
        const res = await fetch("/api/v1/payments/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, listingId, slotId }),
        });

        const data = await res.json();

        if (res.status === 409 || data.conflict) {
          // Outbid conflict! Someone else had an earlier payment timestamp
          setConflictData({
            amountDollars: data.amountDollars || 0,
            categoryName: data.categoryName || "Music",
            message: data.message,
          });
          setConflictOpen(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data.error || "Failed to capture PayPal payment.");
        }

        router.push(`/checkout/success?listing_id=${listingId}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Payment confirmation failed.";
        setError(msg);
        setLoading(false);
      }
    };

    captureOrder();
  }, [orderId, listingId, slotId, router]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center px-4 py-12">
      {loading && (
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5E1A]" />
          <h2 className="text-base font-bold">Verifying PayPal Payment & Timestamp...</h2>
          <p className="text-xs text-[var(--text-muted)]">Confirming slot ownership on overcall.lol</p>
        </div>
      )}

      {error && !conflictOpen && (
        <div className="w-full max-w-md bg-[var(--card-bg)] border border-red-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <h2 className="text-lg font-bold text-red-500">Payment Error</h2>
          <p className="text-xs text-[var(--text-muted)]">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="py-2.5 px-4 rounded-xl bg-[var(--brand-blue)] text-white text-xs font-bold cursor-pointer"
          >
            Return to Leaderboard
          </button>
        </div>
      )}

      {/* Outbid Conflict Popup */}
      <OutbidConflictModal
        isOpen={conflictOpen}
        amountDollars={conflictData.amountDollars}
        categoryName={conflictData.categoryName}
        message={conflictData.message}
        onClose={() => {
          setConflictOpen(false);
          router.push("/");
        }}
      />
    </div>
  );
}

export default function PayPalReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">Loading...</div>}>
      <PayPalReturnContent />
    </Suspense>
  );
}
