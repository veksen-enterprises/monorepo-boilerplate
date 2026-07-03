---
globs: "packages/**/src/**/*.test.*,packages/**/utils*.test.*,apps/**/utils/**/*.test.*,apps/**/lib/**/*.test.*"
---

# Testing Utility / Helper Functions

Stack: Vitest. Pure functions don't need jsdom — no DOM, no mocks, no providers.

## Core principle

Pure functions are the simplest code to test. Input in, output out. No mocks, no setup.

This is the base of the testing pyramid — these tests should be numerous, fast, and completely deterministic.

## Pattern

```ts
import { expect, it } from "vitest";
import { cn } from "./utils";

it("merges conflicting tailwind classes, last wins", () => {
  expect(cn("p-2", "p-4")).toBe("p-4");
});
```

Arrange the input, call the function, assert the output. Pure functions have no collaborators, so there is nothing to mock.

## What to test

1. **Happy path**: Typical valid input produces expected output.
2. **Edge cases**: `null`, `undefined`, empty string, empty array, `0`, negative numbers, boundary values.
3. **Invalid input**: Bad data — does it throw, return a default, or silently fail?
4. **Boundary conditions**: Off-by-one, exactly-at-threshold, min/max.
5. **Type-specific edges**: strings (unicode, whitespace, very long); numbers (`NaN`, `Infinity`, floats); dates (midnight, DST, timezone boundaries).

## Time-dependent functions

Control the clock with `vi.useFakeTimers()`. Always restore with `vi.useRealTimers()`.

```ts
import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("returns 'just now' for the current instant", () => {
  vi.setSystemTime(new Date("2025-01-06T17:00:00.000Z"));

  expect(relativeTime(new Date("2025-01-06T17:00:00.000Z"))).toBe("just now");
});
```

Use explicit UTC times in tests. Don't rely on the machine's local timezone.

## Factory functions

Use lightweight factories with sensible defaults and targeted overrides — not massive object literals.

```ts
// Good: focused, minimal
function makeUser(overrides = {}) {
  return { id: 1, name: "Ada", role: "member", ...overrides };
}

// Bad: 30-line object literal copied into every test
```

## Don'ts

- No mocks. Pure functions have no collaborators to mock.
- No `toHaveBeenCalledWith`. There are no calls to verify.
- No smoke tests. Every test must assert a specific behavior.
- No testing implementation internals. If the function delegates to a sub-function, test the output, not the delegation.
- No duplicate tests with trivially different data on the same code path.
