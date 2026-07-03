---
globs: "packages/ui/**/*.test.*,packages/ui/**/*.spec.*,apps/**/*.test.*,apps/**/*.spec.*"
---

# Testing React Components and Hooks

Stack: Vitest + `@testing-library/react` + jsdom. The shared Vitest config (`@repo/vitest-config`, `uiConfig`) enables `jsdom` and `globals`, so `describe/it/expect` are global and cleanup runs automatically after each test — do NOT call `cleanup()` manually.

## Core principle

"The more your tests resemble the way your software is used, the more confidence they can give you." (Kent C. Dodds)

Test what the **user** sees and does. Never test what the component does internally.

## What to test

1. **Rendered content**: Given props/state, the correct text, elements, and structure are visible.
2. **User interactions**: Click, type, submit — then assert the visible result.
3. **Conditional rendering**: Given state X, element Y is/isn't visible.
4. **Loading, error, and empty states**: All three branches of async data.
5. **Accessibility**: If you can't query by role or label, your UI probably has an accessibility problem.
6. **Callback props**: That `onSelect`, `onChange`, etc. were called with the correct data (an outgoing command — the call IS the behavior).

## What NOT to test

- Internal state (`useState` values) or component instance methods.
- Which child components rendered (structure, not behavior).
- CSS classes or style objects (unless they drive visible show/hide behavior).
- That a hook was called with specific arguments (test the visible outcome instead).

## Query priority

Use this order. Higher = stronger signal that your UI is accessible.

1. **`getByRole`** — the gold standard. Use the `name` option: `getByRole("button", { name: "Add to cart" })`.
2. **`getByLabelText`** — form fields. No label = a bug.
3. **`getByPlaceholderText`** — fallback when no label exists (prefer adding a label).
4. **`getByText`** — non-interactive content.
5. **`getByDisplayValue`** — filled form elements.
6. **`getByAltText`** — images.
7. **`getByTestId`** — last resort only.

## Patterns

### Rendering

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

it("renders the title and children", () => {
  render(
    <Card title="Blue Bottle" href="https://example.com">
      Content
    </Card>,
  );

  expect(screen.getByText("Blue Bottle")).toBeDefined();
});
```

When a component needs context (router, theme, query client), wrap it in the real provider. If several tests need the same providers, extract a local `renderWithProviders()` helper rather than repeating the wrapper per test.

### User interactions

Use `userEvent` (not `fireEvent`) — it simulates real browser behavior (keydown, keyup, focus, blur).

```tsx
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

it("calls onSelect when clicked", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<ItemCard onSelect={onSelect} />);

  await user.click(screen.getByRole("button", { name: /select/i }));

  expect(onSelect).toHaveBeenCalledWith(1);
});
```

### Async data / network

Mock at the network boundary, not by stubbing `fetch` — add [MSW](https://mswjs.io/) when the app starts making requests. Test all three async branches (loading, success, error) via `findBy*`:

```tsx
it("shows results after loading", async () => {
  render(<ResultsList />);

  expect(await screen.findByText("Blue Bottle")).toBeInTheDocument();
});
```

### Hooks

Prefer testing hooks through a component that uses them. Only reach for `renderHook` (from `@testing-library/react`) for shared hooks with complex logic, wrapping with the same providers the app uses.

## `waitFor` / `findBy` usage

- Use `findBy*` for elements that appear after async work (cleaner than `waitFor(() => getBy*)`).
- One assertion per `waitFor` callback. Never put side effects (`userEvent`) inside `waitFor`. Never pass an empty callback.

## Don'ts

- No shallow rendering. Render components with their real children.
- No snapshot tests for UI — they break on every change and get rubber-stamped in review.
- No `container.querySelector()` or CSS-class selectors. Use accessible queries.
- No manual `cleanup()` — it runs automatically.
- No unnecessary `act()` wrapping — `render` and `userEvent` already handle it. An `act()` warning means a genuine async update you need to `await`.
