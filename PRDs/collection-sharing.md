
# PRD: Shared Collections & Collaboration

## 1. Overview

Kadha users should be able to share collections with other registered users. A shared collection can be view-only or collaborative, depending on permissions set by the collection owner.

The feature allows users to invite friends, accept or reject shared collection invitations, see shared collections in their own collection library, and collaborate on collection contents when permitted.

This is not anonymous public link sharing. This PRD focuses on authenticated user-to-user sharing.

## 2. Goals

- Let users privately share collections with specific registered users.
- Let collection owners control who can view or edit a collection.
- Allow invited users to accept or reject collection invitations.
- Show shared collections in the recipient’s collection list.
- Clearly distinguish owned collections from shared collections.
- Support collaborative item management when users have edit permission.
- Maintain strong backend permission enforcement.
- Provide a foundation for future public links, comments, activity history, and advanced collaboration.

## 3. Non-Goals

Initial implementation does not need to include:

- Anonymous public share links.
- Password-protected public links.
- Expiring public links.
- Real-time multiplayer editing.
- Comments or chat.
- Collection forks/cloning.
- Per-item permissions.
- External email invites to non-users.
- Invite by phone number or social accounts.
- Role-based access outside collections.

These may be future enhancements.

## 4. User Stories

### Owner Stories

As a collection owner, I want to:

- Share a collection with another user.
- Search for users by username, name, or email.
- Invite a user as a viewer or editor.
- See pending invitations.
- Cancel pending invitations.
- See accepted members.
- Change a member’s role.
- Remove a member from my collection.
- Disable collaboration by demoting editors to viewers or changing role settings.
- See who has access to my collection.
- Keep full control over collection metadata and deletion.

### Recipient Stories

As an invited user, I want to:

- Receive a notification when someone invites me to a collection.
- See who invited me and which collection is being shared.
- Accept or reject the invitation.
- View accepted shared collections under my Collections page.
- Know whether I can view or edit the collection.
- Leave a shared collection.
- Add or remove collection items if I have editor access.
- Avoid seeing rejected or revoked collections in my normal collection list.

### Viewer Stories

As a viewer, I want to:

- Open the shared collection.
- See collection details and items.
- See owner details.
- See other joined members.
- Understand that I cannot edit the collection.

### Editor Stories

As an editor, I want to:

- Add movies or TV shows to the collection.
- Remove items from the collection.
- See my changes reflected in the shared collection.
- Avoid accidentally changing owner-only settings.

## 5. Core Concepts

### Collection Owner

The user who created the collection.

The owner always has full control and cannot be removed from the collection.

### Collection Member

A user who has accepted an invitation to a collection.

Members can have one of these roles:

- `viewer`
- `editor`

### Collection Invitation

A pending access request created by the owner for another user.

Invitation statuses:

- `pending`
- `accepted`
- `rejected`
- `revoked`

### Shared Collection

A collection visible to a user who is not the owner but has accepted membership.

### Owned Collection

A collection created by the current user.

## 6. Roles & Permissions

### Owner

Can:

- View collection.
- Add items.
- Remove items.
- Edit collection title.
- Edit collection description.
- Edit collection visibility/share settings.
- Invite users.
- Cancel pending invites.
- Remove members.
- Change member roles.
- Delete collection.
- Leave impossible: owner cannot leave their own collection unless ownership transfer is supported later.

### Editor

Can:

- View collection.
- Add items.
- Remove items.
- See members.
- Leave collection.

Cannot:

- Delete collection.
- Rename collection.
- Edit collection description.
- Invite users.
- Remove members.
- Change roles.
- Cancel invitations.
- Transfer ownership.

### Viewer

Can:

- View collection.
- See members.
- Leave collection.

Cannot:

- Add items.
- Remove items.
- Edit metadata.
- Invite users.
- Remove members.
- Change roles.
- Delete collection.

## 7. Recommended Permission Table

| Action | Owner | Editor | Viewer |
|---|---:|---:|---:|
| View collection | Yes | Yes | Yes |
| View members | Yes | Yes | Yes |
| Add items | Yes | Yes | No |
| Remove items | Yes | Yes | No |
| Edit title/description | Yes | No | No |
| Invite users | Yes | No | No |
| Cancel pending invites | Yes | No | No |
| Remove members | Yes | No | No |
| Change member roles | Yes | No | No |
| Delete collection | Yes | No | No |
| Leave collection | No | Yes | Yes |

## 8. Collection List Behavior

The Collections page should include three tabs:

### All

Shows:

- Collections owned by the current user.
- Collections shared with the current user and accepted.

### Mine

Shows:

- Only collections where the current user is the owner.

### Shared

Shows:

- Only collections where the current user is an accepted member but not owner.

Rejected, revoked, or pending invitations should not appear here.

## 9. Collection Card Behavior

Collection cards should show enough context to avoid confusion.

For owned collections:

- Collection name.
- Item count.
- Optional member count.
- Optional shared indicator if members exist.

For shared collections:

- Collection name.
- Owner name/avatar.
- Current user role: `Viewer` or `Editor`.
- Item count.
- Optional member count.

Example shared card metadata:

```text
Owner: Ashe
Role: Editor
12 items
4 members
```

## 10. Collection Detail Behavior

The collection detail page should show:

- Collection title.
- Description, if available.
- Owner identity.
- Member avatars or compact member list.
- Current user role.
- Collection items.
- Owner-only share/manage action.
- Add/remove item controls only when the current user has permission.

### Member Display

The detail page should show joined users near the collection header.

Recommended layout:

```text
Collection Title
by Ashe

[Ashe avatar] [Lux avatar] [Jinx avatar] +3

Role: Editor
```

Clicking or opening the share/member control should show full member details.

## 11. Share Control Popup

The share popup is owner-only.

It should include:

### Header

- Collection title.
- Sharing status summary.
- Member count.

### User Search

Search registered users by:

- Display name.
- Username.
- Email, if appropriate and privacy-safe.

Search should exclude:

- Current owner.
- Users already accepted as members.
- Users with pending invites, unless showing “Pending”.
- Blocked/deactivated users, if such concepts exist later.

### Invite Controls

For each search result:

- User avatar/name.
- Username or email.
- Role selector: `Can view`, `Can edit`.
- Invite button.

Example:

```text
Luxanna Crownguard    @lux
[Can edit v] [Invite]
```

### Pending Invitations

Show users who have been invited but not accepted.

Owner can:

- See invited role.
- Change role before acceptance, optional.
- Revoke invite.

### Members

Show accepted members.

Owner can:

- See role.
- Change role.
- Remove member.

The owner should be shown separately and not removable.

## 12. Invitation Flow

### Invite Creation

1. Owner opens share popup.
2. Owner searches for a user.
3. Owner selects permission: `Can view` or `Can edit`.
4. Owner clicks Invite.
5. System creates a pending invitation.
6. System creates a notification for recipient.

### Recipient Notification

Notification should include:

```text
Ashe invited you to collaborate on “Weekend Watchlist”.
```

If viewer:

```text
Ashe invited you to view “Weekend Watchlist”.
```

Actions:

- Accept
- Reject

### Accept

When recipient accepts:

- Invitation status becomes `accepted`.
- Membership is created or activated.
- Collection appears under `All` and `Shared`.
- Owner may optionally receive a notification.

### Reject

When recipient rejects:

- Invitation status becomes `rejected`.
- No membership is created.
- Collection does not appear in recipient’s collection list.
- Owner may optionally see rejected state in share popup.

### Revoke

When owner revokes:

- Invitation status becomes `revoked`.
- Recipient can no longer accept it.
- Notification action should become unavailable or show “Invite no longer available.”

## 13. Duplicate Handling

The system should prevent:

- Inviting yourself.
- Duplicate pending invitations for the same collection and user.
- Inviting an existing accepted member.
- Creating duplicate memberships.
- Accepting a revoked invitation.
- Accepting an invitation for a deleted collection.
- Accepting an invitation for a deleted/deactivated user.

If a previously rejected user is invited again, the system may either:

- Create a new invitation record, recommended for audit clarity.
- Or reactivate/update the previous rejected invite.

Recommended: create a new invitation event.

## 14. Collaboration Behavior

If a user is an editor, they can add and remove collection items.

### Adding Items

Editors and owners can:

- Search media.
- Add movies or TV shows to the collection.
- Avoid adding duplicates if the collection already prevents duplicates.

### Removing Items

Editors and owners can remove items.

Recommended product rule:

- Editors can remove any item from the collection, not just items they added.

This is simpler and matches the meaning of “Can edit.”

If stricter collaboration is desired later, item-level ownership can be added.

### Metadata Editing

Only owners can edit:

- Title.
- Description.
- Collection cover, if supported.
- Sharing settings.
- Member roles.

## 15. Notifications

The system should support collection invitation notifications.

Notification data should include:

- Notification type: `collection_invite`.
- Collection ID.
- Invitation ID.
- Sender user ID.
- Recipient user ID.
- Role being offered.
- Status.
- Created date.

Notification states:

- Unread.
- Read.
- Acted upon.

When an invite is accepted, rejected, or revoked, the notification should no longer show active action buttons.

## 16. Data Model

Suggested backend entities.

### Collection

Existing collection entity should remain owner-based.

Add or ensure:

```ts
ownerId: string
```

Optional future fields:

```ts
sharedAt?: Date | null
lastSharedActivityAt?: Date | null
```

### CollectionMember

Represents accepted access.

```ts
id: string
collectionId: string
userId: string
role: 'viewer' | 'editor'
createdAt: Date
updatedAt: Date
```

Constraints:

- Unique `(collectionId, userId)`.
- Cannot create member row for owner, unless the system intentionally models owners as members too.

Recommended: owner remains on collection, members table stores non-owner users.

### CollectionInvite

Represents an invitation event.

```ts
id: string
collectionId: string
inviterId: string
inviteeId: string
role: 'viewer' | 'editor'
status: 'pending' | 'accepted' | 'rejected' | 'revoked'
createdAt: Date
updatedAt: Date
respondedAt?: Date | null
revokedAt?: Date | null
```

Constraints:

- Only one active pending invite per `(collectionId, inviteeId)`.
- Historical rejected/revoked invites can remain.

### CollectionItem

If not already present, useful audit fields:

```ts
addedByUserId?: string | null
addedAt: Date
```

This helps future activity feeds and accountability.

## 17. API Requirements

Endpoint names can follow the existing project style.

### List Collections

Should support filtering:

```http
GET /collections?scope=all
GET /collections?scope=mine
GET /collections?scope=shared
```

Response should include ownership/access context:

```ts
{
  id: string
  name: string
  description?: string
  owner: UserSummary
  itemCount: number
  memberCount: number
  access: {
    relationship: 'owner' | 'member'
    role: 'owner' | 'editor' | 'viewer'
  }
}
```

### Get Collection

```http
GET /collections/:collectionId
```

Accessible if:

- Current user owns the collection.
- Current user is an accepted member.

Response should include:

- Collection metadata.
- Owner summary.
- Member summaries.
- Current user access role.
- Items.

### Search Users For Invite

```http
GET /collections/:collectionId/share/users/search?q=lux
```

Owner-only.

Should return users with invite/member state:

```ts
{
  id: string
  displayName: string
  username: string
  avatarUrl?: string
  state: 'available' | 'pending' | 'member'
  currentRole?: 'viewer' | 'editor'
}
```

### Invite User

```http
POST /collections/:collectionId/invites
```

Body:

```ts
{
  inviteeId: string
  role: 'viewer' | 'editor'
}
```

Owner-only.

### List Invites

```http
GET /collections/:collectionId/invites
```

Owner-only.

### Revoke Invite

```http
POST /collections/:collectionId/invites/:inviteId/revoke
```

Owner-only.

### Respond To Invite

```http
POST /collection-invites/:inviteId/respond
```

Body:

```ts
{
  action: 'accept' | 'reject'
}
```

Invitee-only.

### Update Member Role

```http
PATCH /collections/:collectionId/members/:memberId
```

Body:

```ts
{
  role: 'viewer' | 'editor'
}
```

Owner-only.

### Remove Member

```http
DELETE /collections/:collectionId/members/:memberId
```

Owner-only.

### Leave Shared Collection

```http
POST /collections/:collectionId/leave
```

Member-only.

### Add Collection Item

Existing add-item endpoint should allow:

- Owner.
- Editor.

### Remove Collection Item

Existing remove-item endpoint should allow:

- Owner.
- Editor.

## 18. Authorization Rules

Backend must enforce all permissions.

Frontend checks are for UX only.

Authorization helper examples:

- `canViewCollection(userId, collectionId)`
- `canEditCollectionItems(userId, collectionId)`
- `canManageCollectionSharing(userId, collectionId)`
- `getCollectionAccess(userId, collectionId)`

Rules:

- Owner has all permissions.
- Accepted editor can view and edit items.
- Accepted viewer can only view.
- Pending invite grants no collection access.
- Rejected invite grants no collection access.
- Revoked invite grants no collection access.

## 19. UX States

### Empty Shared Tab

If no shared collections:

```text
No shared collections yet.
```

Avoid explaining too much in-app.

### Pending Invite Notification

Show action buttons:

- Accept
- Reject

### Revoked Invite

If user opens an old notification:

```text
This invitation is no longer available.
```

### Removed From Collection

If a user is removed while viewing:

- Next API request should return forbidden.
- UI should redirect to collections page or show access removed state.

### Collection Deleted

If owner deletes collection:

- Shared members lose access.
- Existing notifications/invites should become unavailable.
- Collection disappears from shared lists.

## 20. Edge Cases

Handle:

