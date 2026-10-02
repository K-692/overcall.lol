<div align="center">

<a href="https://overcall.lol">
  <img src="public/logo.png" alt="overcall.lol Logo" width="120" height="120" />
</a>

# overcall.lol

**The Public Pay-to-Rank Discovery & Leaderboard Platform**

An internet-native, competitive discovery engine where **the amount paid directly determines an item's rank** on public leaderboards. Inspired by the raw clarity and spreadsheet-like simplicity of *outbid.lol*, overcall.lol delivers instant legibility, deterministic ranking dynamics, and zero visual bloat.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[Explore Platform](https://overcall.lol) · [Report an Issue](https://github.com/K-692/overcall.lol/issues) · [View Rules](https://overcall.lol/rules)

</div>

---

## ⚡ The Core Invariant

$$\text{More Confirmed Spend} \implies \text{Higher Rank}$$

No opaque algorithms. No shadowbanning. No payola behind closed doors. Listings rank in strict descending order of cumulative paid amount. Equal amounts are resolved deterministically by earliest confirmed payment sequence.

```
┌─────────────────────────────────────────────────────────────┐
│                      overcall.lol                           │
│     Real-Time Deterministic Pay-to-Rank Architecture        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌──────────────────────┐              ┌──────────────────────┐
 │   All-Time Board     │              │     Today's Board    │
 │  Cumulative Lifetime │              │  Strict UTC Day Window│
 │  Confirmed Ledger    │              │  Resets at 00:00 UTC │
 └──────────┬───────────┘              └──────────┬───────────┘
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │               Ranking Engine                 │
        │  ORDER BY total_paid_minor DESC,             │
        │           confirmed_sequence ASC             │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼
 ┌─────────────────────────────────────────────────────────────┐
 │       Sequential High-Density Minimalist Table (#1, #2...)  │
 └─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- **🎯 Deterministic Pay-to-Rank Engine:** Standings, bids, and rank transitions are calculable, transparent, and auditable in real-time.
- **🔄 Pay-the-Difference Incremental Bidding:** Existing canonical listings can be raised by paying only the difference ($\Delta = \text{TargetTotal} - \text{CurrentTotal}$), eliminating duplicate listings and protecting previous investments.
- **📅 Dual Temporal Leaderboards:**
  - **All-Time Board:** Cumulative lifetime spend across all active listings.
  - **Today's Board (UTC):** Spend accumulated strictly within the current UTC day ($00:00:00 \to 23:59:59\text{ UTC}$). Resets automatically at midnight UTC.
- **🏛️ Historical Daily Archive (`/daily`):** Immutable daily snapshots for every single calendar day, complete with an interactive date picker and direct claim shortcuts.
- **🛡️ Outbound Click Tracking & Anti-Bot Filtration (`/go/[id]`):** Transparent analytics tracking genuine user traffic while discarding spiders, crawlers, and automated bots.
- **💳 Multi-Provider Payment Gateway:**
  - **PayPal Standard / Express Checkout:** Live and Sandbox modes via Orders API v2 and webhook verification.
  - **Mock Sandbox Simulator:** Instant zero-credential local testing suite for friction-free development.
- **👑 Ultra-Polished Minimalist Aesthetic:**
  - Clean, sequential vertical ranking table.
  - Transparent `#1` champion entry featuring an amber border, subtle glow, and continuous left-to-right gold shimmer sweep.
  - Custom screenshot-accurate terracotta pagination footer.
  - Dynamic 2-second ease-out stats count-up on the About page.
  - Fluid Dark / Light theme support with seamless system detection.
