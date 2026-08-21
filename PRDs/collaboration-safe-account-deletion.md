# PRD: Collaboration-Safe Account Deletion And Collection Ownership Transfer

## 1. Overview

Kadha supports permanent self-service account deletion. The current implementation correctly removes the account,
revokes its sessions, deletes collections owned by the user, removes collection memberships and invitations, and
clears attribution from collection items that remain in another owner's collection.

The current flow does not explain the collaboration impact to the deleting user or the people with whom they share
collections. An owner's collections can disappear from members' libraries without explanation, while a member can
disappear from an owner's collaboration list without a durable product event.

This feature will make account deletion collaboration-aware by adding:

- a deletion-impact preview;
- an optional automatic ownership-transfer rule;
- a detailed per-collection ownership assignment dialog;
- atomic ownership transfer during account deletion;
- privacy-preserving system notifications for transfers, removed collections, and departed collaborators;
- clear stale-resource and unavailable-collection states.

Permanent deletion must remain available. Ownership transfer is an explicit option, not a prerequisite for deleting
an account.

## 2. Current Baseline

The implementation begins from the behavior shipped in commit `089bd40`:

- account deletion requires the current password;
- the user must type `I understand this account cannot be recovered` exactly;
- the final administrator cannot delete their account;
- deleting an owner cascades to collections they still own;
- deleting a member removes their memberships and pending invitations;
- items contributed to another user's collection remain, with `addedByUserId` set to `null`;
- notifications authored by the deleted account are removed;
- all access and refresh sessions become invalid;
- deletion is permanent in the live database, subject to documented backup-retention limitations.

This PRD extends that behavior without weakening any existing authentication, deletion, privacy, or backup guarantee.

## 3. Problem Statement

Account deletion affects more than the deleting user when collections are shared:

1. If an owner deletes their account, members can unexpectedly lose an entire collection.
2. If a member deletes their account, the owner sees the member disappear without knowing why.
3. A deleting owner may prefer to preserve a useful shared collection by transferring it.
4. A single automatic transfer choice is convenient but cannot cover every relationship or collection correctly.
5. Notifications must explain the outcome without preserving the deleted person's identity unnecessarily.
6. Already-open collection screens and cached lists can temporarily show stale content.

The deletion flow needs to describe these effects before confirmation, execute the chosen ownership plan atomically,
and explain the resulting changes to affected collaborators.

## 4. Goals

- Show the deleting user the collaboration impact before they permanently delete their account.
- Let the user automatically transfer each eligible shared collection to its earliest-added accepted member.
- Let the user inspect every owned shared collection and choose a specific new owner per collection.
- Make per-collection choices override the automatic default.
- Delete collections that the user does not transfer.
- Preserve collection contents, members, and permissions when ownership is transferred.
- Notify affected users about ownership transfers, removed shared collections, and collaborator departures.
- Avoid retaining the deleted username, user ID, or profile in deletion-generated system notifications.
- Keep deletion and all transfers transactional and concurrency-safe.
- Handle stale collection screens and caches with understandable states.
- Preserve the existing final-administrator guard, password check, exact confirmation phrase, session cleanup, and
  backup documentation.

## 5. Non-Goals

This implementation will not add:

- general-purpose ownership transfer outside account deletion;
- co-ownership or multiple owners;
- ownership transfer to pending invitees;
- ownership transfer to users who are not accepted collection members;
- a deletion grace period or account restoration window;
- soft-deleted user profiles or named `Deleted user` tombstones;
- email, push, SMS, or webhook notifications;
- real-time WebSocket synchronization;
- collection cloning or forking;
- automatic transfer of private, unshared collections;
- restoration of collections already deleted before this feature ships;
- a private operator support channel.

The server-side transfer service should be designed so a standalone transfer feature can reuse it later.

## 6. Core Product Rules

### 6.1 Permanent deletion remains the default

If the user does not opt into automatic transfer or choose a new owner for a collection, that collection is deleted
with the account.

