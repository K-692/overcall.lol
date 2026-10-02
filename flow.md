# OverCall.lol — Project Flow & Implementation Journey

> **Platform:** OverCall.lol — The Public Pay-to-Rank Music Discovery & Leaderboard Platform  
> **Status:** Phase 2 Complete · Minimalist & Streamlined outbid.lol UI Architecture  
> **Date:** September 2026  
> **Target Production Domain:** `overcall.lol`  

---

## 1. Executive Summary & Design Philosophy

OverCall is an internet-native, competitive music discovery platform where **the amount paid directly determines the artist listing's rank** on public leaderboards. Inspired directly by the "insultingly simple," spreadsheet-like model of *outbid.lol*, OverCall prioritizes raw clarity, instant legibility, and high-density information architecture over heavy visual bloat or confusing dashboards.

$$\text{More Confirmed Spend} \implies \text{Higher Rank}$$

### Core Design & Behavioral Invariants:
1. **Spreadsheet-Simple Aesthetic:** A clean, sequential vertical ranking list starting immediately with rank #1. No gaudy 3D podiums, heavy animations, or distracting widgets pushing content offscreen.
2. **Inline Quick-Claim Bar:** Directly below the concise headline, visitors have an inline, 1-line bidding input: `[ Artist Link ] [ Genre ] [ $ Amount ] [ Claim Rank ]` with instant quote feedback.
3. **Public & Transparent:** Standings, bids, clicks, and UTC day boundaries are auditable by anyone in real time.
4. **Deterministic Tie-Breaking:** Equal amounts resolved strictly by earliest confirmed transaction sequence ($\text{confirmed\_sequence ASC}$).
5. **Incremental Re-Bidding ("Pay-the-Difference"):** Existing canonical listings are raised by paying only $\Delta = \text{TargetTotal} - \text{CurrentTotal}$. Duplicate listings are prevented.
6. **Dual Temporal Views:**
   - **All-Time Board:** Cumulative lifetime spend across active listings.
   - **Today's Board (UTC):** Spend accumulated strictly within the current UTC day ($00:00:00 \to 23:59:59.999\text{ UTC}$). Resets automatically at midnight UTC.
   - **Historical Daily Archive:** Immutable snapshots preserved for past calendar dates.

---

## 2. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16+ (App Router)                  │
│             React 19 · TypeScript · Tailwind CSS            │
├─────────────────────────────────────────────────────────────┤
│  Frontend Presentation (Minimalist outbid.lol Style):       │
│  - Clean Header: Brand + Links (All-time, Today, Cat, FAQ)  │
│  - Compact Hero: Headline + Inline 1-Row Quick-Claim Bar    │
│  - Sequential Vertical Table: #1, #2, #3... with Outbid CTA │
│  - Filter Bar: All-Time / Today (UTC countdown) + Genres    │
│  - Minimal Bottom Summary: Total Volume, Artists & Clicks   │
│  - Dedicated Minimalist Pages:                              │
│    * /artist/[slug] - Clean profile, stats & audit history  │
│    * /categories & /category/artist/music/[slug]            │
│    * /daily & /daily/[date] - Immutable snapshots           │
│    * /checkout/simulator & /checkout/success                │
│    * /how-it-works, /faq, /terms, /privacy, /report, /admin │
├─────────────────────────────────────────────────────────────┤
│  API & Business Logic Layer (`src/lib`):                    │
│  - Ranking Engine (`src/lib/ranking/rankCalculator.ts`)     │
│  - Payment Provider Abstraction (`src/lib/payments`)       │
│  - Identity & URL Normalizer (`src/lib/identity`)           │
│  - Outbound Click & Anti-Bot Service (`src/lib/tracking`)   │
│  - Moderation & Audit System (`src/lib/moderation`)         │
├─────────────────────────────────────────────────────────────┤
│  Persistence Layer:                                         │
│  - SQLite (better-sqlite3) with WAL Mode & 15s Busy Timeout │
│  - Relational tables: listings, categories, transactions,   │
│    ranking_events, daily_listing_totals, click_events,      │
│    reports, admin_audit_logs                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Schema & Invariants

1. **`categories`**: Taxonomy with parent-child hierarchy, slugs, display orders, and active flags.
2. **`listings`**: Canonical identity URL (unique normalized), display name, slug, description, destination URL, image URL, category ID, moderation status (`active`, `pending`, `hidden`, `suspended`, `removed`), total paid in integer cents (`total_paid_minor`), click count, timestamps.
3. **`bid_transactions`**: Financial ledger entries with provider transaction ID, idempotency key, amount in minor units (cents), transaction type (`initial`, `raise`, `adjustment`), status (`pending`, `paid`, `failed`, `refunded`, `cancelled`), confirmed timestamp.
4. **`ranking_events`**: Immutable audit logs of ranking updates with monotonic `confirmed_sequence`, previous total, and new total.
5. **`daily_listing_totals`**: UTC date snapshots for daily leaderboard calculations and archiving.
6. **`click_events`**: Anonymized outbound click analytics with bot filtering.
7. **`reports` & `admin_audit_logs`**: Safety, compliance, and governance records.

