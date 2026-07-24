Write comprehensive tests for: $ARGUMENTS

Follow the project testing rules (the `testing` skill: `.claude/skills/testing/testing.md`, `testing-philosophy.md`, `testing-react.md`, `testing-utilities.md`):

- Use Vitest + Testing Library. Co-locate the test with its source (`x.tsx` → `x.test.tsx`).
- Mock discipline: only mock network, time, and browser APIs unavailable under jsdom. Never mock the thing under test.
- Test behavior, not implementation. Prefer asserting rendered output / return values over `toHaveBeenCalledWith`.
- Cover happy paths, error paths, and edge cases (empty, null, boundary, invalid).
- One behavior per test, descriptive names, Arrange-Act-Assert.

After writing:

1. Run the new tests (must pass).
2. Run the full suite (`npm run test`) to catch regressions.
3. Run coverage (`npm run test:coverage`) and report gaps on the changed files.
