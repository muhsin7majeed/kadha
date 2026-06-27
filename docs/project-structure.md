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

### Phase 3: Client Feature Modules

- Keep route-level screens in `client/src/pages`.
- Move reusable feature logic into `client/src/features`.
- Avoid placing API hooks or mutation logic under generic UI component folders.

Target shape:

```text
client/src/features/user-media/
  api/
  components/
  hooks/
  types.ts
```

### Phase 4: Shared Contracts

- Introduce shared request and response contracts once API shapes stabilize.
- Prefer shared Zod schemas or a small contracts package over manually duplicated client/server types.

Potential target:

```text
packages/contracts/
  media.ts
  user-media.ts
  collections.ts
```

### Phase 5: Automated Enforcement

- Add lint rules for import boundaries after feature modules exist.
- Add CI checks for build, lint, and tests across client and server.
- Add focused tests around server services and critical client hooks.

## Current Rules

- New server process wiring belongs in `server/src/index.ts`.
- New Express app middleware and route mounting belongs in `server/src/app.ts`.
- New server business logic should avoid growing controllers when a service/helper is a clearer home.
- New client API hooks should prefer feature folders over generic component folders.
- Shared UI-only components can remain in `client/src/components`.
- Query keys should be centralized or colocated consistently by feature, not mixed inline.

## Enforcement Plan

Start with documentation and review discipline, then add automation once the folder boundaries are stable:

1. Add root workspace scripts for `build`, `lint`, `format`, and eventually `test`.
2. Add CI jobs that run those scripts for every pull request.
3. Add import-boundary lint rules after `client/src/features` and `server/src/features` are established.
4. Add tests around the service layer before major controller refactors.