- **🛠️ Superuser Admin Portal (`/admin`):** Real-time administrative controls to approve, hide, suspend, or feature listings, audit financial transactions, and curate champion testimonials.
- **💬 Community Champions & Live Testimonials:** Direct integration with original X/Twitter posts from community leaders who claimed `#1`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.3.6](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Frontend** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Database** | [SQLite](https://sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) with Write-Ahead Logging (WAL) and 15s concurrency timeout |
| **Icons & Effects** | [Lucide React](https://lucide.dev/), [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **Payments** | PayPal REST APIs v2 + Pluggable Mock Payment Gateway |
| **Deployment** | Node.js / Vercel / Docker-ready |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**, **pnpm**, or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/K-692/overcall.lol.git
cd overcall.lol
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env.local
```

Configure your `.env.local` settings:

```env
# Application Settings
NEXT_PUBLIC_APP_DOMAIN=overcall.lol
NEXT_PUBLIC_APP_URL=https://overcall.lol
APP_NAME=overcall.lol
APP_CURRENCY=USD

# Payment Provider: 'mock' for local sandbox testing, or 'paypal'
PAYMENT_PROVIDER=mock

# PayPal Credentials (optional for mock, required for paypal)
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id_here
```

> **Note:** With `PAYMENT_PROVIDER=mock`, you can test bidding, raises, rank recalculations, and checkout flows immediately without requiring any PayPal API credentials!

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The SQLite database (`overcall.db`) and all seed data will initialize automatically on first boot.

### 5. Production Build

```bash
npm run build
npm run start
```

---

## 📂 Project Architecture

```
overcall_lol/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public pages)
│   │   │   ├── page.tsx              # Main Leaderboard & Inline Quick-Claim Bar
│   │   │   ├── about/page.tsx        # Creator Story & Dynamic Live Count-Up
│   │   │   ├── daily/                # Daily Snapshots & Date Archive Picker
│   │   │   ├── rules/page.tsx        # Platform Operating Rules & Invariants
│   │   │   ├── admin/page.tsx        # Superuser Control Center
│   │   │   ├── checkout/             # Payment Simulator & Checkout Flows
│   │   │   └── go/[id]/route.ts      # Outbound Click Tracking & Anti-Bot Redirection
│   │   ├── api/v1/                   # REST API Layer
│   │   │   ├── leaderboards/         # All-time and Today ranking feeds
│   │   │   ├── listings/             # Listing details & bids
│   │   │   ├── bids/                 # Bid submission & rank calculations
│   │   │   ├── testimonials/         # Champion testimonials API
│   │   │   ├── about-stats/          # Live aggregate financial metrics
│   │   │   ├── payments/             # Webhooks & order verification
│   │   │   └── admin/                # Moderation & maintenance actions
│   │   ├── layout.tsx                # Root layout, Header & Navigation
│   │   └── globals.css               # Design system & custom animations
│   ├── components/                   # Modular React UI Components
│   │   ├── layout/                   # Header, Navigation, Footer & ThemeToggle
│   │   ├── leaderboard/              # LeaderboardView, RankingTable & Sidebar
│   │   ├── bidding/                  # QuickClaimBar, Stepper & CheckoutModal
│   │   └── ui/                       # Accessible UI Primitives
│   └── lib/                          # Core Domain Logic
│       ├── config/                   # Global configuration & constants
│       ├── db/                       # SQLite schema, migrations & seed engine
│       ├── ranking/                  # Deterministic rank computation algorithms
│       ├── identity/                 # URL canonicalization & SSRF guards
│       ├── payments/                 # PayPal & Mock payment providers
│       ├── tracking/                 # Bot filtration & click logging
│       └── moderation/               # Safety checks & reporting audit
├── public/                           # Static assets, logos & media
├── flow.md                           # Complete implementation journey & audit log
├── .env.example                      # Sanitized configuration template
└── package.json
```

---

## 🔌 API Reference (v1)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/leaderboards/all-time` | `GET` | Fetches cumulative all-time rankings with pagination and category filters |
| `/api/v1/leaderboards/today` | `GET` | Fetches active UTC day rankings with live countdown to midnight reset |
| `/api/v1/bids/calculate` | `POST` | Calculates target rank, required incremental spend ($\Delta$), and minimum bid |
| `/api/v1/bids/submit` | `POST` | Validates listing submission, registers pending order, returns checkout session |
| `/api/v1/payments/verify` | `POST` | Confirms payment capture, executes ranking updates, returns confirmed sequence |
| `/api/v1/payments/webhook` | `POST` | Asynchronous provider webhook handler with idempotency verification |
| `/api/v1/about-stats` | `GET` | Aggregates live visitor count, total volume, active items, and highest bid |
| `/api/v1/testimonials` | `GET` / `POST` | Fetches and manages community champion testimonials |
| `/go/[id]` | `GET` | Outbound redirection service with bot filtration and click recording |

---

## 🔒 Security & Privacy Invariants

1. **Zero Secret Leakage:** All secrets, private keys, and webhooks are strictly managed via environment variables and excluded from version control.
2. **SSRF & Malicious URL Protection:** Target URLs are validated, normalized to canonical forms, and prevented from pointing to local loopback or private IPv4/IPv6 ranges.
3. **Idempotent Payment Processing:** Bids are tracked via unique idempotency keys, preventing double-crediting or duplicate ranking events under network retries.
4. **Anti-Bot Filtering:** Clicks from known scrapers, crawlers, and headless agents are filtered to preserve authentic conversion metrics.

---

## 👨‍💻 Creator & Author

Built with pride by **Krishnendu Pal**  
*AI Researcher & Creator of [overcall.lol](https://overcall.lol)*

- **GitHub:** [@K-692](https://github.com/K-692)
- **LinkedIn:** [krishnendu-pal-3615b4224](https://www.linkedin.com/in/krishnendu-pal-3615b4224/)
- **Target Production:** [https://overcall.lol](https://overcall.lol)

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
