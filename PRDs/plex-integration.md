# PRD: Plex Integration and Watchlist Import

- Status: Draft
- Version: 0.1
- Product: Kadha
- Primary owner: TBD
- Target release: TBD
- Dependencies: Plex account authorization, TMDB external-ID resolution
- Related areas: Watchlist, media tracking, settings, privacy, data export

## 1. Summary

Kadha will add a scalable Plex integration foundation, beginning with:

- Secure Plex account connection.
- Supported Plex-to-Kadha Universal Watchlist import.
- Manual and scheduled synchronization.
- Exact Plex-to-TMDB identity resolution.
- Import previews, status reporting, and unresolved-item handling.
- A provider architecture capable of supporting future two-way synchronization, Plex library availability, watched-state synchronization, ratings, and playback events.

Kadha will continue using TMDB IDs as its canonical media identity. Plex-specific identifiers and synchronization state will be stored separately.

Full Plex Universal Watchlist write-back will not be included in GA unless Plex provides a supported API contract. Plex documents Universal Watchlist and an RSS feed, but its current cloud mutation routes are not part of the published Plex Media Server API contract. [Plex Universal Watchlist](https://support.plex.tv/articles/universal-watchlist/), [Plex Media Server API](https://developer.plex.tv/pms/)

## 2. Problem

Users who track media in both Kadha and Plex currently maintain separate watchlists and viewing state.

This creates several problems:

- New Plex Watchlist items must be manually recreated in Kadha.
- Users cannot tell whether a Kadha title is available on their Plex server.
- Tracking behavior diverges between services.
- A simplistic synchronization implementation risks duplicates, incorrect TMDB matches, repeated imports, accidental removals, and dependency on unstable Plex endpoints.

Kadha needs an integration that preserves local data ownership and remains maintainable if Plex APIs, server connections, or user authentication change.

## 3. Goals

### Primary goals

- Allow a Kadha user to securely connect their Plex account.
- Import Plex Universal Watchlist additions into their Kadha watchlist.
- Preserve Kadha as the canonical local source of truth.
- Match Plex titles to TMDB without relying on title-only matching.
- Prevent duplicate imports and unintended deletions.
- Provide clear sync status, history, and recovery actions.
- Build a durable synchronization foundation rather than making synchronous Plex calls from UI actions.

### Secondary goals

- Prepare for Plex library availability and “Open in Plex”.
- Prepare for watched-state and rating synchronization.
- Support both single-instance self-hosting and future horizontally scaled deployments.
- Make the integration model reusable for other providers without over-generalizing the product.

## 4. Non-goals

The initial release will not include:

- Undocumented Plex Universal Watchlist writes.
- Guaranteed two-way Universal Watchlist synchronization.
- Plex authentication as a replacement for Kadha login.
- Plex Home managed-user switching.
- Playback or transcoding inside Kadha.
- Radarr, Sonarr, or media-request automation.
- Full historical viewing-event import.
- Plex cloud Lists synchronization.
- Plex server administration.
- Automatic title/year matching without explicit confirmation.
- Deleting local Kadha data when a Plex connection is removed.

## 5. Product decision: supported versus experimental

The integration must expose capabilities explicitly.

| Capability | GA status |
|---|---|
| Plex PIN authorization | Supported |
| Watchlist import using Plex RSS | Supported; requires Plex Pass |
| Manual Watchlist import | Supported |
| Scheduled Watchlist import | Supported |
| Plex Universal Watchlist write-back | Not available |
| Plex library availability | Planned |
| Plex watched-state sync | Planned |
| Plex playback webhooks | Planned; Plex Pass required |
| Undocumented Watchlist cloud API | Optional experimental feature only |

If experimental write-back is ever shipped, it must be independently feature-flagged, carry explicit user-facing warnings, and have a server-side kill switch.

## 6. Personas

### Plex and Kadha user

Uses Plex for playback and discovery but wants Kadha’s private tracking, notes, ratings, social features, and collections.

### Self-hosted operator

Runs Kadha using Docker Compose and expects integration setup to remain simple, secure, and recoverable.

### Hosted Kadha operator

Needs credentials encrypted, jobs rate-limited, failures observable, and synchronization safe across multiple users.

## 7. User stories

- As a user, I can connect Plex without giving Kadha my Plex password.
- As a user, I can see whether my Plex account supports Watchlist import.
- As a user, I can preview what will be imported before changing my watchlist.
- As a user, I can import new Plex Watchlist items into Kadha.
- As a user, I can trigger a manual sync.
- As a user, I can see when synchronization last succeeded.
- As a user, I can inspect items that could not be matched.
- As a user, removing or watching an imported title in Kadha does not cause it to be repeatedly re-imported.
- As a user, I can disconnect Plex without losing my existing Kadha media data.
- As an operator, I can diagnose authentication, mapping, and upstream failures without accessing user credentials.

## 8. User experience

### 8.1 Connection flow

1. User opens Settings → Integrations → Plex.
2. Kadha explains:
   - what data will be accessed;
   - which features require Plex Pass;
   - that Watchlist import is currently Plex-to-Kadha;
   - that Kadha remains the local source of truth.
3. User selects “Connect Plex”.
4. Kadha creates a time-limited Plex PIN authorization attempt.
5. User authorizes Kadha on the Plex-hosted authorization page.
6. Kadha validates the returned token and stores it encrypted.
7. Kadha discovers the Plex account and available server resources.
8. Connection status becomes `CONNECTED`.
9. If Watchlist RSS is available, the user enters or enables their generated feed URL.
10. Kadha validates that the URL is HTTPS and belongs to an allowed Plex host.

Plex passwords must never pass through Kadha.

### 8.2 Initial import

1. User selects “Preview import”.
2. Kadha fetches the Watchlist source.
3. Items are classified as:
   - New;
   - Already in Kadha;
   - Previously imported but locally removed;
   - Unresolved;
   - Unsupported.
4. User reviews summary counts and unresolved titles.
5. User confirms.
6. Kadha imports new, exactly matched titles.
7. Kadha records one summarized integration activity rather than one social activity per title.
8. UI shows final counts and any partial failures.

Initial import must never remove local items.

### 8.3 Scheduled import

- Default polling interval: 30 minutes.
- Operators may configure a global minimum interval.
- Users can disable scheduled import.
- Jobs receive jitter to prevent all accounts syncing simultaneously.
- Manual sync remains available.
- Only newly observed remote additions are applied.

An unchanged remote item must not overwrite a later local removal.

### 8.4 Disconnect

1. User selects “Disconnect Plex”.
2. Kadha explains that existing watchlist and tracking data will remain.
3. Pending jobs are cancelled.
4. Encrypted Plex credentials and feed URL are deleted.
5. External mappings shared by other users may remain.
6. User-specific remote replica state is deleted or archived according to retention policy.

## 9. Watchlist import semantics

The supported release is an import, not state mirroring.

### Rules

- A remotely present item that has never been observed is an addition.
- A remote item already imported is not repeatedly applied.
- If the user later removes or watches the title in Kadha, subsequent unchanged Plex observations do not re-add it.
- Remote removals are not applied unless Plex provides a guaranteed complete snapshot.
- Local removals are not written back to Plex in supported mode.
- Notes, ratings, watched dates, and privacy settings remain Kadha-owned.
- A failed item must not fail the whole import.
- No title is imported without a resolved TMDB identity.
- Initial synchronization is always additive.

### Future two-way rules

When a supported write API becomes available:

- Local changes create durable outbox events.
- The first two-way sync uses a union preview.
- Incremental sync compares:
  - the last synchronized state;
  - current local state;
  - current remote state.
- One-sided changes propagate automatically.
- Concurrent changes produce a visible conflict.
- Remote absence is only treated as deletion after fetching a confirmed complete result set.

## 10. Identity resolution

Kadha retains `(TMDB ID, media type)` as canonical identity: [schema.prisma](/home/muhsin/development/kadha.org/server/src/prisma/schema.prisma:208).

Resolution order:

1. Plex TMDB GUID.
2. Plex IMDb GUID resolved through TMDB `/find`.
3. Plex TVDB GUID resolved through TMDB `/find`.
4. Existing verified external-ID mapping.
5. Title and year candidate presented for manual confirmation.
6. Otherwise, unresolved.

TMDB supports external-ID lookup for IMDb and TVDB identifiers. [TMDB Find By ID](https://developer.themoviedb.org/reference/find-by-id)

Mappings must record confidence:

- `EXACT`: Plex supplied the TMDB ID.
- `RESOLVED`: IMDb or TVDB resolved uniquely through TMDB.
- `MANUAL`: User or administrator confirmed a candidate.
- `UNRESOLVED`: No safe mapping.

Low-confidence automatic matching is prohibited.

## 11. Functional requirements

### P0: Required for release

- Plex PIN authorization.
- Encrypted credential storage.
- Connection validation and reauthentication state.
- Watchlist feed configuration and validation.
- Import preview.
- Manual import.
- Scheduled import.
- Exact external-ID resolution.
- TMDB metadata hydration.
- Duplicate prevention.
- Local-removal suppression.
- Durable sync-run records.
- Per-item result reporting.
- Retry with exponential backoff and jitter.
- Per-connection synchronization lock.
- Disconnect and credential deletion.
- Integration settings UI.
- Privacy policy and export behavior updates.
- Server and client tests covering successful and partial imports.

### P1: Follow-up

- Plex server selection.
- Plex library indexing.
- “Available on Plex” indicators.
- “Open in Plex” deep links.
- Multiple Plex server support.
- Manual resolution UI for unmatched titles.
- Webhook ingestion foundation.

### P2: Future

- Watched-state and rating synchronization.
- Episode-level state mapping.
- Continue Watching and On Deck.
- Rewatch/history event model.
- Kadha collection publishing to Plex.
- Supported two-way Universal Watchlist synchronization.

## 12. Proposed data model

### `IntegrationConnection`

- `id`
- `userId`
- `provider`
- `externalAccountId`
- `displayName`
- `encryptedCredentials`
- `clientIdentifier`
- `status`
- `capabilities`
- `lastValidatedAt`
- `lastSuccessfulSyncAt`
- `lastErrorCode`
- `createdAt`
- `updatedAt`

### `IntegrationResource`

Represents a Plex server or future external resource.

- `id`
- `connectionId`
- `externalId`
- `name`
- `kind`
- `capabilities`
- `lastObservedAt`

### `MediaExternalIdentifier`

- `id`
- `mediaId`
- `mediaType`
- `provider`
- `externalId`
- `confidence`
- `verifiedAt`
- `createdAt`

### `ExternalWatchlistReplica`

- `connectionId`
- `mediaId`
- `mediaType`
- `remotePresent`
- `remoteChangedAt`
- `lastObservedAt`
- `lastAppliedLocalRevision`
- `status`

### `IntegrationSyncRun`

- `id`
- `connectionId`
- `trigger`
- `status`
- `startedAt`
- `completedAt`
- `observedCount`
- `importedCount`
- `existingCount`
- `unresolvedCount`
- `failedCount`
- `errorCode`

### `IntegrationSyncItem`

- `syncRunId`
- `externalItemId`
- resolved local media identity, when available
- `outcome`
- `reason`
- sanitized metadata

### `IntegrationOutbox`

Required before enabling any external writes:

- operation and entity identity
- idempotency key
- status and attempts
- next-attempt time
- worker lease
- sanitized payload
- completion time

### Existing model change

Add `watchlistChangedAt` to `UserMedia`. The existing `watchlistAt` only represents when an item was added and is cleared on removal: [user-media.service.ts](/home/muhsin/development/kadha.org/server/src/features/user-media/user-media.service.ts:33).

## 13. API requirements

Suggested endpoints:

```text
POST   /api/integrations/plex/auth/start
GET    /api/integrations/plex/auth/:attemptId
GET    /api/integrations/plex
PUT    /api/integrations/plex/settings
POST   /api/integrations/plex/watchlist/preview
POST   /api/integrations/plex/watchlist/sync
GET    /api/integrations/plex/sync-runs
GET    /api/integrations/plex/sync-runs/:syncRunId
DELETE /api/integrations/plex
```

Requirements:

- All user endpoints require Kadha authentication.
- Authorization attempts are short-lived and bound to the initiating user.
- Credentials are never included in responses.
- Manual sync endpoints deduplicate concurrent requests.
- Preview endpoints do not mutate watchlist state.
- Sync status is paginated and excludes secrets.
- Provider errors are translated into stable Kadha error codes.

## 14. Reliability requirements

- User requests must not block on long-running Plex imports.
- Synchronization must be idempotent.
- A process restart must not lose queued work.
- Only one sync run may update a connection at a time.
- Partial failures must be retryable by item.
- Authentication failures must not be retried indefinitely.
- Upstream throttling must respect `Retry-After`.
- Jobs must use exponential backoff with jitter.
- Sync runs must distinguish:
  - authentication failure;
  - upstream unavailable;
  - invalid feed;
  - mapping failure;
  - TMDB failure;
  - internal failure.
- Plex downtime must not prevent normal Kadha watchlist use.

## 15. Security and privacy

- Encrypt Plex tokens and feed URLs using AES-GCM.
- Keep the encryption key outside the database.
- Do not log authorization tokens, PINs, feed URLs, or decrypted credentials.
- Allow only HTTPS Plex URLs from an explicit hostname allowlist.
- Protect outbound requests against redirects to private or unapproved hosts.
- Exclude integration credentials from account exports.
- Document imported Plex metadata and connection information in the privacy policy.
- Delete credentials immediately on disconnect.
- Treat webhook payloads as untrusted input.
- Use opaque webhook secrets and validate expected account/server identities.
- Apply request timeouts and response-size limits to all external calls.

## 16. Observability

Operators need:

- Connected-account count.
- Sync success, partial-success, and failure counts.
- Mapping success percentage.
- Sync duration.
- Oldest queued job age.
- Retry and dead-letter counts.
- Plex authentication failures.
- Plex and TMDB upstream error rates.
- Unresolved-item counts.
- Structured logs keyed by connection and sync-run ID, never by token.

The settings UI should expose:

- Connection status.
- Last successful sync.
- Last attempted sync.
- Last error with a user-safe explanation.
- Imported and unresolved counts.
- Reconnect, retry, and disconnect actions.

## 17. Success metrics

Initial product targets:

- Zero unintended local deletions during initial import.
- Zero plaintext credentials stored or logged.
- At least 95% of normal movie/show items resolved without manual title matching.
- At least 99% of successfully fetched, exactly mapped items imported correctly.
- Manual imports provide a result or actionable failure state.
- An unchanged remote item is never repeatedly re-imported after a local removal.
- A single failed item does not prevent other valid items from importing.

## 18. Acceptance criteria

The feature is ready for release when:

- A user can complete Plex PIN authorization without sharing a password.
- Stored credentials are encrypted and omitted from logs and exports.
- A user without Plex Pass receives a clear Watchlist-import requirement message.
- A valid feed produces a non-mutating preview.
- Confirmed import creates correct `UserMedia` and `MediaSnapshot` records.
- Existing watchlist items are not duplicated.
- Movies and TV shows with direct TMDB IDs resolve correctly.
- IMDb and TVDB identifiers resolve through TMDB where supported.
- Unresolved items appear in the sync report and are not imported.
- Marking an imported item watched does not cause the next unchanged import to re-add it.
- Concurrent manual and scheduled syncs are deduplicated.
- Restarting the server does not lose queued synchronization work.
- Revoked Plex authorization results in `REAUTH_REQUIRED`.
- Disconnecting Plex preserves Kadha media data.
- Relevant server build and tests pass.
- Changelog, README, privacy documentation, and data export behavior are updated.

## 19. Rollout plan

### Phase 0: Technical validation

- Verify PIN authorization against a dedicated Plex test account.
- Validate RSS identity fields across representative movies and shows.
- Confirm feed pagination/completeness behavior.
- Record an architecture decision documenting why undocumented writes are excluded.

### Phase 1: Internal alpha

- Connection and encryption.
- External identifiers.
- Manual preview and import.
- Sync-run reporting.
- Test accounts only.

### Phase 2: Private beta

- Scheduled imports.
- Retry and operational dashboards.
- Unresolved-item reporting.
- Plex Pass requirement messaging.
- Small opt-in user group.

### Phase 3: GA

- Security review.
- Data-loss test suite.
- Operator documentation.
- Privacy and export updates.
- Gradual enablement.

### Phase 4: Server capabilities

- Library availability.
- Plex deep links.
- Watched state, ratings, and webhooks.

### Phase 5: Two-way Watchlist

Begin only after Plex offers a supported mutation API or Kadha receives explicit access to one.

## 20. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Plex does not provide stable Watchlist writes | Do not include write-back in GA |
| RSS requires Plex Pass | Explain requirement before setup |
| RSS may not be a complete snapshot | Do not infer removals without validation |
| Incorrect title matching | Require external IDs or manual confirmation |
| Token compromise | AES-GCM encryption, redacted logs, deletion on disconnect |
| Plex or TMDB outage | Async jobs, retries, local availability |
| Repeated import after local removal | Persist remote replica and local revision state |
| Large syncs overwhelm upstream APIs | Pagination, caching, concurrency limits, jitter |
| TV episode-order mismatch | External episode identifiers and explicit ordering safeguards |
| SQLite limits horizontal scaling | Durable interfaces now; PostgreSQL/queue profile later |

## 21. Open product questions

Recommended answers are included.

- Is Plex Pass acceptable for the supported Watchlist feature?
  - Recommendation: Yes, with clear setup messaging.

- Should imported items generate normal watchlist activities?
  - Recommendation: No; generate one summarized private integration activity.

- Should manual title matching ship in the first release?
  - Recommendation: No. Show unresolved items first, then add manual matching in P1.

- Should library availability ship with Watchlist import?
  - Recommendation: Keep it P1 so account/server complexity does not delay safe import.

- Should Kadha ship experimental two-way writes?
  - Recommendation: No, given the requirement to avoid a hacky integration.

- When should Kadha move beyond SQLite?
  - Recommendation: Keep SQLite for single-instance self-hosting; require PostgreSQL before supporting multiple API or worker replicas.
