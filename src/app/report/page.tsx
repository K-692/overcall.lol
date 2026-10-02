"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

function ReportForm() {
  const searchParams = useSearchParams();
  const initialListingId = searchParams.get("listing_id") || "";

  const [listingId, setListingId] = useState(initialListingId);
  const [reason, setReason] = useState("phishing_malware");
  const [details, setDetails] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listingId.trim(),
          reason,
          details: details.trim(),
          reporterEmail: contactEmail.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit report.");
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 space-y-6 text-[var(--foreground)]">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Leaderboard
      </Link>

      <div className="bg-[var(--card-bg)] rounded-3xl p-6 sm:p-8 border border-[var(--card-border)] shadow-xs">
        <div className="flex items-center gap-3 pb-6 border-b border-[var(--card-border)]">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--foreground)]">Report a Listing</h1>
            <p className="text-xs text-[var(--text-muted)]">Help maintain safety and integrity on overcall.lol.</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">Report Received</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Thank you for keeping overcall.lol safe. Our moderation team will review this listing against our guidelines.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-[var(--subtle-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] text-xs font-semibold border border-[var(--card-border)] transition"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Listing URL or ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                placeholder="e.g. list_neon-horizon or artist link"
                className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[var(--brand-blue)] rounded-xl text-[var(--foreground)] text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Reason for Report <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[var(--brand-blue)] rounded-xl text-[var(--foreground)] text-xs outline-none cursor-pointer"
              >
                <option value="phishing_malware">Phishing / Malicious Site</option>
                <option value="deceptive_redirect">Deceptive Redirect / Scams</option>
                <option value="copyright_infringement">Copyright / Trademark Violation</option>
                <option value="hate_harassment">Hate Speech / Harassment</option>
                <option value="spam_manipulation">Bot Abuse / Commercial Spam</option>
                <option value="other">Other Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Additional Details
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe why this listing violates terms..."
                className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[var(--brand-blue)] rounded-xl text-[var(--foreground)] text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">
                Your Contact Email (Optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="reporter@example.com"
                className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--card-border)] focus:border-[var(--brand-blue)] rounded-xl text-[var(--foreground)] text-xs outline-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Submitting Report..." : "Submit Report to Moderation"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-dim)]">Loading report form...</div>}>
      <ReportForm />
    </Suspense>
  );
}
