# Kadha Changelog

## Unreleased

### Feature Changes

#### Authentication

- Fixed logout/session expiry so protected pages leave the loading state and redirect to login after auth is cleared.

### Engineering Changes

#### Testing

- Added Vitest-based server and client test foundations, including Supertest API coverage, an isolated Prisma SQLite test database, and React Testing Library setup.
- Added server integration test helpers and collection permission coverage for owners, viewers, editors, and member role changes.
- Added user-media API coverage for liked, watched, watchlist, watchlist removal on watched media, and per-user media isolation.

#### Frontend Architecture

- Split frontend route declarations into domain route modules while preserving paths and lazy loading.
- Refactored the settings route to compose feature-owned theme and data export sections.
- Added accessible names to auth, collection, and search controls without changing their visual layout.
- Renamed the media carousel component, removed duplicate form wrappers, standardized mutation error typing, and made neutral button palettes explicit.
- Split Chakra UI helper exports so client Fast Refresh linting runs without warnings.

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
