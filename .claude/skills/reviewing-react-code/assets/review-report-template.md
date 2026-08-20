# Findings model and report template

The contract for how findings are bucketed, tagged, numbered and presented. Modelled on the
shared review-findings model used by the `workflow:code-review` skill, with topics adapted to a
React front end.

## Contents

- Two buckets, split by who acts
- Topic to bucket, and the overrides
- Tag, don't rank
- Numbering, grouping, ordering
- Recap is not the posted comment
- Report skeleton
- Rules that outrank the format

## Two buckets, split by who acts

The reviewer's attention is the scarce resource. The split separates findings that need **human
judgment** from the mechanical ones an assistant can apply from the comment alone — so the first
set is read closely and the second is skimmed.

| Bucket | Contents | Presentation |
| --- | --- | --- |
| **🔴 Needs your review** | judgment calls: is it correct, is it usable, is it safe, does it break consumers | shown **in full** — what's wrong, why it matters, the fix |
| **🟢 Auto-addressable** | mechanical, unambiguous fixes | shown as a **one-line recap** per finding |

The test for 🟢: *can you write the exact fix, such that someone could apply it without choosing
between options?* If yes, it is 🟢 whatever its topic. If it needs a decision, it is 🔴.

## Topic to bucket, and the overrides

| 🔴 Needs your review | 🟢 Auto-addressable |
| --- | --- |
| **Correctness** — hooks, state, effects, rendering, logic | **Tests** — missing coverage, weak assertions |
| **Accessibility** — keyboard, focus, ARIA, WCAG barriers | **Conventions & Lint** — project idiom, naming, formatting |
| **Security** — XSS, secrets, unsafe HTML, dependencies | **Code Quality** — dead code, duplication, simplification |
| **Public API & Breaking Changes** — props, exports, semver | **Performance** — one-line wins: a key, a hoisted formatter |

Topic is the starting point, not the verdict. Three overrides:

- **Genuine uncertainty** → tag `(question)` and place it in 🔴, whatever the topic.
- **Nature overrides topic when it is clear-cut.** A mechanical a11y fix (add the missing
  `type="button"`, add the label the pattern requires) is 🟢. A test asserting the *wrong*
  invariant, or a "convention" fix that changes behaviour, is 🔴.
- **Performance that depends on measurement** is 🔴 — the trade-off is a judgment call.

## Tag, don't rank

No blocking / important / nit ladder. No confidence score in the output. At most one tag per
finding:

| Tag | Meaning |
| --- | --- |
| *(untagged)* | a concern — address it. The default. |
| `(question)` | needs an answer before it is actionable. |
| `(suggestion)` | non-blocking alternative; what is there works. |

**Confidence is an internal filter, never shown.** Rate a finding privately if it helps, report
it only when you would stake ≥ 80 on it, then drop the number. Residual uncertainty becomes a
`(question)` in 🔴 — never a `[confidence: 85]` annotation.

Praise does not become a finding. It goes in **What looks good**, and only when earned.

## Numbering, grouping, ordering

- **Number continuously across the whole report**, 1..N, through both buckets, so any finding can
  be referred to by its number afterwards. Never restart numbering inside a topic.
- Group by topic inside each bucket; order by `file:line` inside a topic.
- Lead each bucket and each topic heading with its count.
- Omit an empty topic; omit an empty bucket entirely.

## Recap is not the posted comment

The 🟢 recap is the short pointer the *reviewer* reads: `path:line` plus a three-to-six word
description of the fix. It must still say *what is in the bucket* without opening the PR — never
collapse it to a bare count.

When a finding is posted to the PR, the comment carries the **full** finding for both buckets —
the plain-English problem, why it matters, the concrete fix — because that is what the author and
their assistant need. Never post a terse recap line as a comment body. Write the comment the way
you would say it to a colleague: lead with the problem in one sentence, one idea per sentence,
name the actual variable and what happens, and state the fix as an action.

## Report skeleton

```markdown
## Review — <target>

### Summary
<1-2 sentences: what the change does, whether it does it, and what stands between it and merge.>
**Scope:** <n> files (+<x>/−<y>) · dimensions: correctness, a11y, tests
**Gates:** lint ✅ · types ✅ · unit tests ✅ (123) · e2e not run

### What looks good
- <Non-obvious thing done right. Omit the section rather than padding it.>

### 🔴 Needs your review (2)

#### Correctness (1)
1. **`src/Tabs.tsx:118`** — Arrow keys skip the last enabled tab when the previous one is
   disabled: `getNextIndex` returns the disabled index and `tabRefs.current[i].focus()` throws
   on the missing node, so keyboard navigation dies with a TypeError. Skip disabled entries in
   `getNextIndex` and guard the `focus()` call.

#### Accessibility (1)
2. **`src/Tabs.tsx:281`** `(question)` — An explicitly selected disabled tab still gets
   `aria-selected="true"` and `aria-disabled="true"` on the same element. Is honouring the
   consumer's explicit request intended here, or should it fall back like the uncontrolled path?

### 🟢 Auto-addressable (3)

> Recap only — one line per finding, the full text goes in the PR comment.

**Tests (2)**
3. `src/__tests__/Tabs.test.tsx:206` — add the uncontrolled disabled-first-tab case
4. `src/__tests__/Tabs.test.tsx:515` — assert focus after Home

**Code Quality (1)**
5. `src/Tabs.tsx:303` — collapse the dead branch, reuse `fallbackState`'s index

### Not covered
- <Dimensions skipped, gates not run, files read only partially.>
```

## Rules that outrank the format

- **Location or nothing.** No `file:line`, no finding.
- **Quote the tool** when a gate failed; never paraphrase an error message.
- **Say what was not done.** Silence about coverage reads as full coverage, and that is the one
  thing a review must never fake.
- No score, no grade, no emoji summary beyond the two bucket markers.
