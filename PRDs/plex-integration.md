# PRD: Plex to Kadha Integration

- Status: Draft
- Version: 1.0
- Product: Kadha
- Primary owner: TBD
- Target release: TBD
- Last updated: 2026-07-30
- Dependencies: Plex account authorization, Plex Media Server API, Plex webhooks, TMDB external-ID resolution
- Related areas: Watched media, TV progress, ratings, watchlist, settings, privacy, data export

## 1. Summary

Kadha will provide a supported, one-way Plex-to-Kadha integration for personal media activity.

The integration will:

- Securely connect a Kadha user to their Plex account.
- Discover and select accessible Plex Media Servers.
- Import existing watched movies, watched episodes, and ratings.
- Process Plex webhooks for new watched and rating activity.
- Reconcile against Plex periodically to recover missed events.
- Map Plex library items to Kadha's canonical TMDB identity.
- Report connection health, sync progress, and unresolved mappings.
- Later expose Plex library availability, deep links, and supported Plex Watchlist import.

Plex webhooks are notifications from Plex Media Server to Kadha. They do not let Kadha add items to Plex Universal
Watchlist. Kadha will not depend on undocumented Plex cloud mutation endpoints.

[Plex Webhooks](https://support.plex.tv/articles/115002267687-webhooks/) |
[Plex Media Server API](https://developer.plex.tv/pms/) |
[Plex Universal Watchlist](https://support.plex.tv/articles/universal-watchlist/)

## 2. Problem

Users who watch content through Plex currently have to reproduce that activity manually in Kadha. This causes:

- Watched movies remaining unwatched in Kadha.
- Incorrect TV episode and series progress.
- Ratings diverging between Plex and Kadha.
- Watched titles remaining on the Kadha watchlist.
- No visibility into whether a Kadha title is available on a connected Plex server.
- Duplicate work when adopting Kadha after already using Plex for a long time.

A direct webhook-to-database implementation would be fragile. Webhook delivery may be duplicated or missed, Plex
identifiers are server-specific, and a single Plex account may use multiple servers. The integration therefore needs
durable event processing, explicit identity mappings, reconciliation, and clear source semantics.

## 3. Product goals

### Primary goals

- Provide dependable one-way Plex-to-Kadha synchronization.
- Support watched movies and TV episodes.
- Synchronize Plex ratings into Kadha's existing 1-10 rating field.
- Import existing Plex state without flooding the activity timeline.
- Preserve TMDB IDs as Kadha's canonical media identity.
- Process webhook events asynchronously and idempotently.
- Recover from missed webhook events through periodic reconciliation.
- Prevent activity from one Plex or Kadha user from affecting another user.
- Preserve normal Kadha data when Plex is disconnected.

### Secondary goals

- Show whether a title is available on a selected Plex server.
- Deep-link from Kadha to a mapped Plex library item.
- Import Plex Universal Watchlist entries through Plex's supported read-only RSS source.
- Establish reusable integration boundaries without prematurely generalizing every provider.
- Support current single-instance SQLite deployments while keeping the worker boundary replaceable.

## 4. Non-goals

The supported release will not include:

- Kadha-to-Plex Universal Watchlist writes.
- Two-way watched-state or rating synchronization.
- Plex cloud Lists synchronization.
- A binary Plex-to-Kadha `liked` mapping.
- Plex authentication as a replacement for Kadha authentication.
- Plex Home managed-user switching.
- Playback, streaming, or transcoding inside Kadha.
- Plex player control.
- Music, photo, clip, or live-TV tracking.
- Radarr, Sonarr, or media-request automation.
- Plex server administration.
- Automatic low-confidence title-only matching.
- Deleting normal Kadha media data when Plex is disconnected.
- Undocumented Plex cloud endpoints.

## 5. Product decisions

| Decision | Outcome |
|---|---|
| Primary integration direction | Plex to Kadha |
| Real-time transport | Plex webhooks |
| Recovery and initial import | Plex Media Server API |
| Canonical media identity | TMDB ID and Kadha media type |
| Plex Universal Watchlist | Supported preview/import in a later phase |
| Plex Universal Watchlist write-back | Not supported |
| Watched-event behavior | Mark watched and apply existing Kadha watchlist cleanup |
| Rating-to-liked behavior | No implicit conversion |
| Initial import behavior | Additive and non-destructive |
| Webhook registration | Guided manual setup using a generated secret URL |
| Queue implementation | Durable database-backed jobs initially |

## 6. Prerequisites and constraints

- The Plex Media Server owner must have an active Plex Pass because webhooks are a premium feature.
- The selected Plex Media Server must be reachable using its advertised local or remote connection.
- Kadha's webhook endpoint must be reachable from the Plex Media Server.
- Kadha will target Plex Media Server 1.41.9 or newer so it can rely on the published PMS API contract.
- Users authorize through Plex's documented authentication flow. Plex passwords never pass through Kadha.
- Modern Plex Movie and Plex TV Series metadata agents are strongly recommended for reliable external identifiers.
- The first release supports full Plex accounts. Managed Plex Home profiles require separate validation before support.
- A generated webhook URL requires a configured public API base URL when Kadha's frontend and API use different
  origins.

[Authenticating with Plex](https://developer.plex.tv/pms/#section/API-Info/Authenticating-with-Plex)

## 7. Personas

### Plex and Kadha user

Uses Plex for personal media playback and wants Kadha's tracking, notes, ratings, TV progress, collections, and social
features to stay current automatically.

### Self-hosted operator

Runs Kadha using Docker Compose and needs clear networking instructions, safe credential storage, observable failures,
and a setup that does not require additional infrastructure.

### Hosted Kadha operator

Needs user isolation, encrypted credentials, rate limits, bounded retries, short raw-event retention, and operational
visibility across many independent connections.

## 8. User stories

- As a user, I can connect Plex without providing my Plex password to Kadha.
- As a user, I can choose which accessible Plex servers participate in synchronization.
- As a user, I can choose whether to sync watched movies, TV progress, ratings, and library availability.
- As a user, I can import my existing Plex watched state and ratings.
- As a user, watching a movie in Plex marks that movie watched in Kadha.
- As a user, watching an episode in Plex updates the correct Kadha episode and series progress.
- As a user, rating an item in Plex updates its Kadha rating without changing `liked`.
- As a user, I can see when Kadha last received a Plex event and last completed reconciliation.
- As a user, I can inspect items that Kadha could not map safely.
- As a user, I can disconnect Plex without losing imported tracking data.
- As an operator, I can diagnose connection, mapping, and processing failures without seeing user credentials.

## 9. User experience

### 9.1 Connection flow

1. User opens **Settings → Integrations → Plex**.
2. Kadha explains:
   - the one-way Plex-to-Kadha direction;
   - the Plex Pass requirement for webhooks;
   - the data Kadha will read;
   - the enabled sync behaviors;
   - that Universal Watchlist write-back is unavailable.
3. User selects **Connect Plex**.
4. Kadha starts Plex's documented authorization flow.
5. User completes authorization on a Plex-hosted page.
6. Kadha validates and encrypts the resulting credential.
7. Kadha discovers accessible Plex Media Servers.
8. User selects one or more servers.
9. User selects sync preferences.
10. Kadha generates a private webhook URL.
11. User pastes that URL into Plex account webhook settings.
12. Kadha optionally starts an initial import.
13. The connection becomes `ACTIVE` after server validation. Webhook health becomes `RECEIVING` after the first valid
    event arrives.

Plex does not document automatic webhook registration. Kadha must provide copyable instructions instead of using a
private registration endpoint.

### 9.2 Sync preferences

Users can independently enable:

- Watched movie synchronization.
- TV episode progress synchronization.
- Rating synchronization.
- Initial history import.
- Periodic reconciliation.
- Plex library availability when that phase ships.
- Live playback activity when that phase ships.

### 9.3 Initial import

1. Kadha validates every selected server and library.
2. Kadha creates a durable, resumable import run.
3. Watched movies, watched episodes, and ratings are fetched in pages.
4. Plex items are resolved to TMDB.
5. Exactly mapped items are applied according to import conflict rules.
6. Unresolved and failed items are recorded without failing the entire import.
7. Kadha shows progress and a final summary.

Historical imports must not create one activity-feed entry per imported item. Kadha may create one private summary
activity for the completed import.

### 9.4 Connection status

The integration screen displays:

- Connected Plex account.
- Selected servers and reachability.
- Enabled sync preferences.
- Last webhook received.
- Last successful reconciliation.
- Initial import progress.
- Imported, skipped, unresolved, and failed counts.
- User-safe error state.
- **Sync now**, **Reconnect**, **Rotate webhook URL**, and **Disconnect** actions.

### 9.5 Disconnect

1. User confirms disconnection.
2. Kadha disables the webhook secret immediately.
3. Pending jobs for the connection are cancelled.
4. Encrypted Plex credentials and user-specific Plex replica state are deleted according to retention policy.
5. Shared external-ID mappings may remain.
6. Watched, rating, episode, and other normal Kadha data remain unchanged.

## 10. Expected feature phases

### Phase 0: Technical validation

- Validate the current documented Plex authorization flow.
- Confirm server discovery and authenticated metadata access.
- Capture representative webhook fixtures for movies, episodes, and ratings.
- Validate GUID availability across modern movie and TV agents.
- Confirm rating payload and normalization behavior.
- Verify multi-server and shared-server event identity.
- Validate paginated initial import and reconciliation queries.
- Record an architecture decision excluding undocumented cloud writes.

### Phase 1: Core activity sync

| Feature | Expected behavior |
|---|---|
| Plex account connection | Authorize without collecting Plex credentials |
| Server discovery | List accessible supported servers |
| Server selection | Enable synchronization per server |
| Webhook setup | Generate a private URL with guided Plex setup |
| Initial import | Import existing watched movies, episodes, and ratings |
| Movie scrobble | Mark the mapped movie watched |
| Episode scrobble | Mark the episode watched and recalculate TV progress |
| Rating sync | Update Kadha's 1-10 rating |
| Watchlist cleanup | Remove a title from the Kadha watchlist when marked watched |
| Media mapping | Resolve Plex items to TMDB and cache the binding |
| Reconciliation | Recover missed watched and rating changes |
| Sync health | Show connection, webhook, import, and mapping status |

### Phase 2: Library and Watchlist features

| Feature | Expected behavior |
|---|---|
| Library availability | Show which selected Plex servers contain a title |
| `library.new` processing | Detect and map newly added library content |
| Availability reconciliation | Detect removals because Plex has no corresponding webhook event |
| Open in Plex | Deep-link to the mapped server item |
| Plex Watchlist preview | Show supported RSS items before importing |
| Plex Watchlist import | Add safely mapped remote additions to Kadha |
| Mapping review | Allow explicit resolution of ambiguous items |

Plex Watchlist import is a separate polling adapter because Plex webhooks do not include Watchlist events. It is an
import, not an exact mirror, unless Plex documents a complete and stable snapshot contract.

### Phase 3: Optional real-time features

| Feature | Plex event or source |
|---|---|
| Currently watching status | `media.play` |
| Playback activity timeline | `media.play`, `media.pause`, `media.resume`, `media.stop` |
| Plex next-up section | `library.on.deck` |
| Shared-user playback notification | `playback.started` |
| Server backup health | `admin.database.backup` |
| Server corruption warning | `admin.database.corrupted` |
| New server device notification | `device.new` |

Live activity is opt-in because it increases privacy and data-retention requirements.

## 11. Webhook event behavior

### 11.1 `media.scrobble`

Plex emits `media.scrobble` when media is viewed past its documented 90% threshold.

For a movie:

1. Resolve the webhook secret to one Kadha connection.
2. Validate the server UUID against the connection's enabled servers.
3. Fetch authoritative metadata from Plex using the server-specific `ratingKey`.
4. Resolve the Plex item to a TMDB movie.
5. Create or refresh `MediaSnapshot`.
6. Mark `UserMedia.watched = true`.
7. Apply Kadha's existing watched behavior, including clearing `watchlist`.
8. Record the mutation source as Plex.

For an episode:

1. Fetch the episode and parent-series metadata.
2. Resolve the parent series to a TMDB TV show.
3. Resolve season and episode coordinates.
4. Upsert `UserEpisodeWatch`.
5. Recalculate the series progress using the existing TV progress domain service.
6. Apply existing Kadha watchlist behavior where applicable.

Duplicate scrobbles must not create duplicate episode records or duplicate activity entries. Scrobbling never changes
`liked`.

### 11.2 `media.rate`

- Resolve the item using the same server binding flow.
- Normalize the Plex user rating into Kadha's 1-10 integer range after Phase 0 confirms payload behavior.
- A new live rating event may update an existing Kadha rating.
- An initial import fills missing Kadha ratings by default and reports conflicts rather than silently overwriting them.
- A rating never implies `liked`.
- Rating removal behavior must be validated before clearing a Kadha rating.

### 11.3 `library.new`

- Resolve and cache the newly added item's server binding.
- Mark it available on that server.
- If it is on the user's Kadha watchlist, display **Available on Plex**.
- Do not change watched, liked, rating, or watchlist state.

### 11.4 Playback events

`media.play`, `media.pause`, `media.resume`, and `media.stop` may support opt-in live activity. They must not determine
watched status; `media.scrobble` remains the completion signal.

### 11.5 Unsupported events and media

- Music, photos, clips, and live-TV events are acknowledged and ignored.
- Server-admin events are ignored unless the operator-health feature is enabled.
- Events from disabled or unknown servers are acknowledged without changing user data.
- `playback.started` for a shared user must never be treated as the server owner's personal watch activity.

## 12. Initial import and conflict semantics

The first release is non-destructive.

### Watched state

- Initial import can change unwatched Kadha media to watched.
- Initial import does not clear existing Kadha watched state.
- A live `media.scrobble` changes the mapped item to watched.
- Plex does not provide an unwatch webhook, so automatic unwatching is deferred until source provenance and
  reconciliation semantics are validated.
- Repeated Plex scrobbles are treated as idempotent state updates, not complete rewatch history.

### Ratings

- Initial import fills missing ratings.
- Existing, different Kadha ratings are reported as conflicts by default.
- A live `media.rate` event after connection is treated as the user's latest explicit Plex rating and may update Kadha.
- Ratings do not affect `liked`.

### Activity

- Historical import does not generate per-title activity.
- One summarized private import activity may be generated.
- A successfully processed live scrobble may generate one normal private activity.
- Duplicate delivery must not duplicate activity.

## 13. Identity resolution

Kadha retains `(TMDB ID, media type)` as canonical identity. Plex `ratingKey` values are server-specific bindings.

Resolution order:

1. Plex `tmdb://` GUID.
2. Plex IMDb GUID resolved through TMDB `/find`.
3. Plex TVDB GUID resolved through TMDB `/find`.
4. Existing verified Plex-to-TMDB binding.
5. Unique title-and-year candidate presented for manual confirmation.
6. Otherwise, unresolved.

[TMDB Find By ID](https://developer.themoviedb.org/reference/find-by-id)

### Movie mapping

```text
Webhook server UUID + ratingKey
        ↓
Fetch full Plex movie metadata
        ↓
Resolve external GUID
        ↓
TMDB movie ID
        ↓
MediaSnapshot + UserMedia
```

### Episode mapping

```text
Webhook episode ratingKey
        ↓
Fetch episode and parent show metadata
        ↓
Resolve parent show to TMDB
        ↓
Season number + episode number
        ↓
UserEpisodeWatch
```

Anime, absolute-numbered shows, specials, and alternate episode orders may not align with TMDB. Such items remain
unresolved unless an exact episode identifier or explicit mapping exists.

Mappings record:

- Mapping method: direct TMDB, IMDb lookup, TVDB lookup, or manual.
- Confidence: exact, resolved, manual, or unresolved.
- Server and library identity.
- Last verification timestamp.

Low-confidence automatic matching is prohibited.

## 14. Proposed data model

### `PlexConnection`

- `id`
- `userId`
- `plexAccountId`
- `displayName`
- `encryptedCredentials`
- `clientIdentifier`
- `webhookSecretHash`
- `status`
- watched, episode, rating, reconciliation, and availability preferences
- `lastValidatedAt`
- `lastWebhookAt`
- `lastSuccessfulSyncAt`
- `lastErrorCode`
- `createdAt`
- `updatedAt`

Only one active Kadha connection may own a full Plex account identity unless multi-profile semantics are explicitly
implemented.

### `PlexServer`

- `id`
- `connectionId`
- Plex machine identifier
- server name
- selected and enabled state
- preferred connection URI
- access ownership or shared status
- server version
- last successful connection
- last observed timestamp

### `PlexMediaBinding`

- `id`
- `serverId`
- Plex `ratingKey`
- Plex metadata key
- Plex GUID
- library section ID
- TMDB ID and media type
- season and episode coordinates when applicable
- mapping method and confidence
- availability status
- `lastVerifiedAt`

The unique server and `ratingKey` pair identifies a Plex library item.

### `PlexMediaState`

Provider-specific state remains separate from canonical Kadha state:

- `connectionId`
- TMDB ID and media type
- season and episode coordinates when applicable
- Plex watched state
- Plex rating
- Plex last-viewed value when available
- `lastObservedAt`
- `lastAppliedAt`

This state preserves provenance for future conflict resolution and avoids coupling external state directly to
`UserMedia`.

### `PlexWebhookEvent`

Durable inbox and processing job:

- `id`
- `connectionId`
- event type
- server UUID
- Plex account metadata
- Plex `ratingKey`
- payload hash
- processing status
- attempt count
- next attempt time
- worker lease
- sanitized error code
- received and processed timestamps
- sanitized raw payload with bounded retention

### `PlexSyncRun`

- `id`
- `connectionId`
- trigger: initial, manual, scheduled, or reconciliation
- status and worker lease
- started and completed timestamps
- observed, applied, skipped, unresolved, and failed counts
- resumable cursor
- sanitized error code

### Existing Kadha models

The integration applies resolved state through existing domain services:

- `UserMedia` for movie/show watched, rating, and watchlist behavior.
- `UserEpisodeWatch` for episode progress.
- `MediaSnapshot` for TMDB-backed media metadata.

No Plex identifier should be added directly to those canonical models.

## 15. API requirements

Suggested authenticated endpoints:

```text
POST   /api/integrations/plex/auth/start
GET    /api/integrations/plex/auth/:attemptId
GET    /api/integrations/plex
GET    /api/integrations/plex/servers
PUT    /api/integrations/plex/servers
PUT    /api/integrations/plex/settings
POST   /api/integrations/plex/import
POST   /api/integrations/plex/sync
GET    /api/integrations/plex/sync-runs
GET    /api/integrations/plex/unresolved
POST   /api/integrations/plex/webhook-secret/rotate
DELETE /api/integrations/plex
```

Webhook endpoint:

```text
POST /api/integrations/plex/webhooks/:secret
```

Requirements:

- All management endpoints require Kadha authentication.
- Authorization attempts are short-lived and bound to the initiating user.
- Credentials and webhook secrets are never returned after initial creation.
- The webhook endpoint accepts Plex's multipart JSON payload with strict size limits.
- Valid webhook requests are durably persisted before returning success.
- Long-running imports and reconciliation do not block HTTP requests.
- Concurrent syncs for one connection are deduplicated.
- Sync reports are paginated and exclude secrets.
- Provider failures map to stable Kadha error codes.

## 16. Processing architecture

```text
Plex Media Server
        ↓ multipart POST
Webhook receiver
        ↓ validate and persist
PlexWebhookEvent
        ↓ immediate success response
Background processor
        ↓
Plex metadata fetch
        ↓
TMDB identity resolution
        ↓
Existing Kadha domain service
        ↓
UserMedia / UserEpisodeWatch
```

The webhook receiver must not wait for Plex or TMDB calls. It validates the envelope, persists the job, and responds.

The initial SQLite implementation may use database-backed jobs with atomic leasing. Worker interfaces must remain
replaceable so a future PostgreSQL and external-queue deployment does not require rewriting Plex domain logic.

Suggested server feature ownership:

```text
server/src/features/plex/
  plex.routes.ts
  plex.controller.ts
  plex.service.ts
  plex.client.ts
  plex-auth.service.ts
  plex-webhook.service.ts
  plex-mapping.service.ts
  plex-sync.service.ts
  plex.schema.ts
  plex.types.ts
```

## 17. Reliability requirements

- Event handlers are idempotent.
- Duplicate scrobbles do not create duplicate episode or activity records.
- Valid events are persisted before the webhook returns success.
- Processing retries use exponential backoff and jitter.
- Authentication and permanent mapping failures do not retry indefinitely.
- Unresolved items enter a reviewable terminal state.
- Initial imports are paginated, resumable, and restart-safe.
- Only one state-applying sync may run for a connection at a time.
- Reconciliation repairs missed webhook state without making destructive assumptions.
- Plex or TMDB downtime does not prevent normal Kadha use.
- Unsupported media and events do not poison the queue.
- Raw payload retention is bounded and configurable.
- Worker backlog and dead-letter state are observable.

## 18. Security and privacy

- Use Plex's documented authorization flow; never collect Plex passwords.
- Encrypt Plex credentials using authenticated encryption with a key stored outside the database.
- Generate a high-entropy webhook secret per connection and store only its hash.
- Rotate the webhook URL without reconnecting the Plex account.
- Never log tokens, authorization PINs, webhook secrets, or decrypted credentials.
- Validate the webhook secret before parsing expensive payload content.
- Apply strict multipart, JSON, and image-size limits.
- Ignore attached thumbnails unless a later feature explicitly requires them.
- Treat account titles and usernames as display data, not identity.
- Validate the payload server UUID against the connection's selected servers.
- Rate-limit invalid webhook traffic.
- Apply timeouts and response-size limits to Plex and TMDB requests.
- Exclude credentials and webhook secrets from account exports.
- Include connected account metadata, sync preferences, and imported-state provenance in export and privacy
  documentation.
- Delete credentials and invalidate the webhook immediately on disconnect.
- Prevent shared-user `playback.started` events from mutating the owner's personal state.

Plex does not document a webhook-signature header. The opaque, rotatable URL secret is therefore the primary webhook
authentication mechanism.

## 19. Configuration and deployment

Add a server runtime setting for the externally reachable API origin, such as:

```text
PUBLIC_API_URL=https://api.example.com
```

Hosted deployments use a public HTTPS webhook URL. A private self-hosted deployment may use an address reachable from
its Plex Media Server, but the generated address and Docker/networking requirements must be documented.

Credential encryption requires a separately managed server secret. Rotation and recovery behavior must be designed
before implementation because losing that key makes stored Plex credentials unreadable.

No production queue dependency is required for the first single-instance release. PostgreSQL or an external queue is
required before supporting multiple API or worker replicas.

## 20. Observability

Operators need:

- Active connection and selected-server counts.
- Webhook receipt and processing counts by event type.
- Processing latency.
- Initial import and reconciliation duration.
- Mapping success percentage.
- Oldest queued job age.
- Retry and terminal-failure counts.
- Authentication and server-reachability failures.
- Plex and TMDB upstream error rates.
- Unresolved-item counts.
- Structured logs keyed by connection, server, event, and sync-run IDs, never by credential.

Users need:

- Connection and webhook status.
- Last successful import and reconciliation.
- Clear `REAUTH_REQUIRED`, `SERVER_UNREACHABLE`, `WEBHOOK_NOT_RECEIVED`, and `MAPPING_REQUIRED` states.
- Imported, skipped, unresolved, and failed counts.
- Reconnect, retry, rotate-secret, and disconnect actions.

## 21. Success metrics

- Zero plaintext Plex credentials or webhook secrets stored or logged.
- Zero cross-account or cross-server state mutations.
- At least 98% automatic mapping success for representative modern Plex Movie and Plex TV Series libraries.
- At least 99% correct application for successfully fetched, exactly mapped items.
- 95th-percentile live event processing below 60 seconds.
- Zero duplicate `UserEpisodeWatch` records or duplicate activity from repeated webhook delivery.
- Initial import resumes successfully after an application restart.
- One failed item does not prevent other valid items from processing.
- Users can identify connection and mapping failures without reading server logs.

## 22. Acceptance criteria

The Phase 1 integration is ready when:

- A user can authorize Plex without sharing a password with Kadha.
- Kadha can discover and validate accessible supported Plex servers.
- A user can select servers and sync preferences.
- Kadha generates an opaque webhook URL with correct setup instructions.
- A valid movie scrobble marks the correct TMDB movie watched.
- A valid episode scrobble updates the correct show, season, and episode.
- Scrobbling applies Kadha's existing watchlist cleanup.
- A rating event updates the correct Kadha rating without changing `liked`.
- Existing watched movies, episodes, and ratings can be imported.
- Historical import does not flood the activity timeline.
- Duplicate deliveries are harmless.
- Unknown or ambiguous media never update an unrelated title.
- Events from unknown or disabled servers do not mutate user data.
- Events cannot cross between Kadha accounts.
- Queued events and imports survive a server restart.
- Temporary Plex and TMDB failures retry safely.
- Users can inspect sync health and unresolved mappings.
- Revoked Plex authorization results in `REAUTH_REQUIRED`.
- Disconnecting disables the webhook, removes credentials, and preserves normal Kadha data.
- Relevant server tests, client tests, lint, and builds pass.
- Changelog, README, privacy documentation, data export behavior, project structure, and roadmap are updated for the
  shipped implementation.

## 23. Rollout plan

### Phase 0: Technical validation

- Use a dedicated Plex test account and representative server libraries.
- Validate documented authorization and token lifecycle.
- Capture sanitized webhook fixtures.
- Verify movie, series, and episode GUID behavior.
- Verify rating payload behavior.
- Validate imports across owner and shared-server access.
- Test webhook reachability for hosted and Docker-based self-hosted deployments.
- Confirm API requests against the minimum supported PMS version.
- Record unresolved Plex limitations in an architecture decision.

### Phase 1: Internal alpha

- Account connection and encrypted credentials.
- Server discovery and selection.
- Webhook receiver and durable processing.
- Movie and episode mapping.
- Movie and episode scrobble synchronization.
- Rating synchronization.
- Initial import and reconciliation.
- Test accounts only.

### Phase 2: Private beta

- Connection-health UI.
- Retry and unresolved-item reporting.
- Operator observability.
- Small opt-in user group.
- Mapping accuracy and event latency measurement.

### Phase 3: GA

- Security and privacy review.
- Credential-rotation test.
- Cross-user isolation test.
- Data-loss and duplicate-delivery tests.
- Operator and self-hosting documentation.
- Privacy policy and data export updates.
- Gradual enablement.

### Phase 4: Library and Watchlist

- Plex library availability.
- Plex deep links.
- Supported Plex Watchlist preview and import.
- Manual mapping review.

### Phase 5: Optional activity

- Currently watching.
- Playback activity timeline.
- On Deck.
- Opt-in server-owner notifications.

## 24. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Webhooks are duplicated or missed | Idempotent handlers plus periodic reconciliation |
| Plex item IDs differ by server | Persist server-scoped bindings and retain TMDB identity |
| Incorrect media match | Require external IDs or explicit manual confirmation |
| Episode ordering differs from TMDB | Keep ambiguous episodes unresolved |
| Shared-user event is attributed to owner | Bind by secret and server; filter event semantics explicitly |
| Webhook URL is exposed | Store only its hash and support immediate rotation |
| Plex credential is compromised | Authenticated encryption, redacted logs, revocation, and deletion |
| Plex or TMDB is unavailable | Durable processing, bounded retries, and local Kadha availability |
| Historical import overwrites local choices | Additive watched import and rating conflict reporting |
| Library deletion has no webhook | Periodic availability reconciliation |
| Plex Watchlist has no webhook | Separate supported RSS import |
| SQLite limits horizontal scaling | Durable abstractions now; PostgreSQL and queue before multiple replicas |
| Raw activity creates privacy risk | Opt-in live activity and bounded event retention |

## 25. Open questions

Recommended defaults are included.

- Should initial import overwrite an existing Kadha rating?
  - Recommendation: No. Fill missing ratings and report conflicts.

- Should Plex ever clear Kadha's watched state?
  - Recommendation: Not in Phase 1. Add provenance-aware removal semantics before enabling it.

- Should a high Plex rating automatically set `liked`?
  - Recommendation: No. Consider an explicit user preference only after rating sync is stable.

- Should imported history generate normal activity entries?
  - Recommendation: No. Generate at most one private summary.

- Should managed Plex Home users ship in Phase 1?
  - Recommendation: No. Validate identity isolation separately.

- Should Plex Watchlist import ship with activity sync?
  - Recommendation: No. Keep it in Phase 4 because it uses a separate RSS ingestion model.

- Should Kadha support undocumented Universal Watchlist writes?
  - Recommendation: No.

- When should Kadha move beyond SQLite?
  - Recommendation: Retain SQLite for single-instance self-hosting and require PostgreSQL before multiple API or worker
    replicas.
