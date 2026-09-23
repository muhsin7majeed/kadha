# Project Structure Standards

This document defines the target structure for Kadha as the codebase grows. The goal is to keep features easy to find, test, and change without making small changes heavy.

## Migration Phases

### Phase 1: App Boundaries

- Keep server startup separate from Express app creation.
- Keep entry files small and focused on wiring:
  - `server/src/index.ts` starts the process.
  - `server/src/app.ts` creates and configures the Express app.
- Document the target structure before broad file movement.

### Phase 2: Server Feature Modules

- Move server code from global layers into feature modules when a feature has routes, controllers, schemas, and service logic.
- Keep controllers focused on HTTP request and response handling.
- Move business logic, Prisma calls, and external API calls into services or clients.

Target shape:

```text
server/src/features/media/
  media.routes.ts
  media.controller.ts
  media.service.ts
  tmdb.client.ts
  media.schema.ts
  media.types.ts
```

### Phase 3: Client App Boundaries

- Keep client entry files focused on wiring providers and app-level behavior.
- Keep route declarations in a dedicated app route module.
- Keep route-level screens in `client/src/pages`.

Target shape:

```text
client/src/app/
  routes.tsx
```

### Phase 4: Client Feature Modules

- Keep route-level screens in `client/src/pages`.
- Move reusable feature logic into `client/src/features`.
- Avoid placing API hooks or mutation logic under generic UI component folders.

Target shape:

```text
client/src/features/user-media/
  api/
  components/
  hooks/
  user-media.types.ts
```

### Phase 5: Shared Contracts

- Introduce shared request and response contracts once API shapes stabilize.
- Prefer shared Zod schemas or a small contracts package over manually duplicated client/server types.

Potential target:

```text
packages/contracts/
  media.ts
  user-media.ts
  collections.ts
```

### Phase 6: Automated Enforcement

- Add lint rules for import boundaries after feature modules exist.
- Add CI checks for build, lint, and tests across client and server.
- Add focused tests around server services and critical client hooks.

## Current Rules

- The official hosted backend deployment belongs in `deploy/hosted/compose.yaml`; root Compose files remain available for local development and documented self-hosting.
- New server process wiring belongs in `server/src/index.ts`.
- New Express app middleware and route mounting belongs in `server/src/app.ts`.
- New server feature code belongs in `server/src/features/<feature-name>`.
- Feedback persistence, validation, owner/admin query boundaries, open-status filtering, inbox counts, status transitions, and dashboard attention summaries belong in `server/src/features/feedback`; notification creation and browser-push delivery remain in `server/src/features/notification`, while account portability remains in the user feature.
- The admin dashboard read model is composed in `server/src/features/admin/admin.dashboard.service.ts`; source aggregates remain owned by activity, feedback, and provider-usage features.
- Admin user lists use an explicit identity-only projection; privacy settings and aggregate support totals are loaded only by the administrator user-detail service path.
- Account-synced Home layout validation, normalization, and persistence belong in `server/src/features/home-preferences`; export and import orchestration remain in the user feature.
- New server business logic should live in feature services, not controllers.
- Account-deletion impact calculation and transaction orchestration live in the user feature's dedicated
  `account-deletion.service.ts`; reusable collection ownership invariants live in the collection feature.
- New server controllers should stay focused on HTTP request and response handling.
- New client route declarations belong in `client/src/app/routes.tsx`.
- Route-level screens should be lazy-loaded from `client/src/app/routes.tsx` when practical to keep production chunks small.
- New client API hooks should prefer feature folders over generic component folders.
- New client API hooks belong in `client/src/features/<feature-name>/api`, not `client/src/pages/**/apis`.
- Shared admin framing and navigation belong in `client/src/features/admin/components`; admin route screens remain in `client/src/pages/admin`.
- Feature-owned client types belong near the feature, using `client/src/features/<feature-name>/<feature-name>.types.ts`.
- Feature-owned client utilities and hooks belong near the feature, not in generic `client/src/utils` or `client/src/hooks`.
- Home section preferences, the typed Home registry, and personal Home previews belong in `client/src/features/home`; reusable global catalog rows belong in `client/src/features/discovery`.
- Collection list presentation and collection-owned UI belong in `client/src/features/collections`; authenticated list and details screens belong in `client/src/pages/collections`, while public collection details remain in `client/src/pages/public-collection`.
- Public profile collection lists return privacy-safe summaries and item counts rather than embedded media or collaborator details; full collection data is loaded only on an authorized details route.
- Owner-scoped tracked schedule resolution belongs in `server/src/features/upcoming`; Upcoming query state, list entries, and calendar rendering belong in `client/src/features/upcoming`.
- Shared UI-only components can remain in `client/src/components`.
- Repeated compound controls with Kadha-specific behavior or palette defaults belong in `client/src/components` using the `SimpleX` naming convention. The current canonical wrappers are `SimpleTabs`, `SimpleCheckbox`, `SimpleRadioGroup`, and `SimpleCheckboxCard`.
- Ordinary Chakra `Button`, `IconButton`, `Input`, and `NativeSelect` usage does not require a wrapper; use the global theme default and explicit semantic `colorPalette` values at the call site.
- Shared generic utilities can remain in `client/src/utils`.
- Shared generic hooks can remain in `client/src/hooks`.
- Query keys should be centralized or colocated consistently by feature, not mixed inline.

## Enforcement Plan

The client theme sets `brand` as the global interactive palette, while explicit semantic palettes document deliberate neutral, destructive, status, media, and presentation exceptions.

The client ESLint configuration currently enforces:

1. Direct production `Button` and `IconButton` usage declares an intentional `colorPalette`.
2. Production code uses Chakra primitives instead of raw HTML `button`, `input`, `select`, or `textarea` controls.
3. Standard repeated compound controls use the canonical `SimpleX` wrappers where their API fits.

Theme contract tests cover the global palette and shared wrapper defaults. Continue adding focused tests when a new reusable control or theme behavior is introduced. Import-boundary lint rules remain a future step after the client feature boundaries need stronger enforcement.
