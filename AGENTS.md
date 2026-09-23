# AGENTS.md

## Working Agreement

- Always confirm with the user before making code changes.
- Write readable, reliable, maintainable, and scalable code and solutions.
- Keep changes focused on the requested behavior and avoid unrelated refactors.
- When discussing features, bugs, polish, or product behavior, suggest small opportunities for easter eggs or humor when they fit naturally. Keep them subtle, genuine, and grounded in a solo developer's voice; avoid jokes, wording, or surprises that feel forced, distracting, or like they are trying too hard.
- Write public product copy in a simple, candid, first-person solo-developer voice. Be direct about limits and tradeoffs without sounding defensive, passive-aggressive, or corporate.
- Add code comments only when they are actually useful. Do not add comments for the sake of adding comments.
- Avoid using `any` in TypeScript. Prefer precise types, `unknown` with narrowing, generics, or existing domain types.
- Ask before adding production dependencies or changing deployment/runtime assumptions.

## Code Quality And Incremental Refactoring

- Treat readability and maintainability as correctness requirements. Passing tests do not make unnecessarily tangled, duplicated, or poorly structured code acceptable.
- Prefer clear domain boundaries, cohesive modules, small named functions, and explicit control flow over oversized multi-purpose services, deeply nested conditionals or ternaries, and dense inline query construction.
- Reuse existing domain logic and established framework or library capabilities before writing custom equivalents. Introduce a new dependency only when it materially simplifies the solution, and ask first as required above.
- When touching an area, actively check for the same UI or domain pattern elsewhere. Surface real duplication and propose a shared primitive before copying it again; ask before broadening the change unless the abstraction is already approved.
- Avoid premature abstractions: extract shared code when duplication is real or a domain concept has a clear independent responsibility, not merely because two snippets look similar.
- When feature work touches problematic code, refactor the relevant area enough to leave it clearer, cohesive, and maintainable. Keep that cleanup bounded to the behavior being changed rather than turning it into an unrelated whole-file rewrite.
- Do not duplicate filters, sorting rules, validation, or business decisions across multiple query paths without a strong reason. When duplication is unavoidable, centralize the contract where practical and add tests that keep the implementations aligned.
- If safe incremental cleanup is not practical within the requested change, explain the debt and risk explicitly instead of silently extending the problematic pattern.

## Project Overview

- Kadha is a self-hostable app for tracking movies and TV shows.
- The frontend is a React SPA built with Vite and deployable to GitHub Pages, static hosting, or a frontend Docker container.
- The backend is Node.js with Express, Prisma, and SQLite, deployable with Docker.
- Docker Compose is the primary local development path.

## Local Development

- Use Docker Compose for local dev servers instead of running client or server dev scripts directly.
- Root Docker command: `docker compose up --build`
- Client app: `http://localhost:3000`
- API server: `http://localhost:5000`
- Root `.env` is the primary env file for Docker Compose local development.
- If running the server directly from `server/`, use `server/.env` with the same server variables.

## Verification Commands

- Client install: `docker compose run --rm client npm ci`
- Client build: `docker compose run --rm client npm run build`
- Client lint: `docker compose run --rm client npm run lint`
- Client tests: `docker compose run --rm client npm test`
- Server install: `docker compose run --rm server npm ci`
- Server build: `docker compose run --rm server npm run build`
- Server tests: `docker compose run --rm server npm test`

Run the most relevant build, lint, or test command for the area changed. Pull request CI intentionally skips the client and server test suites, so run relevant tests locally before pushing. If verification cannot be run, explain why.

## Server Structure

- Keep server startup separate from Express app creation.
- Process startup belongs in `server/src/index.ts`.
- Express app setup, middleware, and route mounting belong in `server/src/app.ts`.
- New server feature code belongs in `server/src/features/<feature-name>`.
- Keep controllers focused on HTTP request and response handling.
- Put business logic, Prisma calls, and external API calls in feature services or clients, not controllers.
- Prefer feature-owned schemas and types near the feature.

Target server feature shape:

```text
server/src/features/media/
  media.routes.ts
  media.controller.ts
  media.service.ts
  tmdb.client.ts
  media.schema.ts
  media.types.ts
```

## Client Structure

