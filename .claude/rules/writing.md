---
globs: "*"
---

# Not Shipping Writing AI Slop — A Guide for Docs, PRs, and Comments

Reference brief for any agent writing prose — documentation, PR descriptions, issue bodies,
commit messages, code comments, and replies in chat. An answer to the user is prose and
follows the same rules. The goal: text that reads like a person who knows the subject wrote
it, not text that was generated. Read this before writing prose.

> **Relationship to `CLAUDE.md`.** CLAUDE.md's comment policy ("Explain WHY, not WHAT. No
> filler. No AI-slop.") is the enforced rule for code comments and wins where it applies. This
> brief is the complementary **voice guide** for all prose — is the writing plain and authored,
> or padded and generic. It's the text twin of `design-anti-slop.md` (which covers UI).

---

## 1. What "writing AI slop" is

Slop is not incorrect writing — it's **generic** writing. Grammatical, competently assembled,
and empty: the statistical median of every doc and blog post the model has read. It explains
things nobody asked about, hedges claims it should have verified, sells instead of describing,
and narrates its own reasoning. The failure mode is _padding and posturing_, not _errors_. It
reads fine sentence by sentence and says little in aggregate.

## 2. Why it happens

LLMs reach for the highest-frequency patterns in their training data. For prose that means
explanatory scaffolding ("Let's dive into…", "It's worth noting that…"), marketing register
(every feature is "powerful" and "seamless"), reflexive hedging, and relentless parallel
structure with em-dashes. Given a vague instruction ("write the docs"), the model fills the
space with these defaults.

**The implication:** slop is the default output. Plain writing is not passive — it requires
actively cutting what the model wants to add.

## 3. The fingerprints (the tells to never ship)

- **Self-narration** — narrating the reader's confusion or the doc's own reasoning instead of
  stating facts. "This isn't documented anywhere." "You might think X, but actually…" "This is
  a common reason it looks broken." Any sentence _about_ the explaining rather than the thing.
- **Marketing speech** — selling instead of describing. "The quickest way to…", "powerful",
  "seamless", "unlock", "supercharge", and upsell transitions ("move to X to get…").
- **Invented jargon** — coining a Capitalized noun for an internal concept and leaning on it
  ("the Sync", "a Handoff") when the reader already has plain words ("save to the server",
  "pass the work on"). Same for quoted mini-terms ("the 'wash' case", "volunteered honesty").
- **Moralizing frames** — wrapping a fact in its own significance ("the surfaces where trust
  is actually won", "sitting unused as a trust signal") instead of stating fact, location,
  fix. Includes the closing moral: a final paragraph restating the findings as a theme ("The
  through-line: …").
- **Slogan headers** — headings that argue instead of label ("Say when the reader doesn't
  need you — the biggest gap"). A heading names its contents.
- **Unverified claims stated as fact** — asserting a mechanism or benefit you never checked
  ("retries are handled automatically"). If you didn't verify it, don't write it.
- **Filler and redundancy** — sentences that restate the heading, echo the previous sentence,
  or repeat a link already on the page. Summary lines that add nothing ("In short, …").
- **Clichés and buzzwords** — "compounds", "pays off", "close the loop", "safety net",
  "forcing function", "robust", "leverage", "it's worth noting", "simply", "just".
- **Reflexive hedging** — "you may be able to", "this is a signal that", "can potentially",
  where the fact is plain.
- **Over-polished rhythm** — every sentence the same length, parallel triples, em-dashes as a
  tic, aphoristic punchlines ("you just never sell it"). If a sentence sounds quotable,
  rewrite it as information.

## 4. The discipline that prevents it

### 4a. State the fact, not the narration of the fact

Delete any clause about the explaining itself. "So a missing value isn't proof the import
failed — more often…" collapses to the fact: what a missing value means and what to do about
it.

### 4b. Verify before you assert

If you write "X does Y", you must have checked it — run it, read the code, or read a primary
source. A plausible-sounding mechanism you didn't verify is a lie waiting to be caught. When
you can't verify, say so plainly or cut the claim.

### 4c. Use plain words the reader already has

Don't invent a Capitalized concept-noun and make the reader learn it. Name the thing in words
they know. If a term is genuinely necessary, define it once and move on.

### 4d. Cut every sentence that adds no information

The test: delete the sentence. If the meaning survives, it was slop. Sentences that restate
the heading, echo the sentence before, or repeat a nearby link all fail it.

### 4e. Describe, don't sell

Say what a thing does and its trade-off. Drop "powerful", "the quickest way", and upsell
transitions. The reader decides; you inform.

### 4f. Match an existing plain-voiced page

When unsure of register, open a page that already reads well and mirror it — don't invent a
new voice per document.

### 4g. One point per sentence, short and direct

Prefer the plain sentence over the balanced, em-dashed one. Vary sentence length for clarity,
not to sound literary.

## 5. The judgment layer

Constraints get you out of the slop basin; judgment is what makes it good:

- Would someone who knows this subject write this sentence, or is it filler around the one real
  point?
- Is every claim something I actually verified?
- What did I cut? If nothing, I didn't edit.
- Could this paragraph belong to any project, or only this one?

## 6. Pre-ship checklist

- [ ] No self-narration — no sentence about the reader's confusion or the doc's own reasoning.
- [ ] No marketing register — no "powerful / seamless / quickest way", no upsell.
- [ ] No invented Capitalized jargon; plain words the reader already has.
- [ ] Every factual claim verified — ran it, read the code, or a primary source.
- [ ] Every sentence adds information; deleting it would lose something.
- [ ] No clichés or buzzwords, no reflexive hedging.
- [ ] No moralizing frames or closing moral; headings label, they don't argue.
- [ ] Register matches an existing plain-voiced page.
- [ ] Read it aloud — it sounds like a person, not a brochure.

---

### Sources

- George Orwell, [_Politics and the English Language_](https://www.orwellfoundation.com/the-orwell-foundation/orwell/essays-and-other-works/politics-and-the-english-language/)
  — cut the ready-made phrase; never use a long word where a short one works.
- Strunk & White, _The Elements of Style_ — "Omit needless words."
- Paul Graham, [_Write Like You Talk_](https://www.paulgraham.com/talk.html) — plain spoken
  register beats formal padding.
