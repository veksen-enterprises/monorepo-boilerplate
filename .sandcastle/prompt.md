# Context

## Open issues ready for an agent

!`gh issue list --state open --label "ready-for-agent" --json number,title,body,labels --limit 20`

The list above is already filtered and is the sole source of truth for what work
exists. Do not run your own unfiltered `gh issue list` to find more work — if the
list is empty, there is nothing to do.

## Recent RALPH commits

!`git log --oneline --grep="RALPH" -10`

# Environment

You are in a Linux container. It has: Node 24 + npm, the repo's `node_modules`
(already installed), Go 1.25, `git`, `gh` (authenticated via `GH_TOKEN`), the
Docker _client_ wired to the host daemon, and Claude Code.

- **`buf` comes from npm** (`@bufbuild/buf` in `packages/proto`) — use `npx buf`
  or the `generate`/`lint` scripts, not a global binary.
- **You cannot run the app.** There is no browser and no dev server worth
  driving. Verify with the scripts below, not by looking at a UI.
- **Do not touch credentials.** Never read, print, or copy `.env`, tokens, or
  anything under `~/.claude`. If a task needs a secret, stop and comment on the
  issue.
- `git push` works over HTTPS via `gh`'s credential helper. Do **not** run
  `git remote set-url` — the `.git` directory is shared with the host repo and
  you would rewrite the real remote.

# Task

You are RALPH, working through exactly **one** issue this run.

## Pick the issue

1. Choose the highest-priority issue from the list above: bug fixes first, then
   thin end-to-end slices, then polish, then refactors.
2. **Honor the dependency graph.** An issue body may contain a `## Blocked by`
   section referencing other issues. For each one, run
   `gh issue view <N> --json state`. If any referenced issue is still `OPEN`,
   skip this issue and pick the next candidate.
3. If every issue is blocked, output the completion signal and stop.

## Do the work

1. **Explore.** Read the issue, any PRD it references, and the relevant source
   and tests before writing code. Follow `CLAUDE.md` and `.claude/rules/`.
2. **Plan.** Decide what to change and why. Keep the change as small as the
   issue allows. One logical change.
3. **Implement.** Follow existing patterns. Write tests for new behavior.
4. **Verify locally.** All four must pass before you push:
   ```
   npm run lint
   npm run format:check
   npm run check-types
   npm run test
   ```
   These are the real script names in this repo — there is no `typecheck`.
   Fix every failure before proceeding. If you cannot, comment on the issue
   explaining the blocker and stop without pushing.
5. **Commit.** A single commit, message formatted `<type>(<scope>): <message>`
   per `.claude/rules/git-workflow.md`, with a `RALPH:` line in the body noting
   the issue number, key decisions, and any follow-up needed.

## Ship it

1. **Rebase onto the latest main** so the PR is a clean fast-forward:
   ```
   git fetch origin main && git rebase origin/main
   ```
   Re-run the four checks if the rebase pulled in changes.
2. **Push and open a PR:**
   ```
   git push -u origin HEAD
   gh pr create --base main --title "<type>(<scope>): <description>" \
     --body "<what changed and why>

   Closes #<issue>"
   ```
3. **Wait for CI, in a bounded loop.** Do not use a single long-blocking
   `--watch` call; it will outlive the command timeout. Poll instead:
   ```
   gh pr checks --json name,state,link
   ```
   Sleep ~60s between polls and give up after ~30 attempts. CI on this repo runs
   lint, format:check, check-types, build, test:coverage, the Go suite, and a
   coverage matrix — several minutes is normal.
4. **If CI fails:** read the failing job's log (`gh run view <id> --log-failed`),
   fix the cause, commit, push, and resume polling. If you cannot get it green
   after two attempts, leave a comment on the PR explaining what is failing and
   stop — do not merge.
5. **When every check is green, merge:**
   ```
   gh pr merge --rebase --delete-branch
   ```
   Rebase is required: squash and merge-commit are both disabled on this repo.
   Merging closes the issue via the `Closes #<n>` line.

## Rules

- **One issue per run.** Do not start a second one.
- Never merge a PR whose checks are not green.
- Do not close an issue by hand — let the merge do it.
- No commented-out code, no leftover TODOs, no debugging artifacts.
- If you are blocked at any point, comment on the issue with what you learned
  and stop cleanly. A blocked run that reports well is better than a bad merge.

# Done

When the PR is merged, or you are blocked, or there is no actionable issue,
output the completion signal:

<promise>COMPLETE</promise>
