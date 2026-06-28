# Social and Privacy Contract

## Profile Discovery

User accounts are searchable unless either user has blocked the other. Private profiles are still discoverable, but their profile content and activity sections are locked until the viewer has access.

Search excludes:

- the current user
- users blocked by the current user
- users who blocked the current user

## Friendship States

Database state remains:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `BLOCKED`

API-facing state is viewer-relative:

- `NONE`
- `PENDING_SENT`
- `PENDING_RECEIVED`
- `ACCEPTED`
- `BLOCKED_BY_ME`
- `BLOCKED_ME`

`BLOCKED_ME` should not normally appear in search because blocked users are filtered out.

## Profile Privacy

The database uses `DataPrivacy` for both profile and section privacy:

- `EVERYONE`
- `FRIENDS`
- `ONLY_ME`

For profile UI, `ONLY_ME` is presented as `Private`.

Profile access:

- Owner can view.
- `EVERYONE` can be viewed by strangers.
- `FRIENDS` can be viewed by accepted friends.
- `ONLY_ME` is locked to strangers and pending/rejected users.

Locked profile responses include:

- `canViewProfile: false`
- `lockedReason: "FRIENDS_ONLY" | "PRIVATE"`

## Activity Privacy

Watched, liked, watchlist, and collections are enforced server-side.

Access rules:

- owner can view
- `EVERYONE` can view
- `FRIENDS` requires accepted friendship
- `ONLY_ME` denies non-owner access

Denied activity responses return an empty data set plus access metadata:

```ts
{
  data: [],
  canView: false,
  lockedReason: "PRIVATE" | "FRIENDS_ONLY"
}
```

Allowed activity responses include:

```ts
{
  data: [...],
  canView: true
}
```

Collections keep per-collection privacy. Other-user collection lists return only collections visible to the current viewer.

## Blocking

Blocking is stored as a one-way `BLOCKED` friendship row from blocker to blocked.

Blocking must:

- remove or override any existing friendship/request between the pair
- prevent search visibility both ways
- prevent profile and activity access
- prevent friend requests
- remove existing notifications between the pair

Blocked users are visible only in the blocker's blocked list.

## Current Implementation Notes

- Rejected requests are stored as `REJECTED`; a later request deletes the rejected row and creates a fresh pending request.
- Other-user profile metadata includes section visibility so the client can hide inaccessible tabs, especially watchlist.
- Friendship mutations should invalidate friendship lists, search, notifications, profile, and profile activity queries.
