---
globs: "*"
---

# Git Workflow

## Branch Discipline

- One task = one branch = one PR. No multi-task branches.
- Branch from `main` unless depending on an unmerged branch.
- Naming: `<type>/<short-description>` — append an issue number when one exists (`feat/12-user-menu`).
- Types: `feat`, `fix`, `refact`, `style`, `docs`, `tests`, `chore`, `build`, `ci`, `perf`, `ui`.
- Short description: kebab-case, concrete nouns/verbs, max 3-4 words. Describe WHAT changes, not WHY.
  - Good: `feat/user-menu`, `fix/null-search-response`, `ui/tooltip-hover`
  - Bad: `feat/improvements`, `fix/bug`, `refact/cleanup`, `feat/add-the-new-user-menu-with-avatar-and-dropdown`
- Always create the branch with `git checkout -b`. Never rename `main`.

## Commit Convention

- Format: `<type>(<scope>): <short infinitive message>`
- Scope: the module/component/area affected (e.g. `ui`, `app`, `config`, `ci`).
- Message: infinitive verb, lowercase, no period ("add", not "added"/"adds").
- One logical change per commit.
- Reference an issue in the body when relevant: `Closes #<n>`.

## PR Convention

- Title format: `<type>(<scope>): <description>`
- Examples:
  - `feat(ui): add avatar component`
  - `fix(app): handle empty search result`
  - `ci: gate check-types and format:check`

## Completing Work

1. All tests pass (full suite).
2. Linter and formatter: zero issues.
3. Types check and build succeed.
4. Self-review performed (`/review`).
5. Rebase against main: `git fetch origin main && git rebase origin/main`.
6. After rebase: re-run tests, lint, format, check-types, build.
7. Only then declare complete.
