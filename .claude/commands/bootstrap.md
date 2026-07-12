Set up a new project from scratch (or a major new area of this one) using a disciplined,
issue-driven approach. This starter is the base; bootstrap the domain on top of it.

Project description: $ARGUMENTS

## Process

### Step 1: Discovery

Ask the user to confirm — one topic at a time, don't dump the whole list:

- Project purpose and the domain it serves (feed this into `VISION.md` / `CONTEXT.md`)
- Language(s), frameworks, key libraries beyond the starter's stack
- Test framework, linter, formatter, CI/CD, deployment target
- Monorepo vs single repo, auth needs, integrations, and explicit out-of-scope items

Confirm the full picture before moving on.

### Step 2: Research the Stack

- Research current best practices, project structure, and scaffolding tools
  (`.claude/rules/research.md` — docs first, don't guess versions).
- Identify versions, peer dependencies, and compatibility issues.
- Flag any problems with the user's choices before proceeding.

### Step 3: Author the vision and domain

- Fill `VISION.md` and its `.claude/vision-digest.md` digest (north star, principle, values).
- Fill `CONTEXT.md` with the domain's ubiquitous language and invariants.
- These anchor every issue below — do them before decomposing the work.

### Step 4: Design the Issue Plan

Decompose the setup into atomic, ordered issues. Each must be:

- Focused on one deliverable
- Ordered by dependency (note `Blocked by: #<n>`)
- Precisely scoped with acceptance criteria

### Step 5: Create Issues

Use `gh issue create` for each (or the vendored `/to-tickets` skill), with a clear title,
description, acceptance criteria, and dependency references.

### Step 6: Present and Confirm

Present the full issue list with its dependency order. WAIT for confirmation.

### Step 7: Implement Sequentially

For each issue in order: `/start <n>` → implement → run tests/lint/format/check-types →
`/finish` to validate → declare ready for review.
