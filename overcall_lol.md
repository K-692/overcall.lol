# OverCall.lol — Detailed Website Specification

> Product specification for implementation of **OverCall.lol**, a music/artist-focused pay-to-rank public leaderboard inspired by the interaction model and core mechanics of outbid.lol.

---

## 1. Product Definition

### 1.1 Product name

**OverCall**

### 1.2 Domain

**overcall.lol**

### 1.3 Product category

The platform has one top-level category for launch:

- **Artist**

Inside Artist, listings are organized into **Music** categories/subcategories. The taxonomy must be configurable from the admin panel instead of hard-coded so new music categories can be added later without a database migration.

Suggested initial music taxonomy:

- Pop
- Hip-Hop / Rap
- R&B / Soul
- Rock
- Electronic / EDM
- Indie / Alternative
- Metal
- Jazz
- Classical
- Folk / Acoustic
- Country
- K-Pop
- J-Pop
- Latin
- Reggae / Dancehall
- Blues
- Devotional / Spiritual
- Other

The exact taxonomy can be adjusted before launch; the architecture must support arbitrary music subcategories.

### 1.4 Core concept

OverCall is a public leaderboard where **the amount paid determines the listing's rank**.

Artists, musicians, bands, music projects, labels, or authorized representatives can submit a public artist/music identity and pay to obtain a position on the relevant leaderboard. Paying more allows an existing listing to climb higher.

This is a ranking product, not a voting system, popularity contest, review system, or editorial ranking system.

### 1.5 Core product loop

1. Visitor opens OverCall.
2. Visitor sees the current public leaderboard.
3. Visitor selects or submits an artist/music listing.
4. Visitor selects a music category.
5. Visitor enters a bid/rank amount.
6. Visitor accepts the terms.
7. Visitor completes payment through the configured payment provider.
8. Payment is confirmed.
9. Listing is inserted/updated on the leaderboard at the rank supported by the paid amount.
10. Other users can later pay more to move above it.

The product should make this loop extremely obvious on desktop and mobile.

---

## 2. Product Principles

### 2.1 Simple mental model

The user should understand the product within a few seconds:

> **Pay more → rank higher.**

Avoid introducing points, votes, likes, followers, engagement scores, reputation scores, or algorithmic ranking into the core leaderboard.

### 2.2 Public by default

The leaderboard is public and designed for discovery. Users should be able to inspect:

- rank
- artist name
- category
- bid amount / total paid amount
- artist description
- destination link
- listing age / relative listing date
- public click count where enabled
- relevant current-board status

Private payment information must never be exposed.

### 2.3 No unnecessary complexity

Do not require account creation for the first listing unless it becomes necessary for abuse prevention or listing management. The initial interaction should be as close as possible to:

**artist/link → category → amount → payment → live rank**

### 2.4 Mobile-first

The primary ranking experience must work cleanly on a phone without horizontal scrolling. Desktop should provide the richer leaderboard experience.

---

## 3. Scope

### 3.1 Launch scope

Required:

- public homepage
- public leaderboard
- Artist top-level category
- Music subcategories
- all-time leaderboard
- today leaderboard
- historical daily leaderboard/archive
- artist/listing submission
- listing detail page
- bid amount selector/input
- payment checkout integration
- post-payment rank assignment
- re-bidding/top-up flow
- click tracking
- search/filtering where applicable
- basic admin dashboard
- moderation/reporting
- Terms of Service
- Privacy Policy
- contact page
- FAQ / How it works page
- responsive design
- SEO metadata
- sitemap/robots configuration

### 3.2 Explicitly out of scope for initial release

- social feed
- direct messaging between artists and users
- comments
- likes/upvotes
- follower counts as ranking criteria
- music streaming hosting
- uploading copyrighted audio files to OverCall
- full artist-management/CRM system
- music distribution
- royalties
- fan subscriptions
- recommendation algorithm that changes paid rank
- cryptocurrency payments unless explicitly added later
- native mobile applications

---

## 4. Ranking Model

The ranking mechanism should mirror the simple paid-ranking model of the reference product.

### 4.1 Listing identity

Every listing must have a canonical identity key.

Possible identity types for launch:

- artist website URL
- artist profile URL
- public streaming/profile URL
- optionally a verified social profile URL

The implementation should support additional identity types later through an enum/configuration rather than duplicated logic.

### 4.2 Bid amount

A bid represents the cumulative amount paid by the listing toward its rank.

Recommended launch rules:

- minimum initial bid: configurable, default **$5**
- maximum bid: configurable, default **$999,999**
- bid increments: whole currency units by default
- currency: USD at launch
- payment provider may add applicable taxes/fees at checkout
- users cannot submit negative, fractional, NaN, or otherwise invalid bid values

The minimum and maximum must be environment/configuration values rather than constants embedded in UI code.

### 4.3 Initial listing

For a new listing:

`new_total = submitted_bid`

After payment confirmation, calculate the rank based on the current eligible board state.

The listing does not reserve a rank merely by opening checkout.

### 4.4 Raising an existing listing

When the same canonical listing is submitted again:

`raise_amount = desired_total - current_total`

Checkout charges only the difference.

Rules:

- desired total must be greater than current total
- minimum raise: configurable, default **$1**
- user cannot lower an existing listing's total through the normal bid flow
- the listing retains its original `listed_at` timestamp when raised
- raise transactions are stored separately for complete financial/audit history

### 4.5 Taking a higher rank

When a payment is confirmed, recompute the listing position using the authoritative current board data.

Do not trust a rank shown when the checkout session started.

If another listing moves above the amount while payment is pending, the successful payment still applies but the listing lands at the position supported by the final confirmed total.

### 4.6 Equal bids

