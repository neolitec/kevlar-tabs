---
name: naming-branches
description: Derives a branch name that matches the repository's own convention, and renames a branch that does not follow it. Use when creating a branch, when about to run git checkout -b or git switch -c, when a branch name looks off or was auto-generated from an issue, when a push is rejected for its branch name, or before opening a pull request from a badly named branch.
allowed-tools: Read, Grep, Glob, Bash
---

# Naming branches

Branch names are read by people scanning a PR list and by automation that parses them. A name
that matches the repository's convention costs nothing at creation and saves a rename later.

**Derive the convention from the repository — never impose one.** Conventions differ per repo,
and the wrong prefix can be rejected by a server-side hook.

## Step 1 — Read the convention

```bash
bash .claude/skills/naming-branches/scripts/branch-convention.sh
```

It prints the prefixes actually in use (from remote branches and merged PRs), the commit types in
use, whether ticket keys appear in branch names, and a verdict on the current branch. Read-only.

Also check, when present: `contributing.md`, `CLAUDE.md`, `commitlint.config.*` (its type list is
the branch-type vocabulary), and any documented push rule. Automation-owned prefixes —
`dependabot/`, `renovate/`, `release-please--*` — are not examples to copy.

## Step 2 — Build the name

```
<type>/<slug>                    most repos
<type>/<TICKET-KEY>/<slug>       when the script reports ticket keys in use
```

**Type** — the same type the primary commit will carry, so the branch and the changelog agree.
Use the vocabulary the script reports; the conventional-commit set is the usual one:

| Type | For |
| --- | --- |
| `feat` (or `feature`) | new user-visible capability |
| `fix` | bug fix |
| `docs` | documentation, readme, docs site |
| `chore` | tooling, config, dependencies, agent skills — anything that ships no library code |
| `ci` | workflows, pipelines |
| `refactor` | behaviour-preserving restructuring |
| `test` | tests only |
| `perf` | performance work |
| `build` | build system, packaging, release plumbing |

When a change spans types, pick the type of its **point**: a fix that needed a refactor is
`fix/`.

**Slug** — two to five words, lowercase, kebab-case, ASCII, no trailing slash:

- Describe **what changes**, not what the ticket is titled: `fix/disabled-first-tab`, not
  `fix/uncontrolled-tabs-selects-a-disabled-first-tab-when-no`.
- Keep the whole name under ~50 characters. If it does not fit, the slug is a sentence — cut it.
- No author or agent name, no date, no issue number in the slug (the ticket segment holds it when
  the repo uses one), no `wip`, no `new`, no `update`, no `stuff`.

## Step 3 — Create or rename

**New branch** — always from an up-to-date base:

```bash
git fetch origin
git switch -c <type>/<slug> origin/main
```

**Rename, not yet pushed:**

```bash
git branch -m <old> <new>
```

**Rename, pushed, no pull request open:**

```bash
git branch -m <old> <new>
git push -u origin <new>
git push origin --delete <old>
```

**Rename, pushed, pull request open — verify, do not assume.** GitHub documents that renaming a
branch retargets its open PRs. Observed behaviour in this repo differed: after

```bash
gh api -X POST "repos/<owner>/<repo>/branches/<url-encoded-old>/rename" -f new_name=<new>
```

the branch was renamed and the PR ended up **closed**, still pointing at the old ref, and
`gh pr reopen` failed because that ref no longer existed. So:

1. Rename, then immediately check: `gh pr view <n> --json state,headRefName`.
2. If it is still open and points at the new name, done.
3. If it closed, recreate it from the renamed branch (`gh pr create --head <new>`) and comment on
   the old one saying which PR supersedes it. Review threads on the old PR do not carry over —
   when a review is already in progress, the name is not worth the loss. Keep it and rename next
   time.

Then realign the local branch: `git branch -m <old> <new>`, `git fetch origin --prune`,
`git branch --set-upstream-to=origin/<new>`.

## Anti-patterns

| Name | Problem |
| --- | --- |
| `<username>/<truncated-issue-title>` | GitHub's default when a branch is created from an issue. Carries no type and gets cut mid-word. Rename before pushing. |
| `patch-1`, `patch-2` | GitHub's web-editor default. Says nothing. |
| `fix-typo` (no slash) | no type segment, so it sorts and filters with nothing else. |
| `feature/JIRA-123` | ticket key with no slug: unreadable in a PR list. |
| `Feature/Add-Thing` | uppercase and mixed separators; keep everything lowercase and hyphenated. |
| `chore/misc`, `wip`, `test2` | describes nothing; the next reader has to open the diff. |
| a long-lived `develop`-style branch for one change | one branch per change. |

## Notes

- A push rejected for its name means a server-side pattern exists. Read the error, match the
  pattern it prints, and rename with `git branch -m` — never invent a different prefix hoping it
  passes.
- The branch name is not the changelog. Release tooling reads commit messages, so a mismatched
  branch type is cosmetic — but it is the first thing a reviewer sees.
- Reusable in any repository: nothing here is specific to this project, and the script reads the
  convention from whatever repo it runs in.
