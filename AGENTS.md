# AGENTS.md

## Working Agreement

- Always confirm with the user before making code changes.
- Write readable, reliable, maintainable, and scalable code and solutions.
- Keep changes focused on the requested behavior and avoid unrelated refactors.
- Add code comments only when they are actually useful. Do not add comments for the sake of adding comments.
- Avoid using `any` in TypeScript. Prefer precise types, `unknown` with narrowing, generics, or existing domain types.
- Ask before adding production dependencies or changing deployment/runtime assumptions.

## Project Overview

- Kadha is a self-hostable app for tracking movies and TV shows.
- The frontend is a React SPA built with Vite and deployable to GitHub Pages, static hosting, or a frontend Docker container.
- The backend is Node.js with Express, Prisma, and SQLite, deployable with Docker.
- Docker Compose is the primary local development path.

## Local Development

- Root Docker command: `docker compose up --build`
- Client app: `http://localhost:3000`
- API server: `http://localhost:5000`
- Root `.env` is the primary env file for Docker Compose local development.
- If running the server directly from `server/`, use `server/.env` with the same server variables.

## Verification Commands

- Client install: `cd client && npm ci`
- Client build: `cd client && npm run build`
- Client lint: `cd client && npm run lint`
- Server install: `cd server && npm ci`
- Server build: `cd server && npm run build`
- Server tests: `cd server && npm test`

Run the most relevant build, lint, or test command for the area changed. If verification cannot be run, explain why.

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
- Shared UI-only components can remain in `client/src/components`.
- Shared generic utilities can remain in `client/src/utils`.
- Shared generic hooks can remain in `client/src/hooks`.
- Keep query keys centralized or colocated consistently by feature; do not mix inline patterns.

## Configuration Notes

- Frontend build-time variables use the `VITE_` prefix.
- If `VITE_APP_NAME`, `VITE_APP_URL`, or `VITE_API_URL` changes, rebuild the frontend.
- `APP_URL` is the public app URL used by the server for generated links and public output.
- `CLIENT_URL` is the frontend origin allowed by the API for CORS and authenticated cookie requests.
- Keep secrets out of committed files.

## Documentation

- Keep `README.md` aligned with setup, deployment, and operations changes.
- Keep `docs/project-structure.md` aligned when changing architectural boundaries or placement rules.