Equal bid amounts must have deterministic ordering.

Recommended rule:

- earlier confirmed listing/payment keeps the higher rank
- newer equal-value listing appears below it

Store an immutable ordering timestamp/sequence to make tie handling deterministic even if clocks differ across servers.

Preferred implementation:

`rank_sort_key = (-total_paid, confirmed_sequence ASC)`

Where `confirmed_sequence` is a server-generated monotonic sequence for confirmed ranking events or an equivalent deterministic ordering key.

### 4.7 Rank calculation

For an all-time/category board:

```text
ORDER BY total_paid DESC,
         ranking_sequence ASC
```

Rank is then assigned from the resulting ordered list.

For a Today board, use the amount paid during the current UTC day rather than lifetime total.

```text
ORDER BY today_spend DESC,
         today_sequence ASC
```

For a historical daily board, freeze the result when the UTC day ends.

### 4.8 UTC day boundary

Daily calculations use **UTC**.

A UTC calendar day runs:

`00:00:00 UTC → 23:59:59.999... UTC`

At the next midnight UTC:

- Today resets
- the completed day becomes part of the Daily archive
- All-time remains unchanged

This behavior must be implemented server-side and not depend on the visitor's local timezone.

---

## 5. Leaderboards

### 5.1 Homepage leaderboard

The homepage should show the most important current ranking immediately.

Primary controls:

- All-time
- Today

The selected state must be visually obvious.

### 5.2 All-time board

Shows the cumulative amount associated with listings over the lifetime of the platform.

Columns/card data:

- rank
- artist image/avatar/logo
- artist/display name
- music category
- short description
- total paid
- click count
- listed date / relative date
- action: Visit / View details / OutCall / equivalent product CTA

### 5.3 Today board

Shows spending accumulated during the current UTC day.

Display:

- reset indicator/countdown
- current date in UTC
- current top listings
- rank
- today's spend
- artist/category information
- listing destination

### 5.4 Daily archive

Provide a browsable historical archive of completed UTC-day leaderboards.

Example route:

`/daily/2026-09-28`

Each archived day is immutable after close.

Archive page should support:

- date navigation
- previous day
- next day where available
- calendar/date picker
- top N listings
- total daily spend
- number of participating listings

### 5.5 Category boards

Every music subcategory gets independent leaderboard views.

Example:

- `/category/artist/music/pop`
- `/category/artist/music/hip-hop`
- `/category/artist/music/electronic`

Each category board can provide:

- all-time
- today
- daily archive

### 5.6 Board pagination

Do not load thousands of listings in one browser response.

Use server-side pagination or cursor-based pagination.

Recommended initial page size:

- 25–50 entries

Support SEO-friendly pagination for public pages where appropriate.

### 5.7 Top positions

The first positions should have greater visual prominence than the long tail.

Suggested visual hierarchy:

- #1 hero treatment
- #2–#3 prominent cards/rows
- #4 onward compact ranked rows

Do not alter the actual ranking logic to produce the visual hierarchy.

---

## 6. Homepage Specification

### 6.1 Header

Desktop:

- OverCall logo/wordmark
- All-time
- Today
- Music categories
- How it works
- FAQ
- CTA: Claim a rank

Mobile:

- logo
- compact menu
- primary Claim button

### 6.2 Hero

The hero must communicate the concept immediately.

Suggested copy direction:

> **The music leaderboard where your call is your rank.**
>
> Put your artist on the board. Pay more to climb higher.

Avoid making claims about popularity, musical quality, talent, or audience size unless those are independently measured and explicitly labeled.

Primary CTA:

**Claim a rank**

Secondary CTA:

**See today's board**

### 6.3 Bid widget

The primary interaction should be visible without navigating away.

Elements:

- amount decrement button
- amount input
- amount increment button
- canonical artist/profile URL field
- music category selector
- optional display name
- optional short description
- optional image/logo field if supported
- CTA button
- pricing/rank hint

Dynamic helper text:

- current #1 amount
- amount required to target #1
- amount required to surpass a selected listing
- whether the URL already exists on the board
- difference due for a repeat listing

### 6.4 Current board

Show the top listings beneath the hero.

Use real-time or near-real-time refresh when practical, especially during active bidding periods.

### 6.5 Category discovery

Display Music categories as browseable tiles/chips.

Each tile should show:

- category name
- current #1
- current #1 amount
- number of active listings

### 6.6 Social proof / stats

Optional platform stats:

- total artists listed
- total amount paid
- total public visits/clicks
- artists added today
- highest historical bid

Clearly label these as platform statistics, not artist performance metrics.

---

## 7. Artist Submission Flow

### 7.1 Input options

The minimum required identity input is a public URL/profile that represents the artist/listing.

Potential accepted destinations:

- official artist website
- public artist profile
- public music platform profile
- approved public social profile

The allowed destination types should be configurable.

### 7.2 URL normalization

Normalize URLs before identity matching:

- lowercase host
- remove fragments
- normalize trailing slash
- strip tracking parameters where appropriate
- reject unsafe schemes
- resolve known shorteners if the platform chooses to support them

Allowed scheme:

`https://`

`http://` may be accepted only where required; HTTPS should be preferred.

### 7.3 Duplicate detection

Before payment:

1. normalize submitted identity
2. search for an existing listing
3. if found, load its current total
4. show that the user is raising an existing listing
5. calculate the required incremental payment

The UI must never silently create a second listing for the same canonical identity.

### 7.4 Display name

Preferred order:

1. explicitly submitted display name
2. verified metadata from destination, if available
3. parsed site title
4. fallback domain/profile name

Allow the admin to edit presentation metadata without changing the canonical identity key.

### 7.5 Description

