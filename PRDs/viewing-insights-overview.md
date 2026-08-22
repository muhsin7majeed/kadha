# PRD: Viewing Insights Overview

- Status: Draft
- Version: 1.0
- Product: Kadha
- Primary owner: TBD
- Target release: TBD
- Last updated: 2026-08-22
- Dependencies: Existing watched, liked, rating, media snapshot, and TV episode-progress data; TMDB genres and credits
- Related areas: My Profile, watched media, TV progress, privacy, data export, recommendations, future watch history

## 1. Summary

Kadha will add an owner-only **Overview** tab to My Profile that helps users understand their viewing activity and
taste. It will answer questions such as:

- What kinds of movies and shows do I watch most?
- Which genres define my viewing?
- Which actors, movie directors, and TV creators appear most often?
- What do I tend to like or rate highly?
- How much of my tracked activity is movies, TV shows, or episodes?

The first release will present a concise, attractive all-time overview using current watched state, likes, ratings,
episode progress, and reusable TMDB metadata. It will not claim to represent complete play history or rewatch counts.

The feature must also establish an analytics boundary that can later support:

- richer interactive charts;
- year and custom-period views;
- repeat-watch counts;
- appendable movie and episode watch events;
- accurate viewing-time estimates;
- annual recaps;
- recommendation explanations;
- optional privacy-aware sharing.

The architecture should store canonical media dimensions once, derive user insights from user-owned facts, and add
versioned aggregate caches only when measured performance requires them.

## 2. Context and current state

### 2.1 Current product structure

My Profile is the natural home for personal activity. It currently contains:

- a profile header;
- watched, liked, watchlist, and collections tabs;
- profile and section-level privacy controls;
- owner shortcuts to account and privacy settings.

Settings is intended for account controls rather than personal viewing output. Adding another primary navigation
destination would fragment the profile experience and increase navigation density.

### 2.2 Current stored facts

`UserMedia` currently records one current-state row per user and title:

```text
liked
watched
watchlist
likedAt
watchedAt
watchlistAt
rating
ratedAt
watchedOn
```

`UserEpisodeWatch` currently records one current-state row per user and episode, including watched timestamps, an
optional watched date, rating, and note.

`MediaSnapshot` stores shared title metadata, including:

- movie or TV type;
- title and artwork;
- genre IDs;
- release date;
- original language;
- runtime when available;
- popularity and TMDB rating data.

This is sufficient for initial genre, media-type, release-period, language, rating, title, and episode totals. It is
not sufficient for people insights because cast and crew are not persisted.

### 2.3 Current history limitation

The existing models represent current state, not a complete viewing diary:

- A title can have only one `watchedOn` value.
- A movie cannot have multiple recorded watches.
- An episode can have only one recorded watch.
- Removing and re-adding watched state does not provide trustworthy rewatch history.
- Activity records describe state changes, but are not a canonical play ledger.

The first release must therefore use language such as **titles marked watched**, not plays, viewings, or lifetime watch
count.

## 3. Problem

Kadha lets users collect detailed private tracking data but does not currently turn that data into understandable
feedback. Users can inspect individual lists, but cannot easily see the patterns across their library.

Without an overview:

- the profile is primarily a set of inventories rather than a reflection of the user;
- accumulated watched, liked, rating, and episode data has little compounding value;
- users cannot distinguish viewing habits from taste signals;
- future chart, recap, history, and recommendation features lack a shared analytics contract;
- implementing individual statistics ad hoc could create inconsistent definitions and duplicated user-level counters.

## 4. Product principles

### 4.1 Explain before decorating

Every visual must answer a recognizable question and expose its exact value. Charts should not exist solely to fill a
dashboard.

### 4.2 Keep signals distinct

Kadha must not combine watched, liked, watchlist, and collection membership into one unexplained score.

| Signal | Meaning | Use in the initial overview |
|---|---|---|
| Watched titles and episodes | Consumption | Primary viewing insights |
| Likes and personal ratings | Taste | Separate taste section |
| Watchlist | Future intent | Excluded |
| Collections | Organization, collaboration, or curation | Excluded |

### 4.3 Prefer understandable counts

Prefer statements such as `18 of 64 watched titles are dramas` over proprietary affinity scores. If a score is
introduced later for recommendations, it must not silently replace understandable overview metrics.

### 4.4 Show uncertainty

The response and interface must expose source sample size, metadata coverage, and minimum-sample rules. Missing TMDB
metadata must produce partial, labeled insights rather than silent undercounting or a failed page.

### 4.5 Design for richer analytics without shipping them prematurely

The server response should use reusable metric and distribution shapes rather than chart-library-specific structures.
The first UI may use simple ranked bars and cards, while later clients can render the same data as charts.

### 4.6 Privacy is part of the statistic

An insight derived from private data is private data. Derived output must never bypass the access rules of its source.

## 5. Goals

- Give users a meaningful, attractive summary of their tracked viewing.
- Make Overview the default My Profile tab.
- Clearly separate viewing behavior from taste signals.
- Provide reliable totals and ranked insights from currently available facts.
- Add reusable canonical genre, person, and credit metadata where required.
- Avoid per-user actor, director, and genre score tables.
- Return chart-ready, versioned API data independent of the presentation library.
- Support incomplete metadata and backfill progress gracefully.
- Establish cache invalidation based on user fact revisions rather than fragile incremental counters.
- Preserve a clean migration path to multiple watch events per title or episode.
- Keep the initial implementation appropriate for SQLite and self-hosting.