The ownership-transfer checkbox must be unchecked by default. Transfer changes who controls and retains shared content,
so it requires an affirmative user choice.

### 6.2 Only accepted members are eligible

An eligible new owner must:

- have an active user account at the moment deletion is committed;
- be an accepted `CollectionMember` of that collection;
- not be the deleting owner;
- still have access to the collection;
- not be represented only by a pending, rejected, or revoked invitation.

Both viewers and editors are eligible. Becoming the owner grants full owner permissions regardless of the member's
previous role.

### 6.3 Definition of earliest-added member

The automatic recipient is the eligible member with the earliest `CollectionMember.createdAt` value.

If two rows have the same timestamp, sort by `CollectionMember.id` ascending to make the choice deterministic.

The automatic rule is evaluated again inside the deletion transaction. It must not rely solely on a member selected
from an earlier client preview.

### 6.4 Scope of automatic transfer

The automatic rule applies only to collections owned by the deleting user that have at least one accepted member.

- Shared collection with an eligible member: transfer to the earliest-added member unless overridden.
- Shared collection with no eligible member at commit time: delete it.
- Private or otherwise unshared collection: delete it.
- Collection with pending invitations but no accepted members: delete it.

### 6.5 Detailed choices override the checkbox

The user may override the automatic result for any collection by choosing:

- a specific accepted member; or
- `Delete with my account`.

An explicit per-collection selection always wins over the automatic checkbox.

### 6.6 Transferred content is intentionally retained

The UI must explain that transferring ownership keeps the collection, its metadata, and its items in Kadha under the
new owner. This is different from deleting that collection.

The user must be able to review the final number of transferred and deleted collections before entering the permanent
deletion confirmation phrase.

## 7. User Stories

### Deleting owner

As an owner deleting my account, I want to:

- know how many collections and collaborators will be affected;
- see which collections are shared;
- quickly transfer eligible collections using a predictable default;
- assign a different owner to each collection when necessary;
- deliberately leave a collection marked for deletion;
- understand which content will remain after my account is gone;
- finish permanent account deletion even if I choose not to transfer anything.

### Collection member

As a member of a collection whose owner deletes their account, I want to:

- know whether the collection was transferred or removed;
- know when I became the new owner;
- see the current owner when a collection was transferred to another member;
- avoid unexplained dead links and stale collection cards.

### Collection owner

As an owner whose member deletes their account, I want to:

- know that a collaborator is no longer available;
- keep the collection and its items;
- see the departed member removed from collaboration management;
- see contributed items marked as coming from a former member if attribution is displayed.

## 8. Deletion Impact Summary

The Data settings page must load a deletion-impact preview before the destructive dialog is completed.

The summary should include:

- total collections owned by the user;
- number of owned collections with accepted members;
- number of private or unshared collections that will be deleted;
- number of shared collections currently marked for transfer;
- number of shared collections currently marked for deletion;
- number of distinct collaborators who will lose access to at least one deleted collection;
- number of collections owned by other users that the deleting user will leave;
- whether the account is the final administrator and therefore currently cannot be deleted.

Example:

```text
Deleting your account will:

- Delete 4 private collections.
- Transfer 2 shared collections.
- Delete 1 shared collection and remove access for 3 collaborators.
- Remove you from 5 collections owned by other users.
```

The summary must update immediately when the checkbox or detailed ownership plan changes.

If impact loading fails, account deletion must not proceed. The user should see a retry action rather than an
incomplete or assumed summary.

## 9. Automatic Transfer Checkbox

Show a checkbox in the deletion flow when the user owns at least one collection with an eligible member.

Recommended label:

```text
Automatically transfer each shared collection to its earliest-added eligible member
```

Supporting copy:

```text
You can review or change the selected owner for each collection before deleting your account.
Collections without an eligible member will still be deleted.
```

Behavior:

- unchecked by default;
- checking it supplies the automatic result for collections without an explicit override;
- unchecking it returns non-overridden collections to `Delete with my account`;
- explicit choices made in the detailed dialog remain overrides when the checkbox changes;
- the impact summary recalculates after every change;
- the user can clear an override in the detailed dialog to return that collection to the automatic default.

## 10. Detailed Ownership Dialog

Add a button next to the summary:

```text
Review shared collections
```

The button opens a responsive dialog listing every shared collection owned by the deleting user.

Each row must show:

- collection name;
- number of items;
- number of accepted members;
- the automatic recipient, when one exists;
- the currently resolved outcome;
- a labeled new-owner select field.

The select options are:

- `Delete with my account`;
- each eligible member, identified by username and current role.

Example:

```text
Weekend Watchlist
18 items · 3 members

New owner
[ @asha — Editor                          v ]
```

For a collection with no eligible member:

```text
No accepted member can receive this collection. It will be deleted.
```

The dialog must:

- use one select per collection rather than one global recipient;
- support narrow mobile layouts without horizontal overflow;
- use proper Chakra `Field.Root`, labels, help text, and error text;
- preserve selections when closed and reopened during the current deletion flow;
- distinguish an explicit selection from an automatic default;
- include `Save ownership plan` and neutral `Cancel` actions;
- avoid sending any mutation until the final account-deletion request.

The detailed dialog is a planning step. Saving it updates local deletion-form state and the impact summary only.

## 11. Final Deletion Confirmation

The existing destructive dialog remains the final step and continues to require:

- the current password;
- the exact phrase `I understand this account cannot be recovered`.

Before those fields, show the resolved ownership result:

```text
2 collections will be transferred.
5 collections will be permanently deleted.
3 collaborators will be notified that shared collections were removed.
```

The submit action should remain:

```text
Permanently delete account
```

If any collection or membership changed after the preview, the server must reject the stale plan. The UI must refresh
the impact summary, preserve still-valid explicit choices where possible, and require the user to review the changed
result before submitting again.

## 12. Ownership Transfer Semantics

For each transferred collection, the transaction must:

1. Verify the collection is still owned by the deleting user.
2. Verify the selected recipient is still an accepted member.
3. Update `Collection.userId` to the new owner.
4. Remove the new owner's `CollectionMember` row because ownership and membership are modeled separately.
5. Preserve every other accepted member and their existing viewer/editor role.
6. Preserve collection metadata and collection items.
7. Preserve `addedByUserId` for active contributors.
8. Let the existing `onDelete: SetNull` relation clear attribution for items added by the deleting user.
9. Remove pending invitations for that collection that were issued by the deleting owner.
10. Resolve or remove the corresponding actionable invitation notifications.
11. Create the required actorless ownership-transfer notifications.

The new owner receives full owner permissions immediately. Their former viewer/editor role no longer applies.

The original owner must not be recreated as a member or retained in collection metadata.

## 13. Collection Deletion Semantics

Collections not transferred continue to be deleted by the existing user-to-collection cascade.

Before deletion, the service must calculate the distinct accepted members affected by each removed collection and create
privacy-preserving system notifications for those recipients.

The notifications must not retain:

- the deleted owner's username;
- the deleted owner's user ID;
- the deleted collection ID;
- the deleted collection name;
- item titles or collection descriptions.

Removed-collection notifications may be aggregated per recipient using only a count.

## 14. Member Account Deletion Semantics

When a non-owner member deletes their account:

- their `CollectionMember` rows are deleted;
- pending invitations involving them are deleted;
- collection contents remain unchanged;
- items they contributed remain, with attribution cleared to `null`;
- notifications authored by the deleted account are removed;
- each affected collection owner receives an actorless collaborator-departure notification;
- other members are not notified in the initial version.

Notifications should be aggregated per surviving owner when one deleted account belonged to multiple collections owned
by that person.

No deleted username or user ID may be copied into the notification.

## 15. Notification Requirements

Add system notification types that support an absent actor.

Recommended types:

