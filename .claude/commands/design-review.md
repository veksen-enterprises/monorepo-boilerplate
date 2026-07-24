Perform a design review of the current uncommitted UI changes using a subagent (clean context).

Scope: only files touching the UI layer — components, routes/pages, styles, `packages/ui`.
If `git diff` has no UI changes, say so and stop.

Read `.claude/skills/design/design.md` first, then run `git diff` and check each changed UI surface
against it. Flag the rule tag (`[lint]`/`[axe]`/`[review]`) on each finding.

For the craft dimensions, pull in the vendored design skills: **`better-colors`** (OKLCH color,
palette generation, contrast, Tailwind v4 theming) and **`better-typography`** (type scale, heading
hierarchy, spacing, wrapping, tabular numbers); for interaction/polish and motion use Emil's
**`emil-design-eng`**, **`apple-design`**, and **`review-animations`**. Verify contrast with
**`better-colors`**.

1. **Color & tokens** — raw hex/`rgb()`/`hsl()` instead of `@theme` tokens? Purple/indigo accent
   by reflex instead of a named brand token? Neutrals consolidated or scattered raw grays? Plausible
   contrast on the actual background (verify with `better-colors`)? For palette/token work, consult
   `better-colors` (OKLCH, gamut, dark-mode ramps).
2. **Typography** — deliberate type scale and heading hierarchy, sensible line-height/measure,
   `tabular-nums` on any value the user compares or that updates in place, no reflow on a number
   change? Consult `better-typography`.
3. **Interactions** — `focus-visible:` (not bare `focus:`)? Focus ring intact? Paste not disabled?
   Adequate hit target? `cursor-pointer` only on clickables? A visible hover state on every clickable?
   Consult `emil-design-eng` for interaction and hover polish.
4. **Keyboard & a11y** — fully keyboard-operable? Using a Base UI primitive instead of a hand-rolled
   focus/aria implementation? Flag obvious gaps.
5. **State coverage** — does every async view handle loading, empty/zero, error, and success? Are
   empty/error states useful and actionable?
6. **Motion** — `prefers-reduced-motion` respected? CSS over main-thread JS? Animating
   `transform`/`opacity`, short and interruptible? Consult `apple-design` / `review-animations` for motion craft.
7. **Layout** — responsive, CSS-driven sizing (no fixed heights that clip)? No overflow / long
   strings handled?
8. **Forms** — labels via the `Field` component (not placeholder-as-label)? Specific validation
   messages? Correct `type`/`autocomplete`?
9. **Components** — reusing `@repo/ui` + Base UI? Variants via CVA + `cn()`, not hand-built class
   strings or a forked one-off?
10. **Voice / not generic** (`design-anti-slop.md`) — default-AI accent (purple/indigo/blue gradient
    by reflex)? Generic skeleton (three-box icon grid, nested cards, centered-hero SaaS template)?
    Placeholder content instead of real domain content? Boilerplate empty/error copy? Could this
    screen belong to any app unchanged?

Provide prioritized findings, each tagged with the rule and `file:line`. Separate
**[lint]/[axe] (hard gate)** from **[review] (judgment)**. If everything passes, say so.