## 6. Non-goals

The initial release will not include:

- repeat-watch or play counts;
- a complete watch diary;
- watch streaks;
- accurate total time watched;
- day, week, month, or year trend charts;
- custom date ranges;
- a charting production dependency;
- watchlist or collection items in viewing rankings;
- opaque cross-signal preference scores;
- public or friends-visible insights;
- shareable recap images;
- comparisons with friends or global Kadha users;
- automated recommendations;
- gender-separated cast rankings;
- per-episode cast or director attribution;
- external imports solely for the overview feature.

These are potential follow-up phases, not assumptions embedded in the MVP.

## 7. Product decisions

| Decision | Outcome |
|---|---|
| Primary location | First tab on My Profile |
| Route | `/app/profile/:username/overview` |
| Initial audience | Profile owner only |
| Default period | All time |
| Initial media filter | All, Movies, TV |
| Primary viewing unit | Distinct eligible titles |
| TV episode total | Distinct currently watched episodes |
| Genre ranking | Distinct eligible titles containing the genre |
| Cast ranking | Distinct eligible titles among eligible billed cast |
| Movie authorship | Crew job exactly `Director` |
| TV authorship | TV `created_by`, presented as Creators |
| Likes and ratings | Separate taste section |
| Watchlist and collections | Excluded from viewing and taste calculations in v1 |
| Aggregate persistence | Calculate on read first; versioned cache later if needed |
| Metadata persistence | Shared canonical genre/person/credit relations |
| Future watch count | Dedicated watch-event facts, not activity-log inference |

## 8. Users and user stories

### 8.1 Established tracker

As a user with a substantial library, I want to understand my most common genres and collaborators without manually
reviewing hundreds of titles.

As a user, I want to see the exact titles contributing to an insight so the result feels trustworthy.

As a user, I want movies and TV to be comparable without a long-running TV show overwhelming every ranking.

### 8.2 New tracker

As a new user, I want the overview to explain how it becomes useful instead of showing empty charts.

As a user with limited data, I want Kadha to avoid making exaggerated claims about my taste.

### 8.3 Privacy-conscious user

As a user, I want insights derived from private tracking data to remain private.

As a user, I want to understand what data contributed to each result.

### 8.4 Future history user

As a user, I eventually want to record another watch of a movie or episode without overwriting the previous watch.

As a user, I want future charts and recaps to build on the same media and people metadata as the overview.

## 9. Information architecture

### 9.1 Profile placement

Recommended tab order:

1. Overview
2. Watched
3. Liked
4. Watchlist
5. Collections

The owner profile index should resolve to Overview. Other-user profiles should continue to resolve to the first section
the viewer can access until social insights are deliberately designed.

Overview must not become a separate bottom-navigation or navbar destination in v1.

### 9.2 Page hierarchy

```text
My Profile header

Overview | Watched | Liked | Watchlist | Collections

Media filter: All | Movies | TV

Viewing signature
Headline totals

Genres
People
Taste
Additional distributions
Methodology and coverage
```

The overview should use progressive disclosure: lead with a short summary and a few important values, then allow the
user to inspect ranked details.

## 10. Initial user experience

### 10.1 Viewing signature

The first card should translate the strongest well-supported results into a short sentence:

```text
You gravitate toward Drama. Christopher Nolan is your most-watched
movie director, and Cillian Murphy appears most often in your watched titles.
```

Rules:

- Use only facts that meet minimum sample and metadata-coverage requirements.
- Do not use deterministic personality labels such as `Horror superfan` in v1.
- Omit an unavailable clause rather than displaying `Unknown`.
- Include supporting counts close to the sentence.
- Treat this copy as a deterministic formatter over returned data, not generated text.

### 10.2 Headline totals

Show a responsive group of compact totals:

- titles marked watched;
- movies and TV shows split;
- episodes marked watched;
- average personal rating, when enough ratings exist.

Do not show total viewing time until runtime coverage and watch-event semantics support an honest value.

### 10.3 Genres

Display the top five genres as ranked horizontal bars.

Each row should show:

- rank;
- genre name;
- distinct title count;
- share of eligible titles;
- an accessible text label containing the full relationship.

Example:

```text
1  Drama       28 titles       33%
2  Thriller    21 titles       25%
3  Comedy      16 titles       19%
```

Because titles can have multiple genres, genre percentages are overlapping. Include concise methodology text rather
than presenting genres as slices of a whole. Do not use a pie or donut chart.

### 10.4 People

Use separate sections for:

- most watched cast;
- movie directors;
- TV creators.

Each person item should show:

- rank;
- profile image or avatar fallback;
- name;
- number of distinct contributing titles;
- role label where useful.

Desktop may use a compact row or two-column card layout. Mobile should use a readable vertical ranked list rather than
a horizontally hidden carousel.

### 10.5 Taste

Keep taste visually and semantically separate from watched volume.

Initial taste insights:

- most liked genres;
- highest-rated genres when the minimum sample is met;
- highest-rated titles with personal ratings.

