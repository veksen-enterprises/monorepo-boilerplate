# Vision

> **Status: TEMPLATE — not yet authored.** Every `<…>` below is a slot to fill and
> every _italic line_ is coaching to delete once written. This file is the product
> north star; `CLAUDE.md` points here and `.claude/vision-digest.md` carries the
> always-on short form. A vision left as placeholders is worse than none — fill it
> deliberately or delete it, don't ship the template.

## North star

**`<one sentence: what this product is and the single outcome it exists to create>`.**

_The test: could this sentence describe a competitor unchanged? If yes, it's too_
_generic. Name the specific user and the specific job — "the fastest way for `<user>`_
_to `<job>`", not "a platform for `<category>`". One sentence. If you need three, the_
_product isn't decided yet._

## Guiding principle — `<the one rule every decision bows to>`

`<2–4 sentences: the core stance that resolves arguments. State it as a bias, not a`
`platitude. What does this product refuse to do that competitors do — and why is that`
`refusal the point?>`

_Every feature gets measured against this. Write it so that a proposed feature can_
_actually fail the test — a principle nothing can violate is decoration. (d2armory's is_
_"augment the existing flow, don't disrupt it"; yours should be as sharp and as_
_falsifiable.)_

## Values

_Two to four convictions that drive **how** the work feels and what you trade away._
_The signature move: they must **pull against each other**, and when they conflict you_
_**name the trade-off** instead of pretending it away. A value nothing competes with_
_isn't a value, it's a preference. Order them — the first one wins ties._

- **`<Value 1, e.g. Correctness>`.** `<Why it's non-negotiable, and what you'd sacrifice`
  `to keep it. What breaks if you get this wrong?>`
- **`<Value 2, e.g. Speed>`.** `<What "good" feels like concretely, and where it tensions`
  `with Value 1.>`
- **`<Value 3 — optional>`.** `<…>`

## The components

_The 2–4 parts the product is actually made of. For each: one line on what it is, then_
_the few capabilities that matter. If a "component" has no capabilities under it, it's a_
_feature, not a component — cut or merge it. Delete unused slots; don't pad to three._

### 1. `<Component name>`

`<one line: what this is and who it's for>`

- `<capability that matters>`
- `<capability that matters>`

### 2. `<Component name>`

`<one line>`

- `<capability that matters>`

## The foundation — `<the hard thing everything else rests on>`

_Optional but high-value: the one technical or conceptual bet that makes the rest_
_trustworthy (a data model, an algorithm, a rules engine, a latency budget). If there_
_is one, name it — it's usually the moat. If there genuinely isn't, delete this section_
_rather than inventing one._

`<what it is, and the 2–3 things it makes possible that would otherwise be impossible>`

## Non-goals

_The most valuable section, and the one AI output always omits. List what this product_
_deliberately will **not** do — especially the tempting, adjacent things a reader would_
_assume are in scope. Each non-goal should make someone slightly uncomfortable; if_
_they're all obvious, you haven't drawn the real boundary._

- **Not `<a tempting adjacent thing>`.** `<why it's out of scope — the boundary it protects>`
- **Not `<…>`.** `<…>`

## Open questions

_Unresolved on purpose. Naming a question is a decision — it says "we'll settle this_
_deliberately when we build the relevant part," not "we forgot." List the real forks_
_that will shape the product, not trivia. It's fine — good, even — to ship a vision with_
_open questions; it's not fine to pretend they're closed._

1. **`<question>`.** `<why it matters and what it forks — what changes depending on the answer>`
2. **`<question>`.** `<…>`
