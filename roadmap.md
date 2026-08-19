# Kadha Roadmap

Last reviewed: 2026-08-19

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
- [x] Optional ratings, watched dates, and private action-specific notes.
- [x] TV episode and season progress tracking.
- [x] In Progress TV library with next-episode context, sorting, and pagination.
- [x] Custom collections for movies and TV shows.
- [x] Private activity timeline for account, media, collection, and profile actions.

### Social And Privacy

- [x] Friend requests, unfriend, block, and unblock flows.
- [x] Profile, watched, liked, watchlist, and collection privacy controls.
- [x] Private-profile and locked-content states for unauthorized viewers.
- [x] Private collection invitations with viewer and editor roles.
- [x] Shared collection membership, role management, and collaboration.
- [x] Notifications with unread state and collection-invite actions.

### Ownership, Administration, And Operations

- [x] Docker-first local development and production deployment.
- [x] Environment-based instance and public URL configuration.
- [x] Account data export as JSON.
- [x] Contact-free password recovery using user-held, single-use recovery codes.
- [x] Read-only admin dashboard with user search and instance metrics.
- [x] Theme presets with independent light and dark modes.
- [x] Responsive grouped navigation for account, privacy, appearance, security, and data settings.
- [x] Installable Progressive Web App with branded icons, controlled updates, and privacy-safe static-shell caching.
- [x] Automated server and client builds, tests, linting, and CI.
- [x] Canonical package versions and automated release preparation.

## Near-Term Priorities

### Privacy And Security Hardening

#### P0 — Immediate

- [x] Resolve and triage known production dependency vulnerabilities, then enforce production dependency audits in CI.
- [x] Protect login, registration, recovery, and session-refresh endpoints with targeted rate limits, require eight-character new passwords, and provide password-strength guidance.
- [ ] Add breached-password rejection without sending complete passwords to a third party.
- [ ] Add rotated, revocable refresh sessions with reuse detection, logout invalidation, and a log-out-everywhere action.
- [ ] Close authentication CSRF exposure with hosted-instance `SameSite=Strict` cookies, JSON-only auth requests, and Origin validation.
- [ ] Add authenticated self-service account deletion with session cleanup, a private support fallback, and documented backup handling.
- [ ] Complete account exports with episode-watch history and automated coverage for every user-owned data category.
- [ ] Automate encrypted backups before migrations and verify that production data can be restored.
- [ ] Complete the hosted privacy notice with operator contact, purposes, retention, recipients, user rights, cookies, and deletion details.

#### P1 — Next Security And Privacy Release

- [ ] Add HSTS, CSP, MIME-sniffing, framing, referrer, permissions, and sensitive-response cache protections.
- [x] Make newly registered profiles, activity sections, and collections private by default.
- [ ] Evaluate opt-in username discovery.
- [x] Gate production deployments on successful CI and security checks, deploy immutable image versions, and retain a rollback path.
- [ ] Add privacy-conscious security logging and alerts for authentication abuse, session reuse, admin access, exports, deletion, and backup failures.
- [ ] Validate JWT secret strength and separation, document rotation, and restrict production environment-file access.
- [ ] Add authenticated password changes that revoke existing sessions.

#### P2 — Follow-Up Hardening

- [ ] Define and enforce retention periods for obsolete activity, resolved notifications, old invitations, and operational logs.
- [ ] Require recent reauthentication before account export, deletion, password changes, and other sensitive account actions.
- [ ] Expand third-party transparency for TMDB search, media lookup, artwork, and hosting data flows.

### Release And Beta Reliability

- [ ] Add end-to-end smoke coverage for authentication, media tracking, collection permissions, and privacy.
- [ ] Document and verify upgrades from existing SQLite databases.
- [ ] Measure client startup and home-page performance, then set a practical bundle budget.
- [ ] Make CI verify that the root and generated in-app changelogs are synchronized.

### Data Ownership

- [ ] Add versioned JSON import with validation, preview, idempotency, and conflict handling.
- [ ] Add supported import adapters for services such as Letterboxd or Trakt.

### Social

- [ ] Add a privacy-aware friends activity feed.
- [ ] Add opt-in public collection links.
- [ ] Add a full ghost mode with no public profile footprint.

## Later Product Work

### Recommendations

- [ ] Add genre-based and similar-title recommendations using TMDB.
- [ ] Add recommendations based on a user's saved and watched media.
- [ ] Evaluate optional bring-your-own-key or local AI recommendations without server-side data training.

### Insights And Statistics

- [ ] Add watch-history totals and trends.
- [ ] Add time-watched estimates.
- [ ] Add genre and media-type breakdowns.
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