Do not infer that an unliked title was disliked. Do not infer that a high rating means `liked` or that `liked` means a
specific rating.

### 10.6 Additional distributions

If space and metadata coverage allow, v1 may include:

- movie versus TV distribution;
- release-decade distribution;
- original-language distribution.

These should remain below genres and people. The page should not become a wall of equally weighted charts.

### 10.7 Drill-down

An insight may be interactive only when it has a useful destination.

The preferred future behavior is to open a filtered watched view or an insight detail dialog showing contributing
titles. If filtering is not available in v1, present the item as information rather than using a misleading button or
link style.

### 10.8 Small and empty libraries

| Data state | Experience |
|---|---|
| No watched titles | Explain that marking titles watched builds the overview; link to discovery |
| 1-4 eligible titles | Show totals and recent contributing titles; avoid a viewing signature |
| 5+ eligible titles | Show preliminary rankings with `Based on N titles` |
| Missing credits | Show available insights and a people-specific coverage state |
| Metadata enrichment active | Keep results usable and explain that more details are being prepared |
| Enrichment failure | Do not fail unrelated totals or genres; offer retry where appropriate |

### 10.9 Loading and errors

- Use skeletons matching the final card layout.
- Do not blank the profile header while insights refetch.
- A failure in one optional insight group should not discard successful groups.
- A complete endpoint failure should use the existing retryable error-state pattern.
- Preserve previous data during background refresh where practical.

## 11. Responsive and accessible presentation

The implementation should use existing Chakra UI v3 conventions and Kadha semantic text styles.

Recommended primitives:

- `Stack` and `SimpleGrid` for responsive section layout;
- semantic `Card` sections;
- `Box`-based ranked bars using theme-aware tokens;
- `Avatar` or the existing avatar abstraction for people;
- explicit `colorPalette` values for interactive controls;
- existing shared tabs, state components, and page patterns.

Requirements:

- Every visual value must also appear as text.
- Color must not be the only way to distinguish a category or rank.
- Ranked bars must have accessible names describing label, value, and denominator.
- Keyboard and screen-reader users must receive the same information as pointer users.
- Tooltips may supplement a value but must not be its only representation.
- Profile images are decorative when the adjacent text already names the person.
- Motion must not be required to understand a result and should respect reduced-motion preferences.
- The layout must support mobile, enlarged text, long translated names, and missing artwork.

No charting dependency is required for v1. Adding one later requires explicit approval and should be driven by chart
types that cannot be implemented accessibly and maintainably with existing primitives.

## 12. Metric definitions

Metric definitions are part of the product contract and must be tested independently of the UI.

### 12.1 Eligible watched title

A title is eligible when:

- it is a movie with `UserMedia.watched = true`; or
- it is a TV series with `UserMedia.watched = true`; or
- it is a TV series for which the user has at least one `UserEpisodeWatch` row.

Each movie or series contributes at most one title to title-based rankings, regardless of episode count.

### 12.2 Titles marked watched

Count distinct eligible media identities, using `(media_type, media_id)` as the canonical identity.

### 12.3 Episodes marked watched

Count distinct current `UserEpisodeWatch` rows. Label this as episodes marked watched, not episode plays.

### 12.4 Genre count and share

For each genre:

```text
count = distinct eligible titles containing the genre
share = count / distinct eligible titles with usable genre metadata
```

A multi-genre title contributes once to each of its genres. Shares across genres therefore do not sum to 100%.

### 12.5 Most watched cast

For each person:

```text
count = distinct eligible titles in which the person has an eligible cast credit
```

Store complete useful credits, but initially treat the first ten billed cast members per title as ranking-eligible.
This reduces background, cameo, archive-footage, and very large TV-cast noise while keeping the stored metadata usable
for later experiments.

For TV, count the series once in the default title-based ranking. Do not weight cast by all episodes in the series or
assume that the user watched every episode in which a person appeared.

### 12.6 Movie directors

Count distinct eligible movies with a crew credit whose normalized job is exactly `Director`.

Do not mix writers, producers, assistant directors, or TV creators into this metric.

### 12.7 TV creators

Count distinct eligible TV series containing the person in TMDB `created_by` metadata. Present this category as
**Creators**, not Directors.

Episode directors may become a separate metric only after episode-level credit and viewing facts are available.

### 12.8 Average personal rating

```text
average = sum of eligible personal ratings / number of eligible rated titles
```

Always return and display the number of ratings. Do not compare personal ratings with TMDB community ratings in v1.

### 12.9 Most liked genre

Count distinct currently liked titles per genre. This is a taste metric and does not require `watched = true` because
Kadha currently allows the two flags to remain independent.

### 12.10 Highest-rated genre

Compute the average personal rating for rated titles in each genre. Require at least three rated titles in a genre by
default. Return the sample size beside the average.

### 12.11 Ordering and ties

Use stable ordering:

1. primary count or average descending;
2. sample size descending where applicable;
3. normalized display name ascending;
4. canonical ID ascending.

The UI must display equal primary values honestly even if a stable secondary sort determines row order.

### 12.12 Current-state date semantics

If a future v1 increment supports time filters before watch events exist, the effective date is:

```text
watchedOn when explicitly provided, otherwise watchedAt
```

