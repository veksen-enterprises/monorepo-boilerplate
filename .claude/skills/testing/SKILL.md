---
name: testing
description: Use whenever writing, modifying, or reviewing tests in this repo — unit/integration tests, React component/hook tests, backend/API HTTP-boundary and data-layer tests, or utility/schema tests. Load before writing a new test file or adding cases, and when deciding what to mock, what to assert, or whether a test is a smoke test. Covers the project's testing philosophy (Metz message grid, Khorikov managed/unmanaged deps, when `toHaveBeenCalledWith` is justified) and per-layer standards.
---

The testing standards live in the files beside this one. Read the ones that apply to what you're testing:

- **`testing.md`** — the top-level standards and hard rules; start here.
- **`testing-philosophy.md`** — cross-cutting: the Metz message grid, Khorikov's managed/unmanaged dependency framework, when `toHaveBeenCalledWith` is justified, test naming, the testing trophy.
- **`testing-react.md`** — React components and hooks: Testing Library query priority, `userEvent`, network mocking.
- **`testing-utilities.md`** — pure functions/helpers and schemas: input/output testing, edge cases, time-dependent functions, factory functions.
- **`testing-api.md`** — backend/API: HTTP-boundary integration tests through the real app, and service/data-layer tests against a real database.
