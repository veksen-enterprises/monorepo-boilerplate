# @repo/api-fastify

Sample **Connect (Buf) RPC** backend on Fastify 5. Implements `notes.v1.NotesService`
from `@repo/proto` — the same contract the Go backend (`apps/api-go`) implements and the
frontend consumes via `connect-query`.

## Stack

- **Fastify 5** + `@connectrpc/connect-fastify` — Connect/gRPC/gRPC-Web over plain HTTP
- **Drizzle ORM** + `postgres` (Postgres), migrations generated write-once via drizzle-kit
- **pglite** for tests — real Postgres in-process, no Docker
- **Clerk** (`@clerk/backend`) — bearer-token verification on protected RPCs

## Develop

```bash
docker compose up -d              # local Postgres (repo root)
cp .env.example .env              # set DATABASE_URL + CLERK_* keys
npm run db:migrate -w @repo/api-fastify
npm run dev -w @repo/api-fastify
```

## The contract

Edit `packages/proto/proto/notes/v1/notes.proto`, then regenerate both backends + the
frontend client:

```bash
npm run generate -w @repo/proto
```

## Layout

- `src/rpc/notes.routes.ts` — the Connect service implementation (the HTTP boundary)
- `src/services/notes.service.ts` — business logic + data access
- `src/db/` — Drizzle schema, client, migrator
- `src/rpc/notes.routes.test.ts` — RPC tests via an in-memory Connect client
- `src/services/notes.service.test.ts` — data-layer tests against a real (pglite) DB

Tests follow `.claude/skills/testing/testing-api.md`: the RPC layer is driven through the real
service impl via `createRouterTransport`; the data layer runs against a real database.
