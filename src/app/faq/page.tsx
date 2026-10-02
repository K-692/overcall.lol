import Link from "next/link";
import { HelpCircle, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — overcall.lol",
  description: "Answers to frequently asked questions about overcall.lol ranking, payments, and rules.",
};

const FAQ_ITEMS = [
  {
    q: "What is overcall.lol?",
    a: "overcall.lol is a public, deterministic pay-to-rank discovery leaderboard. Inspired by internet-native paid ledgers, participants pay to claim and climb rankings across categories.",
  },
  {
    q: "How does ranking work?",
    a: "The ranking rule is deliberately simple: More confirmed spend → higher rank. A listing's position is determined by its cumulative confirmed payments. There are no algorithmic popularity boosts or hidden scores.",
  },
  {
    q: "What happens if I bid again?",
    a: "You only pay the difference! If your artist is already listed with a $50 total and you submit a new desired total of $75, checkout charges only $25. Your cumulative total becomes $75 and your listing moves to its new position.",
  },
  {
    q: "How is Today different from All-time?",
    a: "The All-Time board counts the lifetime cumulative spend of every active artist since launch. The Today board tracks spending strictly within the current UTC calendar day, highlighting active campaigns and trending bids.",
  },
  {
    q: "When does Today reset?",
    a: "The Today board resets every midnight UTC (00:00:00 UTC). When it resets, the completed day's standings are permanently frozen and added to the historical Daily Archive.",
  },
  {
    q: "How are equal bids handled?",
    a: "Equal bids are resolved deterministically: the listing whose payment was confirmed earlier keeps the higher rank. Subsequent equal-value bids appear directly below it.",
  },
  {
    q: "What happens if somebody bids while I am checking out?",
    a: "Your rank is finalized based on authoritative board data at the exact moment payment is confirmed. If another listing moves above your target while you are checking out, your payment still applies and you land at the exact rank supported by your confirmed total.",
  },
  {
    q: "What can artists submit?",
    a: "Any legitimate public music profile or website representing an artist, band, music producer, or project. Examples include Spotify artist links, Bandcamp, official websites, Soundcloud, and Apple Music pages.",
  },
  {
    q: "Are payments refundable?",
    a: "No. Because ranking positions are assigned immediately upon payment confirmation and affect public charts in real-time, all payments are final and non-refundable. Being subsequently outbid does not create a refund entitlement.",
  },
  {
    q: "How do I report a listing?",
    a: "If a listing contains malware, deceptive links, or violates our terms of service, click the 'Report' button on the artist profile or visit our Report page. Our moderation team reviews flagged listings promptly.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-[var(--foreground)]">
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--brand-blue)] transition flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to leaderboard
      </Link>

      <div className="space-y-3 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight flex items-center justify-center sm:justify-start gap-3">
          <HelpCircle className="w-8 h-8 text-[var(--brand-blue)]" />
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl">
          Everything you need to know about overcall.lol ranking mechanics, bidding, and policies.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-xs space-y-2.5 transition"
          >
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-start gap-2">
              <span className="text-[var(--brand-blue)] font-mono text-sm">Q{idx + 1}.</span>
              <span>{item.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed pl-6">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] text-center space-y-3 shadow-xs">
        <h3 className="text-lg font-bold text-[var(--foreground)]">Have more questions?</h3>
        <p className="text-xs text-[var(--text-muted)]">
          Check out our How It Works page or read our full Terms of Service.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/how-it-works"
            className="px-4 py-2 rounded-xl bg-[var(--subtle-bg)] hover:bg-[var(--brand-blue)] hover:text-white border border-[var(--card-border)] text-[var(--foreground)] text-xs font-semibold transition"
          >
            How It Works
          </Link>
          <Link
            href="/terms"
            className="px-4 py-2 rounded-xl bg-[var(--subtle-bg)] hover:bg-[var(--brand-blue)] hover:text-white border border-[var(--card-border)] text-[var(--foreground)] text-xs font-semibold transition"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
