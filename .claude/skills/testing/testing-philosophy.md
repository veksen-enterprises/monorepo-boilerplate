---
globs: "**/*.test.*,**/*.spec.*,**/tests/**,**/test/**,**/__tests__/**"
---

# Testing Philosophy

The principles below apply to every test in this codebase, regardless of layer.

## What to test: The Metz Grid

Classify every behavior by **message direction** and **type** (Sandi Metz, "Magic Tricks of Testing"):

| Message               | Query (returns value)             | Command (causes side effect)         |
| --------------------- | --------------------------------- | ------------------------------------ |
| **Incoming**          | Assert the return value           | Assert direct public side effects    |
| **Outgoing**          | Do NOT test (stub for setup only) | Mock and verify the message was sent |
| **To self (private)** | Do NOT test                       | Do NOT test                          |

- **Incoming messages** are your public API. Test what they return or what observable state they change.
- **Outgoing commands** to external systems (analytics, third-party APIs, webhooks) are the only place to verify that a call was made. The call IS the behavior.
- **Outgoing queries** to collaborators are tested as incoming messages on the _receiving_ side. Testing them on the sender is duplication.
- **Private methods** are implementation details. If you feel the urge to test one, extract it into its own module and test its public interface.

## Mock discipline: The Khorikov Framework

Decide what to mock based on **managed vs unmanaged dependencies** (Vladimir Khorikov, "Unit Testing"):

- **Managed dependencies** (your own state, your own modules): You control them. Do NOT mock them. Test with real instances.
- **Unmanaged dependencies** (network, third-party APIs, browser APIs unavailable in the test env): Other systems own the contract. MOCK these.

In practice for this project:

- **Mock**: network calls (`fetch`, external APIs — prefer MSW over stubbing `fetch`), time/dates (`vi.useFakeTimers`), browser APIs not available under jsdom (e.g. `matchMedia`, `IntersectionObserver`), third-party SDKs.
- **Do NOT mock**: your own utilities, your own components, your own hooks, context providers (wrap with the real provider instead).

## `toHaveBeenCalledWith` — decision framework

By default, **do not use it**. It verifies wiring (implementation), not behavior, and breaks when internals are refactored (Fowler: "Mockist tests are more coupled to the implementation of a method").

Use it ONLY when the call IS the observable behavior:

1. **External side effects**: The outcome is that the call happened (analytics tracked, webhook fired). There is no return value to check.
2. **Callback props**: A component's contract is that it calls `onSelect(id)` / `onSubmit(values)`. Verifying the callback fired with the right args IS the behavior.
3. **Computed values only passed to a dependency**: The code computes something (counting, dedup, defaulting) that isn't in the return value or rendered output. Call verification is the only way to assert it.

For everything else, assert the **end result** — the return value or the rendered output. That proves the system works without coupling to how it works.

## Test naming

Tests are specifications. Name them after the behavior, not the implementation.

| Bad (describes mechanism)         | Good (describes behavior)                         |
| --------------------------------- | ------------------------------------------------- |
| should call the store's setter    | should update the count when clicked              |
| should render component correctly | should show the user's name and avatar            |
| should trigger onClick handler    | should open the dialog when the button is pressed |

## Test structure

Follow **Arrange-Act-Assert** (AAA). One behavior per test. No logic in tests (no `if/else`, loops, or `try/catch` for flow control).

Prefer inline setup or pure `setup()` functions over deeply nested `describe` + `beforeEach` chains. Nesting forces variable-mutation tracking across scopes, which makes tests hard to read (Kent C. Dodds, "Avoid Nesting When You're Testing"). One level of `describe` grouping is fine; avoid going deeper.

## What NOT to do

- No smoke tests (`should be defined`, `expect(true).toBe(true)`).
- No duplicate tests with trivially different data.
- No skipping failing tests.
- No massive fixtures. Keep test data minimal — factory functions with sensible defaults and targeted overrides (e.g. `makeUser({ name: "Ada" })`).
- No testing private methods or internal state.
- No `toBeCalledTimes` / `toHaveBeenCalled` as a standalone assertion. Assert the output instead.

## The testing trophy (Kent C. Dodds)

For frontend code, integration tests are the sweet spot: "Write tests. Not too many. Mostly integration." The more your tests resemble how users interact with your software, the more confidence they provide.

| Layer                                    | Volume                     | What it catches                    |
| ---------------------------------------- | -------------------------- | ---------------------------------- |
| **Static** (TypeScript, OxLint)          | Automatic                  | Type errors, lint violations       |
| **Unit** (pure functions, helpers)       | Many, fast                 | Logic bugs in isolated functions   |
| **Integration** (components + providers) | Most investment here       | Wiring bugs, rendering, user flows |
| **E2E**                                  | Few, high-value paths only | Full system integration            |

Push tests as far down as possible. If a unit test covers the case, don't duplicate it in an integration test. If an integration test covers it, don't add an E2E test.

## Sources

- Sandi Metz — "Magic Tricks of Testing" (message classification grid)
- Martin Fowler — "Mocks Aren't Stubs" (classicist vs mockist, state vs behavior verification)
- Vladimir Khorikov — "Unit Testing: Principles, Practices, and Patterns" (managed/unmanaged deps, four pillars)
- Kent C. Dodds — "Testing Trophy", "Testing Implementation Details", "Avoid Nesting When You're Testing"
- Kent Beck — Test Desiderata (behavioral, structure-insensitive, deterministic)
