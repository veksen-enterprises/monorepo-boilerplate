# Sandcastle / RALPH loop — setup hand-off

How to stand up an autonomous RALPH loop (`@ai-hero/sandcastle`) on a **new repo**,
in the **PR-per-issue** shape: the worker opens its own pull request, waits for CI,
and merges itself.

Everything here was verified against `@ai-hero/sandcastle@0.12.0`'s shipped types
and bundle, not inferred from the README. Where the library's behavior contradicts
the obvious assumption, that's called out.

Sandcastle runs a coding agent inside a Docker sandbox against a prompt, picks up
labelled issues, and lands the result. It is a TypeScript library you invoke, not
a daemon.

---

## The design, and why

Two shapes are possible. This document describes the second.

**`merge-to-head`** — sandcastle merges each worker branch straight into whatever
branch you launched from. No PRs. Good when tickets form a dependency chain and
you want one launch to drain the whole frontier: issue B needs A _merged_ to build
on it, and a stack of unmerged PRs breaks that.

**PR-per-issue with `maxIterations: 1`** — one issue per launch. The worker pushes
a branch, opens a PR, polls CI, and merges when green. The chain survives because
the merge completes _before_ the next launch starts, so each run branches from a
main that already contains the last one's work. You get a review surface, a CI
gate, and an audit trail per issue, at the cost of launching once per ticket.

Pick the second when you want every change to pass CI before it lands. Pick the
first when you want to leave it running overnight.

### Decisions worth inheriting

| Decision                                                                                     | Why                                                                                                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `branchStrategy: {type: "branch", baseBranch: "origin/main"}` with a timestamped branch name | Fresh branch per launch, cut from the remote ref. Never `merge-to-head` — the agent lands work through the PR, not into your working copy. |
| Explicit `git fetch` on the host **before** `run()`                                          | See "What sandcastle does not do" below. This is load-bearing.                                                                             |
| Agent opens the PR via `gh` in the prompt                                                    | sandcastle has no PR mode. There is nothing to configure; it's prompt work.                                                                |
| Worker polls CI itself, then merges                                                          | Makes GitHub branch protection _optional_. See "Auto-merge" below.                                                                         |
| `maxIterations: 1`                                                                           | With PRs, a high iteration count races itself: iteration N+1 branches from a main that N's still-open PR hasn't landed in.                 |
| Bounded poll loop, not `gh pr checks --watch`                                                | A single blocking watch on a multi-minute CI run outlives the agent's command timeout.                                                     |

---

## What sandcastle does _not_ do

These are the things that cost the most time to discover. All four are load-bearing.

**1. It does not rebase, and it does not reliably fetch.**

`docker()` is a _bind-mount_ provider — it mounts a git worktree, not a fresh
clone. There is a refresh path (`fastForwardFromOrigin`), but it is `git fetch` +
`git merge --ff-only`, it only fires when reusing an existing worktree, and it
bails silently three ways: HEAD not on that branch, fetch fails, or the branch
diverged. Each bail just logs "reusing as-is".

`NamedBranchStrategy.baseBranch` is worse than it looks — its own docstring:

> Only used when the branch doesn't already exist — ignored otherwise. **Callers
> are responsible for ensuring the ref is current (e.g. `git fetch`).**

So: **fetch on the host yourself before calling `run()`**, and have the prompt
rebase onto `origin/main` before opening the PR. Neither is automatic.

**2. It cannot create PRs.**

The whole strategy union is `head | merge-to-head | branch`. There is no PR mode
and no `--auto` integration. `gh pr create` / `gh pr merge` go in `prompt.md`.

**3. It does not configure git credentials.**

It passes `GH_TOKEN` through as an environment variable and stops there — no
credential helper, no `insteadOf`, no `remote set-url` anywhere in the bundle. If
your `origin` is an SSH URL (`git@github.com:...`), the sandbox has no key and
**`git push` fails**.

Fix it with env-scoped git config, _not_ by rewriting the remote — the worktree's
`.git` is bind-mounted and shared with your host repo, so `git remote set-url`
inside the sandbox rewrites your real remote:

```ts
env: {
  GIT_CONFIG_COUNT: "2",
  GIT_CONFIG_KEY_0: "url.https://github.com/.insteadOf",
  GIT_CONFIG_VALUE_0: "git@github.com:",
  GIT_CONFIG_KEY_1: "credential.https://github.com.helper",
  GIT_CONFIG_VALUE_1: "!gh auth git-credential",
}
```

**4. The stock image is Node 22 and nothing else.**