This represents the best available tracked date, not guaranteed historical viewing time. All-time is the only required
period for the initial release; year and custom-date charts should follow the watch-event foundation.

## 13. Minimum samples and quality thresholds

Recommended defaults:

| Insight | Minimum sample |
|---|---:|
| Viewing signature | 5 eligible titles |
| Top genre | 5 eligible titles with genre metadata |
| Most watched cast | 5 eligible titles with credits |
| Director or creator leader | 3 eligible titles in the applicable media type |
| Average personal rating | 2 rated titles |
| Highest-rated genre | 3 rated titles in that genre |

Thresholds should be named server constants and included in methodology metadata when relevant. They must not be
scattered across client components.

## 14. Canonical metadata architecture

### 14.1 Principle

Genres and people describe media, not users. Store these dimensions once and join user facts to them through the
canonical media identity.

```text
UserMedia ----------> MediaSnapshot <---------- CollectionItem
                           |
                           +---- MediaGenre ----> Genre
                           |
                           +---- MediaCredit ---> Person
```

Do not create actor, director, or genre rows each time a user likes or watches a title.

### 14.2 Genre

Recommended conceptual fields:

```text
Genre
  id                 TMDB genre ID
  name
  updatedAt

MediaGenre
  mediaSnapshotId
  genreId
  createdAt
  unique(mediaSnapshotId, genreId)
```

The existing serialized `MediaSnapshot.genre_ids` may remain during a staged migration. New analytics code should
ultimately consume normalized relations so filtering, indexing, aggregation, and metadata updates do not require JSON
parsing.

### 14.3 Person

Recommended conceptual fields:

```text
Person
  id                 TMDB person ID
  name
  profilePath
  knownForDepartment
  metadataUpdatedAt
```

Person metadata is shared across every media title and user.

### 14.4 Media credit

Recommended conceptual fields:

```text
MediaCredit
  id
  mediaSnapshotId
  personId
  tmdbCreditId
  kind               CAST | CREW | CREATOR
  department
  job
  character
  billingOrder
  aggregateEpisodeCount
  metadataUpdatedAt
```

The exact unique constraint must account for a person having multiple characters or jobs on the same title. Prefer a
stable TMDB credit identity when available, with a documented fallback composite identity for aggregate TV roles.

Store enough information to change ranking rules without refetching all credits.

### 14.5 Media enrichment state

`MediaSnapshot` or a closely owned metadata-status model should track:

```text
metadataStatus        PENDING | READY | PARTIAL | FAILED
metadataVersion
detailsUpdatedAt
creditsUpdatedAt
lastMetadataAttemptAt
metadataFailureCode
```

Do not expose raw upstream error details to users.

## 15. TMDB enrichment strategy

### 15.1 Sources

- Movie details and movie credits for movies.
- TV details, including `created_by`, for series.
- TV aggregate credits for series-wide cast and crew.
- Movie and TV genre configuration for normalized genre names.

TMDB detail endpoints support `append_to_response`, which may reduce requests when compatible subresources are needed
together. The client must still treat movie credits and TV aggregate credits as distinct response contracts.

### 15.2 Write-path behavior

Tracking actions must remain fast:

1. Persist the user action and basic media snapshot transactionally.
2. Detect whether the shared media snapshot needs enrichment.
3. Schedule or mark enrichment work without blocking the action response.
4. Reuse completed metadata for all users and collections referencing the title.

Do not make one credits request per user and do not make successful `Mark watched` depend on TMDB availability.

### 15.3 Durable work

For the initial self-hosted implementation, use a replaceable, database-backed enrichment boundary rather than adding
external queue infrastructure.

The worker or scheduled process should support:

- idempotent upserts;
- bounded concurrency;
- retry with exponential backoff and jitter;
- explicit handling of TMDB `429` responses;
- resumable backfill over distinct media snapshots;
- stale metadata refresh;
- safe partial completion;
- observable pending, failed, and completed counts.

If a general durable-job system is introduced for another feature first, enrichment should reuse it rather than create
a competing queue abstraction.

### 15.4 Backfill

The first deployment must backfill distinct media snapshots, not user-media or collection-item rows.

Backfill behavior:

- deduplicate by `(media_type, media_id)`;
- prioritize titles belonging to currently watched users when practical;
- allow the overview to return partial results during backfill;
- persist progress so restarts do not start over;
- avoid holding a database transaction across network calls;
- report coverage separately for genres, credits, and runtime.

## 16. Analytics service architecture

### 16.1 Feature ownership

Recommended server shape:

```text
server/src/features/insights/
  insights.routes.ts
  insights.controller.ts
  insights.service.ts
  insights.repository.ts
  insights.aggregator.ts
  insights.schema.ts
  insights.types.ts
  insights.constants.ts
```

Metadata enrichment may live under the existing media feature because the metadata belongs to media, not insights.

Recommended client shape:

```text
client/src/features/insights/
  api/use-viewing-insights.ts
  components/
  insights.types.ts
  insights.utils.ts

client/src/pages/user/profile/overview/
  index.tsx
```

### 16.2 Layer responsibilities

- Controller: validate request context and return the response.
- Repository: load bounded user facts and canonical dimensions without N+1 queries.
- Aggregator: apply pure, tested metric definitions.
- Service: enforce ownership/privacy, coordinate loading, coverage, caching, and response construction.
- Client components: render supplied metrics without redefining their meaning.