```text
COLLECTION_OWNERSHIP_RECEIVED
COLLECTION_OWNERSHIP_CHANGED
SHARED_COLLECTIONS_REMOVED
COLLECTION_COLLABORATOR_DEPARTED
```

### 15.1 New owner notification

Recipient: the new owner.

Suggested copy:

```text
You now own “Weekend Watchlist” because its previous owner is no longer available.
```

This notification may reference the surviving collection. It must not reference the deleted account.

### 15.2 Remaining member notification

Recipients: accepted members other than the new owner.

Suggested copy:

```text
“Weekend Watchlist” has a new owner.
```

The notification may link to the surviving collection and display its current owner from live collection data.

### 15.3 Removed shared collection notification

Recipients: members who lost access because one or more collections were deleted.

Suggested copy:

```text
A shared collection is no longer available because its owner deleted their account.
```

Aggregated copy:

```text
3 shared collections are no longer available because their owner deleted their account.
```

This notification has no actor and no collection link.

### 15.4 Departed collaborator notification

Recipient: the surviving collection owner.

Suggested copy:

```text
A collaborator is no longer available and was removed from your collection.
```

Aggregated copy:

```text
A collaborator is no longer available and was removed from 3 of your collections.
```

This notification has no actor, no deleted-user identifier, and no action button.

### 15.5 Notification atomicity

All deletion-generated notifications must be created in the same database transaction as the ownership transfers and
account deletion.

If notification creation fails, the deletion transaction must roll back. Users must not receive an outcome without the
corresponding state change, and state changes must not occur without their required notifications.

## 16. Privacy Rules For Notifications

Account deletion must not create a durable named tombstone for the deleted person.

System notifications must:

- use `actorId: null`;
- avoid deleted usernames and user IDs in metadata, dedupe keys, entity IDs, and reference IDs;
- avoid copying names or descriptions from collections that are being deleted;
- reference a collection only when that collection survives through transfer;
- remain visible only to their recipient;
- contain only the minimum information necessary to explain the collaboration change.

For transferred collections, retaining the collection name and linking to it is allowed because the deleting user
explicitly chose to preserve that shared content under a new owner.

The Privacy Policy must explain that content explicitly transferred before deletion remains with the new owner and
other accepted members.

## 17. Data Model Changes

The existing `Collection.userId` owner relation remains the source of truth. No co-owner field is required.

Extend `NotificationType` with the system types in Section 15.

The existing optional notification actor relation supports system notifications:

```prisma
actorId String?
actor   User? @relation(..., onDelete: SetNull)
```

No deleted-user tombstone table should be added.

If a deletion-impact fingerprint is persisted, it must be short-lived and must not contain plaintext passwords or the
deletion confirmation phrase. The preferred implementation computes an opaque fingerprint from current collection and
membership state without storing a separate database record.

Recommended indexes should support:

- collections by owner;
- members by collection and creation time;
- memberships by user;
- notifications by recipient and creation time.

## 18. Deletion Impact API

Add an authenticated read endpoint:

```http
GET /api/user/deletion-impact
```

Suggested response:

```ts
interface DeletionImpactResponse {
  impactFingerprint: string;
  isFinalAdministrator: boolean;
  ownedCollectionCount: number;
  unsharedOwnedCollectionCount: number;
  membershipsToLeaveCount: number;
  sharedOwnedCollections: Array<{
    id: string;
    name: string;
    itemCount: number;
    members: Array<{
      memberId: string;
      userId: string;
      username: string;
      role: 'viewer' | 'editor';
      joinedAt: string;
    }>;
    automaticRecipientUserId: string | null;
  }>;
}
```

The endpoint may expose these users because they are already accepted members visible to the current owner.

The fingerprint must change when any relevant collection ownership, collection membership, or eligible recipient state
changes.

The response must not include password hashes, recovery data, session versions, pending invite secrets, or unrelated
user information.

## 19. Account Deletion API Extension

Extend the existing authenticated endpoint:

```http
DELETE /api/user/me
```

Suggested request:

```ts
interface DeleteAccountRequest {
  currentPassword: string;
  confirmation: 'I understand this account cannot be recovered';
  impactFingerprint: string;
  ownershipPlan: {
    automaticallyTransferEligibleCollections: boolean;
    overrides: Array<
      | {
          collectionId: string;
          action: 'delete';
        }
      | {
          collectionId: string;
          action: 'transfer';
          newOwnerUserId: string;
        }
    >;
  };
}
```

Rules:

- duplicate collection overrides are invalid;
- an override for a collection not owned by the current user is invalid;
- a transfer without an eligible new owner is invalid;
- explicit overrides win over the automatic rule;
- collections omitted from overrides follow the checkbox rule;
- if the fingerprint is stale, return `409 DELETION_IMPACT_CHANGED`;
- if an explicit selected recipient became ineligible, return `409 DELETION_IMPACT_CHANGED`;
- incorrect passwords continue to return the existing field error;
- the exact confirmation phrase remains server-enforced;
- the final-administrator guard remains server-enforced;
- the endpoint remains protected by JSON, Origin, authentication, and sensitive-action rate-limit middleware.

The success response does not need to expose deleted data or transfer details because the client immediately clears the
session.

## 20. Server Architecture

Keep HTTP concerns in the existing user controller and schema. Put impact calculation and transaction orchestration in
feature services.

Suggested placement:

```text
server/src/features/user/
  user.routes.ts
  user.controller.ts
  user.schema.ts
  user.service.ts
  account-deletion.service.ts
  account-deletion.types.ts

server/src/features/collection/
  collection-ownership.service.ts

server/src/features/notification/
  notification.service.ts
  notification.types.ts
```

Responsibilities:

- `account-deletion.service.ts` calculates impact, verifies fingerprints, resolves plans, aggregates recipients, and
  coordinates the transaction;
- `collection-ownership.service.ts` performs reusable owner-transfer invariants using a provided transaction client;
- the notification feature creates actorless system events;
- controllers only translate service outcomes into HTTP responses;
- schemas validate the ownership plan and exact confirmation phrase.

Do not place Prisma calls or ownership rules in React components or controllers.

## 21. Atomicity And Concurrency

The following must be one logical transaction:

1. Verify the deleting user still exists.
2. Recalculate deletion impact.
3. Compare the submitted impact fingerprint.
4. Verify the current password against the current password hash.
5. Enforce the final-administrator rule.
6. Resolve automatic recipients and explicit overrides.
7. Validate every selected recipient.
8. Capture recipient sets for aggregated notifications.
9. Transfer selected collections.
10. Remove obsolete pending invitations and their actionable notifications.
11. Create actorless transfer, removal, and departure notifications.
12. Remove notifications authored by the deleting user.
13. Delete the user and cascade all remaining owned data.

Any failure rolls back every transfer, notification, and deletion.

Concurrency cases:

- If a selected recipient deletes their account first, reject the stale plan.
- If a member leaves before deletion commits, reject the stale plan when that choice changes the outcome.
- If a new member joins, reject the stale plan because the impact and automatic ordering changed.
- If the collection is edited but ownership and membership do not change, the fingerprint need not change.
- If two requests try to delete the same account, at most one succeeds.
- If ownership transfer and normal sharing management race, transaction validation determines the winner; no collection
  may end with a missing owner or owner duplicated as a member.

## 22. Frontend Architecture

Suggested placement:

```text
client/src/features/user/api/use-deletion-impact.ts
client/src/features/user/api/use-delete-account.ts
client/src/features/user/components/delete-account-section.tsx
client/src/features/user/components/deletion-impact-summary.tsx
client/src/features/user/components/collection-ownership-plan-dialog.tsx
client/src/features/user/account-deletion.types.ts
client/src/features/user/account-deletion-plan.ts
```

The existing Data settings route remains the entry point.

Requirements:

- use TanStack Query for the impact preview;
- keep passwords and the confirmation phrase in local form state only;
- keep the unsaved ownership plan local to the deletion flow;
- do not put the current password in React Query cache, URLs, logs, or global atoms;
- use a focused pure utility to resolve automatic defaults plus overrides for the live summary;
- refetch impact whenever the destructive dialog is opened;
- reset password and confirmation fields whenever the destructive dialog closes;
- preserve the ownership plan only while the user remains in the current deletion flow;
- discard the plan after successful deletion or navigation away from the settings page.

## 23. Chakra UI And Accessibility Requirements

The impact summary, checkbox, detailed dialog, selects, and final confirmation must use Chakra UI v3 patterns.

Requirements:

- use semantic headings and preserve the Settings heading hierarchy;
- use `Field.Root`, `Field.Label`, `Field.HelperText`, and `Field.ErrorText` for each member selector;
- use `Checkbox.Root` and associated label text for the automatic rule;
- use an alert dialog only for the final irreversible confirmation;
- use a normal dialog for reviewing ownership assignments;
- keep destructive actions on an intentional red palette;
- use the brand palette for saving a non-destructive ownership plan;
- use explicit gray palettes for neutral actions;
- announce impact-load failures and stale-plan responses accessibly;
- focus the detailed dialog heading when it opens;
- return focus to `Review shared collections` when it closes;
- keep collection rows and select fields usable at mobile widths;
- do not rely on color alone to distinguish transfer from deletion;
- show loading states without changing button labels unexpectedly;
- prevent duplicate final submissions.

## 24. Stale Collection And Cache Behavior

This feature does not require real-time sockets, but already-open screens must recover cleanly.

When a collection request returns not found or forbidden after an ownership/deletion change:

- remove the unavailable collection detail from the local query cache;
- invalidate collection lists and user-collection lists;
- show a contextual state rather than a generic crash;
- provide a link back to Collections.

Suggested copy:

```text
This collection is no longer available. It may have been removed by its owner or your access may have changed.
```

Collection and collaboration queries should refetch when:

- the browser regains focus, using the existing TanStack Query behavior;
- the collaboration dialog reopens;
- the user opens a relevant system notification;
- a collection request fails because ownership or access changed.

No polling interval or WebSocket dependency is required for the first version.

## 25. Notification UI Behavior

System notifications must render without an actor avatar or deleted-user link.

Transferred-collection notifications:

- may display the surviving collection's current name;
- may link to the collection;
- should refetch collection details before navigation where practical;
- should become a neutral unavailable message if the collection was later deleted.

Removed-collection and departed-collaborator notifications:

- have no action buttons;
- have no dead collection or profile links;
- show singular or plural copy based on the aggregated count;
- remain readable if historical notification metadata is partially missing.

The notification serializer and client parser must treat unknown future system types safely.

## 26. Failure And Edge Cases

Handle all of the following:

- Impact preview fails to load.
- User owns no collections.
- User owns collections but none are shared.
- User owns one shared collection with one viewer.
- User owns one shared collection with one editor.
- User owns many collections with different eligible recipients.
- A collection has pending invites but no accepted members.
- A collection has accepted members and pending invites.
- The earliest-added member leaves after preview.
- A manually selected recipient leaves after preview.
- The earliest-added member deletes their account concurrently.
- A new earlier-timestamp tie is resolved deterministically by member ID.
- User checks automatic transfer and explicitly marks one collection for deletion.
- User leaves automatic transfer unchecked and explicitly transfers one collection.
- User changes the checkbox after saving detailed overrides.
- User closes and reopens the detailed dialog.
- User closes and reopens the final deletion dialog.
- User submits a stale fingerprint.
- User enters the wrong current password.
- User enters an incorrect confirmation phrase.
- User is the final administrator.
- Deleting member belongs to several collections owned by the same user.
- Deleting owner transfers some collections and deletes others for the same member.
- A transferred collection contains items added by the deleting owner.
- A transferred collection contains items added by the new owner and other members.
- Notification creation fails during the transaction.
- A recipient later deletes a transferred collection before opening the notification.
- Browser displays a cached collection that has just been removed.