---

## 4. Implementation Journey & Evolution

- [x] **Milestone 0: Specification Ingestion & Scaffolding**
  - Ingested `overcall_lol.md` full product specifications.
  - Initialized Next.js 16+ TypeScript App Router structure.
  - Setup SQLite database with WAL mode and multi-worker concurrency protection.

- [x] **Milestone 1: Deterministic Ranking & Identity Layer**
  - URL canonicalization with trailing slash normalization and SSRF prevention.
  - Formula: `ORDER BY total_paid_minor DESC, confirmed_sequence ASC`.
  - Incremental re-bid calculation charging only the difference.
  - UTC midnight boundary handling for daily leaderboards and archive snapshots.

- [x] **Milestone 2: Payment Gateway & Webhook Abstraction**
  - Integrated `PaymentProvider` interface and mock sandbox simulator.
  - Signature verification and idempotency handling preventing duplicate event execution.

- [x] **Milestone 3: Outbound Click Tracking & Anti-Bot Filtration**
  - Implemented `/go/[id]` redirection route.
  - Filtered automated crawlers (Googlebot, Bingbot, curl, etc.) while recording genuine human clicks.

- [x] **Milestone 4: UI Simplification & Minimalist outbid.lol Alignment**
  - Removed visual clutter: bulky 3D podium cards, oversized form sidebars, and rainbow neon gradients.
  - Converted the homepage into a spreadsheet-simple layout:
    - Clean brand header with text navigation.
    - Inline 1-row Quick-Claim bar right below the headline.
    - Full-width sequential vertical rankings table starting at `#1`.
    - Genre pills, All-Time vs Today tab switcher with UTC countdown.
    - Streamlined artist detail page (`/artist/[slug]`).

- [x] **Milestone 5: Theme Toggle, $1 Daily Bid, Live Metrics & Dynamic About Section**
  - **Site Logo Integration:** Embedded the official logo (gavel with ascending trend arrow) into the navigation `Header.tsx`, `Footer.tsx`, and site metadata (`layout.tsx` icons/favicon).
  - **Dynamic Title Refinement:** Updated the main hero headline to: *"Claim your spot on the leaderboard."*
  - **Light / Dark Mode Switcher:** Dynamic CSS variables (`--background`, `--foreground`, `--card-bg`, `--card-border`, `--subtle-bg`, `--input-bg`) in `globals.css` with persistent `localStorage` synchronization and smooth transitions via `ThemeToggle.tsx`.
  - **$1 Daily Bid Floor:** Lowered minimum initial bid threshold from $5.00 to $1.00 (`minInitialBidMinor: 100`) across `config`, `ClaimWidget`, and validation endpoints.
  - **Live Online & Daily Visitors Counter:** Built `/api/v1/live-stats` endpoint and added dual live statistics badges into the navigation header:
    - Daily Visitors (`👁 14,850+ today`) with periodic refreshing.
    - Live Online Visitors (`● 42 online`) with an animated pulsing green indicator.
  - **Dynamic Real-Time About Section (`/about` & `/api/v1/about-stats`):**
    - Built dedicated backend endpoint `/api/v1/about-stats` that dynamically queries `overcall.db` to calculate live platform metrics:
      * Dynamic all-time visitors and real-time click volume.
      * Dynamic total revenue from active listings and transactions.
      * Dynamic highest rank holder (identifying top active listing or record).
      * Dynamic listed products / artists count.
      * Dynamic daily volume and artists added today (UTC date partitioned).
      * Real-time calculation of elapsed hours since the August 19, 2026 launch.
    - Interactive live sync indicator with manual and automated periodic refresh.
    - Dynamic digit-by-digit revenue counter component.
    - Preserved viral founder testimonials from X (MakerThrive, Lewis, CrowdReply, Tibo).

- [x] **Milestone 6: White, Blue & Orange Brand Theme + Enlarged Rounded Logo**
  - **Color Palette Alignment with Logo:**
    * Primary Clean White (`#FFFFFF`): Crisp card backgrounds and clean modern surfaces.
    * Electric Blue (`#0066FF`): Modeled from the logo's upward trend arrow; applied to primary CTA buttons, active All-time/Today tabs, category filter pills, link hovers, and top 2-3 ranking badges.
    * Warm Energetic Orange (`#FF5E1A`): Derived from the gavel handle accent; applied to #1 rank badge, header Claim Rank button, and Outbid action buttons.
    * Deep Midnight Navy (`#070D19`): Modeled from the gavel head and outline for high-contrast dark theme mode.
  - **Logo Refinement:**
    * Enlarged the logo size (`w-9 h-9 sm:w-10 sm:h-10` in header, `w-6 h-6` in footer, `w-8 h-8` in mobile menu).
    * Enclosed the logo in rounded containers (`rounded-2xl` / `rounded-xl`) with white backing and subtle borders for crisp contrast on both light and dark themes.
  - **Light/Dark Toggle Modernization:**
    * Defaulted to the crisp white/blue/orange light theme while preserving full toggle support for dark mode.

