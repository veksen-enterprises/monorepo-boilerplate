---
name: design
description: Use for any UI work in this repo — building or reviewing components, routes/pages, or styles (`.tsx` under `apps/*/src` or `packages/ui/src`, and any `.css`). Load before writing UI so the output is on-system and not AI-slop: `@theme` tokens over raw hex/grays, `focus-visible`, `tabular-nums`, all four async states (loading/empty/error/success), CVA + `@repo/ui`, and a deliberate (non-purple-reflex) accent. Covers both the enforced correctness ruleset and the anti-slop voice guide.
---

The design standards live in the files beside this one. Read both before UI work:

- **`design.md`** — the enforced correctness ruleset: `@theme` tokens, contrast, focus, state coverage, `.styles.ts`/`cn()`, `@repo/ui`, Base UI. Tags each rule with how it's enforced ([lint]/[axe]/[review]).
- **`design-anti-slop.md`** — the complementary voice guide: keeping UI authored, not generic (no reflex purple accent, real content, deliberate hierarchy).
