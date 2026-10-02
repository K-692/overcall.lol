"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { ShieldCheck, CreditCard, ArrowLeft, Lock, Music, Hash, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/config";
import { OutbidConflictModal } from "@/components/common/OutbidConflictModal";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id") || "mock_session";
  const listingId = searchParams.get("listing_id") || "";
  const amountMinor = parseInt(searchParams.get("amount") || "500", 10);
  const isRaise = searchParams.get("is_raise") === "true";
  const artistName = searchParams.get("artist") || "Artist Listing";

  const categorySlug = searchParams.get("category_slug") || "all";
  const categoryName = searchParams.get("category_name") || "All Genres";
  const targetDollars = parseInt(searchParams.get("target_dollars") || String(Math.round(amountMinor / 100)), 10);
  const slotId = searchParams.get("slot_id") || `slot_${categorySlug}_${targetDollars}`;

  const [loading, setLoading] = useState(false);
  const [simulatingCompetitor, setSimulatingCompetitor] = useState(false);
  const [competitorSimulated, setCompetitorSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for outbid conflict popup modal
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{
    amountDollars: number;
    categoryName: string;
    message?: string;
  }>({
    amountDollars: targetDollars,
    categoryName,
  });

  // Action: Simulate a rival bidder paying 5 seconds earlier for this exact slot
  const handleSimulateCompetitor = async () => {
    setSimulatingCompetitor(true);
    setError(null);
    try {
      const earlierTimestamp = new Date(Date.now() - 5000).toISOString();
      const rivalId = `list_rival_${Date.now()}`;

      const res = await fetch("/api/v1/payments/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": "simulated",
        },
        body: JSON.stringify({
          eventType: "checkout.completed",
          transactionId: `tx_rival_${Date.now()}`,
          eventId: `evt_rival_${Date.now()}`,
          amountMinor,
          listingId: "list_neon-horizon", // Seed artist
          isRaise: true,
          status: "paid",
          metadata: {
            artistName: "Earlier Rival Artist",
            slotId,
            categorySlug,
            categoryName,
            paymentTimestamp: earlierTimestamp,
            simulatedAt: earlierTimestamp,
          },
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to trigger competitor simulation.");
      }

      setCompetitorSimulated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to simulate competitor.";
      setError(msg);
    } finally {
      setSimulatingCompetitor(false);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const nowIso = new Date().toISOString();

      // Simulate webhook delivery to backend with current payment timestamp
      const res = await fetch("/api/v1/payments/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": "simulated",
        },
        body: JSON.stringify({
          eventType: "checkout.completed",
          transactionId: `tx_${sessionId}_${Date.now()}`,
          eventId: `evt_${Date.now()}`,
          amountMinor,
          listingId,
          isRaise,
          status: "paid",
          metadata: {
            artistName,
            slotId,
            categorySlug,
            categoryName,
            paymentTimestamp: nowIso,
            simulatedAt: nowIso,
          },
        }),
      });

      const data = await res.json();

      // Check if outbid race condition occurred (status 409 or conflict === true)
      if (res.status === 409 || data.conflict) {
        setConflictData({
          amountDollars: data.amountDollars || targetDollars,
          categoryName: data.categoryName || categoryName,
          message: data.message || `Somebody else has bid with $${targetDollars.toLocaleString()} in ${categoryName}`,
        });
        setConflictModalOpen(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      // Success: redirect to success page
      router.push(`/checkout/success?listing_id=${listingId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed.";
      setError(msg);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/checkout/cancel?listing_id=${listingId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[var(--secondary)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--card-border)]">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs tracking-wider">
              OC
            </span>
            <span className="font-bold tracking-tight text-lg text-[var(--foreground)]">overcall.lol Pay</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center gap-1 font-mono">
            <Lock className="w-3 h-3" /> Sandbox Mode
          </span>
        </div>

        {/* Order Summary */}
        <div className="py-6 space-y-4">
          <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{isRaise ? "Raise Listing Rank" : "New Artist Rank Claim"}</p>
                <h4 className="font-semibold text-[var(--foreground)]">{artistName}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[var(--primary)]">
                {formatCurrency(amountMinor)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[var(--text-muted)] px-1">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-[var(--text-dim)]" /> Outbid Slot ID
              </span>
              <span className="font-mono text-[var(--foreground)] font-semibold bg-[var(--subtle-bg)] px-2 py-0.5 rounded border border-[var(--card-border)]">
                {slotId}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Checkout Session</span>
              <span className="font-mono text-[var(--foreground)]">{sessionId.slice(0, 18)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Execution Rule</span>
              <span className="text-[var(--primary)] font-medium">Pay More → Rank Higher</span>
            </div>
            <div className="flex justify-between">
              <span>Settlement Rule</span>
              <span className="text-emerald-500 font-medium">Earliest Timestamp Wins</span>
            </div>
          </div>
        </div>

        {/* Concurrency Simulator Test Card */}
        <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-3.5 mb-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Concurrency Race Test
            </span>
            {competitorSimulated ? (
              <span className="text-amber-500 font-mono text-[11px] font-semibold">
                Competitor Paid -5s earlier!
              </span>
            ) : (
              <span className="text-[var(--text-dim)] font-mono text-[11px]">Slot Uncontested</span>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            Test the timestamp race condition: simulate someone paying for <span className="font-mono font-bold text-[var(--foreground)]">{slotId}</span> moments before you.
          </p>
          <button
            type="button"
            onClick={handleSimulateCompetitor}
            disabled={simulatingCompetitor || competitorSimulated}
            className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
          >
            {simulatingCompetitor ? "Registering earlier rival payment..." : competitorSimulated ? "✓ Rival Paid First (Now Click Authorize Below)" : "⚡ Simulate Competitor Earlier Bid"}
          </button>
        </div>

        {/* Test Card Info */}
        <div className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
              <CreditCard className="w-4 h-4 text-[var(--primary)]" /> Demo Payment Method
            </span>
            <span className="text-emerald-500 font-mono text-[11px] flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
          <div className="p-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg font-mono text-xs text-[var(--foreground)] tracking-wider flex justify-between items-center">
            <span>•••• •••• •••• 4242</span>
            <span className="text-[var(--text-muted)]">12/28</span>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Timestamp & Settlement...
              </span>
            ) : (
              <span>Authorize & Lock In Rank ({formatCurrency(amountMinor)})</span>
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full py-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--foreground)] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel and return to board
          </button>
        </div>
      </div>

      {/* Outbid Conflict Popup Modal */}
      <OutbidConflictModal
        isOpen={conflictModalOpen}
        amountDollars={conflictData.amountDollars}
        categoryName={conflictData.categoryName}
        message={conflictData.message}
        onClose={() => setConflictModalOpen(false)}
      />
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-[var(--foreground)]">Loading checkout session...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