### 16.3 Source abstraction

The aggregator should consume a normalized internal source contract rather than Prisma rows directly. Conceptually:

```ts
interface ViewingTitleFact {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  isTitleMarkedWatched: boolean;
  watchedEpisodeCount: number;
  personalRating: number | null;
  liked: boolean;
  effectiveWatchedAt: Date | null;
  metadata: InsightMediaDimensions;
}
```

In v1, an adapter builds these facts from `UserMedia`, `UserEpisodeWatch`, and canonical metadata. After watch events
ship, a new adapter can add play facts and time-series data without rewriting genre, person, and taste aggregation.

Do not expose this exact internal type as the public API contract.

## 17. API contract

### 17.1 Endpoint

Recommended initial endpoint:

```http
GET /api/user/insights?mediaType=all
```

Supported initial media types:

```text
all
movie
tv
```

The authenticated-user endpoint avoids username ambiguity and makes the owner-only privacy contract explicit.

A future social endpoint may use:

```http
GET /api/user/:username/insights
```

It must be designed separately with source-section privacy enforcement.

### 17.2 Response principles

- Version the response schema.
- Return IDs, labels, values, denominators, rank, and sample sizes.
- Return data semantics, not colors, widths, or chart component names.
- Use ordered arrays for ranked values and time buckets.
- Return coverage per insight group.
- Return unavailable sections explicitly with a stable reason.
- Do not include private notes or unnecessary underlying user records.

### 17.3 Illustrative response

```json
{
  "schemaVersion": 1,
  "scope": {
    "period": "all",
    "mediaType": "all",
    "basis": "CURRENT_TRACKED_STATE"
  },
  "summary": {
    "watchedTitleCount": 84,
    "movieCount": 52,
    "tvSeriesCount": 32,
    "watchedEpisodeCount": 312,
    "personalRating": {
      "average": 7.8,
      "sampleSize": 41
    }
  },
  "viewingSignature": {
    "status": "AVAILABLE",
    "tokens": {
      "topGenre": "Drama",
      "topMovieDirector": "Christopher Nolan",
      "topCastMember": "Cillian Murphy"
    }
  },
  "rankings": {
    "genres": [
      {
        "id": "18",
        "label": "Drama",
        "rank": 1,
        "value": 28,
        "unit": "titles",
        "denominator": 84,
        "share": 0.3333,
        "sampleSize": 84
      }
    ],
    "cast": [],
    "movieDirectors": [],
    "tvCreators": [],
    "likedGenres": [],
    "highestRatedGenres": []
  },
  "distributions": {
    "mediaTypes": [],
    "releaseDecades": [],
    "originalLanguages": []
  },
  "coverage": {
    "eligibleTitleCount": 84,
    "genres": {
      "coveredTitleCount": 84,
      "ratio": 1
    },
    "credits": {
      "coveredTitleCount": 78,
      "ratio": 0.9286,
      "status": "PARTIAL"
    },
    "runtime": {
      "coveredTitleCount": 60,
      "ratio": 0.7143,
      "status": "PARTIAL"
    }
  },
  "methodology": {
    "genreSharesOverlap": true,
    "castBillingLimit": 10,
    "titleCountingMode": "DISTINCT_TITLES",
    "tvPeopleWeighting": "ONE_PER_SERIES"
  },
  "computedAt": "2026-08-22T10:00:00.000Z"
}
```

The final TypeScript contract should use precise unions for availability, basis, units, and filter values. Do not use
`any`.

### 17.4 Future chart compatibility

Future time-series data should use ordered buckets:

```json
{
  "key": "2026-08",
  "label": "Aug 2026",
  "start": "2026-08-01",
  "endExclusive": "2026-09-01",
  "value": 12,
  "unit": "plays"
}
```

The API must define timezone and bucket boundaries. Chart clients should not infer them from display labels.

## 18. Calculation and query strategy

### 18.1 Initial approach

Calculate insights on read from canonical current state:

1. Query eligible user-media facts with only required fields.
2. Query grouped episode counts.
3. Load required genre and credit dimensions in bounded queries.
4. Aggregate with pure functions or database grouping where it materially reduces transferred data.
5. Return top-N rankings, summary values, coverage, and methodology.

Avoid:

- one database query per title;
- one TMDB request per title during an overview request;
- loading overview text, artwork, or notes that are not needed for aggregation;
- returning full credit lists when the UI requests only top-N people;
- reusing paginated watched-list responses and repeatedly fetching every page.

### 18.2 SQLite and Prisma considerations

The implementation should remain correct on SQLite. It may use focused parameterized raw SQL for aggregate joins when
Prisma cannot express an efficient grouped query, but raw SQL must remain repository-owned, typed at its boundary, and
covered by integration tests.

For typical self-hosted libraries, bounded on-read aggregation is expected to be sufficient. Performance decisions
must be based on representative benchmarks rather than speculative counters.

### 18.3 Performance targets

Initial targets on a warmed local database with enriched metadata:

- p95 server computation below 300 ms for 1,000 eligible titles;
- no TMDB network request on the synchronous overview request path;
- bounded query count independent of library size;
- response size below 100 KB for the initial top-N overview;
- partial section failure must not cause a 500 response when core summary data is available.

