# PRD: Media Action Details, Ratings, Notes, and TV Progress

## 1. Overview

Kadha currently lets users quickly toggle three media actions:

- `liked`
- `watched`
- `watchlist`

This is a strong low-friction baseline. The next iteration should preserve that speed while adding optional context: ratings, small private notes, watched dates, and TV episode progress.

The recommended UX is a hybrid model:

- Keep one-click actions on dense discovery surfaces such as media cards, search results, carousels, and saved-list grids.
- Offer optional details after the action through a toast action or lightweight dialog.
- On the media detail page, open a focused tracking dialog when users turn an action on, because they are already in a focused decision context.
- Never require extra fields. Users should be able to submit with no changes and still complete the original action.

The product should feel like a private tracking tool first, not a public review app.

## 2. Current State

### Existing User Actions

Kadha currently stores media interactions on `UserMedia`:

```text
liked: Boolean
watched: Boolean
watchlist: Boolean
likedAt: DateTime?
watchedAt: DateTime?
watchlistAt: DateTime?
```

Relevant current implementation:

- Cards toggle actions directly from `client/src/components/media-card/media-actions.tsx`.
- Media details toggles actions directly from `client/src/pages/media-details/components/hero-section.tsx`.
- Server action endpoints are `POST /api/user-media/liked`, `POST /api/user-media/watched`, and `POST /api/user-media/watchlist`.
- Marking media watched currently also clears `watchlist`.

### Current User Experience

Current flow:

1. User finds a movie or TV show.
2. User clicks Like, Watched, or Watchlist.
3. The state toggles immediately.
4. A toast confirms the action.
5. Removing an item can be undone from the toast.

Strengths:

- Fast.
- Easy to understand.
- Good for adding multiple items from search or discovery lists.
- Low implementation complexity.

Limitations:

- No way to say why something was added to watchlist.
- No way to rate something.
- No way to add a short personal note.
- No way to distinguish "watched once" from "logged on a date."
- TV shows have only title-level watched state, which does not match how users actually track shows.
- No "in progress" or "caught up" state for TV.

## 3. Problem

Users often want different things from different actions.

### Watchlist Intent

When users add something to watchlist, they usually mean:

- "I want to remember this for later."
- "Someone recommended this."
- "This looks interesting, but I have not watched it yet."
- "I want to watch this with someone."
- "This matches a mood or occasion."

They usually do not want to rate it yet.

### Liked Intent

When users like something, they usually mean:

- "I enjoyed this."
- "This represents my taste."
- "Use this as a positive signal."
- "I may want to find more like this later."

Liked often implies watched, but the app should not assume that silently in every case.

### Watched Intent

When users mark a movie watched, they usually mean:

- "I have seen this."
- "Add this to my viewing history."
- "Stop showing this as unwatched."
- "Remove it from my watchlist."
- "Optionally record when I watched it, what I thought, and my rating."

For TV shows, "watched" is ambiguous:

- Watched the latest episode?
- Watched one episode?
- Watched one season?
- Watched all aired episodes?
- Watched the entire completed series?

The UI and data model need to treat TV progress differently.

## 4. Goals

- Preserve low-friction one-click tracking.
- Add optional ratings to watched and liked flows.
- Add optional private notes to liked, watched, and watchlist flows.
- Add a focused media tracking dialog that can be submitted without entering extra details.
- Support TV "In Progress" as a first-class user-visible state.
- Support optional episode-wise watched tracking for TV shows.
- Make progress states understandable without forcing users into detailed episode tracking.
- Keep private tracking data private by default.
- Keep implementation phased so movie/title-level improvements can ship before deeper TV episode tracking.

## 5. Non-Goals

Initial implementation should not include:

- Public reviews.
- Comments on reviews or notes.
- Spoiler tagging and moderation.
- Social feeds for ratings or notes.
- External imports from Letterboxd, IMDb, Trakt, TV Time, or CSV.
- A recommendation engine based on ratings.
- Full calendar/reminder notifications for upcoming TV episodes.
- Rewatch history with multiple dated entries per title.
- Per-episode public discussion.
- Adding new production dependencies unless explicitly approved.

These can be future enhancements.

