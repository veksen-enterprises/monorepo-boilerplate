---
globs: "packages/ui/**,apps/*/src/**,**/*.css"
---

# Design Rules

Imperative rules for any UI work (components, routes/pages, styles). Keep this short and
follow it; the long-form reasoning lives in review, not here.

Each rule is tagged with how it's enforced:

- **[lint]** — fails `npm run lint` (oxlint + `scripts/design-lint.mjs`). Treat as a hard gate.
- **[axe]** — belongs to accessibility tests (not yet wired; treat as hard until then).
- **[review]** — checked by `/design-review` against the diff. No machine gate; don't skip it.

## Color & tokens

- **[lint]** Use `@theme` tokens, never raw hex, `rgb()`, or `hsl()` in components. Tokens live in
  `packages/tailwind-config/shared-styles.css`. If a value isn't a token, add a token first.
- **[lint]** No purple/indigo/violet/fuchsia accent chosen by reflex — it's the canonical AI-slop
  tell. The brand accent is a named `@theme` token picked for a reason (see `design-anti-slop.md`).
  The starter ships purple-by-default in a few components; those are grandfathered in
  `scripts/design-lint-baseline.json` — replace them when you define your palette, don't add more.
- **[review]** Consolidate neutrals. Scattering raw `neutral-*/gray-*/zinc-*` across components is
  how a palette drifts into slop — define a neutral scale in `@theme` and use it consistently.
- **[axe]** Text meets contrast targets (WCAG AA: 4.5:1 body, 3:1 large/UI). Verify on the actual
  composited background — use the `apca-contrast` skill rather than eyeballing.

## Typography & numbers

- **[review]** The font is a deliberate choice (this starter ships Geist Sans/Mono via `@theme
--font-sans/--font-mono`), never Inter-or-system-by-default. Keep type on the token.
- **[review]** Use `tabular-nums` for any numbers the user compares or that update in place —
  prices, counts, stats, timers. Misaligned digits in a list is a bug, not a nitpick.
- **[review]** Headings & buttons: Title Case. Body copy & helper text: sentence case.
- **[review]** No layout shift from number changes — reserve width so a value ticking 9→10 doesn't
  reflow the row.

## Interactions

- **[lint]** Style focus with `focus-visible:`, never bare `focus:`. Never remove a focus ring
  without replacing it with a visible one.
- **[lint]** Never disable paste on `<input>`/`<textarea>`.
- **[review]** Interactive elements have a hit target ≥ the declared `size` (Button `sm` = `h-8`
  min). Add `touch-action: manipulation` to custom tap targets. Don't ship a 16px control.
- **[axe]** Every flow is fully keyboard-operable. Prefer a Base UI primitive (`@base-ui/react`)
  over hand-rolling focus/aria — it gives you WAI-ARIA patterns for free.
- **[review]** `cursor-pointer` only on genuinely clickable elements (match the Button pattern),
  never on text or disabled controls.

## State coverage

- **[review]** Every async view handles four states explicitly: loading, empty/zero-results,
  error, and success. A spinner-only happy path is incomplete.
- **[review]** Empty and error states say something useful and offer the next action — not just
  "No results" / "Something went wrong".
- **[review]** Forgiving interactions: confirm destructive actions, make inputs recoverable, don't
  punish a misclick.

## Motion

- **[review]** Respect `prefers-reduced-motion` for any non-trivial animation.
- **[review]** Prefer CSS transitions/animations over main-thread JS. Animate `transform` and
  `opacity`, not layout properties. Match the existing `transition-colors` idiom.
- **[review]** Animations are interruptible and short (≤ ~200ms for UI feedback).

## Layout & responsiveness

- **[review]** Layouts are responsive and driven by CSS sizing (flex/grid/clamp), not fixed pixel
  heights that clip content.
- **[review]** No horizontal scroll at supported widths. Long strings truncate or wrap
  deliberately, never overflow.

## Forms

- **[review]** Every input has an associated label — use the `Field` component (`@repo/ui`), don't
  rely on placeholder-as-label.
- **[review]** Validation messages are specific and tied to the field (`Field.Error`). Don't block
  submit silently; say what's wrong.
- **[axe]** Inputs expose correct `type`/`autocomplete` so autofill and password managers work.

## Components

- **[review]** Reach for `@repo/ui` + Base UI before hand-rolling. New shared primitives go in
  `packages/ui/src`, following the existing structure (component + `index.ts` + test).
- **[review]** Variants use CVA (`cva({ base, variants, defaultVariants })`) and merge classes with
  `cn()`. Don't concatenate class strings by hand or fork a component for a one-off.
- **[review]** No inline magic spacing/sizing that duplicates an existing variant — extend the
  variant instead.

## Voice (not generic)

The rules above keep UI correct and on-system. These keep it from looking AI-generated — the
long-form reasoning lives in `.claude/rules/design-anti-slop.md`.

- **[review]** No default-AI accent: no purple/indigo or blue→purple gradient chosen by reflex.
  The accent is an `@theme` token picked for a reason.
- **[review]** No generic skeleton: avoid the three-box icon-grid feature section, card-in-card
  nesting standing in for hierarchy, and the centered-hero → features → testimonials →
  3-col-footer SaaS template. Hierarchy comes from meaning, not containers.
- **[review]** Real domain content in any mockup/example — actual names, values, copy. No
  "Item 1 / Lorem ipsum / $0.00" placeholders (they also hide real-length layout bugs).
- **[review]** Empty/error states carry product personality, not boilerplate copy.
- **[review]** The screen could only be _this_ product. If it would fit any generic app unchanged,
  it's slop — give it a point of view.
