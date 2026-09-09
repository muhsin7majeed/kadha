# Kadha Roadmap

Last reviewed: 2026-09-04

Kadha is an open-source, self-hostable movie and TV tracker powered by TMDB and licensed under the MIT License. This roadmap reflects the features implemented in the repository. Checked items are shipped in the codebase; unchecked items are planned and may change as the product evolves.

## Shipped Foundation

### Discovery And Media Details

- [x] TMDB integration for trending, popular, and top-rated movies and TV shows.
- [x] Movie and TV search with media-type filters and pagination.
- [x] Responsive discovery grids, carousels, and media details.
- [x] Cast, metadata, artwork fallbacks, and external media links.
- [x] Region-aware streaming availability using TMDB watch-provider data powered by JustWatch.
- [x] Saved watch-region settings during signup and account settings.
- [ ] Dedicated upcoming-release discovery feed.

### Tracking And Organization

- [x] Watched, liked, and watchlist tracking.
- [x] Optional ratings, watched dates, and private action-specific notes with owner-only summaries and edit access.
- [x] Repeatable private watch-event storage and APIs for movies and TV episodes, with per-viewing dates and notes.
- [x] TV episode and season progress tracking.
- [x] In Progress TV library with next-episode context, sorting, and pagination.
- [x] Custom collections for movies and TV shows.
- [x] Private activity timeline for account, media, collection, and profile actions.

### Social And Privacy

- [x] Friend requests, unfriend, block, and unblock flows.
- [x] Profile, watched, liked, watchlist, and collection privacy controls, including owner-approved anonymous read access.
- [x] Private-profile and locked-content states for unauthorized viewers.
- [x] Private collection invitations with viewer and editor roles.
- [x] Shared collection membership, role management, and collaboration.
- [x] Notifications with unread state and collection-invite actions.

### Ownership, Administration, And Operations

- [x] Docker-first local development and production deployment.
- [x] Environment-based instance and public URL configuration.
- [x] Complete account data export as JSON, including episode-watch history.
- [x] Authenticated self-service account deletion with session cleanup and documented backup handling.
- [x] Authenticated password changes that revoke existing sessions.
- [x] Contact-free password recovery using user-held, single-use recovery codes.
- [x] Read-only admin dashboard with user search and instance metrics.
- [x] Theme presets with independent light and dark modes.
- [x] Responsive grouped navigation for account, privacy, recommendations, navigation, appearance, security, and data settings.
- [x] Account-synced customizable app navigation with Compact, Scrollable, and Grid launcher layouts, reorderable destinations, and per-item icon and label controls.
- [x] Installable Progressive Web App with branded icons, controlled updates, and privacy-safe static-shell caching.
- [x] Automated server and client builds, tests, linting, and CI.
- [x] Canonical package versions and automated release preparation.

## Near-Term Priorities

These priorities are calibrated for Kadha as a small, niche, privacy-focused app rather than an enterprise product. Work
that prevents obvious account compromise, private-data exposure, or privacy-regression bugs stays high priority. Hosted
operations, compliance maturity, and abuse-monitoring work move later unless the hosted service grows enough to need them.

### Privacy, Reliability, And Product Priorities

#### P0 — Trust Baseline And Regression Protection

- [x] Resolve and triage known production dependency vulnerabilities, then enforce production dependency audits in CI.
- [x] Protect login, registration, recovery, and session-refresh endpoints with targeted rate limits, require eight-character new passwords, and provide password-strength guidance.
- [x] Add rotated, revocable refresh sessions with logout invalidation, log-out-everywhere, and reuse detection.
- [ ] Add HSTS, CSP, MIME-sniffing, framing, referrer, permissions, and sensitive-response cache protections.
- [ ] Require recent reauthentication before account export, deletion, password changes, recovery-code replacement, and other sensitive account actions.
- [ ] Add end-to-end smoke coverage for authentication, media tracking, collection permissions, and privacy visibility.
- [x] Close authentication CSRF exposure with hosted-instance `SameSite=Strict` cookies, JSON-only auth requests, and Origin validation.
- [x] Add authenticated self-service account deletion with session cleanup and documented backup handling.
- [x] Complete account exports with episode-watch history and automated coverage for every user-owned data category.
- [x] Automate encrypted, integrity-checked SQLite backups before migrations with retention and restore tooling.

