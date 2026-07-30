# Dependency Security

Kadha checks the production dependency trees for the client and server in CI and on a weekly schedule. High and critical advisories fail the check unless a repository-owned exception documents why the affected code path is not used and when the exception must be reviewed.

Run the same checks locally from the repository root:

```bash
docker compose run --rm --no-deps --volume "$PWD:/workspace" --workdir /workspace server node scripts/audit-production.mjs server
docker compose run --rm --no-deps --volume "$PWD:/workspace" --workdir /workspace client node scripts/audit-production.mjs client
```

Exceptions live in `security/npm-audit-exceptions.json`. Each exception must identify the workspace, npm advisory ID, package, review deadline, and applicability rationale. Expired and stale exceptions fail the audit so they cannot remain silently after the advisory no longer applies.

## Current React Router Exception

The client is pinned to React Router 7.18.2. npm advisory `1124282` covers React Server Components action handling, while Kadha is a client-rendered Vite SPA and does not use React Server Components, framework actions, or server-side React Router request handling.

React Router 8.3.0 contains the upstream fix but requires Node 22.22 or newer. Kadha currently builds with Node 20, so upgrading would change the supported build and deployment runtime. Review the exception before 2026-10-31, or sooner if a compatible React Router 7 fix becomes available.

## Prisma Node Engine Warning

Prisma 7.9.1 supports Node 20.19 or newer, matching Kadha's Node 20 image. Its unused `@prisma/streams-local` development-tooling dependency currently declares Node 22 and produces a non-failing install warning. Kadha's Prisma client generation, server build, production image, and existing-database migration checks pass on Node 20. Recheck this transitive constraint during the next Prisma or Node runtime upgrade.
