# Starting a new project from this boilerplate

A step-by-step runbook for the agent (and human) setting up a fresh project from this starter.
Work top to bottom. Each step says **where** to change things, **how**, and when to **delete**
the piece instead of filling it. After each step, the repo should still pass
`npm run lint && npm run format:check && npm run check-types && npm run test && npm run build`.

The starter ships intentional blanks — templates (`VISION.md`, `CONTEXT.md`), a design-lint
burn-down baseline, and an example DB setup. "Backfilling" means turning each blank into a real
decision or deleting it. A shipped template is worse than none.

## 0. Prerequisites

```bash
. "$NVM_DIR/nvm.sh" && nvm use   # Node 24.x (.nvmrc); do NOT proceed on a different major
npm install
```

Confirm the toolchain is green before changing anything:

```bash
npm run lint && npm run format:check && npm run check-types && npm run test && npm run build
```

## 1. Claim the repo

- **`package.json`** (root) — change `"name": "monorepo-boilerplate"` to your project. The
  workspace packages are scoped `@repo/*`; keep that or rename consistently across
  `packages/*/package.json` and their importers.
- **`README.md`** — replace the Turborepo starter blurb with what this project is.
- **Git remote** — point `origin` at the new repo:
  `git remote set-url origin git@github.com:<org>/<repo>.git`. Never keep the boilerplate's
  remote.

## 2. Vision — fill or delete

- **Fill:** author `VISION.md` (north star, guiding principle, values, components, non-goals, open
  questions — the file coaches you through each). Then compress it into `.claude/vision-digest.md`
  (north star + values). The digest is injected every session by the `SessionStart` hook.
- **Delete:** if the project doesn't warrant a vision, delete `VISION.md` **and**
  `.claude/vision-digest.md`, **and** remove the `SessionStart` hook block from
  `.claude/settings.json`. Don't leave the template injecting itself every session.

## 3. Domain / context — fill or delete

- **Fill:** author `CONTEXT.md` (ubiquitous language, key concepts, invariants). The
  `domain-modeling` and `diagnosing-bugs` skills read it.
- Record architectural decisions in `docs/adr/` as you make them (`docs/adr/README.md` has the
  format). The seed ADR `0001` explains the practice — keep it.
- **Delete `CONTEXT.md`** if there's no domain worth pinning down yet; add it later.

## 4. Design system — replace the reflex defaults

The starter ships **purple-by-default** components (the canonical AI-slop tell), grandfathered in
`scripts/design-lint-baseline.json`. Give the product a real look:

- Define real tokens in **`packages/tailwind-config/shared-styles.css`** (`@theme`) — a named brand
  accent chosen for a reason, a neutral scale. Keep type on the token (Geist ships by default).
- Replace the `purple-*`/raw-neutral classes in the three baselined components
  (`packages/ui/src/{button,dialog,input}`), then **remove those files from
  `scripts/design-lint-baseline.json`** so the ratchet can't regress. `npm run lint` fails if a
  baselined file is now clean but still listed — that's the burn-down working.
- Follow the `design` skill (`.claude/skills/design/design.md` and `design-anti-slop.md`); run `/design-review` on UI diffs.

## 5. Database — set up or delete

The starter has **no database wired in**, only the convention and a local Postgres for when you add
one (the `database` skill at `.claude/skills/database/` + `.claude/rules/migrations.md`).

- **Set up:** pick your stack (Postgres + a typed ORM is the house default). `docker compose up -d`
  starts local Postgres; `cp .env.example .env` and set `DATABASE_URL`. Add your ORM, put the
  schema in one place, and point `.claude/hooks/block-manual-migrations.sh` at your tool's
  migrations directory. Follow `migrations.md` for the write-once workflow.
- **Delete (no DB):** remove `docker-compose.yml`, `.env.example`, `.claude/skills/database/`,
  `.claude/rules/migrations.md`, and `.claude/hooks/block-manual-migrations.sh` (and its entry in
  `.claude/settings.json` `PreToolUse`).

## 6. MCP servers

`.mcp.json` ships `context7` (live library docs) and `chrome-devtools` (drive/inspect the app to
verify UI). Keep them, add your own, or trim — and mirror the list in
`.claude/settings.json` `enabledMcpjsonServers`.

## 7. Skills

`.claude/skills/` is vendored via `npx skills` and tracked in `skills-lock.json`.

- **Prune** what you don't want with `npx skills remove <name>` (keeps the lockfile in sync — don't
  hand-delete). Matt Pocock's `personal/` (`obsidian-vault`, `edit-article`, `ask-matt`) and
  `in-progress/` skills are prime candidates.
- **Configure** the engineering skills for this repo: run `/setup-matt-pocock-skills` once (issue
  tracker, triage labels, domain-doc layout).
- `react-doctor` is repo-owned; keep it for React projects, delete the folder otherwise.

## 8. Strip the demo

Remove the starter's example surfaces you won't use:

- `apps/app/src/routes/about.tsx`, `apps/app/src/routes/components.tsx` (demo routes — the router
  regenerates `routeTree.gen.ts` on the next `dev`/`build`).
- Demo UI in `packages/ui/src/` you don't need (`turborepo-logo`, `gradient`).
- Rewrite `apps/app/src/routes/index.tsx` into your real landing surface.

## 9. Feedback loops

- `.claude/rules/mistakes.md` starts empty — append with `/learn` when a mistake is worth not
  repeating.
- CI (`.github/workflows/ci.yml`) targets `main`. If your default branch differs, update it; the
  coverage baseline is seeded on the first push to the default branch.

## 10. Verify, then start real work

```bash
npm run lint && npm run format:check && npm run check-types && npm run test && npm run build
```

All green → begin. Use `/start <issue>` to pick up scoped work (vision-anchored), or `/bootstrap`
to plan a greenfield area into issues first. `/finish` runs the full completion gate before you
call anything done.