Recommended limit:

- 160–280 characters for a concise listing description

The listing description appears publicly.

Do not allow:

- raw HTML
- scripts
- unsafe embeds
- misleading metadata
- unsupported claims presented as verified facts

### 7.6 Artwork/logo

Option A: retrieve the destination site's favicon/logo.

Option B: allow an artist-supplied image.

Image requirements:

- square preferred
- max file size configurable
- server-side content-type validation
- image resizing/compression
- strip metadata where practical
- safe storage URL

Do not require artists to upload artwork for MVP.

---

## 8. Checkout Flow

### 8.1 Checkout states

The frontend must explicitly represent:

1. Ready
2. Validating listing
3. Creating checkout session
4. Redirecting to payment
5. Payment pending
6. Payment confirmed
7. Rank calculated
8. Payment failed/cancelled
9. Verification delayed

### 8.2 Checkout authorization

The client must not be trusted to determine:

- final amount
- current rank
- existing total
- category ownership
- payment state

All of these must be calculated/validated server-side.

### 8.3 Race condition handling

This is a critical requirement.

Scenario:

- user A starts checkout at $100
- user B pays $110
- user A completes checkout

User A must receive a valid position based on the final confirmed board state rather than an obsolete target rank.

### 8.4 Payment idempotency

Payment webhooks can be delivered multiple times.

The system must process payment events idempotently using a unique provider transaction/event ID.

Never add the same payment twice.

### 8.5 Payment provider abstraction

Build a payment service layer:

```text
PaymentProvider
  createCheckout()
  verifyPayment()
  handleWebhook()
  getTransaction()
```

Do not tightly couple ranking logic to the provider SDK.

The provider can be swapped later.

### 8.6 Currency

Launch currency: USD.

Format amounts consistently:

`$5`, `$25`, `$1,005`

Avoid floating-point currency arithmetic.

Use integer minor units internally, e.g. cents:

`amount_cents = 500`

---

## 9. Post-Payment Experience

After successful payment:

### 9.1 Confirmation page

Show:

- payment confirmed
- artist/listing name
- amount now paid
- previous amount if it was a raise
- current all-time rank
- current category rank
- today's rank if applicable
- CTA to view listing
- CTA to share listing
- CTA to raise rank again

### 9.2 Shareable URL

Every listing should have a stable public URL.

Example:

`/artist/<slug>`

The URL should remain stable when the listing's rank changes.

### 9.3 Share card

Generate Open Graph/Twitter-compatible metadata containing:

- artist name
- current rank
- category
- bid amount
- OverCall branding

Do not expose payment provider IDs.

---

## 10. Artist Listing Detail Page

Example:

`/artist/taylor-example`

Contents:

- artist image/logo
- artist name
- music category
- short description
- destination link
- current all-time rank
- current category rank
- today's rank if active
- total paid
- public click count
- listed date
- recent rank/bid activity where appropriate
- CTA to outbid / raise rank

### 10.1 Bid history

Optional but strongly recommended.

Public history should show only non-sensitive data such as:

- timestamp/date
- new total
- whether it was an initial listing or raise

Do not show:

- card details
- billing address
- payment provider customer IDs
- private email addresses
- payment authorization data

---

## 11. Navigation / Route Map

Suggested application routes:

```text
/
/how-it-works
/faq
/categories
/category/artist/music/:slug
/category/artist/music/:slug/today
/daily
/daily/:date
/artist/:slug
/claim
/checkout/success
/checkout/cancel
/search
/terms
/privacy
/contact
/report
/admin
/admin/listings
/admin/payments
/admin/categories
/admin/reports
/admin/users
/admin/settings
```

Use server-rendered or statically generated public pages where practical for SEO.

---

## 12. Search & Discovery

### 12.1 Search

Provide public search across:

- artist name
- listing title
- canonical domain
- music category

### 12.2 Filtering

Filters:

- Music category
- All-time / Today
- optionally rank range
- optionally newly listed

### 12.3 Sorting

Primary ranking remains paid amount.

Secondary discovery sorting can include:

- newest
- trending clicks

These must be clearly labeled and must not masquerade as the official paid-rank board.

---

## 13. Click Tracking

When a visitor clicks an artist's destination link through OverCall, record a click event.

Track at minimum:

- listing ID
- timestamp
- referrer where legally appropriate
- coarse device/browser metadata if needed
- anonymized session/event ID

Do not store unnecessary personal information.

### 13.1 Click counting

Use server-side redirect or tracked outbound route:

`/go/<listing-id>`

Flow:

1. validate listing
2. record click event
3. redirect to destination

Use async/event-based logging where possible so outbound navigation is not noticeably delayed.

### 13.2 Bot filtering

Avoid obviously automated crawlers being counted as human clicks.

Use reasonable bot detection without blocking legitimate privacy-focused browsers.

Document the click-counting methodology.

---

## 14. Moderation & Safety

### 14.1 Listing eligibility

Allow only legitimate public artist/music entities or authorized representatives.

Reject or review:

- malicious URLs
- phishing pages
- malware
- illegal content
- impersonation
- deceptive redirects
- prohibited adult/sexual content
- content that violates applicable law or platform policy
- listings the submitter is clearly unauthorized to represent

### 14.2 Moderation states

A listing should support:

- pending
- active
- hidden
- suspended
- removed

Do not delete financial transaction history when a listing is removed.

### 14.3 Reports

Public report form:

- listing URL
- reason
- optional details
- reporter email optional where appropriate

Admin actions:

- review
- hide
- restore
- suspend
- permanently remove public visibility
- note reason

### 14.4 Non-refund rule

Define refund behavior explicitly in the Terms and checkout UI.

