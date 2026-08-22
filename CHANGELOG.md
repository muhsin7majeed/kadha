# Kadha Changelog

## Unreleased

### Feature Changes

#### Account Security And Control

- Added authenticated password changes that sign users out on every device.
- Added permanent self-service account deletion protected by the current password and an explicit irreversible-action
  confirmation phrase.
- Added collaboration-impact previews and per-collection ownership choices to account deletion, including an opt-in
  automatic transfer to each shared collection's earliest-added accepted member.

#### Collaboration

- Preserved explicitly transferred collections, membership roles, and items when an owner deletes their account.
- Added anonymous system notifications for ownership changes, removed shared collections, and departed collaborators,
  with surviving collection details available directly from transfer notifications.
- Added recovery states that clear stale collection data when a collection is removed or access changes.

#### Data Ownership

- Completed account exports with TV episode-watch history and added an export option to the account-deletion flow.

#### Media Tracking

- Added owner-only tracking summaries to media detail pages and personal-details dialogs to media cards, with direct
  editing for saved ratings, watched dates, and action-specific private notes.

#### Viewing Insights

- Added a private Overview tab to My Profile with all-time watched-title and episode totals, personal rating summaries,
  movie and TV filtering, and ranked genre, cast, movie-director, TV-creator, liked-genre, release-decade, and
  original-language insights.
- Added intentional small-library, empty, loading, error, and partial-metadata states with accessible exact values
  alongside every visual ranking.

### Engineering Changes

#### Account Security And Data Integrity

- Added focused rate limiting for sensitive authenticated account actions, guarded deletion of the final administrator,
  and made collection-item attribution clear automatically when its contributing user is deleted.
- Added server and client coverage for password-change session revocation, account-deletion cascades, irreversible-action
  confirmation, shared-record preservation, and complete account exports.
- Made ownership transfer, notification creation, and account deletion one transaction protected by an opaque
  collaboration-impact fingerprint.

#### Viewing Insights And Media Metadata

- Added canonical shared genre, person, and media-credit storage with durable asynchronous TMDB enrichment, retryable
  backfill jobs, freshness tracking, and partial-coverage reporting.
- Added a versioned, chart-ready owner insights API that derives current results without per-user score tables and
  preserves distinct-title semantics for a future multi-watch event history.
- Added server and client coverage for insight calculations, privacy isolation, shared metadata enrichment, responsive
  rendering, media filtering, and tracking-driven cache invalidation.

## v0.1.10

### Feature Changes

#### Authentication Security

- Blocked cross-origin browser authentication requests, required JSON for state-changing authentication requests, and
  hardened refresh cookies to `SameSite=Strict` by default.

### Engineering Changes

#### Authentication Security

- Added deployment-aware refresh-cookie SameSite configuration and focused CSRF regression coverage.

#### Database Safety

- Added encrypted, integrity-checked SQLite backups before production migrations, configurable retention, and a
  separate persistent backup volume.
- Added backup verification and safe restore tooling that preserves the replaced database, plus operator guidance for
  keeping encrypted backups and their key off-host.

#### Dependency Security

- Updated the transitive URI parser to its patched release and documented a time-limited, configuration-only Prisma
  advisory exception so production audit gates remain strict and reviewable.

## v0.1.9

### Feature Changes

#### Authentication Security

- Added targeted abuse protection for login, registration, account recovery, and session-refresh requests.
- Raised the minimum length for new passwords to eight characters while keeping additional strength recommendations optional.
- Added accessible password-strength guidance, password visibility controls, and password-manager-compatible login and registration fields.

#### Mobile Installation

- Made Kadha installable from supported mobile and desktop browsers with branded Home Screen icons and an app-style
  standalone window.
- Added a contextual install action, iPhone and iPad installation guidance, connection-status feedback, and a
  user-controlled prompt when a new Kadha version is ready.
- Kept account and library data network-only: the installed app caches its static interface but requires a connection
  to load or update personal content.

#### Privacy And Product Transparency

- Made new accounts and collections private by default without changing existing users' visibility choices.
- Clarified that hosted Kadha is pseudonymous rather than anonymous, is not end-to-end encrypted, and remains
  technically accessible to the instance operator.