## 27. Testing Requirements

### 27.1 Server tests

- Impact preview reports owned, shared, unshared, membership, collaborator, and final-admin counts.
- Eligible recipients include accepted viewers and editors only.
- Automatic recipient ordering uses `createdAt`, then member ID.
- Automatic transfer is opt-in.
- Automatic transfer moves every eligible non-overridden collection.
- Collections without eligible recipients are deleted.
- Explicit transfer overrides automatic transfer.
- Explicit deletion overrides automatic transfer.
- A selected new owner becomes `Collection.userId`.
- The new owner's old member row is removed.
- Other members and roles remain unchanged.
- Collection metadata and items survive transfer.
- Items added by the deleting owner survive with null attribution.
- Pending invites issued by the deleting owner are removed.
- New-owner and remaining-member notifications are created with null actors.
- Deleted-collection notifications are aggregated by recipient.
- Collaborator-departure notifications are aggregated by surviving owner.
- Deletion-generated notifications contain no deleted username or user ID.
- Removed-collection notifications contain no deleted collection name or ID.
- Transferred-collection notifications reference only surviving resources.
- A stale fingerprint returns `409 DELETION_IMPACT_CHANGED` without changing data.
- An ineligible explicit recipient returns a stale-impact conflict without changing data.
- Incorrect passwords, incorrect phrases, final-admin deletion, Origin validation, JSON enforcement, authentication, and
  rate limits continue to work.
- Concurrent member departure and deletion cannot produce an orphaned collection.
- A transaction failure rolls back transfers, notifications, and deletion.
- Existing account-deletion cascade coverage remains green.

### 27.2 Client tests

- Impact summary renders all relevant counts.
- Impact loading failure blocks deletion and offers retry.
- Automatic transfer checkbox is hidden when no collection is eligible.
- Automatic transfer checkbox is unchecked by default.
- Checking it updates transfer/delete counts.
- Detailed dialog lists every shared owned collection.
- Eligible member selects have accessible labels.
- Pending invitees are not selectable.
- Collections without eligible members explain that they will be deleted.
- Per-collection transfer and deletion choices override the automatic default.
- Overrides persist across detailed-dialog reopen during the flow.
- Closing the final destructive dialog clears passwords and the typed phrase.
- Final request contains the fingerprint, checkbox state, and explicit overrides.
- Password and confirmation values are not included in cached impact data.
- Stale-impact conflicts refetch and require review before retry.
- Successful deletion clears the session and navigates away.
- Transferred, removed, and departed system notifications render correct singular/plural copy.
- System notifications do not render deleted-user profile links.
- A not-found collection clears stale detail/list caches and shows the contextual unavailable state.
- Mobile dialog layout and keyboard navigation remain usable.

## 28. Documentation And Changelog

When implemented:

- add the feature under `## Unreleased` in `CHANGELOG.md`;
- run `cd client && npm run sync:changelog`;
- update `roadmap.md` with collaboration-safe deletion and ownership-transfer status;
- update the Privacy Policy to explain explicitly transferred content and anonymous system notifications;
- update README/operator documentation if notification or restore behavior changes;
- update `PRDs/collection-sharing.md` so ownership transfer is no longer described only as a future enhancement;
- update `docs/project-structure.md` if a dedicated account-deletion service creates a new documented boundary.

No version release should be cut without explicit approval.

## 29. Rollout Plan

### Phase 1: Impact preview and plan model

- Add deletion-impact types and service.
- Add the authenticated impact endpoint.
- Add the impact fingerprint.
- Add the client impact summary.
- Add the automatic-transfer checkbox and pure plan-resolution utility.

### Phase 2: Per-collection ownership planning

- Add the detailed review dialog.
- Add eligible member selectors.
- Add explicit transfer/delete overrides.
- Add responsive and accessibility coverage.

### Phase 3: Transactional transfer and deletion

