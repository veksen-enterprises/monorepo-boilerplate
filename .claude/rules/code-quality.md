---
globs: "**/*.ts,**/*.tsx,**/*.js,**/*.jsx"
---

# Code Quality Checklist

Before declaring done, verify:

- Does this actually solve the stated problem?
- Any obvious bugs, off-by-one, unhandled cases?
- Is error handling present and meaningful?
- Any security issues (injection, auth bypass, data exposure)?
- Is the code readable to someone who didn't write it?
- Names descriptive and consistent with codebase conventions?
- Any dead code, debugging artifacts, or abandoned TODOs?
- Any unnecessary new dependencies?
- Could this break existing functionality?
- Does this pass the Refactoring Bar? (see below)

## Rules

- Follow existing codebase patterns. Don't introduce new patterns without discussion.
- Prefer simple, boring code over clever code.
- Don't over-engineer. Solve the problem at hand.
- Run `npm run lint:fix && npm run format` after changes. Fix all issues.
- NEVER delete `package-lock.json`. Not to fix install issues, not to "regenerate" it, not for any reason. If there's a lockfile conflict, run `npm install` to resolve it.
- Never hand-edit generated files (`routeTree.gen.ts`, `dist/**`, `coverage/**`). Change the source and regenerate.

## Scope Discipline

- One task per branch/PR. No drive-by cleanups mixed with feature work.
- Before finishing, ask: "does this diff contain ONLY task-related changes?" Revert unrelated hunks — including formatter reflows of files you didn't otherwise touch.
- If you notice an unrelated problem, note it (or file an issue) rather than fixing it inline.

## Refactoring Bar

A refactor must make the code measurably simpler — fewer lines to read, a real bug eliminated, or duplication that has already caused divergence removed. "More organized" or "more maintainable" without concrete evidence is not enough.

- Don't shape-shift working code (switch → config object → interpreter) without reducing total lines or complexity.
- Don't extract a hook/helper with a single consumer unless it enables testing.
- Repetitive but clear code is fine. Resist DRYing it unless the repetition is actively causing bugs.
