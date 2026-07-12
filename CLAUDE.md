# monorepo-boilerplate

Turborepo starter for Vite + React apps with a shared Base UI component library.

**Read `VISION.md` for product direction** — the north star, guiding principle,
values, components, non-goals, and open questions. Use it to judge whether a change
serves the product. (It ships as a template; fill it before building features. The
always-on short form is `.claude/vision-digest.md`, injected each session.)

## Stack

- TypeScript, React 19 (React Compiler), Vite (rolldown-vite), TanStack Router
- Monorepo: Turborepo + npm workspaces (Node 24.x)
- UI: Base UI + `@repo/ui`, Tailwind CSS v4, CVA
- Linter: OxLint | Formatter: OxFmt | Tests: Vitest + Testing Library

## Node Version

This project requires **Node 24.x** (see `.nvmrc` and `engines` in `package.json`). If your shell uses nvm, activate it once at the start of the session:

```bash
. "$NVM_DIR/nvm.sh" && nvm use
```

If `node --version` does not show `v24.x`, do NOT proceed with npm commands.

## Commands

```
npm run lint          # oxlint
npm run lint:fix      # oxlint --fix
npm run format        # oxfmt (write)
npm run format:check  # oxfmt (check only)
npm run check-types   # turbo run check-types (tsc --noEmit)
npm run test          # turbo run test
npm run test:coverage # turbo run test:coverage
npm run build         # turbo run build
```

Do NOT run `npm run dev` or `npm run build` unless explicitly asked (`dev` is long-running and noisy).

## Architecture

- `apps/app/` — Main Vite + React application (TanStack Router; `routeTree.gen.ts` is generated)
- `packages/ui/` — Shared React component library (Base UI + CVA)
- `packages/typescript-config/` — Shared TypeScript configs
- `packages/tailwind-config/` — Shared Tailwind CSS config
- `packages/vitest-config/` — Shared Vitest config

## Workflow — ALWAYS Follow This Order

1. **Research** — Read docs, source, and existing patterns first. If unfamiliar with a library/API, research it (WebFetch, docs, subagents). DO NOT guess. See `.claude/rules/research.md`.
2. **Plan** — State what you'll do and why BEFORE writing code. Get confirmation on non-trivial changes. Use `/plan`.
3. **Implement** — Write the code. Follow existing patterns (`.claude/rules/code-quality.md`).
4. **Test** — Run the full test suite. Tests must pass. Write new tests for new code (`.claude/rules/testing.md`).
5. **Lint & Format** — `npm run lint:fix && npm run format`. Fix all issues.
6. **Check types & Build** — `npm run check-types` then `npm run build`. Fix any errors.
7. **Self-review** — Review your own diff as a senior engineer. Use `/review`.
8. **Rebase & Validate** — Rebase against `main`, then re-run tests/lint/format/check-types/build.
9. **Verify** — Never say "done" unless proven. Use `/finish` for the full checklist.

## Honesty Policy

- NEVER say something works if you cannot validate it.
- NEVER say something is complete if you haven't verified it.
- If unsure, ASK. Don't guess, don't take shortcuts.
- If a fix fails twice for the same issue, STOP. Analyze root cause first.

## Git Workflow

- Feature branches only. NEVER commit to `main`.
- Branch: `<type>/<short-description>` (e.g. `feat/user-menu`, `fix/null-search`).
- Commits: `<type>(<scope>): <message>` — one logical change per commit.
- Before completing: rebase against `main`, re-run all checks.
- Never force-push shared history or expose secrets.

See `.claude/rules/git-workflow.md` for full conventions.

## Code Comments

- Explain WHY, not WHAT. Only when the WHY is non-obvious.
- No filler. No AI-slop comments.

## Mistakes

- Record mistakes in `.claude/rules/mistakes.md` using `/learn` so they don't repeat.

## Agent Skills

- `.claude/skills/` bundles third-party skills vendored via [`npx skills`](https://github.com/vercel-labs/skills) from `mattpocock/skills` (engineering/workflow) and `emilkowalski/skills` (design/motion). Sources and hashes are tracked in `skills-lock.json`.
- Update or prune with `npx skills check` / `npx skills add`. The vendored tree is excluded from oxfmt/oxlint — don't hand-edit skills, re-sync from source.
- `react-doctor` is repo-owned (not tracked by `skills-lock.json`): it wraps `npx react-doctor` to scan React changes for lint/a11y/perf/architecture regressions. `/finish` runs it on React diffs.
