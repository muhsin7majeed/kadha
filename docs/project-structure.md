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
  types.ts
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

- New server process wiring belongs in `server/src/index.ts`.
- New Express app middleware and route mounting belongs in `server/src/app.ts`.
- New server feature code belongs in `server/src/features/<feature-name>`.
- New server business logic should live in feature services, not controllers.
- New server controllers should stay focused on HTTP request and response handling.
- New client route declarations belong in `client/src/app/routes.tsx`.
- New client API hooks should prefer feature folders over generic component folders.
- New client API hooks belong in `client/src/features/<feature-name>/api`, not `client/src/pages/**/apis`.
- Shared UI-only components can remain in `client/src/components`.
- Query keys should be centralized or colocated consistently by feature, not mixed inline.

## Enforcement Plan

Start with documentation and review discipline, then add automation once the folder boundaries are stable.

Root scripts are provided as a convenience command layer only. They do not use npm workspaces, and they do not replace the existing `client/package-lock.json` or `server/package-lock.json` install model used by Docker and GitHub Actions.

Available root commands:

```bash
npm run check:structure
npm run client:build
npm run server:build
npm run build
npm run check
```

`npm run check:structure` blocks these legacy locations:

```text
client/src/pages/**/apis/*
server/src/controllers/*
server/src/routes/*
server/src/schemas/*
```

Next enforcement steps:

1. Add CI jobs that run root `npm run check` once both client and server builds are expected for every pull request.
2. Add import-boundary lint rules after lint is clean enough to be a reliable gate.
3. Add tests around the service layer before major behavioral refactors.
