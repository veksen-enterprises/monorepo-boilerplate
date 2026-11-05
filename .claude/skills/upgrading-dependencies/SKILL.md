---
name: upgrading-dependencies
description: Upgrade, add or remove dependencies in this monorepo. Use when bumping a package or a major version, clearing npm audit findings, repairing package-lock.json, or checking the app bundle for duplicated packages.
---

# Upgrading dependencies

One package moves per commit, one major per PR, and nothing is done until the change has run where users run it. A green suite proves the code compiles against the new version. The app running on it proves the upgrade. This skill is the explicit ask for `npm run build` and `npm run dev` that `CLAUDE.md` requires.

## Fixed points

- **CI installs with `npm ci --force`** (`.github/workflows/ci.yml`). A lockfile counts as clean when that command installs it.
- **The `@connectrpc/*` set moves in one PR.** `@connectrpc/connect-web` and `@connectrpc/connect-fastify` peer `@connectrpc/connect` at one exact version. A lone bump of `@connectrpc/connect` installs without an error and leaves the old version at the root for them, so `npm ls @connectrpc/connect` shows two versions while `npm ls --all | grep invalid` stays empty.
- **`apps/app` declares `lightningcss-darwin-arm64` directly.** It is the macOS arm64 binary of `lightningcss`; keep it at the version `npm ls lightningcss` shows.
- **Generated code is committed.** `packages/proto/gen` and `apps/api-go/internal/gen` come from the plugins in `packages/proto/buf.gen.yaml`. A bump of `@bufbuild/buf`, `@bufbuild/protoc-gen-es` or `@connectrpc/protoc-gen-connect-query` reruns `npm run generate -w @repo/proto` and commits the output with the bump. That script also calls `protoc-gen-go` and `protoc-gen-connect-go`, which must be on `PATH`.

## 1. Pick the work

Rank candidates by what the user gains:

1. A high `npm audit` finding that an in-range update clears (see step 3, the transitive branch).
2. A package duplicated inside the shipped bundle. `apps/app` is the one app that ships a bundle (Vite); `apps/api-fastify` ships `tsc` output beside its `node_modules`, and `apps/api-go` a Go binary. Measure with [`bundle-dupes.mjs`](bundle-dupes.mjs) after `npm run build -- --filter=app`:

   ```sh
   node .claude/skills/upgrading-dependencies/bundle-dupes.mjs
   ```

   `vite build` emits no sourcemaps here, so the script runs its own build with sourcemaps into a temp dir and leaves `apps/app/dist` alone.

3. A major the code is already living past, such as `@types/*` behind the runtime they describe.
4. Everything else.

No CI job runs `npm audit`. Present the ranked list and let the user pick. Start a major only when the user asks for that one.

**Done when** the user has named the package and its target version.

## 2. Read what changed

Read the release notes for every major between the installed and target version (WebFetch the GitHub release, or context7), then `git grep` every import of the package. Grep imports rather than `package.json`: `apps/api-fastify/src/rpc/auth.ts` imports `@clerk/backend`, which no `package.json` declares, so it moves whenever `@clerk/fastify` does. Match each breaking change against the code that uses it.

**Done when** every breaking change is marked either "touches us at `file:line`" or "touches nothing we call", with the grep that shows it.

## 3. Move the package

Branch from `main` as `chore/bump-<package>-<major>`, per `.claude/rules/git-workflow.md`.

- **A direct dependency.** One commit per package:

  ```sh
  npx npm-check-updates -u <name> --deep
  npm i            # add --force only when sibling packages peer each other at one major and npm refuses
  git add -A
  git commit -m "chore(deps): bump <name> to <version>"
  ```

  `--deep` moves every workspace that declares the package.

- **A transitive advisory.** Check the parent's range with `npm view <parent>@<version> dependencies.<name>`. If the fixed version fits, `npm update <name>` changes the lockfile alone. If it does not fit, the parent needs a bump instead.
- **Adding or removing a package.** `npm install -w <workspace> <name>` and `npm uninstall -w <workspace> <name>`.
- **A Go module in `apps/api-go`.** From that directory, `go get <module>@<version>`, then `go mod tidy`, then commit with the same subject.

Then confirm the package moved. `npm ls <name>` must show the target version wherever it is installed, and `npm ls --all | grep invalid` must show nothing, as it does on `main`. Nested copies are normal (`apps/app/node_modules` holds its own `@tanstack`, `@babel` and `typescript`); a stale copy is a nested one still at the old version after the bump, and the bundle or server keeps running it. Repair it by uninstalling and reinstalling the package in that workspace, then read the lockfile diff by entry rather than by line count.

Review `git diff` for npm's side effects and formatter reflows outside the change, and revert them (Scope Discipline in `.claude/rules/code-quality.md`).

**Done when** `npm ls` shows the target version everywhere, `npm install --dry-run` reports `up to date`, and the diff holds only this package and its generated code.

## 4. Fix what broke

Each code fix is its own commit after the bump commit. Write the failing test first, following the `testing` skill for its layer, and watch it go red on the new version. Then make it green, then remove the fix and watch it go red again. A test that mocks the package passes on every version: `apps/api-fastify/src/rpc/notes.routes.test.ts` mocks `@clerk/backend`, so a Clerk change is proven against the stub in step 5.

**Done when** each breaking change marked "touches us" in step 2 has a commit that fixes it, or a sentence in the PR body saying why it needs none.

## 5. Prove it runs

Run `npm run test -- --filter=<workspace>` for every workspace that imports the package, then `npm run check-types` and `npm run build`. Then run the change where users meet it:

- **App:** `npm run dev -w app`. Pages that call RPCs need the backend at `VITE_API_URL`: `docker compose up -d`, an `apps/api-fastify/.env` from its `.env.example`, `npm run db:migrate -w @repo/api-fastify`, `npm run dev -w @repo/api-fastify`. Load the pages that use the package through the `chrome-devtools` MCP server and exercise the exact case the breaking change named. Signing in needs a Clerk key in `apps/app/.env`; without one, record the signed-in path as not run.
- **Bundle:** run `bundle-dupes.mjs` on the old and the new version. Explain every package that gained an install.
- **`apps/api-go`:** `npm run test -- --filter=@repo/api-go` starts Postgres through testcontainers, so it needs Docker.
- **A third-party SDK** (Clerk): send through the SDK to a local HTTP stub. Assert the client points at the stub before the first request, because some SDKs reset their base URL when the API key is set. `verifyToken` from `@clerk/backend` fetches its JWKS from the `apiUrl` option.

**Done when** the case each breaking change named has been exercised in the running app, the bundle or the stub, and the output is recorded.

## 6. Open the PR and land it

The title follows `.claude/rules/git-workflow.md` and names what the user gains (an advisory cleared, a crash avoided, a bundle shrunk), with the bump alongside it when it fits. The body's Tests section lists what ran, with numbers, and what did not run and why.

A red check gets its `##[error]` read before anything is rerun. When the failure is outside the diff's reach, check whether the same assertion failed on an unrelated PR with `gh run list --workflow CI --status failure` and `gh run view <run-id> --log-failed`, then `gh run rerun <run-id> --failed`. When one dependency PR merges, rebase the others onto `main`, confirm each lockfile installs clean with `npm ci --force`, and force-push each with `--force-with-lease`. `.claude/hooks/guard-bash.sh` blocks any command containing `git push --force`, the lease form included, so hand that push to the user.

**Done when** the PR is open, every check is green on a branch level with `main`, and the user has the link.