If the business chooses the reference model, payments are final and a subsequent rank change does not itself create a refund obligation. This must be reviewed against applicable consumer/payment laws before launch.

---

## 15. Admin Dashboard

### 15.1 Dashboard overview

Show:

- total active listings
- listings added today
- total paid volume
- today's paid volume
- highest current bid
- highest historical bid
- click volume
- failed payments
- pending reviews
- reported listings

### 15.2 Listings management

Admin can:

- search
- filter
- inspect
- edit display metadata
- change category
- hide/unhide
- suspend
- restore
- inspect bid/payment history

Admin must not directly mutate financial totals through ordinary UI.

Corrections to financial records must use a dedicated audited procedure.

### 15.3 Category management

Admin can:

- create music subcategory
- edit name/slug
- enable/disable category
- reorder categories
- merge/migrate listings

### 15.4 Audit log

Record:

- actor
- action
- target
- previous state where relevant
- resulting state
- timestamp
- reason

---

## 16. Data Model

Suggested relational schema.

### 16.1 `listings`

```text
id UUID / BIGINT
canonical_identity VARCHAR UNIQUE
aidentity_type ENUM
display_name VARCHAR
slug VARCHAR UNIQUE
description TEXT
destination_url TEXT
image_url TEXT
status ENUM
category_id FK
listed_at TIMESTAMP
first_payment_at TIMESTAMP
last_payment_at TIMESTAMP
total_paid_minor BIGINT DEFAULT 0
click_count BIGINT DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
```

### 16.2 `categories`

```text
id
parent_id NULLABLE
name
slug UNIQUE
level
sort_order
is_active
created_at
updated_at
```

For launch:

```text
Artist
  Music
    Pop
    Hip-Hop / Rap
    ...
```

The hierarchy should be general enough to support future non-music Artist subcategories without redesign.

### 16.3 `bid_transactions`

```text
id
listing_id FK
provider_transaction_id UNIQUE
provider_event_id UNIQUE nullable
amount_minor BIGINT
currency
transaction_type ENUM(initial, raise, adjustment)
status ENUM(pending, paid, failed, refunded, cancelled)
confirmed_at
created_at
metadata JSONB
```

### 16.4 `ranking_events`

```text
id
listing_id FK
transaction_id FK
previous_total_minor
new_total_minor
confirmed_sequence BIGINT UNIQUE
confirmed_at
```

### 16.5 `daily_listing_totals`

```text
id
utc_date
listing_id
spend_minor
ranking_sequence
rank
created_at
updated_at
UNIQUE(utc_date, listing_id)
```

### 16.6 `click_events`

```text
id
listing_id FK
occurred_at
date_utc
session_hash nullable
user_agent_hash nullable
referrer nullable
is_bot BOOLEAN
```

### 16.7 `reports`

```text
id
listing_id FK
reporter_email nullable
reason
description
status
created_at
resolved_at
resolved_by
```

### 16.8 `admin_audit_logs`

```text
id
admin_user_id
action
entity_type
entity_id
before_json
after_json
reason
created_at
```

---

## 17. Database Constraints & Invariants

These invariants are mandatory:

1. `total_paid_minor >= 0`
2. one canonical identity maps to one active listing
3. provider transaction IDs are unique
4. provider webhook event IDs are idempotent
5. paid total equals the sum of successfully confirmed financial transactions, subject only to explicitly audited adjustments
6. a listing's initial `listed_at` never changes on a raise
7. category references must point to active/valid categories when a listing becomes active
8. ranking sequence values must be unique and deterministic
9. archived daily ranking results are immutable
10. monetary values use integer minor units

---

## 18. API Specification

Use REST or a typed RPC layer. REST examples below assume `/api/v1`.

### Public

```http
GET /api/v1/leaderboards/all-time
GET /api/v1/leaderboards/today
GET /api/v1/categories
GET /api/v1/categories/:slug/leaderboard
GET /api/v1/categories/:slug/today
GET /api/v1/daily/:date
GET /api/v1/listings/:slug
GET /api/v1/search?q=...
```

### Submission

```http
POST /api/v1/listings/validate
POST /api/v1/listings/checkout
POST /api/v1/payments/webhook
GET  /api/v1/checkout/:id/status
```

### Example validation response

```json
{
  "identity": "artist:example.com",
  "existing": true,
  "currentTotal": 50,
  "requestedTotal": 75,
  "increment": 25,
  "currentRank": 8,
  "estimatedRank": 5
}
```

`estimatedRank` is informational only and must never be treated as guaranteed until payment is confirmed.

### Checkout request

```json
{
  "identity": "https://artist.example.com",
  "displayName": "Example Artist",
  "description": "Independent electronic artist.",
  "categorySlug": "electronic",
  "desiredTotal": 75
}
```

The server must recalculate all sensitive values before creating checkout.

---

## 19. Ranking Service Design

Keep ranking logic isolated in a dedicated service/module.

Suggested methods:

```text
normalizeIdentity()
getListingByIdentity()
calculateIncrement()
getCurrentBoard()
calculateRank()
applyConfirmedPayment()
rebuildDailyBoard()
archiveDailyBoard()
```

### 19.1 Transaction boundary

Payment confirmation and financial update should occur atomically enough that two simultaneous successful payments cannot corrupt totals.

Use database transaction/row locking or equivalent optimistic concurrency control.

Conceptual flow:

```text
BEGIN
  verify webhook
  check idempotency
  lock listing / relevant ranking state
  create transaction
  update total_paid
  append ranking_event
  update daily total
COMMIT
```

Then refresh/cache derived rankings.

### 19.2 Derived vs source-of-truth data

Source of truth:

- confirmed payment transactions
- listing identity
- category