- Documented visibility scopes, operator access, data uses, TMDB artwork requests, necessary cookies, current export
  limitations, and the lack of a private deletion-request channel during beta.
- Published Kadha under the MIT License and aligned open-source, modification, redistribution, and self-hosting claims
  with the granted permissions.
- Clarified that hosted beta access is complimentary and that the planned sustainable model keeps a useful free core
  while reserving advanced or heavier-use features for a paid tier.

### Engineering Changes

#### Authentication Security

- Added privacy-conscious per-account login throttling, per-IP authentication limits, and configurable trusted-proxy handling for accurate client addresses behind a reverse proxy.
- Added lazy-loaded zxcvbn password estimation and focused server and client coverage for authentication limits and form accessibility.

#### Testing

- Made TV progress coverage independent of the current calendar date so aired-episode checks remain reliable over time.

#### Progressive Web App

- Added a build-generated web app manifest and Workbox service worker with static application-shell precaching,
  explicit network-only API handling, and outdated-cache cleanup.
- Added standard, maskable, and Apple touch icons plus focused install-environment and prompt-lifecycle coverage.
- Added production Nginx cache policies that revalidate the app shell and service worker while keeping hashed assets
  immutable.

#### Privacy Defaults

- Added an existing-data-preserving migration for private user defaults and enforced those defaults explicitly during
  registration.

#### Dependency Security

- Updated the server's production dependency baseline, removed type-only and unused packages from the runtime dependency tree, added an audited transitive security override, and kept development image installs locked to `npm ci`.
- Updated client HTTP dependencies and pinned React Router to the tested Node 20-compatible release while documenting the non-applicable React Server Components advisory.
- Added high- and critical-severity production dependency audit gates for pull requests, pushes, manual CI runs, and a weekly scheduled check, with expiring repository-owned exceptions.

#### Deployment Safety

- Gated hosted production deployments on successful CI runs from `master`.
- Changed hosted server deployments to use the exact CI-tested commit image while retaining commit-tagged images and a documented rollback path.

## v0.1.8

### Feature Changes

#### Settings And Profile

- Reorganized authenticated Settings into responsive Account, Privacy, Appearance, Security, and Data sections with direct URLs for each category.
- Moved account details and profile visibility controls into Settings, and changed My Profile to show the owner's profile activity with account and privacy shortcuts.
- Kept public Settings focused on device appearance so signed-out users no longer see unavailable account recovery or data export actions.

#### Account Recovery

- Added contact-free password recovery using a private, single-use recovery code issued during signup.
- Added recovery-code creation and replacement under Settings → Security for existing accounts, with copy, download, and print options.
- Added a recovery activity history and clear guidance that accounts cannot be recovered if both the password and recovery code are lost.

#### Product Information

- Updated the public roadmap, landing page, and privacy policy to accurately distinguish shipped data export from planned import and account deletion work.
- Added prioritized privacy and security hardening work to the public roadmap and required future feature changes to keep roadmap status synchronized.

### Engineering Changes

#### Frontend Architecture

- Added route-backed Settings categories, shared typed user-update payload construction, and frontend coverage for responsive settings navigation and independent account and privacy updates.

#### Authentication Security

- Stored only one-way recovery-code verifiers, rotated codes after use, and protected recovery attempts with account and IP rate limits.
- Added per-user session versions so password recovery immediately invalidates previously issued access and refresh tokens.
- Added server and client coverage for recovery issuance, replacement, reset, reuse protection, throttling, session revocation, recovery kits, and save acknowledgment.

## v0.1.7

### Feature Changes

#### Navigation

- Replaced the overflowing floating tab bar with a fixed bottom navigation bar that keeps primary destinations visible and moves lower-frequency destinations into a More menu.

#### Responsive Typography

- Added consistent responsive typography across page and section titles, dialogs, application states, cards, tabs, search results, and supporting metadata.

#### Media Cards

- Reduced media card and control sizes on smaller screens while preserving the existing desktop layout.
- Fixed media action and badge sizing at intermediate screen widths.
- Displayed up to two fluid media-card columns on small screens, falling back to one when the available width is too narrow.

#### Media Actions

