
**PRD: Kadha Admin Dashboard V1**

**Goal**
Build a simple read-only admin dashboard so the self-hosted instance owner can see who uses the app and basic usage metrics. V1 should stay lightweight, but the backend structure should make future admin actions, permissions, audit logs, and stronger security easy to add later.

**Non-Goals**
V1 will not include user deletion, suspension, password resets, impersonation, content editing, moderation queues, audit logs, MFA, separate admin sessions, or a separate admin login page.

**Admin Login**
Admins log in through the existing Kadha login page:

```text
/auth/login
```

An admin is a normal user account with an admin role.

After login:

1. User logs in normally.
2. Client fetches `/api/user/me`.
3. If `user.role === "ADMIN"`, the UI shows an Admin nav item.
4. Admin visits:

```text
/app/admin
```

5. Backend protects admin APIs with:

```text
authMiddleware -> requireAdmin
```

No separate admin credentials or admin login route are needed for V1.

**First Admin Setup**
The first admin should be created explicitly by promoting an existing user.

Recommended command:

```bash
cd server
npm run admin:promote -- --username muhsin
```

This should update that user’s role to `ADMIN`.

Do not automatically make the first registered user an admin.

**Data Model**
Add a simple role enum:

```prisma
enum UserRole {
  USER
  ADMIN
}
```

Add to `User`:

```prisma
role UserRole @default(USER)
```

Include `role` in `/api/user/me`.

Do not expose role unnecessarily in public profile responses unless needed later.

**Backend Requirements**
Add a dedicated admin feature:

```text
server/src/features/admin/
  admin.routes.ts
  admin.controller.ts
  admin.service.ts
  admin.schema.ts
  admin.types.ts
```

Mount admin routes under:

```text
/api/admin
```

Admin routes must use:

```ts
authMiddleware
requireAdmin
```

`requireAdmin` should query the database for the current user role. It should not rely only on JWT claims, so role changes take effect without waiting for token expiration.

Required endpoints:

```http
GET /api/admin/overview
GET /api/admin/users?page=&limit=&query=&sort=&order=&role=
GET /api/admin/users/:id
```

**Frontend Requirements**
Add admin pages under the existing authenticated app shell:

```text
/app/admin
/app/admin/users
/app/admin/users/:id
```

Add files roughly under:

```text
client/src/pages/admin/
client/src/features/admin/api/
client/src/features/admin/admin.types.ts
```

Add an admin route guard that checks the authenticated user’s role.

Show the Admin nav item only for admins.

**Dashboard Overview**
The overview page should show instance-level metrics:

- total users
- new users in last 7 days
- new users in last 30 days
- total tracked media rows
- total collections
- total friendships
- total notifications
- total admins
- app name
- app version

If “active users” is easy to derive safely, include it. Otherwise defer until a `lastSeenAt` field is added.

**Users Page**
Show a searchable, paginated user table.

Columns:

- username
- role
- joined date
- updated date
- profile privacy
- watched privacy
- liked privacy
- watchlist privacy
- watched count
- liked count
- watchlist count
- collection count
- friend count

Controls:

- search by username
- filter by role
- sort by username, joined date, updated date
- pagination

Row action:

- view details only

No destructive actions in V1.

**User Detail Page**
Read-only account summary.

Show:

- user id
- username
- role
- created date
- updated date
- privacy settings
- watched count
- liked count
- watchlist count
- collection count
- friend count
- pending sent friend request count
- pending received friend request count

Do not show password hashes, tokens, or raw internal secrets.

For V1, it is acceptable to keep privacy simple and show aggregate counts only, not item-level private lists.

**Security Requirements**
- Admin APIs must be server-protected, not only hidden in the frontend.
- Non-admin authenticated users receive `403`.
- Unauthenticated users receive `401`.
- Admin responses must use explicit Prisma `select` fields.
- Never return `password`.
- Avoid relation includes that accidentally expose private content.
- Add tests for admin access control.

**Scalability Requirements**
The implementation should be simple but ready for future expansion:

- keep admin code in its own feature folder
- keep `requireAdmin` separate from normal auth
- keep admin API hooks in `client/src/features/admin/api`
- use explicit response types
- avoid mixing admin queries into regular user services
- use route structure that can later support actions like suspend/delete/export
- use `UserRole` now, but avoid hardcoding assumptions that would block future permissions

**Acceptance Criteria**
- Existing users can still register and log in normally.
- A promoted admin can access `/app/admin`.
- Non-admin users cannot access admin pages or admin APIs.
- Admin can view overview metrics.
- Admin can search and page through users.
- Admin can open a read-only user detail page.
- Admin API responses never include password hashes.
- Implementation follows the existing project structure.