Derived/cacheable:

- rank
- leaderboard page cache
- click aggregates
- daily board snapshots

Never treat cached rank as the financial source of truth.

---

## 20. Real-Time Updates

Recommended behavior:

- polling for MVP: 15–30 seconds on live board pages
- websocket/SSE can be introduced later

When a bid changes the top of a board:

- update affected rows
- update target rank text
- update current #1 amount
- invalidate relevant caches

Do not force a full page reload for every small ranking change.

---

## 21. Caching

Cache public board data aggressively because the pages are read-heavy.

Cache keys should include:

```text
leaderboard:all-time:all
leaderboard:today:all
leaderboard:all-time:category:<slug>
leaderboard:today:category:<slug>
daily:<date>
listing:<slug>
```

Invalidate on confirmed ranking events.

Historical Daily pages can be cached for long periods because they are immutable after close.

---

## 22. Recommended Technical Architecture

A modern TypeScript-first stack is preferred.

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS or a similarly maintainable utility/design system
- accessible component primitives

### Backend

Either:

- Next.js route handlers/server actions for a simpler MVP

or

- dedicated API service if traffic/architecture requires separation

### Database

- PostgreSQL

### ORM

- Prisma / Drizzle / equivalent typed ORM

### Cache

- Redis / managed equivalent

### Object storage

- S3-compatible storage for optional artist images

### Payments

- provider adapter around the chosen payment processor

### Deployment

Use a managed deployment platform suitable for Next.js plus managed PostgreSQL/Redis.

The architecture must remain portable enough to move providers later.

---

## 23. Frontend Component Structure

Suggested components:

```text
<AppShell>
  <Header />
  <Navigation />

<Hero />
<ClaimRankCard />
<LeaderboardTabs />
<Leaderboard />
  <TopListing />
  <ListingRow />
<CategoryGrid />
<StatsStrip />
<Footer />
```

Claim flow components:

```text
<ClaimForm />
<IdentityInput />
<CategorySelect />
<BidAmountControl />
<RankPreview />
<CheckoutButton />
```

Listing components:

```text
<ArtistCard />
<RankBadge />
<BidAmount />
<ClickCount />
<CategoryBadge />
<OutbidButton />
```

---

## 24. UX Details

### 24.1 Bid amount control

Provide:

- minus button
- numeric input
- plus button
- keyboard support
- min/max validation
- formatted currency display

For power users, allow direct typing instead of forcing repeated plus clicks.

### 24.2 Rank preview

Before payment:

```text
Your total: $75
Current #1: $100
Target #1: $105
Your current estimated position: #5
```

Use wording such as **estimated** because the board can change during checkout.

### 24.3 Existing listing detection

When an existing listing URL is entered:

```text
This artist is already on the board at $50.
Raise the total to $75.
You pay $25 today.
```

This is a critical conversion/clarity feature.

### 24.4 Empty state

For empty category boards:

```text
Nobody has claimed a rank yet.
Be the first artist on this board.
[Claim #1]
```

### 24.5 Loading states

Never show fake rankings.

Use skeleton rows or explicit loading states.

---

## 25. Design Direction

### 25.1 Overall visual character

The design should feel:

- internet-native
- competitive
- playful
- premium enough to justify a public paid ranking
- strongly focused on the leaderboard
- music-oriented without becoming a generic music streaming app

### 25.2 Visual hierarchy

Most important visual elements:

1. current rank
2. artist identity
3. current paid amount
4. action to climb/outbid
5. category
6. supporting metadata

### 25.3 Avoid

- cluttered dashboards
- excessive gradients
- stock music imagery everywhere
- fake popularity indicators
- misleading “best artist” language
- confusing auctions where the winner owns the item
- UI that hides the actual amount needed to raise rank

### 25.4 Responsive behavior

Desktop:

- wider board rows
- multi-column category discovery
- rich #1 presentation

Tablet:

- compressed board rows
- 2-column supporting content

Mobile:

- stacked listing cards/rows
- sticky Claim CTA where appropriate
- compact navigation
- no horizontal overflow

---

## 26. SEO

### 26.1 Indexable public pages

Index:

- homepage
- category pages
- public listing pages
- historical daily pages where useful
- FAQ
- How it works

Noindex:

- admin
- checkout intermediate states
- account/private pages
- internal APIs
- moderation pages

### 26.2 Metadata

Every public listing should have unique:

- title
- description
- canonical URL
- Open Graph metadata
- Twitter/X card metadata

Example title:

```text
Artist Name — #12 on OverCall | Pop
```

### 26.3 Structured data

Where appropriate:

- WebSite
- Organization
- BreadcrumbList
- ProfilePage / Person where applicable and valid

Do not use structured data to imply awards, popularity, or editorial endorsement that the site does not actually establish.

---

## 27. Accessibility

Target WCAG 2.2 AA where practical.

Requirements:

- keyboard-accessible controls
- visible focus states
- semantic headings
- ARIA only when needed
- sufficient text contrast
- non-color rank indicators
- meaningful image alt text
- accessible amount input
- screen-reader announcements for rank updates
- reduced motion support

Do not communicate rank solely through color.

---

## 28. Security

### 28.1 Input security

Sanitize/validate:

- URLs
- text fields
- image uploads
- category identifiers
- numerical bid values

### 28.2 SSRF protection

If the server fetches submitted URLs for metadata:

- allow only HTTP(S)
- block private IP ranges
- restrict redirects
- enforce timeout
- limit response size
- validate content type
- sandbox metadata fetching where appropriate

### 28.3 Rate limiting

Protect:

- listing validation
- search
- checkout-session creation
- report submission
- admin endpoints

### 28.4 Webhook security