- Added optional 5-star ratings, watched dates, and private notes to liked, watched, and watchlist tracking flows.
- Added focused tracking dialogs on media detail pages while keeping media-card actions one-click with optional toast actions for details.
- Added TV episode progress tracking with derived progress states, mark-next episode actions, season progress, and a focused episode tracking dialog.
- Added an In Progress TV library page with next-episode context, recently watched sorting, next-episode sorting, and pagination.

#### Authentication

- Fixed logout/session expiry so protected pages leave the loading state and redirect to login after auth is cleared.
- Extended refresh-token sessions from one day to seven days and aligned the signed token lifetime with its cookie.
- Kept refresh tokens exclusively in secure HTTP-only cookies instead of including them in authentication response bodies.

### Engineering Changes

#### Testing

- Added Vitest-based server and client test foundations, including Supertest API coverage, an isolated Prisma SQLite test database, and React Testing Library setup.
- Added server integration test helpers and collection permission coverage for owners, viewers, editors, and member role changes.
- Added user-media API coverage for liked, watched, watchlist, watchlist removal on watched media, and per-user media isolation.
- Added profile and media privacy API coverage for private, friends-only, everyone-visible, owner, and accepted-friend access.
- Added admin API coverage for unauthenticated, non-admin, overview, user list, and user detail access.
- Added collection sharing edge-case coverage for duplicate invites, revoked invites, removed members, leaving shared collections, and owner leave rejection.
- Added remaining backend coverage for auth edge cases, friendship lifecycle, notifications, activity, data export, and TMDB-backed media service behavior.
- Added frontend coverage for route guards, session cleanup, token state, media action payload/copy/cache utilities, metadata parsers, collection helpers, and theme presets.

#### CI

- Added a GitHub Actions CI workflow that runs Docker Compose-backed server build/tests and client lint/tests/build on pushes and pull requests to `master`.
- Cancelled superseded CI and deployment runs so only the latest workflow run for a branch continues.

#### Frontend Architecture

- Split frontend route declarations into domain route modules while preserving paths and lazy loading.
- Refactored the settings route to compose feature-owned theme and data export sections.
- Added accessible names to auth, collection, and search controls without changing their visual layout.
- Renamed the media carousel component, removed duplicate form wrappers, standardized mutation error typing, and made neutral button palettes explicit.
- Split Chakra UI helper exports so client Fast Refresh linting runs without warnings.

#### Theme System

- Added semantic responsive text styles and a Chakra type-generation workflow so typography roles stay centralized and type-safe.

#### Media Tracking

- Extended user-media persistence and validation for private ratings, action-specific notes, and normalized watched dates.
- Kept private tracking details out of username-based profile media APIs while preserving them for the signed-in user's own lists and media details.
- Added normalized TV episode watch persistence, lazy TMDB season detail fetching, and derived TV progress APIs.
- Added a paginated current-user TV in-progress API backed by derived episode progress.

## v0.1.6

### Feature Changes

#### Beta Readiness

- Added hosted beta disclosure, signup privacy warning, and public Privacy Policy and Terms pages.

#### Data Ownership

- Added account data export so users can download their Kadha profile, media, collections, social, notification, and activity data as JSON.

#### Media Actions

- Improved media action buttons with clearer labels, collection access from media details, more helpful feedback messages, and undo actions when removing saved media.

### Engineering Changes

#### Frontend Architecture

- Consolidated frontend auth/session state around the `/me` query, including central session cleanup on refresh failure.
- Normalized media card rendering through a shared media card model and moved reusable friendship actions into the friendship feature.
- Centralized media action payload creation for cards and media details.
- Grouped frontend query keys by feature and added collection and notification invalidation helpers.
- Narrowed media action cache updates to typed detail and saved-list caches.
- Moved activity and notification metadata parsing into feature utilities.

#### Release Workflow

- Simplified version handling so release preparation only needs to bump package metadata while client and server code read package-derived versions.
- Updated agent release instructions to match the package-version release flow.

## v0.1.5

### Feature Changes

#### Landing Page

- Updated the landing page positioning, product comparison, audience messaging, and FAQ to explain when Kadha is a better fit than public review or hosted tracking apps.

#### Collection Collaboration

- Simplified the collection members mobile UI by collapsing invite search and pending invitations, and moving member management controls into compact row actions.