- [x] **Milestone 7: Dynamic +$1 Target #1 Title, Centered Controls, Category List View, 7-Day Daily Cards & High-Contrast Light Theme**
  - **Dynamic +$1 Target #1 Headline & Quick-Claim Pay Button:**
    * Removed legacy subtitle: *"The public pay-to-rank music chart where your bid directly decides your position. Daily bid starts at $1."*
    * Dynamic calculation of the required bid to claim #1 on the All Genres leaderboard: `targetNumberOneDollars = Math.max(1, Math.floor(currentNumberOneMinor / 100) + 1)`.
    * Hero headline dynamically reflects: `Claim your spot on the leaderboard for ${targetNumberOneDollars.toLocaleString()}.`
    * Inline `ClaimWidget` automatically pre-fills with `initialBidDollars={targetNumberOneDollars}` and displays `Pay $X,XXX.00`, strictly enforcing +$1 on top of the #1 rank.
  - **Removal of Outbid Action Button:**
    * Removed the "Outbid" button column from `LeaderboardView.tsx`, expanding artist information and aligning paid amounts cleanly to the right for maximum minimalism.
  - **Centered Menu Bar & Stretched Full-Width Search:**
    * Removed the redundant "Today" link from the header navigation bar, keeping it right where users interact with it on the homepage leaderboard switcher.
    * Centered the `All-time` / `Today (UTC countdown)` menu switcher in the page layout.
    * Positioned the search bar directly below the switcher, stretching edge-to-edge from left to right for fast accessibility.
  - **Category Section List View (Default First Category):**
    * Refactored `/categories` from a 3-column card grid into a split list view layout.
    * Left column presents all genres vertically with index, name, current #1 artist, and top bid. The first genre (`Electronic`) is automatically selected by default on load.
    * Right column renders the selected genre's live standings list, dedicated quick-claim widget, and deep link to the category page.
  - **Daily Leaderboard 7-Day Cards with Top 3 & Date Picker:**
    * Refactored `/daily` to present the **last 7 UTC calendar days as cards by default**.
    * Each card displays the formatted calendar date, UTC timestamp, total daily transaction volume, and the **top 3 rankings** (#1 in orange, #2 and #3 in blue) with spent amounts.
    * Each card contains a dedicated `"Show all ranks for {date} →"` button linking to `/daily/[date]`.
    * Implemented an interactive date picker button (`Select any date`) in the top navigation strip allowing instant navigation to any historical snapshot.
  - **Universal Text Visibility & High-Contrast Light Theme:**
    * Audited and resolved text invisibility issues caused by legacy hardcoded `text-white` classes against light mode backgrounds across all pages:
      - `/faq`, `/how-it-works`, `/terms`, `/privacy`, `/report`, `/claim`, `/search`, `/categories/[slug]`, `/daily/[date]`, `/admin`, `/checkout/simulator`, `/checkout/success`, and `/checkout/cancel`.
    * Standardized all text elements to theme variables: `text-[var(--foreground)]` (primary text), `text-[var(--text-muted)]` (secondary text), and `text-[var(--text-dim)]` (tertiary text).

- [x] **Milestone 8: Top Category Bar, Dynamic Category Titles, Streamlined Claim Widget, Top-3 Podium Entry Styling & Live Heartbeat Dot**
  - **Dynamic Title & Punctuation Polish:**
    * Removed trailing full-stop from the headline: `"Claim your spot on the leaderboard for $2,001"`.
    * Highlighted the target dollar amount in vibrant orange: `<span className="text-[var(--brand-orange)] font-black">$2,001</span>`.
    * Made the headline title dynamically respond to the selected category:
      - All Genres: `"Claim your spot on the leaderboard for $2,001"`.
      - Specific Genre (e.g. Rock): `"Claim your spot on the Rock leaderboard for $X,XXX"`.
      - Synchronized `initialBidDollars` and `initialCategory` in `ClaimWidget` with the selected category.
  - **Relocation of Category Bar to Top:**
    * Moved the horizontal category selection bar to the very top of the homepage, directly underneath the main navigation bar.
  - **Header Navigation Simplification:**
    * Removed the "Categories" tab link from both desktop navigation and the mobile drawer.
    * Removed the "+ Claim Rank" CTA button from the navigation bar and mobile drawer, focusing visitor attention on the central hero claim bar.
  - **Streamlined ClaimWidget:**
    * Removed the helper status text (`"Enter artist link to claim or raise position."` and calculation details).
    * Reduced the widget strictly to its core components: URL input, Category selector, Dollar amount input, and Pay button.
  - **Attractive #1, #2, #3 Podium Styling on Leaderboard Entries:**
    * **Rank #1 Entry:** Warm amber-orange ambient gradient background (`bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.04] to-transparent`), border accent (`border-l-4 border-l-[var(--brand-orange)]`), radiant gold/orange badge (`bg-gradient-to-br from-[#FF6B2B] via-[#FF8F00] to-[#FFB300]`), and bold orange amount.
    * **Rank #2 Entry:** Sleek electric blue ambient gradient (`bg-gradient-to-r from-blue-500/[0.06] via-sky-500/[0.03] to-transparent`), border accent (`border-l-4 border-l-[var(--brand-blue)]`), radiant electric-blue/silver badge (`bg-gradient-to-br from-[#0055FF] via-[#2563EB] to-[#60A5FA]`), and bold blue amount.
    * **Rank #3 Entry:** Metallic bronze/amber ambient gradient (`bg-gradient-to-r from-amber-700/[0.05] via-amber-600/[0.02] to-transparent`), border accent (`border-l-4 border-l-amber-600`), rich bronze badge (`bg-gradient-to-br from-[#B45309] via-[#D97706] to-[#F59E0B]`), and bronze amount.
  - **Live Heartbeat Dot on Today Switcher:**
    * Removed the UTC countdown time string from the "Today" button.
    * Integrated a lifelike heartbeat pulse effect with keyframe animations (`@keyframes heartbeat` and `@keyframes heartbeat-ring`) with an animated glowing red dot signaling an active, on-going live chart.

- [x] **Milestone 9: 'Claim #1 in <category> for $...' Headline & Slash-Free Music Taxonomy**
  - **Dynamic Headline Template ("Claim #1 in <category> for $..."):**
    * Updated headline text template to directly target rank #1:
      - All Genres: `"Claim #1 in All Genres for $2,001"`.
      - Category-specific: `"Claim #1 in Electronic for $2,001"`, `"Claim #1 in Hip-Hop for $1,201"`, `"Claim #1 in Rock for $801"`, etc.
    * Highlighted dollar amount in vibrant orange without a trailing period.
  - **Category Names Taxonomy Normalization (Removing "/"):**
    * Removed all clunky slashes (`/`) from category names in both `src/lib/db/seed.ts` and the live `overcall.db` SQLite database.
    * Standardized to industry-correct music genre names:
      - `Electronic / EDM` $\to$ `Electronic`
      - `Hip-Hop / Rap` $\to$ `Hip-Hop`
      - `Indie / Alternative` $\to$ `Indie`
      - `R&B / Soul` $\to$ `R&B`
      - `Folk / Acoustic` $\to$ `Folk`
      - `Reggae / Dancehall` $\to$ `Reggae`
      - `Devotional / Spiritual` $\to$ `Devotional`

- [x] **Milestone 10: Daily Leaderboard Unique Key Resolution & Next.js Dev Indicator Clarification**
  - **React Unique Key Prop Fix (`src/app/daily/page.tsx` & `rankCalculator.ts`):**
    * Root cause: `getDailyArchive` SQL query aliased listing ID as `l.id as listing_id` rather than `l.id as id`, causing `it.id` to evaluate to `undefined` across daily top 3 items.
    * Enhanced `getDailyArchive` in `src/lib/ranking/rankCalculator.ts` to explicitly project `l.id as id`.
    * Upgraded key assignment in `src/app/daily/page.tsx` to generate globally collision-free keys scoped to the UTC date: `key={`${dateStr}-top3-${item.id || item.slug || idx}`}` and `key={`${dateStr}-empty-${emptyIdx}`}` for placeholder spots.
  - **Dev Indicator Documentation:**
    * Documented the purpose of the red circular Next.js badge (`N`) at the bottom left: it is Next.js's built-in Turbopack development toolbar/indicator and only appears in local development (`npm run dev`), never in production builds.

- [x] **Milestone 11: Unique Outbid Slot System, Authoritative First-Timestamp Settlement, Outbid Conflict Popup Modal, and PayPal Integration**
  - **Deterministic Outbid Slot Identifiers (`outbid_slots`):**
    * Every outbid slot (i.e. +$1 of the current bid in any music category) receives a deterministic unique identifier: `slot_{categorySlug}_{amountDollars}` (e.g. `slot_all_2001`, `slot_electronic_1501`, `slot_hip-hop_1201`).
    * Implemented `outbid_slots` table in SQLite schema with indexes on `category_slug` and `status` (`available` vs `claimed`), tracking the winning listing ID, transaction ID, sequence, and verified payment timestamp.
  - **Authoritative Timestamp-Based Settlement Rule (No Pre-Locking):**
    * Users can concurrently initiate checkout for the same slot without slot-wise pre-locking.
    * Concurrency resolution is settled strictly at payment confirmation time inside an atomic SQLite transaction (`db.transaction(...)` in `applyConfirmedPayment`).
    * **Earliest Timestamp Wins:** The first verified payment according to its timestamp is accepted, monotonic sequence is assigned, and the slot is claimed.
    * **Late Payment Rejection:** Any subsequent payment attempting to claim the same slot with an equal or later timestamp is strictly **failed and NOT accepted**; funds are not credited to the listing and automatic refunds/voids are executed.
  - **Outbid Conflict Popup Modal (`OutbidConflictModal.tsx`):**
    * When a payment attempt fails due to a timestamp race conflict, a stylish modal dialog pops up:
      > **"Somebody else has bid with $<amount> in <category_name>"**
    * Reassures the bidder that funds were not accepted, explains the timestamp rule, and provides a direct CTA to return to the board to view the new available slots.
  - **Backend PayPal REST API v2 Integration:**
    * Built `PayPalPaymentProvider` (`src/lib/payments/paypalProvider.ts`) supporting PayPal Orders API v2 (Sandbox and Live modes).
    * Integrated `/api/v1/payments/paypal/create-order`, `/api/v1/payments/paypal/capture-order`, `/api/v1/payments/paypal/webhook`, and `/checkout/paypal-return`.
    * Authoritative capture timestamp (`create_time`) from PayPal is passed directly to the settlement engine; on conflict, PayPal's Refund API (`POST /v2/payments/captures/{id}/refund`) is immediately triggered to return funds to the customer.
  - **Interactive Concurrency Simulator:**
    * Enhanced `/checkout/simulator` with an interactive "Simulate Competitor Earlier Bid (Test Race Condition)" button, allowing instant verification of the timestamp settlement rule and the outbid conflict popup modal directly in the browser.

- [x] **Milestone 12: Dual-Column Layout with Reciprocal Sidebar Rankings, (-) & (+) Bid Controls, and Category Scroll Arrows**
  - **Horizontal Category List with Left & Right Arrows:**
    * Integrated left and right navigation buttons (`ChevronLeft` / `ChevronRight`) bounding the category list bar to visibly signal horizontal scrollability.
    * Smooth programmatic scrolling on click (`scrollBy({ left: ±240, behavior: 'smooth' })`).
  - **Dynamic Headline with (-) and (+) Circular Stepper Buttons:**
    * Structured headline: `Claim #1 in {category} for - $X,XXX +` (or `Claim today's #1 in {category} for - $X +`).
    * Circular `-` button decrements by $1 (clamped to the minimum required outbid for #1).
    * Circular `+` button increments by $1.
    * Dollar amount highlighted in bold orange (`#FF5E1A`).
  - **Simplified Quick-Claim Row (`ClaimWidget.tsx`):**
    * Removed the amount text box entirely from the input row; bid amount is directly driven by the headline stepper.
    * Input row streamlined to: `[ 🌐 Artist URL ] [ Category ⌄ ] [ Claim rank ]`.
    * Submit button renamed to **"Claim rank"** with warm terracotta/peach pill styling.
  - **Two-Column Layout with Reciprocal Sidebar Rankings (`SidebarRanking.tsx`):**
    * Main column (`lg:col-span-8`): Stretched search bar + full leaderboard cards list.
    * Sidebar column (`lg:col-span-4`):
      - When viewing **All-time ranking** $\to$ Sidebar displays **"• Today's ranking"** with red live dot and `See all >` CTA.
      - When viewing **Today's ranking** $\to$ Sidebar displays **"🏆 All-time ranking"** with trophy icon and `See all >` CTA.
      - Top 5 ranked items rendered with compact thumbnail, title, and spend amount.
  - **Card Isolation & Exclusivity for #1:**
    * Only rank `#1` receives the special warm peach background (`bg-[#FFF6F3]`), orange rank text, and highlighted accents.
    * Removed special podium colors and gradient backgrounds from `#2` and `#3`; ranks `#2` through `#N` render in clean, neutral cards.
  - **UTC Midnight Reset Countdown:**
    * Under the centered switcher pill, active "Today" view displays dynamic real-time countdown: `Resets every day at midnight UTC · {hours}h {minutes}m {seconds}s left`.

- [x] **Milestone 13: Dynamic Tab Title, Lighter Steppers, Mild Gold Shining #1 Card, Orange Theme CTA & Auto-Favicons**
  - **Dynamic Browser Tab Title:**
    * When **All-time** is selected: browser tab title strictly shows `overcall.lol - Claim a rank on the public leaderboard`.
    * When **Today** is selected: browser tab title reactively updates to `Today - overcall.lol`.
    * Synchronized via reactive `useEffect` on `timeframe` in `src/app/page.tsx` and server-rendered default metadata in `src/app/layout.tsx`.
  - **Lightened Headline Stepper Buttons:**
    * Softened the `-` and `+` circular stepper buttons from heavy orange fill to ultra-light pastel fill (`bg-orange-50/80` with fine border `border-orange-200/50`).
  - **Mild Gold #1 Card with Always-Shining Effect:**
    * Replaced the dull peach background on `#1` with a prestigious mild gold gradient (`from-[#FFFDF0] via-[#FFF9E7] to-[#FFFDF0]` in light mode, `from-[#211B0E] via-[#2C2311] to-[#211B0E]` in dark mode).
    * Integrated `@keyframes goldShimmer` with continuous diagonal metallic light sweep (`animate-gold-shimmer`) every 3.2s.
    * Added ambient gold breathing glow (`animate-gold-aura`) and gold border accents (`border-[#E5CA68]`).
    * Replaced the plain `#1` label with a gold gradient champion badge (`#1` inside golden pill).
    * Rendered the dollar amount in mild gold typography (`text-amber-600 dark:text-amber-400`).
  - **Orange Theme Claim Rank Button:**
    * Upgraded the "Claim rank" button in `ClaimWidget.tsx` from terracotta to vibrant theme orange (`bg-[var(--brand-orange)]` / `#FF5E1A` with hover `#EA4F0D`).
  - **Automatic High-Resolution Website Favicon Integration:**
    * Added `getFaviconUrl(url, size = 128)` helper in `src/lib/identity/normalizer.ts` utilizing Google's high-resolution S2 Favicon API.
    * Backend checkout route (`/api/v1/listings/checkout`) automatically detects destination domain and stores the favicon if no custom image is supplied.
    * Frontend `LeaderboardAvatar` and `SidebarThumbnail` automatically resolve the favicon for any submitted website or link with error fallback handling.

- [x] **Milestone 14: Editable Bid Input with Dynamic Rank Calculation, Orange/Light Stepper Buttons, Offset-Orange & Yellow Glowing #1 Card, External Tab Redirection & Top 10 Sidebar**
  - **Editable Bid Input & Dynamic Rank Calculation:**
    * Converted the headline dollar amount into an editable numeric input directly inside `- [ $... ] +`.
    * Users can type any dollar amount or click `-` / `+` to increment or decrement.
    * Implemented `calculatePredictedRank(dollars)` adhering strictly to the **late-to-bid rule**:
      - If an existing rank has an amount $\ge$ user's bid, the existing listing stays ahead because it was earlier in time, placing the user in the rank below (`higherOrEqualCount + 1`).
      - The headline dynamically and reactively updates: `Claim #{predictedRank} in {category} for - [ $amount ] +`.
  - **Stepper Button Aesthetics:**
    * The `-` and `+` symbols are colored bold orange (`text-[#FF5E1A]`).
    * The circular button background is filled with an offset of orange that is very light in color (`bg-[#FFF5EE]` / `dark:bg-orange-950/25` with fine border `border-orange-200/60`).
  - **#1 Card with Offset of Orange & Yellow Glow:**
    * Replaced the previous pale gold styling with the requested warm offset of orange background (`bg-[#FFF6EF]` in light mode, `dark:bg-[#1E130D]`).
    * Wrapped in a vibrant yellow border (`border-2 border-amber-300 dark:border-amber-400`) and pulsating yellow glow box shadow (`shadow-[0_0_24px_rgba(250,204,21,0.45)] animate-yellow-glow`).
    * Enhanced `#1` rank badge with an ultra-visible high-contrast black-on-yellow design (`bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 text-black border-2 border-yellow-200/90 font-black text-2xl`).
  - **Click-to-Redirect on Leaderboard in New Tab:**
    * Entire leaderboard rows and sidebar rows are now interactive links to `/go/${item.id}` opening in a new tab (`target="_blank" rel="noopener noreferrer"`).
    * Outbound click logging is automatically triggered, redirecting immediately to the destination website.
  - **Working Dummy Websites with High-Res Favicons:**
    * Seeded 12 real, accessible working dummy websites (Spotify, SoundCloud, Bandcamp, YouTube Music, Apple Music, Pitchfork, Tidal HiFi, Mixcloud, Audiomack, GitHub Open Audio, Wikipedia, and BBC Sounds).
    * All entries automatically fetch real, high-resolution official favicons from the domains via Google S2 Favicon API.
  - **Top 10 Entries Always in Sidebar Rankings:**
    * Updated `SidebarRanking.tsx` to request and display top 10 rankings (`limit: 10`) always for both All-time and Today.

- [x] **Milestone 15: Transparent Stepper Background, Clean #1 Glow (No Black Fill), 2-Column Admin-Managed Testimonials, Krishnendu Pal AI Researcher Profile, Header Reorganization, Rules Integration & Universal overcall.lol Branding**
  - **Transparent Stepper Background:**
    * Removed solid and tinted backgrounds from `- $2000 +` in `src/app/page.tsx`.
    * Minus and plus circular buttons set to `bg-transparent hover:bg-orange-500/10` with subtle border `border-orange-300/60 dark:border-orange-500/40`.
    * Editable bid input set to `bg-transparent` with borderless typography.
  - **Removal of Black Fill in #1 Item:**
    * Eliminated `text-black` and dark card fills in `LeaderboardView.tsx`.
    * Rank `#1` badge upgraded to an amber-yellow luminous pill (`bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-400 text-amber-950 border border-yellow-200`).
    * Card background set to a clean amber offset (`bg-amber-500/10 dark:bg-amber-500/15`) with radiant border and shimmer light beam without dark or black shading.
  - **2-Column Champion Testimonials on About Page:**
    * Converted the "From the people who took #1" section in `src/app/about/page.tsx` into a responsive 2-column card grid (`grid grid-cols-1 md:grid-cols-2 gap-4`).
    * Backed by database table `champion_testimonials` and `/api/v1/testimonials` with self-healing migration and live sync.
    * Added full administrative control tab in `/admin` enabling the administrator to create, preview, toggle visibility, and delete testimonials.
  - **Founder Section Replacement — Krishnendu Pal:**
    * Replaced previous founder block with **Krishnendu Pal**:
      - Title: **AI Researcher**
      - Circular profile photo embedded from attached media at `/public/krishnendu.jpg` (`rounded-full object-cover object-[50%_20%] border-2 border-[#FF5E1A] shadow-md ring-4 ring-[#FF5E1A]/15`).
      - Verified links with official icons:
        - GitHub: `https://github.com/K-692`
        - LinkedIn: `https://www.linkedin.com/in/krishnendu-pal-3615b4224/`
    * All metrics on the About page (Total Visitors, Revenue, Highest Rank, Items, Today's Spend) are dynamically synchronized with live database counters via `/api/v1/about-stats`.
  - **Header Layout Restructuring:**
    * **Left Side:** `overcall.lol` logo followed immediately by daily visitors count (`{count} today`) and real-time online indicator (`{count} online` with pulsing green dot).
    * **Right Side:** Desktop navigation tabs (`Leaderboard`, `Daily`, `About`, `Rules`).
    * **Action Controls:** Swapped icon order to place Search icon first and ThemeToggle second.
    * **Rules Integration:** Replaced "FAQ" with "Rules" across header navigation, mobile menu, and footer, linking to `/rules` which presents the canonical rules of the platform (aliasing `/how-it-works`).
  - **Universal overcall.lol Casing:**
    * Replaced all occurrences of `OverCall` and `OverCall.lol` with lowercase `overcall.lol` across all pages, layouts, metadata, terms, privacy, search, report, config, and backend engine docstrings.

- [x] **Milestone 16: About Profile Refinement, Testimonial X Post Redirection & Offset Orange #1 Elimination of Black Fill**
  - **About Profile Streamlining:**
    * Removed the standalone "AI Researcher" badge from the right side of "Krishnendu Pal".
    * Removed *"Researching intelligent systems, algorithmic ranking dynamics, and next-generation decentralized web architectures."* from the bio, keeping it crisp and authoritative: *"AI Researcher & Creator of overcall.lol."*
  - **Testimonial Redirection to Original X Posts:**
    * Made all 2-column cards under *"From the people who took #1"* clickable links (`<a>` elements with `target="_blank" rel="noopener noreferrer"`).
    * Enhanced the database schema and API route (`/api/v1/testimonials`) with `post_url` support and automated handle fallback (`https://x.com/{handle}`).
    * Included `post_url` field in the `/admin` superuser panel for adding and modifying original tweet links.
  - **Offset Orange #1 Styling (Complete Removal of Black Fill):**
    * In `src/components/leaderboard/LeaderboardView.tsx`, changed the `#1` badge to use the light offset orange fill (`bg-[#FFF5EE]` / `dark:bg-orange-950/50`) matching the `-` and `+` stepper button color, with glowing yellow border (`border-2 border-amber-300 dark:border-amber-400 shadow-[0_0_16px_rgba(250,204,21,0.45)]`) and theme orange text (`text-[#FF5E1A]`).
    * In `src/app/page.tsx`, colored the dynamic rank number in the headline with theme orange (`text-[#FF5E1A]`) rather than defaulting to foreground black.
    * In `src/components/leaderboard/SidebarRanking.tsx`, styled `#1` in the top 10 sidebar in bold orange text.

- [x] **Milestone 17: 50 Entries Page Size, Screenshot-Accurate Orange Pagination, Daily Tab Claim Button & Date Dropdown, Transparent #1 Glowing Card, and About Page Bill Copy**
  - **50 Entries Leaderboard Page Size & API Synchronization:**
    * Updated `APP_CONFIG.pageSize` in `src/lib/config/index.ts` from 25 to 50.
    * Updated default fallback limit in all-time (`/api/v1/leaderboards/all-time`) and today (`/api/v1/leaderboards/today`) API routes to `50` (or `APP_CONFIG.pageSize`).
    * Updated `src/app/page.tsx` fetch logic to request 50 entries and track total database count in state.
  - **Screenshot-Accurate Orange Page Navigation Footer:**
    * Implemented custom pagination footer in `src/components/leaderboard/LeaderboardView.tsx` matching the user's reference screenshot:
      - Row 1: Left chevron `<`, active page in a solid terracotta/orange circle with bold white text (`(1)`), inactive page numbers in orange (`2 3 4 ... 61`), and right chevron `>`.
      - Row 2: Centered item counter displaying `${start} - ${end} of ${total}` (e.g., `1 - 50 of 3,026` or dynamic active count).
  - **Transparent #1 Entry Background with Yellow Glowing Border:**
    * Replaced the tinted peach/orange background of the `#1` entry with `bg-transparent` in `src/components/leaderboard/LeaderboardView.tsx`.
    * Retained the golden shimmer beam, glowing yellow border (`border-2 border-amber-300 dark:border-amber-400`), box-shadow glow, and pulsing yellow glow animation (`animate-yellow-glow`).
  - **Daily Tab Enhancements (`/daily`):**
    * **Current Day "Claim a rank" Button:** For `isToday`, added a prominent orange "Claim a rank" button alongside "Show all ranks", redirecting users directly to the today claiming flow (`/?tab=today`).
    * **Unified Action Label:** Changed button text from `"Show all ranks for <date>"` to strictly `"Show all ranks"` across all daily archive cards.
    * **Interactive Date Picker Dropdown:** Fixed "Select any date" by wiring an overlay date input with direct `.showPicker()` programmatic and native click support, allowing users to open the calendar dropdown and jump to any historical date archive.
  - **About Page Copy & Footer Sub-Links Cleanup:**
    * Replaced `"This simple project generated"` with `"overcall.lol paid my bills worth of"` in the big revenue counter.
    * Removed the sub-links row (`Rules · Terms · Privacy · About · Live stats`) underneath `"Built by Krishnendu Pal · overcall.lol"`.

- [x] **Milestone 18: Transparent #1 Badge & Favicon Container, Continuous Left-to-Right Gold Shimmer Sweep, and 2-Second Stat Count-Up on About Page**
  - **Transparent #1 Badge & Favicon Elements:**
    * In `src/components/leaderboard/LeaderboardView.tsx`, removed all grayish and tinted fill backgrounds:
      - Set `bg-transparent` on the `#1` rank badge (`bg-transparent text-[#FF5E1A] border-2 border-amber-300 dark:border-amber-400`).
      - Set `bg-transparent` on the `LeaderboardAvatar` container for both `#1` and subsequent ranks, eliminating gray square container artifacts.
  - **Continuous Left-to-Right Gold Shimmer Beam:**
    * Re-engineered `@keyframes goldShimmer` in `src/app/globals.css`:
      - Removed the 35% stoppage artifact (`translateX(260%)`) that caused the beam to halt in the center.
      - Defined a continuous, linear movement from `translateX(-160%)` to `translateX(450%)` with `skewX(-20deg)` over `5s linear infinite`.
      - Expanded beam element width to `w-1/3` across the entire card width in `src/components/leaderboard/LeaderboardView.tsx`, allowing the metallic gold beam to glide smoothly from far-left to far-right in an infinite loop without pausing.
  - **2-Second Number Count-Up Effect in About Page:**
    * Created `useCountUp(target, duration = 2000)` hook in `src/app/about/page.tsx` utilizing requestAnimationFrame with an `easeOutCubic` curve.
    * Wired all 6 metrics under *"Then it went live"* (Visitors, Revenue, Highest Rank, Listed items, Bids placed today, Revenue today) to animate smoothly from `0` to their final values over 2 seconds upon opening the About tab.
    * Synchronized the big revenue counter under *"overcall.lol paid my bills worth of"* to tick up from `$0` in unison.

- [x] **Milestone 19: Credential Security Audit, Environment Template Scaffolding, Professional README Architecture, and GitHub Repository Push**
  - **Comprehensive Security & Secret Sanitization Audit:**
    * Performed rigorous codebase scanning for API keys, tokens, client secrets, and hardcoded credentials.
    * Verified that all sensitive variables (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`) are accessed strictly via `process.env`.
    * Tightened `.gitignore` to explicitly ignore `.env*` (including `.env.local`), database files (`*.db`, `*.db-shm`, `*.db-wal`, `*.sqlite*`), build caches (`.next/`), dependency folders (`node_modules/`), and logs (`*.log`), while explicitly allowing `.env.example`.
  - **Environment Configuration Template (`.env.example`):**
    * Created a sanitized, production-ready `.env.example` file documenting all environment options: domain settings, app currency, bidding thresholds, mock mode vs PayPal integration, and webhook configuration.
  - **Production-Grade Documentation & Licensing (`README.md` & `LICENSE`):**
    * Crafted an exhaustive, high-impact `README.md` complete with status badges, system architecture ASCII diagrams, core mathematical invariants, feature breakdowns, API endpoint reference table, quick-start guides, and author credits.
    * Integrated the official centered platform logo (`public/logo.png`) directly at the top of the README for high visual polish and branding clarity on GitHub.
    * Added official MIT License file credited to Krishnendu Pal.
  - **Git Repository Initialization & Remote Push:**
    * Initialized git repository, staged all verified source files, committed with structured commit messaging, and linked remote origin `https://github.com/K-692/overcall.lol.git`.











