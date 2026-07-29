
**PRD: Region-Aware “Where To Watch”**

**Objective**

Add region-aware streaming availability to Kadha media detail pages, powered by TMDB Watch Providers data. Users should set a preferred country during signup, update it later from profile/settings, and see movie/TV availability for that region on detail pages.

This should feel like a natural part of the app, not a separate lookup tool.

**Problem**

Streaming availability differs by country. A movie may be on Netflix in one country, Prime Video in another, and unavailable elsewhere. Without a user region, “Where to watch” results are ambiguous or misleading.

Kadha should store each user’s preferred watch region and use it when fetching provider availability.

**Goals**

- Ask users for their country/region during signup.
- Store a preferred watch region on the user profile.
- Allow users to update their region from the profile/settings page.
- Use the user’s region when loading “Where to Watch” data.
- Show available providers on movie and TV detail pages.
- Clearly communicate which region the data is based on.
- Let users quickly change their region from the media details page, either inline or by navigating to profile/settings.
- Attribute JustWatch as required by TMDB’s provider data terms.

**Non-Goals**

- Do not build direct deep links to Netflix, Prime Video, etc. TMDB does not provide full deep links.
- Do not scrape provider websites.
- Do not guarantee availability accuracy beyond TMDB/JustWatch data.
- Do not support per-media temporary region overrides in v1 unless it falls out naturally from the UI.
- Do not add a paid external provider API unless TMDB is insufficient later.

**User Stories**

As a new user, I want to choose my country during signup so Kadha can show relevant streaming availability.

As an existing user, I want to change my country from my profile/settings so availability reflects where I currently watch content.

As a user viewing a movie or TV show, I want to see whether it is available to stream, rent, buy, or watch free in my region.

As a user viewing availability, I want to understand which region the results are based on.

As a user on the media details page, I want a quick way to change my region if the shown region is wrong.

**Data Source**

Use TMDB Watch Providers:

```http
GET /3/movie/{movie_id}/watch/providers
GET /3/tv/{series_id}/watch/providers
```

TMDB returns provider availability by country code.

Example region result shape:

```ts
{
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
}
```

Provider shape:

```ts
{
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}
```

TMDB notes:
- Data is powered by JustWatch.
- JustWatch attribution is required.
- TMDB does not return full provider deep links.
- The returned TMDB `link` can be used as the external availability link.

**Core UX**

**Signup**

Add a country selector to registration.

Fields:
- Username/name, existing fields
- Email, existing fields
- Password, existing fields
- Country / watch region

Default behavior:
- Default country can be inferred from browser locale if reliable.
- If not available, default to `US`.
- User must be able to change it before submitting.
- The field should be required unless the app intentionally supports anonymous/unknown region.

Suggested label:

```text
Country
```

Helper text:

```text
Used to show streaming availability in your region.
```

Avoid over-explaining TMDB/JustWatch during signup.

**Profile / Settings**

Add a setting under profile/settings:

```text
Watch region
United States
```

Allow editing via country select.

On save:
- Persist to user profile.
- Invalidate/refetch user profile query.
- Invalidate/refetch relevant watch provider queries.
- Existing media details do not need to be refetched unless provider data is bundled into details.

**Media Details Page**

Add a new section, likely after `OverviewSection` and before movie/TV-specific metadata:

```text
Where to Watch
Based on your region: United States
```

The region text should be actionable:

Option A, simpler:
```text
Based on your region: United States · Change
```

Clicking `Change` opens a small dialog with a country select and save button.

Option B, lower implementation scope:
```text
Based on your region: United States · Change in profile
```

Clicking routes to profile/settings.

Recommended v1: inline dialog from the media details page. It avoids interrupting the user’s flow and directly solves the problem where they notice the wrong region while viewing availability.

Provider grouping:
- Stream
- Rent
- Buy
- Free
- Ads

Only show groups with data.

Example:

```text
Where to Watch
Based on your region: United States · Change

Stream
[ Netflix ] [ Prime Video ] [ Hulu ]

Rent
[ Apple TV ] [ Amazon Video ]

Buy
[ Apple TV ] [ Google Play Movies ]
```

If no providers are available:

```text
No availability found for United States.
Change region
```

If TMDB has a region entry but no provider groups:

```text
No streaming, rental, or purchase options are listed for United States.
```

If the API fails:

```text
Could not load watch options right now.
```

Also show:

```text
Availability data provided by JustWatch.
```