### Engineering Changes

#### Release Workflow

- Added a release preparation script and README workflow for keeping package versions, the app version fallback, GitHub changelog, and in-app changelog in sync.
- Added a tag-triggered GitHub Release workflow that publishes release notes from the matching changelog section.
- Updated agent release instructions to use the release preparation script and tag-triggered GitHub Release workflow.

## v0.1.4

### Feature Changes

#### Navigation

- Unified app page padding so tabbar destinations share consistent outer spacing.
- Added subtle page transitions when navigating across app pages with the tabbar.
- Fixed media card poster proportions on saved media list pages, especially on mobile screens.
- Consolidated collection sharing into the collection members dialog, improved mobile spacing, fixed friend action menus inside dialogs, and added confirmations for removing members and revoking invitations.

#### Profile

- Improved profile pages with clearer account and privacy settings, stronger public profile headers, better locked-profile messaging, and profile tabs that open the first visible section.

#### Media Details

- Improved the media details page with clearer error states, artwork fallbacks, responsive hero actions, tracking controls, and better handling for long TV season lists.
- Improved light-mode readability in the media details hero and made watch-provider chips open provider search pages when supported.
- Refined the media details hero with a consistent readable info card and no heavy text shadows.
- Updated the watch region dialog actions to use the app theme colors consistently.
- Made media details metadata easier to scan by reducing low-value empty box-office cards, clarifying estimated financial figures, and making production details secondary.
- Fixed media detail external links so official website and IMDb buttons open correctly.
- Fixed invalid nested paragraph markup in movie profit details.

#### Watch Providers

- Added user watch region settings during signup and profile editing.
- Added region-aware "Where to Watch" availability to movie and TV detail pages.

#### Theme Presets

- Added a settings page with light/dark mode controls and saved brand accent theme presets.

### Engineering Changes

#### Media Availability

- Added TMDB watch provider integration with normalized server responses and cached provider lookups.
- Refactored the media details watch provider UI into smaller provider chip, link resolution, grouping, and region dialog modules.

#### Theme System

- Replaced the default Chakra system with a project-owned system that exposes reusable brand semantic tokens.

#### Documentation And Process

- Added frontend guidance requiring intentional theme color palettes for Chakra buttons.

## v0.1.3

### Feature Changes

#### Navigation

- Made the app tab bar horizontally scroll when its tabs overflow on narrow screens.
- Added descriptive helper text to the collections page header.

#### Collection Collaboration

- Added the private sharing foundation for collections, including viewer/editor access roles, invitations, and shared collection list filters.
- Added owner share management for inviting users, revoking pending invitations, changing member roles, and removing members.
- Added collection invite notification actions so recipients can accept or reject shared collection access.
- Added a leave action for members of shared collections.
- Updated collection cards and details to show owner, current role, item counts, and member counts for shared collections.
- Improved shared collection labeling with shared icons, creator wording, avatars in sharing controls, and clearer shared collection rows in add-to-collection.
- Added a collection members dialog from the collection header so participants can review members, open profiles, send friend requests, and owners can remove members.

#### Activity Timeline

- Added a private activity timeline where signed-in users can review their media, collection, and profile-setting actions.
- Included account creation, sign-in, and sign-out events in the private activity timeline.

#### Admin Dashboard

- Added backend admin role support and read-only admin APIs for overview metrics and user account summaries.
- Added a server command for promoting an existing user account to admin.
- Added admin-only frontend routes for viewing dashboard metrics, searching users, and opening read-only user summaries.

### Engineering Changes

#### Admin Foundation

- Added a dedicated admin server feature, database-backed admin authorization middleware, and a user role field for future admin tooling.

#### Activity Tracking

- Added an append-only user activity model and migration so timeline events are recorded separately from current media and collection state.

#### Collection Collaboration

- Added collection member and invitation database tables, collection item attribution, and backend authorization checks for shared collection access.
- Added backend collection sharing management APIs for invite revocation, role changes, member removal, and leaving shared collections.

#### Media Storage

- Normalized saved TMDB media data into a shared media snapshot table for watched, liked, watchlist, and collection items.
- Added action timestamps for liked, watched, and watchlist state so future recommendations and stats can use more precise history.

