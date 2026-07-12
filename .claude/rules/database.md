---
globs: "**/db/**,**/schema*.ts,**/drizzle.config.*,**/prisma/**,docker-compose.yml,.env.example"
---

# Database

No database is wired into this starter — this is the convention for **when you add one**.
Postgres + a typed ORM/query builder is the house default (Drizzle, Prisma, Kysely, Knex;
your call). Migration discipline lives in `migrations.md`; this file is setup and queries.

## Local database

- `docker-compose up -d` starts a local Postgres — swap the image/engine if your stack differs.
- `cp .env.example .env` and set `DATABASE_URL`. `.env` is gitignored; never commit secrets.
- Read the connection string from the environment and fail fast if it's missing — don't hard-code
  it or default to a shared database.

## Schema & queries

- Keep the schema in one place (your ORM's schema file). It is the source of truth; the database
  is derived from it via migrations.
- Prefer the typed query builder over raw SQL. When raw SQL is unavoidable, parameterize it —
  never interpolate user input into a query string.
- Any schema change goes through a migration — see `migrations.md`.
- If you have a query-analysis tool (an `EXPLAIN`/planner, a Query Doctor-style MCP), validate the
  plan of any new or changed query instead of reasoning about it by hand.