- Owner tries to invite self.
- Owner invites user already invited.
- Owner invites accepted member.
- Recipient accepts after invite revoked.
- Recipient accepts after collection deleted.
- Recipient accepts after owner deleted/deactivated.
- Recipient rejects after invite revoked.
- Editor tries to rename collection.
- Viewer tries to add item.
- Removed member tries to access collection.
- Member leaves, then owner invites again.
- Owner changes editor to viewer while editor has UI open.
- Duplicate item add attempts.
- Collection deleted while invite notification exists.

## 21. Activity & Audit

Not required for the first implementation, but the data model should support future activity.

Potential tracked events:

- User invited.
- Invite accepted.
- Invite rejected.
- Invite revoked.
- Member removed.
- Role changed.
- Item added.
- Item removed.
- Collection renamed.
- Collection deleted.

This can later power:

- Activity feed.
- Notifications.
- Undo history.
- Audit log.

## 22. Privacy & Security

Important rules:

- Only registered users can be invited.
- Search results should not expose sensitive data unnecessarily.
- Email search should only be allowed if the app already treats email as discoverable.
- Shared collections are private to accepted users.
- Collection IDs alone must not grant access.
- All collection read/write endpoints must enforce access checks.
- Notifications must only be visible to the recipient.
- Invite response endpoints must verify the current user is the invitee.
- Owner management endpoints must verify current user is the owner.

## 23. Future Enhancements

### Public Share Links

Allow owner to create a read-only public link:

```text
/share/collections/:token
```

Options:

- Anyone with link can view.
- Expire link.
- Regenerate link.
- Disable link.

### Ownership Transfer

Allow owner to transfer ownership to another accepted member.

Useful if the original owner leaves the project/app.

### Comments

Allow members to comment on a collection or individual item.

### Activity Feed

Show recent changes:

```text
Lux added Dune: Part Two
Ashe removed Inception
```

### Per-Invite Message

Allow owner to include a short note:

```text
“Add your favorite weekend movies.”
```

### Per-Member Permissions

Additional roles:

- `commenter`
- `manager`
- `contributor`

Recommended only if needed later.

### Item-Level Attribution

Show who added each item.

### Invite Expiration

Pending invites expire after a fixed period, such as 7 or 30 days.

### Email Invites

Allow inviting users who do not yet have accounts.

Flow:

- Owner enters email.
- Recipient signs up.
- Invite is attached after account creation.

### Collection Forking

Allow users to copy a shared collection into their own collections.

## 24. Suggested Rollout Phases

### Phase 1: Private Sharing Foundation

- Data model for members and invites.
- Owner invites registered users.
- Accept/reject notification flow.
- Collections tabs: `All`, `Mine`, `Shared`.
- Shared collection cards show owner and role.
- Shared collection detail shows owner and members.
- Viewer/editor permissions enforced.

### Phase 2: Collaboration Polish

- Role editing.
- Remove members.
- Revoke pending invites.
- Leave shared collection.
- Added-by attribution for collection items.
- Better empty/error states.

### Phase 3: Activity & Notifications

- Notify owner when invite accepted.
- Notify members when collection changes, if desired.
- Activity feed.
- Item-level attribution in UI.

### Phase 4: Public Sharing

- Optional public read-only links.
- Regenerate/disable link.
- Public share page.

### Phase 5: Advanced Collaboration

- Comments.
- Ownership transfer.
- Invite expiration.
- Email invites.
- Collection cloning/forking.

## 25. Open Product Decisions

Before implementation, decide:

1. Should editors be allowed to remove items added by other users?
   - Recommendation: yes.

2. Should users be searchable by email?
   - Recommendation: only if email is already visible/discoverable.

3. Should rejected invites be visible to owners?
   - Recommendation: show in share popup history only if useful; otherwise hide.

4. Should owners receive notifications when invites are accepted/rejected?
   - Recommendation: accepted yes, rejected optional.

5. Should collaboration be global or per-user?
   - Recommendation: per-user roles.

6. Should collection metadata editing be owner-only?
   - Recommendation: yes.

7. Should the owner appear in the member list?
   - Recommendation: yes visually, but model ownership separately.

## 26. Success Metrics

Useful metrics if analytics exist:

- Number of shared collections created.
- Number of invites sent.
- Invite acceptance rate.
- Number of active shared collections.
- Number of collaborative item additions/removals.
- Percentage of collections with more than one member.
- Revoke/remove/leave rates as negative friction signals.

## 27. Recommended Final Product Behavior

The final feature should feel like this:

Ashe owns a collection. She opens Share, searches for Lux, chooses whether Lux can view or edit, and sends an invite. Lux receives a notification and accepts. The collection now appears in Lux’s Collections page under Shared. Lux can open it, see Ashe as the owner, see other members, and interact according to her role. If Lux is an editor, she can add and remove items. Ashe remains the owner and can manage access at any time.
