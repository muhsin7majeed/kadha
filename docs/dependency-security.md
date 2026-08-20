# Dependency Security

Kadha checks the production dependency trees for the client and server in CI and on a weekly schedule. High and critical advisories fail the check unless a repository-owned exception documents why the affected code path is not used and when the exception must be reviewed.

Run the same checks locally from the repository root:

```bash
docker compose run --rm --no-deps --volume "$PWD:/workspace" --workdir /workspace server node scripts/audit-production.mjs server
docker compose run --rm --no-deps --volume "$PWD:/workspace" --workdir /workspace client node scripts/audit-production.mjs client
```

Exceptions live in `security/npm-audit-exceptions.json`. Each exception must identify the workspace, npm advisory ID, package, review deadline, and applicability rationale. Expired and stale exceptions fail the audit so they cannot remain silently after the advisory no longer applies.

## Prisma Node Engine Warning

Prisma 7.9.1 supports Node 20.19 or newer, matching Kadha's Node 20 image. Its unused `@prisma/streams-local` development-tooling dependency currently declares Node 22 and produces a non-failing install warning. Kadha's Prisma client generation, server build, production image, and existing-database migration checks pass on Node 20. Recheck this transitive constraint during the next Prisma or Node runtime upgrade.

## Current Prisma Configuration Exception

Prisma 7.9.1 pins `deepmerge-ts` 7.1.5 in its configuration tooling. npm advisory `1145093` requires
attacker-controlled recursive object graphs to reach the affected merge API. Kadha loads a static, repository-owned
Prisma configuration during builds, migrations, and startup; it does not pass request data or other user-controlled
objects into this path.

`deepmerge-ts` 8 contains the upstream fix, but forcing that major version underneath Prisma would bypass Prisma's
tested dependency constraint. Review the exception before 2026-10-31, or sooner when Prisma adopts the fixed major.