These are engineering targets, not user-facing guarantees, and should be validated in Docker Compose using generated
non-production fixtures.

## 19. Cache and invalidation strategy

### 19.1 Initial cache

Use normal React Query caching for the owner overview. A short server memory cache is optional only if profiling shows a
benefit.

Cache identity must include:

- user ID;
- media-type filter;
- period when added;
- response schema version;
- user insight revision;
- relevant metadata revision.

### 19.2 User insight revision

Introduce a transactionally updated per-user insight or library revision when persistent caching becomes necessary.
Increment it when a mutation can affect insights, including:

- watched state;
- liked state;
- personal rating;
- explicit watched date;
- episode watched state;
- future watch-event creation, edit, or deletion.

Client mutations should invalidate the insights query immediately regardless of server caching.

### 19.3 Metadata revision

Shared metadata enrichment can change a result without changing user facts. Persistent cached results must therefore
also account for metadata freshness. This may be a global metadata revision, an affected-media dependency version, or
a conservative expiry combined with source coverage checks.

### 19.4 Persistent cache, only when justified

If on-read aggregation becomes expensive, add a versioned response snapshot rather than per-dimension counters:

```text
UserInsightSnapshot
  userId
  filterHash
  schemaVersion
  userInsightRevision
  metadataRevision
  payloadJson
  computedAt
  expiresAt
```

Recompute the snapshot when revisions no longer match. Do not incrementally mutate `UserActorScore`, `UserGenreScore`,
or similar tables on every action; those tables are difficult to repair when actions, metadata, or formulas change.

## 20. Future watch-event architecture

### 20.1 Objective

The immediate follow-up to Overview should allow multiple watches of the same movie or episode and make watch count a
first-class fact. It must not derive play counts from activity records or overwrite the only previous watched date.

### 20.2 Conceptual model

```text
WatchEvent
  id
  userId
  mediaId
  mediaType
  seasonNumber          nullable for movies and title-level legacy facts
  episodeNumber         nullable for movies and title-level legacy facts
  episodeId             nullable
  occurredAt
  datePrecision         EXACT | DATE_ONLY | RECORDED_AT_FALLBACK | UNKNOWN
  runtimeMinutes        nullable snapshot or resolved fact
  source                MANUAL | IMPORT | PLEX | OTHER_INTEGRATION | LEGACY
  sourceConnectionId    nullable
  externalEventKey      nullable
  createdAt
  updatedAt
```

Final field names and relations require a separate implementation design. The important invariants are:

- one row represents one watch occurrence;
- events belong to a user and canonical media identity;
- movie and episode events use one coherent analytics source;
- external events have an idempotency key scoped to their source connection;
- users can correct or remove erroneous events;
- date precision is explicit rather than implied;
- current watched flags remain compatible during migration;
- analytics can distinguish distinct titles, watched episodes, and total plays.

### 20.3 Relationship with current state

`UserMedia` should remain the convenient title-level state for liked, watchlist, notes, ratings, and fast library
queries. The watch-history design must explicitly decide whether `UserMedia.watched` becomes derived from watch events
or remains a denormalized state maintained transactionally.

Recommended direction:

- creating the first watch event makes the title watched;
- additional events increase play count without duplicating the title in the watched library;
- deleting one of several events does not make the title unwatched;
- deleting the last event prompts or applies a documented watched-state rule;
- marking a TV episode watched creates one event and updates current episode progress;
- removing current watched status must not silently delete a user's full historical diary.

The future UX must separate **remove watched status** from **delete watch history** when those concepts diverge.

### 20.4 Legacy migration

Existing data can seed, but cannot reconstruct, history:

- create at most one legacy movie/title watch event for each currently watched title;
- use explicit `watchedOn` when available;
- otherwise use `watchedAt` with `RECORDED_AT_FALLBACK` precision;
- create at most one legacy event for each current watched episode;
- preserve a migration/source marker;
- explain that pre-history watch counts begin at one where only current state was known;
- do not infer repeated watches from like, activity, or collection records.

Migration must be idempotent and covered with existing-data fixtures.

### 20.5 Analytics evolution

After watch events ship, keep existing metrics stable:

- `titles marked watched` continues to mean distinct eligible titles;
- `episodes marked watched` continues to mean distinct episodes with current watched state;
- add `total plays` as a separate metric;
- add `rewatches` as `total plays - distinct watched units`, with clearly defined units;
- use watch events for time buckets, first/last watch, and annual recaps;
- never silently change an existing title count into a play count.

This separation allows old Overview cards and new history charts to coexist.

### 20.6 Index and scale considerations

The future event model should support indexes for:

```text
(userId, occurredAt)
(userId, mediaType, mediaId, occurredAt)
(userId, mediaType, mediaId, seasonNumber, episodeNumber)
(sourceConnectionId, externalEventKey) unique when present
```

History queries must paginate event details and aggregate time series in the database. The overview endpoint should
return bounded top-N and bucket results, not raw event history.

## 21. Privacy and security

### 21.1 Initial visibility

Overview is owner-only in v1, regardless of profile visibility. This avoids creating accidental inference channels
while the product establishes insight-specific privacy behavior.