The attribution should appear near the provider list, not hidden in a footer.

**Region Model**

Store a country code on the user.

Recommended DB field:

```ts
watchRegion: string
```

Use ISO 3166-1 alpha-2 country codes because TMDB provider results are keyed by country code:

```text
US
IN
GB
CA
AU
DE
FR
```

Display names should be resolved client-side or server-side from a supported region list.

Recommended shared type:

```ts
type WatchRegionCode = string;
```

Keep it as `string` at the database/API boundary because country lists can change, but validate against a known supported list in requests.

**Supported Regions**

TMDB supports many watch provider regions. For v1, there are two reasonable approaches.

Recommended:
- Backend exposes supported watch regions from TMDB configuration/provider countries if available, cached.
- Client uses that list in signup/settings.
- Fallback to a local static list if the TMDB region list request fails.

Simpler:
- Ship a static country list in the client/server.
- Validate submitted country codes against it.

Given this is a self-hostable app, the simpler static list is acceptable for v1, but the best product behavior is to use TMDB-supported watch regions so users do not select a country TMDB cannot return provider data for.

**API Requirements**

Add/update user profile fields.

Auth/register request:

```ts
{
  name: string;
  email: string;
  password: string;
  watchRegion: string;
}
```

Current user response should include:

```ts
{
  id: string;
  name: string;
  email: string;
  watchRegion: string;
}
```

Profile update endpoint should allow:

```ts
PATCH /api/user/me
{
  watchRegion: "US"
}
```

Or use the existing profile update route if one already exists.

Add watch provider endpoint:

```http
GET /api/media/:mediaType/:id/watch-providers
```

Behavior:
- Requires authenticated user if using saved user region.
- Resolves region from current user’s `watchRegion`.
- Optional query override may be supported:

```http
GET /api/media/movie/123/watch-providers?region=GB
```

Recommended behavior:
- Authenticated request with no query param uses user profile region.
- Query param can override region for previewing or inline change flows.
- If unauthenticated usage exists, default to `US` or `VITE_DEFAULT_WATCH_REGION`.

Response:

```ts
{
  region: {
    code: "US",
    name: "United States"
  },
  link: "https://www.themoviedb.org/movie/...",
  providers: {
    stream: WatchProvider[];
    rent: WatchProvider[];
    buy: WatchProvider[];
    free: WatchProvider[];
    ads: WatchProvider[];
  },
  attribution: {
    provider: "JustWatch"
  }
}
```

Provider:

```ts
{
  id: number;
  name: string;
  logoUrl: string;
  displayPriority: number;
}
```

Prefer returning full `logoUrl` from the server or consistently building it on the client from `logo_path`. Since the client already builds TMDB image URLs elsewhere, either is fine. Full URL is cleaner for this new API.

**Backend Implementation Notes**

Add to `server/src/features/media/tmdb.client.ts`:

```ts
getWatchProviders(mediaType, id)
```

Cache key:

```text
watch-providers:{mediaType}:{id}
```

TTL:
- 12 hours minimum
- 24 hours acceptable

The raw TMDB response contains all countries, so cache the full response by media item. Region filtering can happen in the service layer.

Add to `media.service.ts`:

```ts
getWatchProviders(mediaType, id, region)
```

Responsibilities:
- Validate media type.
- Fetch TMDB providers.
- Select requested region.
- Normalize groups.
- Sort providers by `display_priority`.
- Return empty arrays for missing groups.

Add to `media.controller.ts`:
- Parse `mediaType`, `id`, optional `region`.
- If no region query param, use authenticated user region.
- Return normalized response.

Add to `media.routes.ts`:
```ts
GET /:mediaType/:id/watch-providers
```

Place it before any broad dynamic route if route ordering matters.

**Database Requirements**

Prisma user model:

```prisma
model User {
  ...
  watchRegion String @default("US")
}
```

Migration:
- Add nullable or defaulted column.
- Backfill existing users to `US`.
- Prefer non-null with default after migration.

Existing users:
- Default to `US`.
- They can change it from profile/settings.

**Client Implementation Notes**

Add types near media feature:

```ts
export interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string;
  displayPriority: number;
}

export interface WatchProvidersResponse {
  region: {
    code: string;
    name: string;
  };
  link: string | null;
  providers: {
    stream: WatchProvider[];
    rent: WatchProvider[];
    buy: WatchProvider[];
    free: WatchProvider[];
    ads: WatchProvider[];
  };
  attribution: {
    provider: 'JustWatch';
  };
}
```