`CLAUDE_CODE_DOCKERFILE` is `FROM node:22-bookworm` plus git/curl/jq, the GitHub
CLI, and Claude Code. If your repo pins a different Node — check `engines` and
`.nvmrc` — you must bump the base image. Everything else your build needs, you add.

---

## Auto-merge: usually a red herring

The instinct is `gh pr merge --auto` plus branch protection. Two facts kill it:

- GitHub only lets you _enable_ auto-merge on a PR that isn't already mergeable.
  With no required status checks configured, `gh pr merge --auto` errors instead
  of queuing.
- So auto-merge requires a ruleset on the default branch — which changes how
  humans push to it too.

If the worker polls CI and merges itself, you get the same guarantee with no repo
settings change. The trade-off is honest: nothing _enforces_ the gate if the agent
misbehaves. Add the ruleset later if you want the guarantee independent of agent
behavior.

Check the repo's merge settings before writing the merge command — `--rebase`,
`--squash`, and `--merge` are individually disableable:

```bash
gh api repos/OWNER/REPO --jq '{allow_auto_merge, allow_squash_merge, allow_rebase_merge, allow_merge_commit}'
```

---

## Scoping the image

The sandbox must be able to run your **full verification suite** unattended.
Work backwards from the scripts the prompt will call.

- **Match the repo's Node major.** `engines` / `.nvmrc`.
- **Add every non-Node toolchain** your build touches (Go, Rust, Python, …), as
  root, _before_ the `USER` switch. Pin versions to whatever the repo pins.
- **Check whether a "missing" tool is actually an npm dependency.** Tools like
  `buf` are commonly installed via npm — `npm install` already provides them, and
  a second global copy just drifts.
- **Databases:** if tests need a real database, you have two options. Either bind-mount
  the host Docker socket (`mounts` + `groups: ["docker"]` — `DockerOptions`
  documents this as Docker-outside-of-Docker) so testcontainers works unchanged,
  or run a persistent sidecar on a shared docker network and have tests honor
  `DATABASE_URL`. The socket needs no source changes but hands the sandboxed agent
  your host daemon. The sidecar is the safer boundary but needs a code path in your
  test setup and self-isolating tests (schema-per-run), because the sidecar persists
  across runs.
- **Sibling-container networking:** with the socket mounted, testcontainers starts
  containers _next to_ the sandbox and then dials the published port. `localhost`
  is the wrong host from inside. Set `TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal`
  (Docker Desktop resolves it automatically).
- **You still can't run the app.** No browser, no simulator. Say so in the prompt
  so the agent verifies with scripts instead of pretending to click around.

Build and verify before trusting it — **`build-image` exits 0 even when the docker
build fails**, so the exit code proves nothing. Run the toolchain to confirm:

```bash
image="sandcastle:$(node -p "require('./package.json').name")"
npx sandcastle docker build-image --image-name "$image"
docker run --rm --entrypoint sh "$image" -c 'node --version; go version; gh --version'
```

**Name the image explicitly.** `defaultImageName` lowercases the _checkout
directory's_ basename, which is wrong any time the working copy isn't named after
the repo — git worktrees, agent workspaces, or a plain `git clone <repo> <other>`.
You then get one stray image per worktree, all rebuilt from scratch. Pass
`--image-name` to the CLI and set `imageName` in `docker({...})` — the two must
match, or the loop builds one image and runs another. Keying it to the package
name keeps it stable across checkouts and correct after a fork.

One trap worth knowing when adding apt repos: some vendors publish an
ASCII-armored signing key, which apt rejects with a bare `exit code: 100`. Either
pipe it through `gpg --dearmor` (and install `gnupg`), or check whether you need
that tool at all — e.g. testcontainers speaks the Docker Engine API over the
socket directly and never needs the `docker` CLI installed.

---

## Prompt checklist

The stock template is a starting point with real bugs in it. Every one of these
is a correction, not a preference:

- **Filter the issue query to your agent label.** The template ships it
  _unfiltered_ — it will happily try to "implement" a parent spec.
- **Honor `## Blocked by`.** Tell the agent issue bodies may reference blockers
  and to check `gh issue view <N> --json state` before starting.
- **Use your repo's real script names.** The template calls `npm run typecheck`.
  If your repo defines `check-types`, that step silently never runs and every
  check is green for the wrong reason.
- **Add an `## Environment` section** stating what the sandbox has and lacks.
- **Poll CI in a bounded loop** with an explicit attempt cap and a give-up branch.
- **Forbid credential access** explicitly.
- **State the merge method** that your repo actually allows.

---

## Label hygiene