## v0.1.2

### Feature Changes

#### Landing Page

- Updated the landing page feature lists to reflect current privacy, social, search, notification, and upcoming roadmap status.

#### Error Handling

- Added a client error boundary with a recovery screen for unexpected app crashes.

#### Media Cards

- Improved light mode readability by using a white title overlay on media cards.

#### Media Actions

- Updated media action state changes to refresh cached client data directly instead of refetching TMDB-backed media queries.

#### Search

- Improved the global search dialog so it prompts for a search before showing result filters.
- Kept the global search input and filters visible while scrolling through dialog results.

#### In-App Changelog

- Improved the changelog dialog layout and heading formatting.

### Engineering Changes

#### Server Responses

- Standardized server response helpers, validation errors, auth errors, and unexpected error handling.
- Normalized server error payloads to use `message` and field-level validation errors consistently.

#### Cleanup

- Replaced the remaining non-Lucide client icons with `Lu` icon variants.
- Removed a stray collection service debug log and tightened client API error typing.

#### Search

- Refactored the global search dialog into focused feature-owned components.
- Reused the shared search input in the global search dialog instead of maintaining duplicate input behavior.
- Reused the shared simple dialog wrapper for the global search dialog.

#### In-App Changelog

- Reused the shared simple dialog wrapper for the changelog dialog.
- Replaced the custom changelog line parser with a Markdown renderer.

#### Documentation And Process

- Added guidance to check for existing UI components before creating new client components.

## v0.1.1

### Feature Changes

#### Navigation

- Simplified the navbar so mobile screens keep direct access to search, notifications, profile, and sign up without horizontal scrolling.
- Moved lower-frequency utility actions like theme, changelog, and GitHub into compact menus.

## v0.1.0

This release includes changes created from commits after `5d14425`, the 2026-06-25 commit that renamed the app to Kadha and added the navbar/API version display.

### Feature Changes

#### In-App Changelog

- Added a clickable version number in the navbar so users can open the changelog from inside the app.
- Added an end-user changelog view that summarizes feature changes first, followed by engineering notes for maintainers.

#### Social Privacy

- Added profile privacy controls so users can choose who can view their media activity.
- Added locked profile states when another user's content is not visible to the viewer.
- Added profile tabs for another user's watched, liked, watchlist, and collections views when access is allowed.
- Added blocking support to the friendship flow.

#### Social And Search Pagination

- Added pagination controls to watched, liked, watchlist, profile media, friends, collections, and search result views.
- Improved large-list browsing so social and search pages load smaller result sets instead of trying to render everything at once.

#### Notifications

- Reworked notifications to support unread counts, individual read state, and marking all notifications as read.
- Improved friendship notification creation so requests and social actions produce clearer notification records.

#### Media Data

- Improved TMDB data handling for movie and TV search/details responses.
- Improved how media payloads are normalized before saving liked, watched, and watchlist items.
- Fixed media action refresh behavior so changes to liked, watched, and watchlist state update related views consistently.

#### Authentication

- Fixed stale authentication state when switching accounts.
- Improved user lookup behavior during login/register flows so account changes resolve to the correct current user.

### Engineering Changes

#### App Structure

- Moved server code toward feature-owned routes, controllers, services, schemas, and types.
- Moved client API hooks and feature-owned types into `client/src/features`.
- Extracted route declarations into `client/src/app/routes.tsx` and lazy-loaded route-level screens.
- Moved collection UI into the collections feature.
- Centralized and tightened React Query key usage.

#### Performance And Build

- Split major frontend vendor chunks for UI, icons, query, and utility dependencies.
- Fixed the previous UI vendor chunk split issue.

#### Database And Migrations

- Added migrations for user content privacy, social query indexes, and the notification rework.
- Fixed the SQLite notification migration so existing SQLite deployments can migrate cleanly.

#### Documentation And Process

- Added project structure documentation and aligned it with the current client/server boundaries.
- Added social privacy documentation.
- Added repository agent working guidelines.
- Added guidance to use configured client import aliases and generated client-owned artifacts instead of importing repository-root files directly.
- Added an in-app changelog sync script so the root changelog can remain the canonical source of truth.