- Add the reusable collection ownership-transfer service.
- Extend the delete-account schema and transaction.
- Handle pending invites and new-owner member rows.
- Add stale-plan conflicts and concurrency coverage.

### Phase 4: Collaboration notifications

- Add notification enum values and migration where required.
- Create actorless transfer, removal, and departure notifications.
- Add notification rendering and pluralization.
- Verify no deleted identifiers remain in notification payloads.

### Phase 5: Stale-resource handling and documentation

- Add contextual unavailable-collection states.
- Add collection cache eviction/invalidation behavior.
- Update privacy, roadmap, changelog, generated changelog, and related PRDs.
- Run the full Docker Compose verification suite and migration replay.

The feature should ship only when all five phases are complete. Partial rollout must not expose transfer controls before
the transactional server behavior and required notifications are available.

## 30. Acceptance Criteria

- The deleting user sees a complete collaboration-impact summary before final confirmation.
- The automatic transfer checkbox is explicit, unchecked by default, and uses the earliest-added eligible member.
- The user can open a detailed dialog and choose a new owner or deletion for every shared owned collection.
- Explicit per-collection choices override the automatic rule.
- The final summary accurately reports transfers, deletions, collaborators losing access, and memberships being left.
- Ownership transfers and account deletion complete in one transaction.
- A transferred collection has exactly one owner and does not also list that owner as a member.
- Other accepted members and their roles survive transfer.
- Collections not transferred are permanently deleted.
- The current password and exact irreversible-action phrase remain mandatory.
- A stale impact plan cannot delete the account or transfer collections.
- New owners and remaining members receive actorless ownership-change notifications.
- Members who lose collections receive anonymous removed-collection notifications.
- Owners whose collaborator deletes their account receive anonymous departure notifications.
- Deletion-generated notifications retain no deleted username, user ID, profile link, or deleted collection content.
- Items added by a deleted member remain with null attribution.
- Already-open stale collection screens transition to a useful unavailable state after refetch.
- The final administrator remains protected from self-deletion.
- All previous account deletion, password change, export, collection sharing, notification, privacy, and session tests
  remain green.
- Server tests, server build, client tests, client lint, client build, migration replay, and `git diff --check` pass.

## 31. Open Product Decisions

The recommendations below are part of this PRD unless changed before implementation:

1. Should automatic transfer be enabled by default?
   - Recommendation: no. Retaining content under another owner requires affirmative consent.

2. Are viewers eligible to become owners?
   - Recommendation: yes. Accepted membership demonstrates access, and ownership grants the required permissions.

3. Should pending invitees be eligible?
   - Recommendation: no. They have not accepted access or responsibility.

4. Should other members be notified when one member deletes their account?
   - Recommendation: notify the owner only to avoid unnecessary notification volume.

5. Should removed-collection notifications retain collection names?
   - Recommendation: no. The collection is deleted content; use anonymous singular/plural copy.

6. Should transferred-collection notifications retain and link the collection name?
   - Recommendation: yes. The collection survives through an explicit transfer and remains shared with the recipient.

7. Should transfer be available as a normal collection action in the same release?
   - Recommendation: no. Build the service for reuse, but keep this release focused on safe account deletion.

8. What happens when no eligible member exists?
   - Recommendation: delete the collection and state that clearly before confirmation.

9. Should deletion wait for a recipient to accept ownership?
   - Recommendation: no. Only existing accepted members are eligible, and requiring a second acceptance would block
     permanent deletion.

10. Should Kadha create a named deleted-user placeholder?
    - Recommendation: no. Use anonymous system events and `Former member` attribution where needed.

## 32. Future Enhancements

- Standalone collection ownership transfer from collaboration settings.
- Optional recipient acknowledgment before a non-deletion transfer.
- Collection duplication or forking before an owner deletes an account.
- External push notifications.
- Real-time collaboration state updates.
- A collection-level audit history that is independent of deleted user activity rows.
- Configurable operator support and privacy-request contact details.
- Time-based encrypted-backup expiry and automated post-restore deletion reconciliation.