## 6. UX Recommendation

### Recommended Interaction Model

Use a hybrid model:

```text
High-density surfaces:
  One-click action -> toast -> optional "Add details"

Focused detail page:
  Click action-on -> open dialog -> submit with optional fields

Action-off:
  Immediate toggle -> toast with Undo where appropriate
```

This keeps browsing fast while still offering richer capture at the moment users are most likely to care.

### Why Not Always Open a Dialog?

A blocking dialog on every action creates friction:

- Users often add multiple items from search results.
- Many actions do not need details.
- A required extra submit step makes the app feel slower.
- Empty optional dialogs train users to dismiss or ignore the feature.

The dialog is valuable when users are focused on one title. It is less valuable when they are scanning a grid.

## 7. User Stories

### Movie Watchlist

As a user, I want to add a movie to my watchlist quickly so I can remember to watch it later.

As a user, I want to optionally add a note to a watchlist item so I remember why I saved it.

As a user, I do not want to be asked for a rating when I have not watched the movie yet.

### Movie Watched

As a user, I want to mark a movie watched so it appears in my watched history.

As a user, I want the app to remove a movie from watchlist when I mark it watched.

As a user, I want to optionally rate the movie when I mark it watched.

As a user, I want to optionally record a short note after watching.

As a user, I want to optionally adjust the watched date.

### Movie Liked

As a user, I want to like a movie so it becomes part of my taste profile.

As a user, I want to optionally rate a movie when liking it.

As a user, I want to optionally add a short note about why I liked it.

As a user, if I like something I have not marked watched, I want a clear option to also mark it watched.

### TV Watchlist

As a user, I want to add a show to my watchlist so I remember to start it later.

As a user, I want to optionally add a note such as "watch with family" or "recommended by Alex."

As a user, I do not want watchlist to imply I have started the show.

### TV Progress

As a user, I want to mark the next episode watched without opening a complex checklist every time.

As a user, I want to see which episode I should watch next.

As a user, I want to mark an entire season watched when catching up old shows.

As a user, I want to optionally mark individual episodes watched.

As a user, I want the app to show whether I am in progress, caught up, or completed.

As a user, I do not want unaired episodes to make me look behind.

## 8. Core Concepts

### Watchlist

The user wants to watch this later.

Recommended behavior:

- Does not imply watched.
- Does not imply liked.
- Can contain movies and TV shows.
- Can have an optional private note.
- Can be removed when watched, preserving current behavior.

### Watched

The user has seen the media.

Recommended behavior:

- Movies: title-level watched is clear.
- TV: title-level watched should eventually mean "all aired episodes watched" or "completed," not simply "I started this."
- Marking watched should remove from watchlist unless the user explicitly opts out later.

### Liked

The user enjoyed or recommends the media.

Recommended behavior:

- Independent from rating.
- Independent from watched in data, but UI should suggest marking watched if not already watched.
- Can have an optional private note.
- Can optionally include rating.

### Rating

The user gives a personal score.

Recommended behavior:

- Store as a title-level personal rating in v1.
- Use 1 to 10 internally.
- Display as 5 stars with half-star support, or as a 10-point segmented/radio control.
- Ratings should be optional.
- Rating should not automatically imply liked.
- Rating should imply watched only if the product explicitly chooses that behavior. Recommended: prompt, do not silently infer.

### Note

The user records private context.

Recommended behavior:

- Small, plain text, private by default.
- Action-specific in v1:
  - Watchlist note: why I saved this.
  - Watched note: what I thought after watching.
  - Liked note: why I liked it.
- Notes should not be public until a separate public reviews feature exists.

### TV Progress

TV progress is derived from episode watch state.

Recommended user-visible states:

- `Not Started`: no watched episodes.
- `Plan To Watch`: in watchlist, no watched episodes.
- `In Progress`: at least one aired episode watched, but not all aired episodes watched.
- `Caught Up`: all aired episodes watched, show has future episodes or is still in production.
- `Completed`: all episodes watched and show is ended.
- `Watched`: fallback label for title-level watched before episode tracking is available.

Future explicit states:

- `Paused`
- `Dropped`