Verify provider signatures.

Reject unsigned/invalid events.

Use idempotency.

### 28.5 Authorization

Admin functions require strong authentication and role-based access control.

### 28.6 Secrets

Never place payment secrets in client-side bundles.

Use environment variables / managed secret storage.

---

## 29. Privacy

Collect only information required to operate the service.

Avoid exposing:

- payer email unless intentionally made public
- payment provider identifiers
- IP address
- payment method details
- billing address

Publish a clear privacy policy covering:

- payment processing
- cookies/local storage
- analytics
- click tracking
- fraud prevention
- data retention
- deletion/contact process

The actual policy must be reviewed for the launch jurisdiction and chosen payment/analytics providers.

---

## 30. Analytics

Track product events such as:

```text
homepage_view
claim_started
identity_validated
existing_listing_detected
category_selected
bid_changed
checkout_started
checkout_completed
checkout_cancelled
payment_failed
listing_activated
rank_changed
listing_clicked
search_performed
report_submitted
```

Do not send sensitive payment or personal data to analytics platforms unnecessarily.

Useful metrics:

- visitor → claim conversion
- checkout completion rate
- average initial bid
- average raise amount
- time between raises
- share of listings that return to raise rank
- clicks per listing
- revenue by music category
- top-of-board concentration

---

## 31. Error Handling

### Invalid identity

```text
We couldn't verify that artist link.
Check the URL and try again.
```

### Existing identity

```text
This artist is already listed.
Your payment will raise its existing rank.
```

### Bid too low

```text
Your new total must be at least $1 above the current total.
```

### Payment failure

```text
Your payment was not completed.
No rank was changed.
```

### Webhook delay

```text
Payment received.
We're confirming the transaction and will update your rank shortly.
```

### Rank changed during checkout

Do not present this as an error. Explain:

```text
The board changed while you were checking out.
Your payment has been applied and your final rank is based on the confirmed board.
```

---

## 32. Performance Targets

Initial production targets:

- homepage LCP: ideally < 2.5s on a normal mobile connection
- public board first render: < 2.5s target
- cached leaderboard API: < 200ms p95 target
- checkout-session creation: < 1s target excluding payment provider latency
- outbound click redirect: near-immediate

Use pagination and caching to prevent leaderboard size from affecting initial page load.

---

## 33. Reliability

### Required

- daily automated backups
- database point-in-time recovery where supported
- payment event retry handling
- webhook replay safety
- structured logs
- uptime/error monitoring
- alerting on payment/ranking discrepancies

### Financial consistency check

Run periodic reconciliation:

```text
sum(confirmed transactions)
          ==
listing total_paid aggregate
```

Any mismatch must create an administrative alert.

---

## 34. Testing Strategy

### Unit tests

Cover:

- URL normalization
- identity matching
- minimum bid validation
- maximum bid validation
- raise amount calculation
- rank calculation
- equal-bid tie-breaking
- UTC day boundaries
- daily reset
- payment idempotency

### Integration tests

Cover:

- new listing → checkout → webhook → live rank
- existing listing → raise → checkout → updated rank
- simultaneous bids
- failed payment
- duplicate webhook
- payment confirmation delay
- category board updates
- daily archive creation

### E2E tests

Required scenarios:

1. new artist claims a position
2. second artist pays more and moves above it
3. first artist raises and regains a higher position
4. equal bid preserves earlier confirmed ordering
5. Today's board resets at UTC midnight
6. historical daily board remains unchanged after close
7. clicking a listing records a click and redirects
8. invalid URL cannot reach payment
9. checkout cancellation leaves the board unchanged
10. an unauthorized admin cannot mutate listings

---

## 35. Acceptance Criteria

The MVP is ready only when all of the following are true:

### Core product

- [ ] `overcall.lol` is configured as the production domain.
- [ ] The public site is branded as OverCall.
- [ ] Artist is the only top-level launch category.
- [ ] Music subcategories are configurable.
- [ ] Users can submit an artist identity.
- [ ] Users can select a music category.
- [ ] Users can enter a bid amount.
- [ ] Successful payment creates/updates the listing.

### Ranking

- [ ] Higher confirmed total ranks above lower total.
- [ ] Equal totals use deterministic earliest-confirmed ordering.
- [ ] Re-bids charge only the incremental amount.
- [ ] Re-bids update the same listing rather than creating duplicates.
- [ ] Rank is recalculated after payment confirmation.
- [ ] Checkout race conditions do not corrupt rank or totals.

### Boards

- [ ] All-time board works.
- [ ] Today board works.
- [ ] Today uses UTC boundaries.
- [ ] Daily archives are generated and immutable after close.
- [ ] Music category boards work independently.

### Payments

- [ ] Payment webhook signature is verified.
- [ ] Webhooks are idempotent.
- [ ] Failed/cancelled payments do not change the board.
- [ ] Financial totals use integer minor units.
- [ ] No card details are stored by the application unless explicitly required by the provider architecture.

### Public listings

- [ ] Every active artist has a stable public URL.
- [ ] Listing pages contain current rank and paid total.
- [ ] Outbound clicks are tracked.
- [ ] Listing metadata is SEO-friendly.

### Admin

- [ ] Admin authentication exists.
- [ ] Listings can be moderated.
- [ ] Categories can be managed.
- [ ] Reports can be reviewed.
- [ ] Administrative actions are audited.

### Quality

- [ ] Mobile responsive.
- [ ] Keyboard accessible core interactions.
- [ ] No horizontal scrolling on mobile.
- [ ] Error states are handled gracefully.
- [ ] Core ranking/payment tests pass.
- [ ] Backups and monitoring are configured.

---

## 36. Recommended Project Structure

Example Next.js structure:

