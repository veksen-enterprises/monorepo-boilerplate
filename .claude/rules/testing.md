---
globs: "**/*.test.*,**/*.spec.*,**/tests/**,**/test/**,**/__tests__/**"
---

# Testing Standards

- Every new feature or bug fix MUST have tests.
- Tests must pass before declaring work complete. Run the FULL suite (`npm run test`), not just new tests.
- Run `npm run test:coverage` after writing tests. If coverage drops on modified files, investigate.
- Co-locate tests with source: `button.tsx` → `button.test.tsx`.

## Hard Rules

- One behavior per test. Descriptive names that read like specifications.
- Arrange-Act-Assert. No logic in tests (no `if/else`, loops, or `try/catch` for flow control).
- Test the contract, not the implementation.
- Cover happy paths, error paths, and edge cases (empty, null, boundary, invalid).
- No smoke tests (`should be defined`, `expect(true).toBe(true)`).
- No skipping failing tests. No massive fixtures. No duplicate tests with trivially different data.

## Layer-specific guidelines

Detailed standards for each layer, with rationale from Metz, Fowler, Khorikov, and Dodds:

- **`testing-philosophy.md`** — cross-cutting: the Metz message grid, Khorikov's managed/unmanaged dependency framework, when to use `toHaveBeenCalledWith`, test naming, the testing trophy.
- **`testing-react.md`** — React components and hooks: Testing Library query priority, `userEvent`, network mocking, what to test vs. not.
- **`testing-utilities.md`** — pure functions/helpers: input/output testing, edge cases, time-dependent functions, factory functions.
- **`testing-api.md`** — backend/API (when you add one): HTTP-boundary integration tests through the real app, and service/data-layer tests against a real database. Framework-agnostic.