These should be added later only if there is a clear place in the UI to manage them.

## 9. UX Flows

### Flow A: Add To Watchlist From Media Card

Surface:

- Home carousels.
- Search results.
- Saved lists.
- Collection media grids.

Flow:

1. User clicks watchlist icon.
2. App adds item to watchlist immediately.
3. Toast confirms.
4. Toast includes optional action: `Add note`.
5. If user clicks `Add note`, open the tracking dialog focused on watchlist details.

Toast copy:

```text
Added Dune: Part Two to watchlist
[Add note]
```

Dialog fields:

- Private note.

Dialog actions:

- `Save`
- `Cancel`

All fields optional. If submitted unchanged, the item remains watchlisted.

### Flow B: Add To Watchlist From Detail Page

Flow:

1. User clicks `Watchlist`.
2. Open dialog.
3. Dialog indicates the watchlist action is already selected.
4. User can add optional note.
5. User clicks `Save`.
6. App saves watchlist state and optional note.

Dialog title:

```text
Add to watchlist
```

Suggested body:

```text
Save this for later. You can add a private note if you want.
```

Fields:

- Private note.

Primary action:

```text
Save
```

Secondary action:

```text
Cancel
```

Cancel behavior:

- Recommended: cancel should not perform the action if the dialog is opened before save.
- On cards, the action has already happened, so cancel only closes the note dialog.

### Flow C: Mark Movie Watched From Media Card

Flow:

1. User clicks watched icon.
2. App marks movie watched immediately.
3. App removes movie from watchlist if applicable.
4. Toast confirms and offers details.

Toast copy:

```text
Marked Dune: Part Two watched
Removed from watchlist too.
[Add details]
```

Details dialog fields:

- Watched date.
- Rating.
- Private note.
- Like this movie checkbox or toggle.

Defaults:

- Watched date defaults to today.
- Rating empty.
- Note empty.
- Like unchecked unless already liked.

### Flow D: Mark Movie Watched From Detail Page

Flow:

1. User clicks `Mark watched`.
2. Open watched dialog.
3. User can fill optional details.
4. User clicks `Save`.
5. App marks watched, removes from watchlist, saves optional details.

Dialog title:

```text
Mark watched
```

Fields:

- Watched date, optional.
- Rating, optional.
- Private note, optional.
- Like toggle, optional.

Primary action:

```text
Save
```

Allow empty submission:

- If user enters nothing and clicks `Save`, movie is simply marked watched.

### Flow E: Like Movie From Media Card

Flow:

1. User clicks heart.
2. App likes movie immediately.
3. Toast confirms and offers details.

Toast copy:

```text
Liked Dune: Part Two
[Add details]
```

Details dialog fields:

- Rating.
- Private note.
- If not watched: checkbox `Also mark watched`.

Recommended default for `Also mark watched`:

- Default unchecked in v1 to avoid surprising users.
- Revisit after user testing. If most users expect liked to imply watched, default can change later.

### Flow F: Like Movie From Detail Page

Flow:

1. User clicks `Like`.
2. Open liked dialog.
3. User can add optional rating/note.
4. If media is not watched, show `Also mark watched`.
5. User clicks `Save`.

Dialog title:

```text
Like this movie
```

Fields:

- Rating, optional.
- Private note, optional.
- Also mark watched, optional if not already watched.

### Flow G: Remove Action

Applies to:

- Unlike.
- Mark unwatched.
- Remove from watchlist.

Recommended behavior:

- No dialog.
- Perform immediately.
- Show toast with Undo where useful.

Reason:

- Removal is usually corrective.
- A dialog here slows users down and adds little value.

Open question:

- Should removing liked/watchlist clear the corresponding note?

Recommended v1:

- Preserve notes after removal so accidental toggles do not delete user text.
- Hide notes in active lists when the action is off.
- If the user re-adds the action later, show the previous note in the dialog.

## 10. TV Tracking UX

### TV Detail Page Primary Actions

Current TV detail page uses the same actions as movies.

Recommended TV-specific behavior:

- Replace or supplement `Mark watched` with `Track progress`.
- Keep `Like`.
- Keep `Watchlist`.
- Keep `Add to collection`.

