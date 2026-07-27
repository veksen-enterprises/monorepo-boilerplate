# Sandcastle loop — this repo

An autonomous RALPH loop. One launch picks up one `ready-for-agent` issue, does the
work, opens a PR, waits for CI, and merges it.

For the generic setup guide and the reasoning behind the design, see
[`sandcastle-handoff.md`](./sandcastle-handoff.md). This file is the repo-specific
runbook.

## Setup

```bash
./scripts/sandcastle-setup.sh
```

It checks prerequisites, creates the `ready-for-agent` / `ready-for-human` labels,
scaffolds `.sandcastle/.env`, builds the image, and verifies the toolchain. Then
fill in the two tokens it tells you about — that step is yours, not the agent's.

## Running

```bash
npm run sandcastle
tail -f "$(ls -t .sandcastle/logs/*.log | head -1)"
```

Logs go to a file; the terminal only prints a "Started" line. Run one at a time —
two concurrent launches race the merge.

## What the worker does

1. Picks the highest-priority `ready-for-agent` issue whose `## Blocked by`
   references are all closed.
2. Implements it, then runs `lint`, `format:check`, `check-types`, and `test`.
3. Rebases onto `origin/main`, pushes, opens a PR.
4. Polls `gh pr checks` until green (bounded — it gives up rather than hanging).
5. `gh pr merge --rebase --delete-branch`. Squash and merge-commit are disabled
   on this repo, so rebase is the only option.

If it can't get CI green in two tries, it comments on the PR and stops. It never
merges a red PR and never closes an issue by hand.

## The sandbox image

`.sandcastle/Dockerfile` — Node 24 (the stock sandcastle image is Node 22, which
this repo's `engines` rejects), Go 1.25.7 pinned to `apps/api-go/go.mod`, and the
GitHub CLI.

It is tagged **`sandcastle:monorepo-boilerplate`**, derived from `package.json`
`name` in both `.sandcastle/main.mts` and `scripts/sandcastle-setup.sh`. Left to
itself sandcastle tags the image after the _checkout directory_, which is wrong in
a git worktree or an agent workspace and leaves a stray image per checkout. If you
rename the package, both places follow automatically — but they must stay in sync,
or the loop builds one image and runs another.

`buf` is deliberately **not** installed: `packages/proto` pulls `@bufbuild/buf`
from npm, so `npm install` provides it. Installing a global copy just lets the two
drift. The Docker CLI isn't installed either — testcontainers-go speaks the Engine
API over the socket directly and never shells out to it.

### The Docker socket

`apps/api-go/internal/testutil/postgres.go` calls testcontainers with no
`DATABASE_URL` fallback and no skip, so `npm run test` needs a real daemon.
`.sandcastle/main.mts` bind-mounts the host socket and adds the `docker` group.

That hands the sandboxed agent control of your host Docker daemon. It's the option
that needs no source changes, but it is a real widening of the blast radius. The
alternative is a Postgres sidecar on a shared docker network plus a `DATABASE_URL`
branch in `testutil` — safer boundary, but it means editing `apps/api-go` and
making those tests self-isolate (schema-per-run), since a sidecar persists across
runs. Swap if you'd rather not expose the socket.

`TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal` is set because testcontainers
starts _sibling_ containers on the host; from inside the sandbox, `localhost` is
the wrong host.

### Pushing

`origin` is an SSH remote and the sandbox has no key. `main.mts` sets
`GIT_CONFIG_*` env vars that rewrite SSH→HTTPS and register `gh` as the credential
helper — env-scoped rather than written to config, because the worktree's `.git`
is shared with your host repo and a `git remote set-url` in the sandbox would
rewrite your real remote.

## Labelling is the access-control model

The loop's blast radius is exactly the set of issues carrying `ready-for-agent`.
Label small, self-contained, genuinely automatable work. Anything credential-
touching or judgment-heavy goes to `ready-for-human`. Specs and PRDs get no label —
they're context to read, not work to implement.

## Removing it

Delete `.sandcastle/`, `scripts/sandcastle-setup.sh`, both docs, and the
`sandcastle` script plus `@ai-hero/sandcastle` / `tsx` devDependencies from the
root `package.json`.