- Keep client entry files focused on wiring providers and app-level behavior.
- New route declarations belong in `client/src/app/routes.tsx`.
- Route-level screens belong in `client/src/pages`.
- Lazy-load route-level screens from `client/src/app/routes.tsx` when practical.
- Reusable feature logic belongs in `client/src/features`.
- New client API hooks belong in `client/src/features/<feature-name>/api`, not under page folders.
- Feature-owned client types belong near the feature, such as `client/src/features/<feature-name>/<feature-name>.types.ts`.
- Feature-owned utilities and hooks should live near the feature instead of generic `client/src/utils` or `client/src/hooks`.
- Before creating a new shared or feature UI component, search for an existing component that already covers the behavior and reuse or extend it when practical.
- Use theme-aware Chakra styling for UI controls. Buttons and icon buttons must set an intentional `colorPalette` for primary, destructive, status, or branded actions; neutral secondary actions should use an explicit neutral palette such as `gray` with the appropriate variant instead of relying on Chakra defaults. The client lint configuration enforces this for direct production usage.
- Use `brand` as the default application palette for interactive states. Keep explicit `gray`, destructive, status, media-type, and presentation palettes when they communicate a deliberate distinction.
- Use existing `SimpleX` components as the canonical Kadha wrappers for repeated compound controls: `SimpleTabs`, `SimpleCheckbox`, `SimpleRadioGroup`, and `SimpleCheckboxCard`. Do not add thin wrappers for ordinary Chakra `Button`, `IconButton`, `Input`, or `NativeSelect` usage without a demonstrated behavioral need.
- Use the semantic responsive typography roles defined in `client/src/theme/text-styles.ts` for standard application text such as page, section, subsection, and card titles, body copy, supporting text, and compact labels. Prefer these shared `textStyle` roles over repeated responsive `fontSize`, component `size`, or ad hoc text-style values.
- Do not implement responsive typography by scaling the root or body font size. Keep explicit responsive sizing for genuinely unique display or hero treatments, and add or extend a semantic text style when a reusable application role is missing.
- Run `npm run typegen` from `client/` after adding or changing custom Chakra theme values, including semantic text styles.
- Shared UI-only components can remain in `client/src/components`.
- Shared generic utilities can remain in `client/src/utils`.
- Shared generic hooks can remain in `client/src/hooks`.
- Keep query keys centralized or colocated consistently by feature; do not mix inline patterns.
- Use configured import aliases instead of relative parent-path imports in client code. Use `@/*` for `client/src/*`.
- Do not import files outside the client package directly from client source. If client code needs repository-root content, generate or copy a client-owned artifact.

## Configuration Notes

- Frontend build-time variables use the `VITE_` prefix.
- If `VITE_APP_NAME`, `VITE_APP_URL`, or `VITE_API_URL` changes, rebuild the frontend.
- `APP_URL` is the public app URL used by the server for generated links and public output.
- `CLIENT_URL` is the frontend origin allowed by the API for CORS and authenticated cookie requests.
- Keep secrets out of committed files.

## Instance Branding

- Treat `VITE_APP_NAME` and server-side `APP_NAME` as the configured display name for a self-hosted instance. User-visible runtime copy must use the configured name or avoid naming the product; do not add new hardcoded `Kadha` display strings.
- Keep compatibility identifiers stable even when display branding changes, including `KADHA_USERS`, `kadha-data-export`, the `KADHA-` recovery-code prefix, storage keys, CSS class or variable names, and import/export schema identifiers.
- When adding a new user-visible branding surface, check browser metadata, PWA/service-worker notifications, downloaded filenames, auth/recovery copy, and generated links as well as the main UI.

## Documentation

- Before making changes, read `CHANGELOG.md` when it exists so you understand the latest user-facing and engineering changes.
- Update `CHANGELOG.md` for user-visible feature changes, engineering-significant changes, dependency or deployment changes, database migrations, and behavior fixes that end users or maintainers should know about.
- Keep the top changelog section focused on end-user feature changes, then include engineering notes below it.
- Keep `README.md` aligned with setup, deployment, and operations changes.
- Keep `docs/project-structure.md` aligned when changing architectural boundaries or placement rules.
- Update `roadmap.md` whenever a feature is added, removed, completed, deferred, or materially changed, and keep its shipped and planned checkboxes accurate in the same change.
- When adding or changing user-owned preferences, assess whether they belong in account export and import. Include portable preferences by default, or document why an intentional exclusion is necessary.

## Release And Changelog Workflow

- During normal feature work, add changelog entries under `## Unreleased`.
- Do not create a new version section for every feature commit.
- When `Unreleased` contains enough user-visible or maintainer-significant changes to justify a release, tell the user before starting additional unrelated changes and recommend cutting a release first.
- A release is usually appropriate when `Unreleased` includes shipped user-facing features, behavior fixes, migrations, deployment/runtime changes, release workflow changes, or several related engineering changes that should be grouped for operators.
- Do not cut a release without explicit user approval.
- When cutting a release:
  - Run `node scripts/prepare-release.mjs X.Y.Z` from the repository root, using a SemVer version without a leading `v`.
  - The release script renames the current `## Unreleased` content to `## vX.Y.Z`, creates a fresh `## Unreleased` section, and bumps client and server package versions and lockfile root versions.
  - Review the generated diff before committing and make sure `CHANGELOG.md` and client/server package files are consistent.
  - Run the relevant build, lint, or test commands.
  - Commit the version and changelog updates as a release commit, such as `Release vX.Y.Z`.
  - Tag the release commit as `vX.Y.Z` and push `master` with tags. The GitHub Release workflow creates a release from the matching `CHANGELOG.md` section when the tag is pushed.
- After a release, keep future changes under the fresh empty `## Unreleased` section.