#### P1 — Portability, Useful Privacy, And Product Reliability

- [x] Add selectable, versioned JSON export and import with validation, preview, idempotency, and conflict handling.
- [ ] Add supported import adapters for services such as Letterboxd or Trakt.
- [ ] Add watch-history totals and trends.
- [ ] Add breached-password rejection without sending complete passwords to a third party.
- [ ] Validate JWT secret strength and separation, document rotation, and restrict production environment-file access.
- [ ] Complete the hosted privacy notice with operator contact, purposes, retention, recipients, user rights, cookies, and deletion details before broader hosted use.
- [ ] Document and verify upgrades from existing SQLite databases.
- [ ] Measure client startup and home-page performance, then set a practical bundle budget.
- [x] Add collaboration-safe account deletion with impact previews, optional collection ownership transfer, anonymous
  system notifications, and stale-resource handling.
- [x] Make newly registered profiles, activity sections, and collections private by default.
- [x] Gate production deployments on successful CI and security checks, deploy immutable image versions, and retain a rollback path.
- [x] Add authenticated password changes that revoke existing sessions.

#### P2 — Hosted Operations And Social Expansion

- [ ] Complete a production restore drill using an off-host backup and separately stored encryption key.
- [ ] Add privacy-conscious security logging and alerts for authentication abuse, session reuse, admin access, exports, deletion, and backup failures.
- [ ] Define and enforce retention periods for obsolete activity, resolved notifications, old invitations, and operational logs.
- [ ] Expand third-party transparency for TMDB search, media lookup, artwork, and hosting data flows.
- [ ] Automate scheduled off-host replication of encrypted database backups with remote retention and failure reporting.
- [ ] Add a configurable private support channel for account and privacy requests that cannot be completed in-product.
- [ ] Evaluate opt-in username discovery.
- [ ] Add a privacy-aware friends activity feed.
- [ ] Add a full ghost mode with no public profile footprint.

### Release And Beta Reliability

- [ ] Keep core Docker Compose build, lint, and test checks green before releases.
- [ ] Expand smoke coverage as privacy-sensitive product flows are added.

### Data Ownership

- [x] Keep export and import formats documented as they evolve.

### Media Tracking

- [x] Add movie watch-history management to the media details experience, including explicit rewatch logging and
  individual event editing and removal.

### Social

- [x] Add opt-in public collection links.

## Later Product Work

### Recommendations

- [x] Add private recommendations based on a user's own allowed liked, rating, watched, rewatch, and optional watchlist signals.
- [x] Add user-controlled recommendation settings, visible scores and explanations, and more/less/hide tuning feedback.
- [x] Add genre-based and similar-title candidate generation using TMDB without collaborative user-data pooling.
- [ ] Evaluate optional bring-your-own-key or local AI recommendations without server-side data training.

### Insights And Statistics

- [x] Add a private profile overview with watched-title and episode totals, personal rating summaries, and ranked genre,
  cast, movie-director, TV-creator, liked-genre, release-decade, and original-language insights.
- [ ] Add time-watched estimates.
- [x] Add genre and media-type breakdowns.
- [ ] Add TV progress and viewing-pattern insights.

### Integrations

- [ ] Complete Plex activity-sync Phase 0 validation for authorization, webhooks, GUID mapping, imports, and reconciliation.
- [ ] Add supported Plex-to-Kadha sync for watched movies, TV episode progress, and ratings.
- [ ] Add Plex library availability and deep links after activity sync is stable.
- [ ] Add supported Plex Watchlist preview and import as a separate RSS-based follow-up.

### Optional Experiments And Sustainability

- [ ] Evaluate swipe-based discovery and feedback-driven recommendation tuning.
- [x] Choose a hosted model with a useful free core and a paid tier for advanced or heavier-use features.
- [ ] Measure hosted usage and support costs, then define transparent free-tier limits and paid pricing.
- [ ] Add hosted subscriptions without paywalling privacy, account security, export, or deletion.
- [x] Publish the project under the MIT License and keep self-hosting available without hosted subscription gating.

## Guiding Principles

- Users should be able to control, export, and delete their data.
- Self-hosting is first-class.
- Privacy is the default, not an afterthought.
- Social features are optional.
- No dark patterns.
- No algorithm manipulation.
