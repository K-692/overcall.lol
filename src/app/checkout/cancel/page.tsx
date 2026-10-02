import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-6">
          <XCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Checkout Cancelled</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">
          No charges were processed. Leaderboard standings and artist totals remain unchanged.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/10 border border-[var(--card-border)] text-[var(--foreground)] font-medium text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Leaderboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