```text
src/
  app/
    page.tsx
    how-it-works/
    faq/
    categories/
    category/
      artist/
        music/
          [slug]/
          [slug]/today/
    daily/
      [date]/
    artist/
      [slug]/
    claim/
    checkout/
      success/
      cancel/
    api/
      v1/
  components/
    layout/
    leaderboard/
    claim/
    artist/
    categories/
    checkout/
    common/
  lib/
    ranking/
    payments/
    identity/
    click-tracking/
    moderation/
    seo/
    validation/
  db/
    schema/
    migrations/
  jobs/
    daily-archive/
    reconciliation/
  types/
  config/
```

Keep business logic out of presentation components.

---

## 37. Environment Configuration

Example variables:

```env
NEXT_PUBLIC_APP_URL=https://overcall.lol
APP_NAME=OverCall
APP_CURRENCY=USD
MIN_INITIAL_BID_MINOR=500
MIN_RAISE_MINOR=100
MAX_BID_MINOR=99999900
DAY_TIMEZONE=UTC

DATABASE_URL=...
REDIS_URL=...

PAYMENT_PROVIDER=...
PAYMENT_SECRET_KEY=...
PAYMENT_WEBHOOK_SECRET=...

STORAGE_BUCKET=...
STORAGE_ENDPOINT=...

ANALYTICS_KEY=...

ADMIN_AUTH_SECRET=...
```

Do not commit secrets.

---

## 38. Content & Copy Guidelines

The copy should be concise and internet-native.

Preferred language:

- rank
- bid
- raise
- board
- #1
- claim
- today
- all-time
- music category
- artist

Avoid confusing the product with a traditional auction where only the winner pays. OverCall is a pay-to-rank leaderboard unless the business rules are intentionally changed.

Avoid statements like:

- “best artist”
- “most talented”
- “official #1 artist”
- “critically superior”

unless a separate, objective methodology actually establishes those claims.

---

## 39. Legal / Business Pages

Required public pages:

### Terms of Service

Cover:

- service definition
- eligibility
- listing rights/authorization
- payment rules
- rank mechanics
- bid/raise mechanics
- refunds
- content rules
- moderation/removal
- prohibited use
- intellectual property
- limitation of liability
- applicable law/jurisdiction
- contact

### Privacy Policy

Cover:

- data collected
- purposes
- processors
- payments
- analytics
- cookies
- retention
- user rights
- contact

### FAQ

Answer at minimum:

- What is OverCall?
- How does ranking work?
- What happens if I bid again?
- How is Today different from All-time?
- When does Today reset?
- How are equal bids handled?
- What happens if somebody bids while I am checking out?
- What can artists submit?
- Are payments refundable?
- How do I report a listing?

Legal wording must be finalized for the actual operating entity and jurisdictions before launch.

---

## 40. Reference Mechanics Used For This Specification

The interaction model in this specification is based on the publicly observable mechanics of **outbid.lol**:

- public paid leaderboard
- rank determined by paid amount
- All-time and Today views
- category-specific boards
- repeat submission to raise an existing listing
- incremental payment for raises
- deterministic equal-bid ordering
- rank finalized when payment is confirmed
- UTC-based Today/Daily handling
- public listing/detail pages
- external-link click tracking
- third-party checkout

Reference pages inspected:

- https://outbid.lol/
- https://outbid.lol/faq
- https://outbid.lol/about
- https://outbid.lol/daily/2026-08-24
- https://outbid.lol/category/developer-tools

The exact production values for OverCall (minimum bid, maximum bid, payment provider, refund policy, artist verification rules, legal entity, and final music taxonomy) should be treated as configurable launch decisions rather than assumed to be identical to the reference site.

---

## 41. Final Product Definition

**OverCall.lol is a public pay-to-rank music discovery board.**

The launch hierarchy is:

```text
OverCall
└── Artist
    └── Music
        ├── Pop
        ├── Hip-Hop / Rap
        ├── R&B / Soul
        ├── Rock
        ├── Electronic / EDM
        ├── Indie / Alternative
        ├── Metal
        ├── Jazz
        ├── Classical
        ├── Folk / Acoustic
        ├── Country
        ├── K-Pop
        ├── J-Pop
        ├── Latin
        ├── Reggae / Dancehall
        ├── Blues
        ├── Devotional / Spiritual
        └── Other
```

The central rule is deliberately simple:

```text
More confirmed spend → higher rank
```

The application must make that rule visible, deterministic, auditable, and easy to understand at every point in the user journey.

---

## Implementation Priority

### P0 — Must exist for first release

- homepage
- claim flow
- artist identity validation
- Artist → Music category hierarchy
- payment integration
- payment webhook handling
- all-time ranking
- Today ranking
- repeat bid / pay-the-difference
- public artist pages
- click tracking
- moderation
- Terms / Privacy / FAQ
- responsive UI
- database backups

### P1 — Strongly recommended

- Daily archive
- category landing pages
- search
- shareable ranking cards
- live board refresh
- bid history
- analytics dashboard
- admin category management
- automated reconciliation

### P2 — Future

- verified artist badges
- richer profile metadata
- additional artist subcategories
- streaming-platform integrations
- advanced trend views
- notification system
- real-time websocket board updates
- additional payment currencies
- native applications

---

## Build Rule

Do not implement hidden ranking logic, editorial promotion, or popularity scoring behind the scenes.

A visitor should be able to inspect a listing and understand why it has its position from the documented ranking rules alone.

---

## 26. UI/UX Evolution & Enhancements (Milestone 7 Update)

