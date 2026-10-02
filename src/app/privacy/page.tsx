import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — overcall.lol",
  description: "Privacy policy regarding data collection, click tracking, and payments on overcall.lol.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 text-[var(--foreground)] text-sm leading-relaxed">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[#FF5E1A] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      <div className="space-y-2 border-b border-[var(--card-border)] pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-dim)]">Effective Date: September 2026 · Version 1.0</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">1. Information We Collect</h2>
        <p className="text-[var(--text-muted)]">
          overcall.lol collects minimal information necessary to deliver transparent leaderboard services:
        </p>
        <ul className="list-disc list-inside space-y-1 text-[var(--text-muted)] pl-2">
          <li><strong>Public Listing Data:</strong> Canonical URL, display name, description, and category.</li>
          <li><strong>Financial Audit Data:</strong> Payment transaction identifiers, amounts paid, and timestamps. We never store credit card numbers, CVVs, or full cardholder billing details.</li>
          <li><strong>Click & Analytics Data:</strong> When users click an outbound link, we record anonymized timestamps and coarse browser user-agents to prevent automated bot inflation.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">2. Public by Default</h2>
        <p className="text-[var(--text-muted)]">
          Rankings, names, cumulative spend amounts, and click tallies are public by design. However, private payer identities, emails, and payment method details are kept confidential and are never exposed publicly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">3. Third-Party Payment Processors</h2>
        <p className="text-[var(--text-muted)]">
          Payments are securely handled by integrated payment processors. All payment processing occurs in encrypted environments compliant with PCI-DSS standards.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">4. Cookies and Local Storage</h2>
        <p className="text-[var(--text-muted)]">
          overcall.lol uses minimal cookies or local storage solely for session persistence, checkout flows, and user preferences. We do not sell user data to advertising brokers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">5. Contact and Inquiries</h2>
        <p className="text-[var(--text-muted)]">
          For privacy inquiries or data requests, please contact our administrative team via our official contact channels.
        </p>
      </section>
    </div>
  );
}
