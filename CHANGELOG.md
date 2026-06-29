# Kadha Changelog

## Unreleased

### Feature Changes

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
