
Use small AI-agent tasks and keep each change reviewable. The goal is to reduce architectural risk without turning this into a broad rewrite.

**Phase 1: Auth And Session Reliability**

1. **Create a single auth/session facade**
   - Route guards should consume one `useAuth` hook.
   - Avoid manually creating partial user objects after login/register.
   - Login/register should set the token, clear/invalidate auth data, then refetch `/me`.

   Agent task:
   ```text
   Refactor frontend auth so route guards consume a single `useAuth` hook. The hook should derive status and user from the current `/me` query/session state. Remove partial user objects from login/register success handlers. Preserve current navigation behavior.
   ```

2. **Handle token refresh failure centrally**
   - On refresh failure, clear the token and app auth state.
   - Ensure protected routes stop rendering after session expiry.
   - Keep this logic in one place instead of scattering logout behavior.

   Agent task:
   ```text
   Add a central session-expired/logout handler used by the Axios refresh interceptor. It should clear the access token and auth/query state so route guards treat the user as unauthenticated. Do not add new dependencies.
   ```

**Phase 2: Media Model Cleanup**

3. **Introduce a normalized `MediaCardModel`**
   - `MediaCard` should not accept multiple incompatible domain models.
   - Add adapters for movie, TV, user media, and collection media.
   - Remove casts from `MediaCard`.

   Agent task:
   ```text
   Create a normalized `MediaCardModel` for media card rendering. Refactor `MediaCard` to accept only this model. Add adapter functions for existing movie, TV, user-media, and collection-media callers. Remove type assertions from `MediaCard`.
   ```

4. **Centralize media action payload creation**
   - Avoid duplicated payload creation in cards and media details.
   - Use one utility to convert normalized media/detail data into `UserMediaPayload`.

   Agent task:
   ```text
   Extract a shared utility for building `UserMediaPayload` from supported media UI models/details. Refactor media card actions and media details hero actions to use it. Preserve existing liked/watched/watchlist behavior.
   ```

**Phase 3: Cache And Query Cleanup**

5. **Group query keys by feature**
   - Keep keys typed and predictable.
   - Avoid generic `unknown` params where concrete params exist.
   - Add feature-owned invalidation helpers.

   Agent task:
   ```text
   Refactor query keys into typed feature groups while preserving existing key values. Add small feature-owned invalidation helpers for user-media, collections, friendship, notifications, and admin where useful.
   ```

6. **Reduce brittle manual cache patching**
   - Keep direct patching only where UX clearly benefits.
   - Use invalidation for broader or uncertain query shapes.
   - Make the updater depend on normalized media identity rather than response-specific assumptions.

   Agent task:
   ```text
   Simplify `updateMediaActionCache` by replacing broad query-shape assumptions with safer typed helpers and targeted invalidation where appropriate. Preserve the current instant UI update behavior for visible media actions.
   ```

**Phase 4: Feature Boundary Cleanup**

7. **Move reusable page-owned components into features**
   - `FriendshipActions` should not live under `pages` if feature components import it.
   - Move reusable social/profile UI into feature folders.

   Agent task:
   ```text
   Move reusable friendship UI currently imported from `pages` into `features/friendship/components`. Update imports and keep behavior unchanged.
   ```

8. **Move domain normalization out of pages**
   - Collection media parsing should live in the collections feature.
   - Activity/notification metadata parsing should be centralized.

   Agent task:
   ```text
   Extract collection media normalization and genre ID parsing into `features/collections/utils`. Refactor collection pages and profile collection tabs to use the utility.
   ```

**Phase 5: Routing And Page Organization**

9. **Split route declarations by domain**
   - Keep `AppRoutes` as the top-level composition.
   - Extract auth, app, admin, profile, and friendship route groups.
   - Preserve lazy loading.

   Agent task:
   ```text
   Split `client/src/app/routes.tsx` into smaller route modules by domain. Preserve all paths, redirects, lazy loading, and route guards.
   ```

10. **Thin large route-level pages**
   - Pages should orchestrate hooks/layout.
   - Move complex UI sections into feature-owned components.
   - Start with one page at a time.

   Agent task:
   ```text
   Refactor one large route-level page into smaller feature-owned components without changing behavior. Start with `admin/users` or `settings`. Keep the page as orchestration only.
   ```

**Phase 6: Accessibility And Consistency**

11. **Fix accessibility gaps**
   - Add labels to form controls.
   - Add `aria-label`s to icon-only buttons.
   - Avoid placeholder-only inputs where practical.

   Agent task:
   ```text
   Audit media action buttons, auth forms, collection forms, and search controls for accessible names. Add labels or aria labels while preserving the current visual design.
   ```

12. **Apply low-risk consistency cleanup**
   - Rename `MediaCarousal` to `MediaCarousel`.
   - Remove duplicate nested wrappers.
   - Standardize mutation error typing.
   - Use explicit neutral `colorPalette` where missing.

   Agent task:
   ```text
   Apply low-risk frontend cleanup: rename `MediaCarousal` to `MediaCarousel`, remove duplicate nested form wrappers, standardize mutation error typing, and ensure Chakra buttons use intentional color palettes.
   ```

**Recommended Order**

1. Auth/session cleanup.
2. Media model normalization.
3. Media action payload utility.
4. Query key/cache cleanup.
5. Feature boundary cleanup.
6. Domain normalization extraction.
7. Route split.
8. Page thinning.
9. Accessibility pass.
10. Naming and consistency cleanup.

**Instruction Block For Each AI Agent Task**

```text
Before editing, inspect the relevant files and summarize the intended changes.
Keep behavior unchanged unless explicitly fixing a reviewed issue.
Do not introduce production dependencies without approval.
Use existing project patterns and Chakra UI conventions.
Use precise TypeScript types; do not add `any`.
Keep changes focused and avoid unrelated refactors.
Run the relevant Docker Compose build/lint command after changes.
Update CHANGELOG.md only for user-visible behavior fixes or engineering-significant changes.
```

**Best First Milestone**

Start with auth/session cleanup, media card normalization, and moving `FriendshipActions` into the friendship feature. Those give the biggest maintainability improvement without requiring a full redesign.