If the show has no episode progress:

```text
Track progress
```

If the user has started:

```text
Mark next episode
```

If caught up:

```text
Caught up
```

If completed:

```text
Completed
```

### TV Progress Summary

Add a compact progress section near the top of TV detail pages:

```text
Your progress
Season 2, Episode 4 next
13 of 24 aired episodes watched
```

Possible states:

```text
Not started
In progress
Caught up
Completed
```

### Mark Next Episode

This should be the fastest TV interaction.

Flow:

1. User clicks `Mark next episode`.
2. App marks the next unwatched aired episode watched.
3. Toast confirms.
4. Toast offers `Add note` or `Undo`.

Toast:

```text
Marked S2 E4 watched
[Undo]
```

If no aired episodes remain:

```text
You are caught up
```

### Episode Progress Dialog

Open from:

- `Track progress`.
- Progress summary.
- Season card.
- Toast `Add details`.

Dialog title:

```text
Track episodes
```

Recommended layout:

- Show progress summary at top.
- Season selector or accordion.
- Each episode row has:
  - Checkbox.
  - Episode number.
  - Episode title.
  - Air date.
  - Optional note/rating affordance later.
- Bulk actions:
  - `Mark season watched`
  - `Mark all aired watched`
  - `Clear season`

Important behavior:

- Do not include unaired episodes in completion/caught-up calculations.
- Specials should be hidden by default with a `Show specials` toggle.
- If TMDB has missing air dates, include episodes in season UI but avoid counting unaired status from unknown dates unless needed.

### Season Cards

Current TV details show season cards with episode counts. Enhance them with user progress:

```text
Season 1
8 episodes
6 watched
[Continue]
```

If a season is complete:

```text
Season 1
8 episodes
Watched
```

Season actions:

- Continue season.
- Mark season watched.
- Clear season.

### Watchlist and TV Progress Relationship

Recommended behavior:

- Adding a show to watchlist means `Plan To Watch`.
- Marking the first episode watched should remove the show from watchlist by default.
- If user wants to keep future shows in watchlist, that can be revisited later.

Rationale:

- It matches current behavior where watched removes watchlist.
- It keeps watchlist focused on not-started items.
- "In progress" should become its own list/filter, not live inside watchlist.

## 11. Proposed Information Architecture

### Existing Lists

Keep:

- Watched
- Liked
- Watchlist

### New Or Enhanced Lists

Recommended:

- Add `In Progress` for TV once episode tracking ships.

Possible navigation:

```text
Profile / Library
  Watched
  Liked
  Watchlist
  In Progress
  Collections
```

If nav space is limited:

- Keep top-level `Watched`, `Liked`, `Watchlist`.
- Add `In Progress` as a filter under Watched or TV-specific library view.

Recommended v1.5:

- Add a dedicated `In Progress` page for TV shows because it represents an important daily workflow.

## 12. Dialog Component Requirements

### General

The tracking dialog should be reusable across actions.

Inputs:

- Media snapshot.
- Media type.
- Initial action: `liked`, `watched`, `watchlist`, or `tv-progress`.
- Existing user media state.
- Existing notes/rating.
- Context: `card-post-action` or `detail-pre-action`.

Outputs:

- Updated media action flags.
- Optional rating.
- Optional notes.
- Optional watched date.
- Optional episode progress updates.

### Required Dialog Properties

- All fields optional.
- Clear primary action.
- Mobile-friendly full-width sheet or responsive dialog.
- Keyboard accessible.
- Escape/cancel behavior should be predictable.
- Form should not lose typed text if mutation fails.
- Loading state on submit.
- Error state inside dialog or via existing error handler.

### Suggested Field Labels

Watchlist note:

```text
Private note
```

Placeholder:

```text
Why do you want to watch this?
```

Watched note:

```text
Private note
```

Placeholder:

```text
What do you want to remember?
```

Liked note:

```text
Private note
```

Placeholder:

```text
What did you like about it?
```

Rating:

```text
Your rating
```

Watched date:

```text
Watched on
```

Like toggle inside watched dialog:

```text
Like this too
```

Mark watched inside liked dialog:

```text
Also mark watched
```