1. **Dynamic +$1 Target #1 Bidding Model:**
   - Homepage headline: `"Claim your spot on the leaderboard for $X,XXX."` dynamically calculated as `Math.max(1, Math.floor(currentNumberOneMinor / 100) + 1)`.
   - The inline Quick-Claim bar and Pay button strictly reflect this amount for All Genres, enabling 1-click #1 rank claiming.
   - Removed legacy subtitle text: *"The public pay-to-rank music chart where your bid directly decides your position. Daily bid starts at $1."*

2. **Clean Spreadsheet Minimalist Leaderboard:**
   - Removed the "Outbid" action button column, keeping the table minimal, sequential, and focused on Rank, Artist, and Confirmed Spend.
   - Removed "Today" tab link from top navigation bar while keeping the switcher centrally located directly on the leaderboard (`All-time` / `Today ({countdown})`).
   - Stretched search bar full width directly below the centered switcher.

3. **Genre Category List View:**
   - `/categories` structured as an interactive list view with the first category selected by default.
   - Left side displays the genres list with live top bid; right side renders the selected genre's live rankings table and quick-claim input.

4. **Daily Leaderboards Cards (Last 7 Days Default) & Date Picker:**
   - `/daily` presents the past 7 UTC days as cards by default.
   - Each card highlights the Top 3 ranks inside with spent amounts and a `"Show all ranks for {date} →"` button.
   - Top navigation includes an interactive date picker allowing jumping to any historical calendar date.

5. **Theme & Legibility:**
   - Official brand colors (White `#FFFFFF`, Electric Blue `#0066FF`, Energetic Orange `#FF5E1A`).
   - High-contrast typography across all content pages (FAQ, Terms, Privacy, Admin, Checkout, etc.) in both light and dark modes.

6. **Milestone 8 Refinements:**
   - Dynamic title without full stop and with vibrant orange amount: `"Claim your spot on the [Category] leaderboard for $X,XXX"`.
   - Category selection bar relocated to the very top, directly below the main navigation bar.
   - Removed Categories link and +Claim Rank button from navigation bar for maximum focus.
   - Simplified ClaimWidget to only URL, Category, Pay Amount, and Pay button (helper text removed).
   - Attractive top-3 podium entries with ambient gradients, left border accents, and gold/blue/bronze badges.
   - Today tab upgraded with an active beating heartbeat live dot indicator without time string.

7. **Milestone 9 Refinements:**
   - Headline updated to `"Claim #1 in <category> for $..."` format with orange dollar amount without full stop.
   - Slash-free genre taxonomy: all `/` characters removed from category names in code and SQLite database (`Electronic`, `Hip-Hop`, `Indie`, `R&B`, `Folk`, `Reggae`, `Devotional`).

8. **Milestone 10 Refinements:**
   - Resolved React unique key console warning in `/daily` page across `top3` listing cards and empty spot placeholders.
   - Enhanced `getDailyArchive` query in `rankCalculator.ts` to expose `l.id as id`.

9. **Milestone 11: Outbid Slot Unique Identifiers, Authoritative Timestamp Settlement, Outbid Conflict Modal, and PayPal Integration:**
   - **Deterministic Outbid Slot IDs:**
     * Format: `slot_{categorySlug}_{amountDollars}` (e.g. `slot_all_2001`, `slot_electronic_1501`).
     * Tracked via `outbid_slots` relational table in SQLite with indexing on `category_slug` and `status`.
   - **Timestamp-Based Settlement Rule:**
     * Slot-wise pre-locking is not required; multiple bidders can initiate checkout for the same outbid slot simultaneously.
     * Settlement is determined strictly by the payment confirmation timestamp.
     * Earliest timestamp wins the slot and claims the ranking position.
     * Subsequent payments for the same slot with equal or later timestamps are **failed and NOT accepted**; funds are refunded and not credited to listings.
   - **Outbid Conflict Popup Modal:**
     * Triggers whenever a bidder is late on payment:
       `"Somebody else has bid with $<amount> in <category_name>"`
     * Reassures the bidder that funds were not accepted, explains the timestamp rule, and provides a direct link back to the updated leaderboard.
   - **PayPal REST API v2 Integration:**
     * `PayPalPaymentProvider` handles OAuth2 authentication, Orders v2 creation, and order capture.
     * Captures verified payment timestamps (`create_time`) and triggers automatic PayPal refunds (`/v2/payments/captures/{id}/refund`) on outbid conflict.

10. **Milestone 12: Dual-Column Layout with Reciprocal Sidebar Rankings, (-) & (+) Bid Controls, and Category Scroll Arrows:**
    - **Category Scroll Arrows:** Added left and right navigation buttons (`ChevronLeft` / `ChevronRight`) allowing horizontal scrolling across the categories taxonomy bar.
    - **Headline with (-) & (+) Buttons:** Rendered `Claim #1 in {category} for - $X,XXX +` (or `Claim today's #1 in {category} for - $X +`) with circular stepper buttons adjusting the target bid.
    - **Simplified Claim Widget:** Removed amount input text box; input row contains `[ 🌐 Artist URL ] [ Category ⌄ ] [ Claim rank ]`.
    - **Dual-Column Layout with Sidebar Rankings:**
      * Left area: Stretched search bar + full leaderboard cards list.
      * Right area:
        - When viewing All-time $\to$ Sidebar displays **"• Today's ranking"** with `See all >`.
        - When viewing Today $\to$ Sidebar displays **"🏆 All-time ranking"** with `See all >`.
    - **#1 Card Exclusivity:** Only rank `#1` has the peach gradient background (`bg-[#FFF6F3]`) and orange rank; ranks `#2` and above render in clean, neutral cards without podium badges.
    - **UTC Midnight Reset Countdown:** Real-time countdown timer displayed under switcher pill when "Today" is active.