Add hook:

```text
client/src/features/media/api/use-watch-providers.ts
```

Query key:

```ts
['media', mediaType, id, 'watch-providers', region]
```

If using authenticated user region from server, the query key still needs user region or current user version to refetch after changes.

Recommended:
- Client reads current user.
- Passes `region=currentUser.watchRegion`.
- Query key includes region explicitly.

Add component:

```text
client/src/pages/media-details/components/watch-providers-section.tsx
```

Responsibilities:
- Loading state with compact skeletons.
- Empty state.
- Provider groups.
- JustWatch attribution.
- Region display/change affordance.

Use compact badges/chips with logos. Avoid large cards.

**Inline Region Change UX**

Component behavior:
- `Change` opens dialog.
- Dialog contains country select.
- Save calls user profile update mutation.
- On success:
  - Close dialog.
  - Refresh current user.
  - Watch provider query automatically refetches because region changed.
  - Show toaster success.

Dialog copy:

```text
Watch region
Choose the country used for streaming availability.
```

Buttons:
```text
Cancel
Save
```

**Validation**

Client:
- Country required during signup.
- Country must be in supported country list.
- Display friendly country name.

Server:
- Reject invalid country code with 400.
- Normalize to uppercase.
- Use `US` default only when creating/backfilling, not silently on invalid updates.

**Permissions / Auth**

Preferred:
- Region setting is tied to authenticated users.
- Watch providers endpoint can require auth because it depends on user profile.

If media details are public/unauthenticated:
- Allow `region` query param.
- Use default region if unauthenticated and no region is supplied.

Given Kadha already has user media features, requiring auth for personalized provider region is acceptable. But basic availability can still work for anonymous users if the app has public browsing.

**Error States**

Signup:
- If country list fails to load, use static fallback.
- Do not block signup on TMDB region-list failure.

Profile:
- Save failure shows toaster.
- Existing region remains unchanged.

Media details:
- Provider API failure should not break the full details page.
- Show section-level error only.
- Do not redirect.

**Analytics / Activity**

Optional, not required for v1:
- Do not log every media availability view.
- Updating watch region may create a user activity event if profile-setting changes are already tracked.

Potential activity label:

```text
Updated watch region
```

**Accessibility**

- Provider logos must have accessible names.
- If using image-only chips, include text or `aria-label`.
- Region change control must be keyboard accessible.
- Dialog must focus the country select when opened.
- Loading skeletons should not trap focus.

**Changelog**

Add under `## Unreleased`.

Feature changes:
```md
#### Watch Providers

- Added user watch region settings during signup and profile editing.
- Added region-aware “Where to Watch” availability to movie and TV detail pages.
```

Engineering changes:
```md
#### Media Availability

- Added TMDB watch provider integration with normalized server responses and cached provider lookups.
```

Run:

```bash
cd client && npm run sync:changelog
```

**Verification Plan**

Server:
```bash
cd server && npm run build
cd server && npm test
```

Client:
```bash
cd client && npm run lint
cd client && npm run build
```

Manual QA:
1. Register a new user and select `United States`.
2. Confirm profile shows `United States`.
3. Open a popular movie detail page.
4. Confirm “Where to Watch” appears with region text.
5. Change region from the media details page.
6. Confirm provider list refetches for the new region.
7. Confirm profile now shows the updated region.
8. Open a TV show detail page and confirm provider data works.
9. Test a title with no availability in the selected region.
10. Confirm JustWatch attribution is visible.

**Open Decisions**

- Use inline region-change dialog on media details, or link to profile/settings?
  - Recommendation: inline dialog.
- Use static country list or TMDB-supported watch regions endpoint?
  - Recommendation: static fallback plus TMDB-supported list if straightforward.
- Should unauthenticated users see watch providers?
  - Recommendation: yes if public media browsing exists, using default region; authenticated users get their saved region.
- Default region?
  - Recommendation: browser locale if confidently available, otherwise `US`.

**Suggested Implementation Order**

1. Add `watchRegion` to user model, migration, server user types.
2. Add signup country field and profile/settings edit field.
3. Add server watch provider TMDB client/service/controller/route.
4. Add client watch provider hook/types.
5. Add media details `WhereToWatchSection`.
6. Add inline region edit dialog from media details.
7. Update changelog and generated changelog.
8. Run server/client verification.
