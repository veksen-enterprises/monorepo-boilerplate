# Context

> **Status: TEMPLATE — not yet authored.** Every `<…>` is a slot to fill and every
> _italic line_ is coaching to delete once written. This file is the project's domain
> model and ubiquitous language — the shared vocabulary the code and the team use for
> the same things. Several agent skills read it (`domain-modeling`, `diagnosing-bugs`,
> `codebase-design`). Architecture decisions live next door in `docs/adr/`. Fill this
> when the domain has real nouns worth pinning down, or delete it — don't ship the blanks.

## Core

`<2–4 sentences: what this system is in domain terms — the nouns it manipulates and the`
`job it does. Not the tech stack (that's CLAUDE.md), the _domain_.>`

## Ubiquitous language

_The terms the team says out loud, defined once so code, docs, and conversation use them_
_the same way. A term earns a place here only if using the wrong word would cause a bug or_
_a misunderstanding — don't pad it with generic software words. Name it, define it in one_
_line, and note anything it is often confused with._

| Term     | Means                                   | Not to be confused with        |
| -------- | --------------------------------------- | ------------------------------ |
| `<Term>` | `<one-line definition in domain words>` | `<the near-synonym it is not>` |
| `<Term>` | `<…>`                                   | `<…>`                          |

## Key concepts

_The few entities/aggregates the domain is built from. For each: what it is and the one or_
_two things that make it non-obvious. Cut anything a reader could infer from its name._

### `<Concept>`

`<what it is, and the non-obvious part — a lifecycle, an ownership rule, a state it can be in>`

## Invariants

_Rules that must always hold — the things a change can silently break. These are the_
_highest-value lines in the file: they're what `diagnosing-bugs` checks a suspect change_
_against. Write each as a statement that could be true or false, not a vague aspiration._

- `<X can never Y>` — `<why; what breaks if it's violated>`
- `<Every A has exactly one B>` — `<…>`

## Boundaries

_Where this context ends and another begins — the seams where data crosses into a different_
_model (an external API, another service, a different bounded context). Name what changes at_
_the seam. Delete this section if the project is a single small context._

- `<Boundary>` — `<what model/owner is on the other side, and what translates across>`

---

Architecture decisions and their rationale live in [`docs/adr/`](docs/adr/). When a choice
here has a "why" worth preserving, record it as an ADR and link it from the relevant term.