### 21.2 Future social visibility

A later social release must decide whether:

- each insight inherits its source section's privacy;
- the entire Overview receives a dedicated privacy setting; or
- users explicitly opt individual insight groups into sharing.

Until that decision is implemented, do not expose username-based insight responses.

Mixed-source cards are particularly sensitive. For example, a viewing signature that combines watched and liked data
may be shown only when the viewer can access both sources.

### 21.3 API requirements

- Authenticate and authorize before reading user facts or cached insight payloads.
- Key caches by owner identity and access context where relevant.
- Never expose private notes through insight responses.
- Do not leak hidden titles through person, genre, count, date, coverage, or empty-state differences.
- Apply normal endpoint rate limits if social access is introduced.
- Avoid logging complete user insight payloads.

### 21.4 Export and deletion

Canonical media, genre, person, and credit metadata is shared reference data and is not deleted with one user.

User-specific insight snapshots and future watch events are user-owned data:

- include watch events in account export when they ship;
- delete user-specific cached snapshots during account deletion or allow them to cascade;
- do not treat a derived overview response as the canonical export source;
- keep account export based on underlying facts so it remains complete and portable.

## 22. Observability

Track locally useful operational signals without adding third-party analytics requirements:

- overview request latency;
- query count and slow-query warnings;
- cache hit and miss counts when server caching exists;
- genre, credit, and runtime coverage;
- enrichment queue depth and oldest pending age;
- TMDB success, retry, `429`, and terminal failure counts;
- number of partial insight responses;
- response schema version;
- future watch-event ingestion duplicates and failures.

User-facing metadata coverage should be understandable; operator diagnostics may be more detailed but must avoid
private media lists unless explicitly needed for a user-authorized support action.

## 23. Testing strategy

### 23.1 Aggregation unit tests

Cover:

- empty and small libraries;
- mixed movies and TV;
- a TV show eligible through episode progress only;
- multi-genre titles without double-counting within a genre;
- overlapping genre percentages;
- cast billing eligibility;
- multiple credits for one person on one title;
- exact movie-director job matching;
- TV creators kept separate from directors;
- ratings and minimum samples;
- deterministic ties;
- missing and partial metadata;
- all, movie, and TV filters;
- stable output ordering.

### 23.2 Server integration tests

Cover:

- unauthenticated rejection;
- owner-only access;
- isolation between users;
- private data not appearing in another user's response;
- bounded database query behavior;
- cache revision invalidation after relevant mutations;
- partial enrichment responses;
- idempotent metadata backfill;
- metadata updates changing cached results safely.

### 23.3 Client tests

Cover:

- Overview as the owner profile default;
- other-user profile routing remains unchanged;
- all, movie, and TV switching;
- empty, preliminary, partial, loading, error, and populated states;
- visible exact values for every bar;
- accessible names and keyboard behavior;
- no viewing signature below its minimum sample;
- image fallbacks and long names;
- responsive tab and section behavior;
- refetch/invalidation after a relevant tracking mutation.

### 23.4 Future watch-event tests

The follow-up feature must cover repeat watches, external idempotency, correction and deletion behavior, legacy
migration, date precision, watched-state reconciliation, episode identity, and chart bucket boundaries.

## 24. Rollout plan

### Phase 0: Definitions and performance fixture

- Lock metric definitions and minimum samples.
- Create representative non-production libraries for correctness and performance tests.
- Validate existing genre and runtime coverage.
- Confirm TMDB movie credits, TV aggregate credits, and TV creator response shapes.
- Decide the reusable enrichment-job boundary.

### Phase 1: Overview foundation

- Add the owner-only Overview route and profile tab.
- Add the insights server feature and typed client API boundary.
- Return all-time title, media-type, episode, rating, genre, decade, and language data supported by existing metadata.
- Add chart-ready response shapes, coverage, methodology, and empty states.
- Calculate on read without persistent user score tables.

### Phase 2: People metadata and insights

- Normalize genre relations if not completed in Phase 1.
- Add canonical Person and MediaCredit storage.
- Add durable asynchronous enrichment and distinct-media backfill.
- Add cast, movie director, and TV creator rankings.
- Surface partial credit coverage without blocking the rest of Overview.

### Phase 3: Watch events and watch count

- Complete a dedicated watch-history design based on the invariants in this PRD.
- Add multiple movie and episode watch occurrences.
- Migrate existing current state conservatively.
- Add total plays and rewatches while preserving distinct-title metrics.
- Add date filtering and initial time-series distributions.
- Update data export, deletion, tests, documentation, changelog, and roadmap.

### Phase 4: Full statistics experience

- Add year and custom-period controls.
- Add accessible line, bar, and calendar-style charts where they add meaning.
- Add accurate runtime and time-watched metrics after coverage is sufficient.
- Add first/last watch, viewing frequency, streaks, and annual recaps.
- Add drill-down into contributing titles and events.
- Evaluate shareable insights and privacy controls.

### Phase 5: Recommendations and explanation

- Reuse canonical dimensions and viewing facts for recommendations.
- Keep recommendation scoring separate from user-facing overview definitions.
- Explain recommendations using understandable source signals.
- Preserve opt-out, privacy, export, and deletion expectations.

