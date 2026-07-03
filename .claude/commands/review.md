Perform a self-code-review of the current uncommitted changes using a subagent (clean context).

Run `git diff` and review for:

1. **Correctness** — logic errors, off-by-one, race conditions.
2. **Error handling** — swallowed exceptions, missing error paths.
3. **Security** — injection, auth bypass, data exposure, secret leaks.
4. **Testing** — are there tests? Do they test meaningful behavior, not implementation?
5. **Mock quality** — mocks used sparingly, at boundaries only?
6. **Code clarity** — readable? Good names? Unnecessary complexity?
7. **Dead code** — debugging leftovers, commented-out code, stray TODOs.
8. **Consistency** — follows existing codebase patterns?
9. **Scope** — does the diff contain ONLY task-related changes (no drive-by reformatting)?
10. **Comments** — explain WHY not WHAT? Any AI-slop comments?

Provide prioritized findings. If everything looks good, say so.
