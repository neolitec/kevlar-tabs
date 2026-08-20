# Review report template

Adapt the sections to what the change contains: drop empty severity sections, never drop
**Verdict** or **Not covered**. Keep each finding to the four lines below — the claim, the
location, the concrete failure, the fix.

```markdown
## Review — <target: branch, PR #n, or path>

**Verdict:** changes requested | approve with comments | approve
**Scope:** <n> files (+<x>/−<y>) · dimensions reviewed: correctness, a11y, tests
**Gates:** lint ✅ · types ✅ · unit tests ✅ (142) · e2e not run

### Blocking

1. **Arrow keys skip the last enabled tab when the previous one is disabled** ·
   `src/Tabs.tsx:118` · `[blocking]` `[correctness]`
   With `<Tab disabled/>` in the last position, `getNextIndex` returns the disabled index and
   `tabRefs.current[i].focus()` throws on the missing node — keyboard navigation dies with a
   TypeError.
   Fix: skip disabled entries in `getNextIndex`, and guard the `focus()` call.

### Important

1. **New `orientation` prop has no test for the vertical keyboard path** · `src/Tabs.tsx:96` ·
   `[important]` `[test-coverage]`
   Nothing fails if Up/Down stop working; the existing suite only covers the horizontal axis.
   Fix: add a vertical case asserting `ArrowDown` selection and `Home`/`End` behaviour.

### Nits

1. `tabNamesKey` recomputed on every render · `src/Tabs.tsx:71` · `[nit]` `[efficiency]`
   Cheap for realistic tab counts; mentioned only for symmetry with the memoized values above.

### Questions

1. Is the consumer meant to win over the injected `className` on `Tab`? · `src/Tabs.tsx:165` ·
   `[question]`
   The spread order gives the consumer precedence for `className` but not for `onClick`. If that
   asymmetry is deliberate, a comment would keep the next reader from "fixing" it.

### Worth keeping

- The adjust-state-during-render pattern at `src/Tabs.tsx:78` with the comment explaining why it
  replaces a prop→state effect: correct, and the reason survives the next refactor.

### Not covered

- e2e suite not run (needs browsers installed); the keyboard assertions above are from reading
  `e2e/keyboard-navigation.spec.ts`, not from a run.
- Styling and packaging not reviewed — untouched by this diff.
```

## Rules that matter more than the format

- **One label per finding.** A `[blocking]` list of fifteen items is a triage failure.
- **Location or nothing.** No `file:line`, no finding.
- **Quote the tool** when a gate failed; do not paraphrase an error message.
- **Say what was not done.** Skipped dimensions, unrun gates, files skimmed. Silence reads as
  full coverage, and that is the one thing a review must never fake.
- **No score, no grade, no emoji summary.** A verdict and the findings are the deliverable.