### Button Copy

Primary:

```text
Save
```

Secondary:

```text
Cancel
```

Avoid:

- `Submit`
- `Confirm`

Reason:

- `Save` clearly communicates optional details and state persistence.

## 13. Data Model Proposal

### Phase 1: Title-Level Tracking Details

Extend `UserMedia`.

Recommended fields:

```prisma
model UserMedia {
  // existing fields
  liked       Boolean   @default(false)
  watched     Boolean   @default(false)
  watchlist   Boolean   @default(false)
  likedAt     DateTime?
  watchedAt   DateTime?
  watchlistAt DateTime?

  // new optional title-level fields
  rating        Int?
  ratedAt       DateTime?
  watchedOn     DateTime?
  likedNote     String?
  watchedNote   String?
  watchlistNote String?
}
```

Validation:

- `rating`: integer from 1 to 10.
- Notes: max length should be modest. Recommended 500 characters for v1.
- `watchedOn`: date-only concept, stored as DateTime in SQLite/Prisma with normalized date handling.

Why action-specific notes:

- A watchlist note answers "why save this?"
- A watched note answers "what did I think?"
- A liked note answers "why did I like this?"
- A single generic note would be simpler but can become confusing when the item moves across states.

Open question:

- Should rating be allowed when `watched` is false?

Recommended v1:

- Allow it, but prompt users to mark watched. Do not block.

### Phase 2: TV Episode Progress

Add a user-owned episode progress table.

Recommended model:

```prisma
model UserEpisodeWatch {
  id            String    @id @default(uuid())
  userId        String
  media_id      Int
  media_type    MediaType
  seasonNumber  Int
  episodeNumber Int
  episodeId     Int?
  watchedAt     DateTime  @default(now())
  watchedOn     DateTime?
  rating        Int?
  note          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, media_id, media_type, seasonNumber, episodeNumber])
  @@index([userId, media_id, media_type])
  @@index([userId, watchedAt])
  @@index([media_id, media_type])
}
```

Constraints:

- `media_type` should be `tv` for episode rows.
- Enforce this in service validation.
- `rating`: optional 1 to 10.
- `note`: optional max 500 characters.

Alternative:

- Store a compressed JSON progress map on `UserMedia`.

Recommendation:

- Use a normalized table. Episode progress will need querying, undo, export, stats, and future imports. JSON will become limiting quickly.

### Derived TV Status

Do not store `In Progress`, `Caught Up`, or `Completed` in v1 if it can be derived.

Derived from:

- User episode watches.
- TMDB season/episode metadata.
- Air dates.
- Show `status` / `in_production`.

Pseudo-logic:

```ts
if watchedEpisodeCount === 0:
  return watchlist ? 'Plan To Watch' : 'Not Started'

if watchedAiredEpisodeCount < totalAiredEpisodeCount:
  return 'In Progress'

if showEnded && watchedAiredEpisodeCount === totalAiredEpisodeCount:
  return 'Completed'

return 'Caught Up'
```

## 14. API Proposal

### Phase 1: Upsert Title Tracking

Current endpoints can be extended, but a unified endpoint may be cleaner.

Option A: Extend existing endpoints.

```http
POST /api/user-media/liked
POST /api/user-media/watched
POST /api/user-media/watchlist
```

Payload additions:

```ts
{
  rating?: number | null;
  watchedOn?: string | null;
  likedNote?: string | null;
  watchedNote?: string | null;
  watchlistNote?: string | null;
}
```

Option B: Add unified tracking endpoint.

```http
PATCH /api/user-media/:mediaType/:mediaId/tracking
```

Payload:

```ts
{
  media: UserMediaPayload;
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
  rating?: number | null;
  watchedOn?: string | null;
  likedNote?: string | null;
  watchedNote?: string | null;
  watchlistNote?: string | null;
}
```

Recommended:

- Use Option A for lower-risk phase 1.
- Consider Option B later if action payloads become too complex.

Reason:

- Existing cache utilities and mutations are built around action-specific endpoints.
- Lower migration risk.
- Works well for current client architecture.

### Phase 2: Episode Progress API

Recommended endpoints:

```http
GET /api/user-media/tv/:mediaId/progress
POST /api/user-media/tv/:mediaId/episodes
DELETE /api/user-media/tv/:mediaId/episodes/:seasonNumber/:episodeNumber
POST /api/user-media/tv/:mediaId/seasons/:seasonNumber/watched
DELETE /api/user-media/tv/:mediaId/seasons/:seasonNumber/watched
POST /api/user-media/tv/:mediaId/mark-all-aired-watched
POST /api/user-media/tv/:mediaId/mark-next-episode-watched
```

Possible response:

```ts
{
  status: 'not_started' | 'plan_to_watch' | 'in_progress' | 'caught_up' | 'completed';
  watchedEpisodeCount: number;
  totalAiredEpisodeCount: number;
  nextEpisode: {
    seasonNumber: number;
    episodeNumber: number;
    episodeId?: number;
    name: string;
    airDate?: string;
  } | null;
  seasons: Array<{
    seasonNumber: number;
    name: string;
    watchedCount: number;
    airedCount: number;
    totalCount: number;
  }>;
}
```

## 15. TMDB Data Requirements

Current TV details include season summaries, last episode, next episode, number of seasons, and number of episodes.

Episode-wise tracking needs season detail data:

```http
GET /3/tv/{series_id}/season/{season_number}
```

Episode detail is available if needed:

```http
GET /3/tv/{series_id}/season/{season_number}/episode/{episode_number}
```

Recommended approach:

- Use existing TV details for high-level progress summary where possible.
- Fetch season details on demand when the user opens a season or episode progress dialog.
- Cache season detail responses similarly to current media details cache.
- Do not fetch every season automatically for long-running shows.

Why:

- Some shows have hundreds or thousands of episodes.
- Fetching all seasons upfront would be slow and wasteful.
- The user usually only needs current or selected season details.

## 16. Client Implementation Notes

### Feature Placement

Recommended client structure:

```text
client/src/features/user-media/
  components/
    media-tracking-dialog.tsx
    rating-input.tsx
    tracking-note-field.tsx
    tv-progress-summary.tsx
    tv-episode-progress-dialog.tsx
  api/
    use-update-media-tracking.ts
    use-tv-progress.ts
    use-mark-next-episode-watched.ts
    use-update-episode-watch.ts
  utils/
    media-tracking-copy.ts
    tv-progress.ts
```

Keep reusable UI-only primitives in `client/src/components` only if they are not media-specific.

### Existing Components To Update

Likely impacted:

- `client/src/components/media-card/media-actions.tsx`
- `client/src/pages/media-details/components/hero-section.tsx`
- `client/src/pages/media-details/components/tv-info.tsx`
- `client/src/features/user-media/api/use-media-action-mutation.ts`
- `client/src/features/user-media/utils/build-user-media-payload.ts`
- `client/src/features/user-media/utils/media-action-copy.ts`
- Saved media list pages if they should show ratings/notes.

### Cache Behavior

When tracking details change:

- Update detail query cache.
- Update saved-list caches.
- Update discovery card caches for basic flags.
- Invalidate user activity if the action creates activity.
- Do not refetch TMDB-backed data unless necessary.

For notes/rating:

- Optimistic update is optional in v1.
- If added, keep cache update narrowly typed.

### Toast Behavior

Existing toasts already confirm action state and offer undo for removals.

Add detail actions only when turning an action on:

```text
Liked Dune
[Add details]
```

```text
Added Dune to watchlist
[Add note]
```

```text
Marked Dune watched
[Add details]
```

## 17. Server Implementation Notes

### Validation

Extend `userMediaSchema` with optional fields:

```ts
rating: z.number().int().min(1).max(10).nullable().optional()
watchedOn: z.string().nullable().optional()
likedNote: z.string().max(500).nullable().optional()
watchedNote: z.string().max(500).nullable().optional()
watchlistNote: z.string().max(500).nullable().optional()
```

Date validation:

- Validate `watchedOn` as a date string.
- Normalize or store consistently.
- Decide whether future dates are allowed. Recommended: disallow future watched dates.

### Activity

Current activity records action toggles.

Recommended:

- Do not create activity for note edits in v1.
- Create activity for rating only if the rating is part of a visible/social feature later.
- Keep private notes out of activity metadata.

Reason:

- Private note content should not leak into activity, notifications, logs, or public profile views.

### Data Export

Kadha already has account data export.

Update export once implemented:

- Include ratings.
- Include notes.
- Include watched dates.
- Include episode progress rows.

This is important because tracking data is user-owned and self-hostable.

## 18. Privacy Requirements

Default:

- Ratings: private unless profile privacy rules later expose them.
- Notes: private only.
- Episode progress: follows watched privacy if shown to others, but episode-level detail should be private in v1.

Do not expose:

- Private notes on public or friend-visible profile pages.
- Notes in activity timeline.
- Notes in notifications.
- Notes in collection item metadata.

Open question:

- Should friends see ratings eventually?

Recommended v1:

- No. Store ratings privately first.

Future:

- Add separate privacy control for ratings/reviews if they become social.

## 19. Accessibility Requirements

Tracking dialog:

- Must have accessible title.
- Form controls must have labels.
- Rating input must be keyboard operable.
- Stars alone are not enough; expose text such as `7 out of 10`.
- Episode checkboxes must have labels including season and episode number.
- Dialog focus should move into dialog on open and return to triggering button on close.
- Submit button loading state must not trap focus.

TV progress:

- Progress bars must include text labels, not color alone.
- State badges must use text labels.

## 20. Empty, Loading, and Error States

### Dialog Submit Failure

Show:

```text
Could not save tracking details. Try again.
```

Keep user-entered text in the form.

### TV Season Loading

Show:

```text
Loading episodes...
```

### TV Season Error

Show:

```text
Could not load episodes for this season.
```

Include retry.

### Missing Episode Metadata

If episode title is missing:

```text
Episode 4
```

If air date is missing:

- Omit date rather than showing invalid text.

## 21. Edge Cases

### User Likes Without Watched

Do not silently mark watched in v1.

Show optional:

```text
Also mark watched
```

### User Marks Watched While In Watchlist

Continue current behavior:

- Mark watched.
- Clear watchlist.

### User Removes Watched

Do not automatically re-add watchlist.

Preserve watched note/rating unless user explicitly clears them.

### User Clears Rating

Allow rating to be set to null.

### User Clears Note

Allow empty string to become null.

### User Marks TV Show Watched Before Episode Tracking Exists

During phase 1:

- Preserve current title-level watched behavior.

After phase 2:

- For TV, `Mark watched` should become:
  - `Mark all aired watched`, or
  - `Track progress`.

Recommended migration:

- If a TV show has `watched = true` before episode tracking exists, treat it as title-level watched.
- Do not auto-create episode rows for old title-level watched shows unless the user chooses `Backfill episodes`.

### Ongoing Shows

If all aired episodes are watched and show is in production:

- Show `Caught up`.

When a new episode airs:

- Derived state becomes `In Progress` again.

### Specials

Specials should not block completion by default.

Recommended:

- Exclude season 0 from progress totals unless user enables specials.

### Anime, Daily Shows, News, Long-Running Shows

Avoid fetching all episodes at once.

Use season-level lazy loading.

### Duplicate Episodes Or TMDB Corrections

Use `seasonNumber + episodeNumber` as the stable user-facing key.

Store `episodeId` when available, but do not rely on it exclusively.

## 22. Rollout Plan

### Phase 1: Optional Details For Existing Actions

Scope:

- Add title-level rating and notes.
- Add tracking dialog.
- Detail page opens dialog when turning actions on.
- Cards keep one-click actions and offer toast action for details.
- Existing saved lists continue to work.

Deliverables:

- DB migration.
- Schema updates.
- API updates.
- Client types updates.
- Tracking dialog.
- Rating input.
- Note fields.
- Tests for validation, persistence, cache updates, and dialog behavior.

Recommended first implementation target:

- Movies and TV title-level details, without episode tracking.

### Phase 2: TV Progress Foundation

Scope:

- Add episode progress table.
- Add TMDB season detail fetching.
- Add progress service.
- Add derived progress state.
- Add `Track progress` dialog.
- Add `Mark next episode watched`.

