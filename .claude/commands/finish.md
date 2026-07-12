Run the completion checklist before declaring work done.

1. **Tests:** Run `npm run test`. All must pass. Fix failures first.
2. **Lint:** Run `npm run lint`. Zero errors. Fix any issues.
3. **Format:** Run `npm run format`. Ensure all files are formatted.
4. **Types:** Run `npm run check-types`. Zero errors.
5. **Build:** Run `npm run build`. Must succeed. Fix any errors.
6. **Self-review:** Run `/review` (subagent code review of `git diff`). Resolve findings.
7. **UI / React checks:** If the diff touches the UI layer, run `/design-review` and resolve every `[lint]`/`[axe]` finding. If it touches React components or hooks, run the `react-doctor` skill (`npx react-doctor@latest --no-telemetry --scope changed`) and fix any new issues.
8. **Scope check:** Confirm the diff contains ONLY task-related changes. Revert unrelated hunks (including stray formatter reflows).
9. **Rebase:**
   - `git fetch origin main && git rebase origin/main`
   - Trivial conflicts: resolve, then re-run checks.
   - Non-trivial conflicts (contradicting logic, overlapping changes): STOP. Explain and ask for guidance. Do NOT guess.
10. **Post-rebase:** Re-run tests, lint, format, check-types, build. All must pass.
11. **Summary:** Report what was done, what tests cover it, and any caveats.
