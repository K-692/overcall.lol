import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — overcall.lol",
  description: "Terms and conditions governing the use of overcall.lol pay-to-rank platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 text-[var(--foreground)] text-sm leading-relaxed">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[#FF5E1A] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      <div className="space-y-2 border-b border-[var(--card-border)] pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-xs text-[var(--text-dim)]">Effective Date: September 2026 · Version 1.0</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">1. Service Definition</h2>
        <p className="text-[var(--text-muted)]">
          overcall.lol (&ldquo;overcall.lol&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a public, paid-to-rank discovery leaderboard. Rankings on the platform are determined strictly by confirmed transaction totals and deterministic tie-breaking. overcall.lol is not an editorial ranking, talent competition, voting contest, or endorsement of quality.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">2. Bidding and Rank Mechanics</h2>
        <p className="text-[var(--text-muted)]">
          By submitting a listing and completing payment, you agree that your listing will be positioned based on your cumulative confirmed spend relative to other listings. overcall.lol does not guarantee that your listing will maintain any specific rank for any duration, as other participants may subsequently pay more to surpass your position.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">3. Non-Refundable Payments</h2>
        <p className="text-[var(--text-muted)]">
          All payments made through overcall.lol are strictly final and non-refundable. Because ranking adjustments and public ledger updates occur in real-time immediately upon payment confirmation, no refunds, chargebacks, or reversals are granted on the basis of ranking fluctuations or being outbid by another user.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">4. Listing Eligibility and Prohibited Content</h2>
        <p className="text-[var(--text-muted)]">
          You agree to submit only legitimate public profiles or official links. The following are strictly prohibited:
        </p>
        <ul className="list-disc list-inside space-y-1 text-[var(--text-muted)] pl-2">
          <li>Malicious URLs, phishing sites, malware, or deceptive redirects.</li>
          <li>Content that violates applicable intellectual property or trademark laws.</li>
          <li>Unlawful, harassing, defamatory, or sexually explicit material.</li>
          <li>Impersonation of entities or artists without authorization.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">5. Moderation and Removal</h2>
        <p className="text-[var(--text-muted)]">
          overcall.lol reserves the right to hide, suspend, or permanently remove any listing that violates these Terms without notice. In the event of removal for violation of policy, paid fees are forfeited and will not be refunded.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">6. Limitation of Liability</h2>
        <p className="text-[var(--text-muted)]">
          To the maximum extent permitted by applicable law, overcall.lol shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the platform, including any perceived loss of publicity or ranking position.
        </p>
      </section>
    </div>
  );
}
