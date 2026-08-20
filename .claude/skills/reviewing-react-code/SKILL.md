---
name: reviewing-react-code
description: Reviews React and TypeScript front-end code for correctness (hooks, state, effects, rendering), accessibility against WCAG 2.2 AA and the ARIA APG, performance and re-render cost, props and public API design, styling, security and test adequacy. Use when the user asks to review React/TSX code, a front-end change, branch, PR or diff, to audit a component, to run an accessibility or performance review, or to check hook, rendering, a11y or test quality in .tsx/.jsx files.
allowed-tools: Read, Grep, Glob, Bash
---

# Reviewing React code

Framework-agnostic within the React ecosystem: works on component libraries, Vite SPAs,
Next.js apps and RSC codebases. Detect the project's shape first, then review against the
dimensions that actually apply.

## Review workflow

Copy this checklist into the response and tick items as they complete:

```
Review progress:
- [ ] 1. Resolve the target and collect the diff
- [ ] 2. Profile the project and load its local conventions
- [ ] 3. Select review dimensions, read the matching reference files
- [ ] 4. Review each changed file, verify every finding against the code
- [ ] 5. Run the project's own gates, drop findings the tooling already reports
- [ ] 6. Write the report
```

### Step 1 — Resolve the target and collect the diff

Run the context collector from the repository root:

```bash
bash .claude/skills/reviewing-react-code/scripts/collect-context.sh [base-ref]
```

It prints the diff target, the changed files grouped by kind, the project profile and the
gates available in `package.json`. It is read-only.

Target resolution, in order of what the user asked for:

| The user said | Target |
| --- | --- |
| nothing, "review my changes" | uncommitted changes, else `<base>..HEAD` (the script picks the base) |
| a branch or ref | `git diff <merge-base>...<ref>` |
| a PR number or URL | `gh pr diff <n>` for the diff, `gh pr view <n>` for intent |
| a path or component name | full-file audit of that path, diff ignored |

Read the intent before the code: PR/commit messages, linked issue, changelog entry. A change
that does what it says badly and a change that does something else are different findings.

### Step 2 — Profile the project and load its local conventions

The project's own conventions outrank everything in this skill. Read, when present:

- `CLAUDE.md`, `AGENTS.md`, `contributing.md` — explicit house rules.
- `eslint.config.*` / `.eslintrc.*` — **especially disabled rules with a comment explaining
  why**. A justified `eslint-disable` is a decision, not a defect. Never report it as one.
- `project-notes.md` next to this file — optional per-repo overlay (invariants, idioms,
  known non-negotiables). Read it if it exists; it is authoritative on this repo.
- `tsconfig.json` (`strict`, `noUncheckedIndexedAccess`), `.prettierrc`, CI workflows.
- Two or three untouched files near the change, to learn the local idiom.

Style the code already follows consistently is the standard, even where personal taste differs.

### Step 3 — Select dimensions and read the reference files

Read only what the change touches. Each file is a dense catalogue of checks.

| Dimension | Read when | Reference |
| --- | --- | --- |
| Hooks, state, effects, refs, rendering | any `.tsx`/`.jsx`/hook change (almost always) | `reference/react-correctness.md` |
| Accessibility, keyboard, focus, ARIA | markup, interaction, widget or CSS-visibility change | `reference/accessibility.md` |
| Re-renders, memoization, bundle, lists | perf-sensitive trees, lists, context, imports | `reference/performance-rendering.md` |
| Types, props and public API design | props, exported types, component signatures | `reference/typescript-and-api.md` |
| Test adequacy and test quality | every change (also when no test changed) | `reference/testing.md` |
| CSS, styled-components, Tailwind, RTL | styles, class names, theming, layout | `reference/styling-and-css.md` |
| XSS, secrets, unsafe HTML, deps | `dangerouslySetInnerHTML`, URLs, storage, env, new deps | `reference/security.md` |
| SSR, RSC, hydration, package exports | Next.js/RSC app, or a published library's build output | `reference/ssr-and-packaging.md` |

### Step 4 — Review, and verify every finding

For each changed file: read the whole file, not the diff hunk alone. A hook change is only
correct in the context of its call sites — grep for them.

**Evidence rule — a finding ships only when all four hold:**

1. It points at a real line in the changed code (`path/file.tsx:42`).
2. A concrete failure can be described: inputs or state → the wrong behaviour that results.
   "Could be a problem" is not a finding; delete it.
3. The surrounding code has been read and does not already handle it (guard upstream, prop
   type that makes the case impossible, comment explaining the choice).
4. It is not a restatement of a rule the project deliberately turned off.

When a suspicion cannot be verified, either verify it with a grep or a test run, or drop it.
Report it as a `[question]` only when the answer genuinely needs the author's intent.

Prefer few high-confidence findings over broad coverage. Ten shaky findings train the author
to ignore the review.

### Step 5 — Run the project's own gates

Run whatever exists (the collector prints the commands): lint, typecheck, unit tests, and
`test:e2e` only when the change is behavioural and the suite is cheap. Then:

- A failure the tooling reports **is** the finding — quote the output, don't re-derive it.
- A finding the linter would already flag is noise. Drop it, or state that lint catches it.
- If a gate cannot run (missing deps, no network), say so in "Not covered". Never imply a
  gate passed when it was not run.

### Step 6 — Write the report

Use `assets/review-report-template.md`. Severity, one label per finding:

| Label | Meaning |
| --- | --- |
| `[blocking]` | Wrong behaviour, data loss, security hole, a11y barrier, breaking change to a public API. Must not merge. |
| `[important]` | Real defect with a narrow blast radius, missing test for new behaviour, notable perf regression. Should fix now. |
| `[nit]` | Readability, naming, small duplication. Author's call. |
| `[question]` | Needs the author's intent before it can be judged. |
| `[praise]` | A non-obvious thing done well. Include at most two, only when earned. |

Each finding: the claim in one line, `file:line`, the concrete failure, the smallest fix.
Show a patch only when the fix is not obvious from the sentence.

End with an explicit verdict and an explicit **Not covered** list — dimensions skipped, gates
not run, files read only partially. Silence about coverage reads as full coverage.

## Reusing this skill in another React project

Copy `.claude/skills/reviewing-react-code/` into the other repo. The reference files and the
collector are project-agnostic; only `project-notes.md` is repo-specific — rewrite it (or
delete it) for the new repo.