- `ready-for-agent` — genuinely actionable and safe to automate.
- `ready-for-human` — credential-touching, judgment calls, anything you'd want to
  watch.
- **Specs and PRDs get no label.** They are context to read, not work to do.

The loop's blast radius is exactly the set of issues carrying the agent label.
That is the entire access-control model. Treat labelling as a privileged action.

---

## Running it

```bash
npm run sandcastle
tail -f "$(ls -t .sandcastle/logs/*.log | head -1)"
```

- **Logs go to a file, not your terminal.** The terminal prints one "Started" line.
- **One launch at a time.** Two concurrent runs race the merge. Check with
  `pgrep -f 'tsx .sandcastle/main.mts'`.
- The loop emits `<promise>COMPLETE</promise>` and exits when nothing is actionable.

---

## Gotchas

| Symptom                                                 | Cause                                                                            | Fix                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `cannot lock ref 'refs/heads/sandcastle/worker/...'`    | A branch literally named `sandcastle` collides with the worker ref namespace     | Never name a branch `sandcastle`                             |
| Agent works from stale code                             | `baseBranch` is only read when the branch is new; sandcastle doesn't fetch       | `git fetch` on the host before `run()`; rebase in the prompt |
| `git push` fails / asks for a key                       | `origin` is SSH; the sandbox has no key and sandcastle sets no credential helper | `GIT_CONFIG_*` env rewrite + `gh auth git-credential`        |
| Your host repo's remote changed                         | Something ran `git remote set-url` in the sandbox; `.git` is shared              | Use env-scoped git config, never mutate config in-sandbox    |
| Loop grabs a spec or a blocked ticket                   | Template issue query is unfiltered; no blocked-by check                          | Filter to the agent label; honor `## Blocked by`             |
| Type-check "passes" but never ran                       | Prompt calls a script name the repo doesn't define                               | Match the prompt to real `package.json` scripts              |
| `gh pr merge --auto` errors                             | No required checks on the base branch, so the PR is already mergeable            | Poll + merge in the prompt, or add a ruleset                 |
| `gh pr merge` rejected                                  | That merge method is disabled on the repo                                        | Check `allow_*_merge` and use one that's enabled             |
| Toolchain "not found" in sandbox                        | Stock image is Node-only                                                         | Add it to the Dockerfile, rebuild                            |
| A stray `sandcastle:<something-odd>` image per checkout | Default image tag is the checkout dir basename, not the repo                     | Set `imageName` + `--image-name` from the package name       |
| Image "built" fine but is broken                        | `sandcastle docker build-image` exits 0 even when the docker build fails         | Verify with `docker run … -c '<tool> --version'`             |
| `apt-get` fails with a bare `exit code: 100`            | The vendor's apt signing key is ASCII-armored                                    | `gpg --dearmor` it, or drop the tool                         |
| DB tests fail in sandbox                                | No Docker daemon → no testcontainers                                             | Mount the socket, or sidecar + `DATABASE_URL`                |
| Tests hang connecting to `localhost`                    | Sibling containers aren't on the sandbox's loopback                              | `TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal`          |
| CI-wait command times out                               | One long blocking `--watch` call                                                 | Bounded poll loop with sleeps                                |
| Merge races / flaky DB                                  | Two concurrent launches                                                          | One at a time                                                |

---

## Per-repo checklist

- [ ] Docker running; `gh` authed with `repo` scope; `claude setup-token` obtained.
- [ ] `npx @ai-hero/sandcastle init --agent claude-code --template simple-loop --sandbox docker --issue-tracker github-issues --create-label false --build-image false`
- [ ] Root `package.json`: `sandcastle` script + `@ai-hero/sandcastle` and `tsx` devDeps.
- [ ] `main.mts`: host `git fetch`; `branch` strategy with timestamped name and
      `baseBranch: origin/<default>`; `maxIterations: 1`; model set; git-config env;
      DB access wired if needed.
- [ ] `prompt.md`: label filter, `## Blocked by`, **real** script names,
      `## Environment`, push → PR → bounded CI poll → merge, credential ban.
- [ ] `Dockerfile`: correct Node major, every toolchain, build and verify.
- [ ] `.env`: both tokens filled, gitignored.
- [ ] Labels created; specs unlabelled.
- [ ] Verify the repo's allowed merge methods.
- [ ] First run supervised, on a small throwaway issue.

---

## Credentials

`CLAUDE_CODE_OAUTH_TOKEN` **is your Claude login**. On your own machine for
supervised runs that's fine; putting it on an always-on runner is a real trust
decision — make it deliberately.

Let the human do every credential-touching step. Hand them a script; take back
the result, never the secret.
