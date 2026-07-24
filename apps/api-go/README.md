# @repo/api-go

Sample **Connect (Buf) RPC** backend in Go. Implements `notes.v1.NotesService` from
`@repo/proto` — the same contract the Fastify backend (`apps/api-fastify`) implements and
the frontend consumes via `connect-query`. The generated Go lives in `internal/gen/`
(run `npm run generate -w @repo/proto` to regenerate).

## Stack

- **connect-go** on chi v5 — Connect/gRPC/gRPC-Web over plain HTTP
- **pgx v5** (`pgxpool`) for Postgres; hand-written SQL in `internal/store`
- **goose** (embedded) for ordered, write-once migrations, run in-process
- **Clerk** (`clerk-sdk-go/v2`) — bearer-token verification on the protected `DeleteNote`
- **slog** structured logging; graceful shutdown

## Toolchain

Needs Go 1.25+ on PATH (alongside Node 24). Turborepo runs the Go tasks via this
package's scripts (`build`, `check-types` → `go vet`, `test`). Formatting/linting use the
Go tools directly (not wired into npm): `gofmt -w .` and `golangci-lint run ./...`.

## Develop

```bash
docker compose up -d              # local Postgres (repo root)
cp .env.example .env              # set DATABASE_URL + CLERK_SECRET_KEY, then export them
go run ./cmd/api                  # migrations apply on start
```

## Layout

- `cmd/api/main.go` — wiring: config, pool, migrations, chi + connect handler, shutdown
- `internal/rpc/` — the Connect service impl (`notes.go`) + Clerk auth (`auth.go`)
- `internal/store/` — pgx data access + embedded goose migrations
- `internal/rpc/notes_test.go` — RPC tests via a real connect client over `httptest`
- `internal/store/store_test.go` — data-layer tests against real Postgres (testcontainers)

Tests follow `.claude/skills/testing/testing-api.md`: the RPC layer runs through the real HTTP
pipeline with a typed client; the store runs against a real database.