## 25. Acceptance criteria

### Product and UX

- My Profile opens an Overview tab before existing activity tabs.
- Overview is owner-only and does not alter other-user profile defaults.
- Users see exact all-time totals and ranked values, not chart-only encodings.
- Watched behavior and taste are visually and semantically separate.
- Watchlist and collection membership do not affect viewing rankings.
- Small samples, missing metadata, and partial coverage have intentional states.
- The page is responsive, keyboard accessible, screen-reader understandable, and theme aware.

### Data correctness

- Metric definitions in this PRD are implemented as server-owned, tested rules.
- Titles are deduplicated by canonical media identity.
- Multi-genre titles are described and counted correctly.
- Movie directors and TV creators remain separate.
- TV series do not receive implicit episode-weighted people scores.
- Existing state is never presented as complete repeat-watch history.

### Engineering

- Canonical genre/person/credit metadata is stored once per media relationship, not per user action.
- Tracking actions do not block on credits enrichment.
- Overview requests do not call TMDB synchronously.
- Database query count is bounded and avoids N+1 behavior.
- API and client types contain no `any`.
- Response data is versioned and presentation-library independent.
- Relevant mutations invalidate overview data.
- The architecture can add watch events and chart buckets without redefining existing title metrics.
- Relevant server tests and client lint, tests, and build pass in Docker Compose.

### Documentation and release process

- `CHANGELOG.md` is updated when the user-visible feature is implemented.
- The generated in-app changelog is synchronized after changelog changes.
- `roadmap.md` is updated as phases ship or materially change.
- Data export and privacy documentation are updated when watch events or social insights ship.
- No release is cut without explicit user approval.

## 26. Success measures

The first release should be evaluated primarily for correctness, usefulness, and performance rather than engagement
optimization.

Product signals:

- users with enough data can identify their top genre and people without opening individual lists;
- users understand the difference between watched and liked insights;
- empty and partial-data states lead users toward useful next actions;
- qualitative feedback describes results as understandable and accurate.

Engineering signals:

- overview latency remains within the target on representative large libraries;
- no synchronous overview request depends on TMDB;
- enrichment retries safely and achieves high credit coverage;
- metric changes can be recomputed without data repair migrations;
- adding watch events does not break or silently change existing overview totals.

Do not add third-party behavioral analytics solely for this feature. Hosted-instance analytics, if introduced, require a
separate privacy and product decision.

## 27. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Users interpret current state as complete history | Use precise labels and defer plays/rewatches to WatchEvent |
| Long-running TV shows dominate people rankings | Count each series once in title rankings |
| Huge or noisy casts distort results | Use billed-cast eligibility while storing richer credits |
| Missing credits make rankings look definitive | Return and display metadata coverage |
| TMDB slowness affects tracking or profile load | Enrich asynchronously and never call TMDB from overview reads |
| Per-user counters drift | Derive from facts; cache versioned responses instead of incremental scores |
| New charts couple the API to one library | Return semantic metrics and buckets, not chart configuration |
| Derived insights leak private activity | Keep v1 owner-only and authorize before cache access |
| Existing watched dates produce misleading trends | Require all-time in v1; introduce event-backed time charts later |
| SQLite aggregation becomes slow for very large libraries | Benchmark, index facts and dimensions, then add revisioned snapshots |
| Metadata changes alter past-looking results | Track metadata version and show computation freshness |

## 28. Open questions

These do not block the PRD but must be resolved before the relevant phase:

- Should Phase 1 normalize existing genre IDs immediately or temporarily aggregate the stored JSON while Phase 2 adds
  canonical relations?
- What credit identity fallback is safest for TV aggregate roles when a stable TMDB credit ID is unavailable?
- Should people drill-down open a filtered watched page or a dedicated insight detail dialog?
- What credit-coverage threshold should be required before featuring a person in the viewing signature?
- Should a future public Overview use one dedicated privacy setting or inherit each source section's privacy?
- When WatchEvent ships, should `UserMedia.watched` be derived or transactionally denormalized?
- How should deleting the final watch event interact with watched state and TV progress?
- Should runtime be snapshotted on each watch event or resolved from versioned media/episode metadata during aggregation?
- Which integration owns the canonical external-event idempotency contract when Plex or other sync sources create watch
  events?

## 29. Research references

- [Letterboxd all-time stats example](https://letterboxd.com/en/stats/)
- [Trakt All Time Stats announcement and breakdown](https://forums.trakt.tv/t/all-time-stats/19086)
- [TMDB append-to-response documentation](https://developer.themoviedb.org/docs/append-to-response)
- [TMDB movie credits endpoint](https://developer.themoviedb.org/reference/movie-credits)
- [TMDB TV aggregate credits endpoint](https://developer.themoviedb.org/reference/tv-series-aggregate-credits)
- [TMDB TV series details endpoint](https://developer.themoviedb.org/reference/tv-series-details)
- [TMDB rate-limit guidance](https://developer.themoviedb.org/docs/rate-limiting)
- [TMDB API attribution requirements](https://developer.themoviedb.org/docs/faq)
- [W3C guidance: do not use color alone](https://www.w3.org/WAI/tips/designing/)
- [W3C accessible data-table guidance](https://www.w3.org/WAI/tutorials/tables/)
