---
globs: "**/migrations/**,**/drizzle/**,**/prisma/**,**/knexfile.*,**/schema*.ts"
---

# Migrations

Migrations are **generated from your schema, ordered, and write-once** — whatever tool you use
(drizzle-kit, Prisma Migrate, Knex, …). The discipline below is the same across tools; adapt the
commands to yours. Setup and query conventions live in `database.md`.

## Rules

- **Generated, never hand-written.** Edit the schema, then run the tool's generate command
  (`drizzle-kit generate`, `prisma migrate dev`, `knex migrate:make`, …) to produce a new numbered
  migration.
- **Write-once.** Never edit or delete a migration once it has been committed or applied to any
  shared database — the statements already ran, you can't un-run them. Fix a mistake with a _new_
  migration that corrects it.
- **Never touch the generated metadata.** Snapshot / journal files (e.g. drizzle's `meta/`,
  `_journal.json`) are how the tool diffs the last known state. Hand-editing them corrupts the
  chain and makes the next generate produce wrong or duplicate SQL. A PreToolUse hook
  (`.claude/hooks/block-manual-migrations.sh`) blocks edits under the migrations directory — point
  it at your tool's directory.
- **Order is history.** Migrations apply in numbered order and are tracked in a migrations table.
  Renaming or reordering them corrupts that history.

## Workflow for a schema change

1. Edit the schema (your ORM's schema file or models).
2. Generate the migration with a descriptive name (e.g. `--name add_user_widgets`).
3. **Review the generated SQL** — confirm it matches intent. Prefer additive changes; a destructive
   change or a data backfill is a deliberate, reviewed step, not a surprise.
4. Apply it locally (the tool's migrate command).
5. Commit the schema change and the generated migration **together**.

## `push` is for throwaway local experiments only

A direct schema-sync command (`drizzle-kit push`, `prisma db push`) skips the migration file. Use
it only for scratch iteration against a local DB you can reset. Anything committed must come from
generate, so the migration history stays the source of truth.