Deliverables:

- DB migration.
- Server feature service methods.
- Client hooks.
- TV progress summary.
- Season progress UI.
- Tests for derived status and API permissions.

### Phase 3: In Progress Library

Scope:

- Add TV `In Progress` page or filter.
- Show next episode.
- Sort by recently watched or next unwatched episode.

Deliverables:

- New route/page.
- API endpoint for in-progress shows.
- Pagination.
- Empty state.

### Phase 4: Better Logs And Rewatches

Scope:

- Separate "watched" from dated "log entries."
- Allow multiple watched dates per movie/show/episode.
- Support rewatches.

This should wait until the initial optional details and TV progress model are stable.

## 23. Success Metrics

Quantitative:

- Percentage of action-on events that add details.
- Percentage of watched actions with rating.
- Percentage of watchlist actions with note.
- Percentage of TV users who mark more than one episode.
- Number of shows in `In Progress`.
- Reduction in TV shows incorrectly marked fully watched.

Qualitative:

- Users can still add several items quickly from search.
- Users understand that notes are private.
- Users understand difference between Watchlist and In Progress.
- Users can answer "what episode am I on?" without thinking.

## 24. Testing Requirements

### Server Tests

Add or update coverage for:

- Rating min/max validation.
- Note max length validation.
- Saving liked note.
- Saving watchlist note.
- Saving watched note.
- Saving watched date.
- Clearing rating/note.
- Existing watched behavior still clears watchlist.
- Notes are scoped per user.
- Notes are not exposed through other users' profile media APIs in v1.
- Episode progress creation.
- Episode progress deletion.
- Mark next episode watched.
- Mark season watched.
- Derived TV statuses.

### Client Tests

Add or update coverage for:

- Dialog opens from detail page action-on.
- Card action remains one-click.
- Toast action opens details dialog.
- Empty dialog submission succeeds.
- Rating and notes are sent when provided.
- Removing actions does not open dialog.
- TV progress state labels.
- Episode checkbox interactions.
- Accessibility labels for rating and episode checkboxes.

## 25. Open Questions

- Should rating be 1-10, 0.5-5 stars, or both internally/displayed? Recommended: store 1-10, display as 5 stars with half steps.
- Should liking default `Also mark watched` to on? Recommended: off in v1.
- Should notes be private forever or eventually shareable as reviews? Recommended: private in v1.
- Should watchlist notes survive when an item is removed from watchlist? Recommended: yes.
- Should a TV title-level `watched` flag remain after episode tracking ships? Recommended: keep for backward compatibility, but derive UI status from episode progress where available.
- Should "Paused" and "Dropped" be explicit states in v1? Recommended: no.
- Should TV progress include specials by default? Recommended: no.
- Should ratings be visible to friends under existing liked/watched privacy settings? Recommended: no in v1.

## 26. Source Notes

External UX references reviewed:

- Letterboxd FAQ: watched vs diary logging, optional rating/review/like/tags, and rating vs liking. https://letterboxd.com/about/faq/
- IMDb Watchlist FAQ: watchlist as titles users want to watch, sorting, notifications, and privacy. https://help.imdb.com/article/imdb/track-movies-tv/watchlist-faq/G9PA556494DM8YBA
- IMDb Ratings FAQ: 1-10 ratings, one rating per title, and separate series vs episode ratings. https://help.imdb.com/article/imdb/track-movies-tv/ratings-faq/G67Y87TFYYP6TWAV
- IMDb Check-ins FAQ: watched/currently watching activity with optional short comments, and support for whole TV series or individual episodes. https://help.imdb.com/article/imdb/track-movies-tv/check-ins-faq/GG59ELYW45FMC7J3
- Serializd: TV tracking, ratings, reviews, and TV diary positioning. https://www.serializd.com/
- Next Episode: TV watchlist, watched episode tracking, calendar, and recommendations. https://next-episode.net/
- TMDB TV series details API. https://developer.themoviedb.org/reference/tv-series-details
- TMDB TV season details API. https://developer.themoviedb.org/reference/tv-season-details
- TMDB TV episode details API. https://developer.themoviedb.org/reference/tv-episode-details

