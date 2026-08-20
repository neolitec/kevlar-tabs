#!/usr/bin/env bash
# Reports the branch-naming convention a repository actually uses, and checks the
# current branch against it. Read-only: no fetch, no write, no rename.
#
# Usage: bash .claude/skills/naming-branches/scripts/branch-convention.sh [candidate-name]
#   candidate-name  optional: validate this name instead of the current branch.

set -uo pipefail

CANDIDATE_ARG="${1:-}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository — nothing to derive a convention from."
  exit 0
fi

cd "$(git rev-parse --show-toplevel)" || exit 1

# Branch names owned by automation are conventions of their tools, not of this
# repository, so they must not be counted as examples to follow.
AUTOMATION='^(dependabot|renovate|release-please|gh-readonly-queue|revert)'

# The conventional-commit family plus the aliases repositories commonly accept.
# A prefix outside this set is not a type, however often it appears — the most
# frequent prefix in a repo is often the username form GitHub generates from an
# issue, which is exactly what this skill exists to correct.
TYPES='feat|feature|fix|bugfix|hotfix|docs|chore|ci|refactor|test|perf|build|style|task|revert|release'

collect_names() {
  git for-each-ref --format='%(refname:short)' refs/remotes 2>/dev/null |
    sed 's|^[^/]*/||'
  # Merged branches are usually deleted, so live refs alone under-sample the
  # history. Merged PR head refs recover it when gh is available.
  if command -v gh >/dev/null 2>&1; then
    gh pr list --state merged --limit 100 --json headRefName \
      --jq '.[].headRefName' 2>/dev/null
  fi
}

NAMES="$(collect_names | grep -vE '^(HEAD|main|master|develop|trunk)$' |
  grep -vE "$AUTOMATION" | grep -v '^[[:space:]]*$' | sort -u)"

echo "# Branch convention in this repository"
echo

if [ -z "$NAMES" ]; then
  echo "No branch history to learn from (no remote, or a fresh repo)."
  echo "Fall back to \`<type>/<slug>\` with the commit types below."
else
  TOTAL="$(printf '%s\n' "$NAMES" | wc -l | tr -d ' ')"
  echo "## Prefixes in use ($TOTAL branches sampled)"
  echo
  printf '%s\n' "$NAMES" | grep '/' | sed 's|/.*||' | sort | uniq -c | sort -rn |
    while read -r count prefix; do
      if printf '%s' "$prefix" | grep -qE "^($TYPES)$"; then
        printf -- '- `%s/` — %d\n' "$prefix" "$count"
      else
        printf -- '- `%s/` — %d  ← not a type; do not copy (username or one-off)\n' \
          "$prefix" "$count"
      fi
    done

  NOSLASH="$(printf '%s\n' "$NAMES" | grep -cv '/')"
  [ "$NOSLASH" -gt 0 ] && echo "- (no prefix at all) — $NOSLASH"

  # A ticket segment is a repo-wide decision: either names carry one or they do not.
  TICKETS="$(printf '%s\n' "$NAMES" | grep -cE '^[A-Za-z]+/[A-Z]{2,}-[0-9]+/')"
  echo
  if [ "$TICKETS" -gt 0 ]; then
    echo "## Shape: \`<type>/<TICKET-KEY>/<slug>\` ($TICKETS branches carry a ticket key)"
    echo
    printf '%s\n' "$NAMES" | grep -E '^[A-Za-z]+/[A-Z]{2,}-[0-9]+/' | head -3 |
      awk '{ printf "- %s\n", $0 }'
  else
    echo "## Shape: \`<type>/<slug>\` (no ticket key in any sampled branch)"
  fi

  USED_TYPES="$(printf '%s\n' "$NAMES" | grep '/' | sed 's|/.*||' | sort -u |
    grep -E "^($TYPES)$" | tr '\n' ' ')"
  echo
  echo "## Prefixes to choose from here"
  echo
  echo "\`${USED_TYPES% }\` — pick the one matching the commit type below."

  echo
  echo "## Examples worth copying (shortest well-formed names)"
  echo
  printf '%s\n' "$NAMES" | grep -E '^[a-z]+/[a-z0-9]+(-[a-z0-9]+)*$' |
    awk '{ print length"\t"$0 }' | sort -n | cut -f2 | head -5 |
    awk '{ printf "- `%s`\n", $0 }'
fi

echo
echo "## Commit types in use (the branch-type vocabulary)"
echo
git log --no-merges --pretty=%s -200 2>/dev/null |
  grep -oE '^[a-z]+(\([^)]*\))?!?:' | sed -E 's/(\(.*\))?!?:$//' |
  sort | uniq -c | sort -rn | head -10 |
  awk '{ printf "- `%s` — %d commits\n", $2, $1 }'

if [ -f commitlint.config.cjs ] || [ -f commitlint.config.js ] ||
   [ -f commitlint.config.mjs ] || [ -f .commitlintrc.json ]; then
  echo
  echo "commitlint is configured: the branch type should come from the same set."
fi

# ---------------------------------------------------------------------------
# Verdict on one name
# ---------------------------------------------------------------------------
BRANCH="${CANDIDATE_ARG:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null)}"

echo
echo "## Verdict on \`$BRANCH\`"
echo

VERDICT_OK=1
say() { echo "- $1"; }
fail() { echo "- ✗ $1"; VERDICT_OK=0; }

case "$BRANCH" in
  main|master|develop|trunk|HEAD)
    say "Default branch — nothing to check. Create a working branch before committing."
    exit 0
    ;;
esac

if printf '%s' "$BRANCH" | grep -qvE '/'; then
  fail "No type segment: add a \`<type>/\` prefix."
else
  PREFIX="${BRANCH%%/*}"
  REST="${BRANCH#*/}"
  ALLOWED="$(printf '%s\n' "$NAMES" | grep '/' | sed 's|/.*||' | sort -u |
    grep -E "^($TYPES)$")"
  [ -n "$ALLOWED" ] || ALLOWED="$(printf '%s\n' "$TYPES" | tr '|' '\n')"
  if printf '%s' "$PREFIX" | grep -qE "^($TYPES)$"; then
    say "✓ Prefix \`$PREFIX/\` is a commit type."
  elif printf '%s' "$PREFIX" | grep -qiE "^($TYPES)$"; then
    fail "Prefix \`$PREFIX/\` is a type in the wrong case — lowercase it."
  else
    fail "Prefix \`$PREFIX/\` is not a type — likely a username, which is GitHub's create-branch-from-issue default. Use one of: $(printf '%s' "$ALLOWED" | tr '\n' ' ')"
  fi
  if printf '%s' "$REST" | grep -qvE '^[a-z0-9]+(-[a-z0-9]+)*(/[a-z0-9]+(-[a-z0-9]+)*)*$' &&
     printf '%s' "$REST" | grep -qvE '^[A-Z]{2,}-[0-9]+/'; then
    fail "Slug \`$REST\` is not lowercase kebab-case."
  fi
fi

LEN="${#BRANCH}"
if [ "$LEN" -gt 50 ]; then
  fail "$LEN characters — over ~50. Shorten the slug to 2-5 words."
else
  say "✓ $LEN characters."
fi

WORDS="$(printf '%s' "${BRANCH#*/}" | tr '/-' '  ' | wc -w | tr -d ' ')"
[ "$WORDS" -gt 6 ] && fail "$WORDS words in the slug — describe the change, not the issue title."

if printf '%s' "$BRANCH" | grep -qiE '(^|/)(wip|tmp|temp|test[0-9]*|patch-[0-9]+|new|misc|stuff|update)s?($|/|-)'; then
  fail "Contains a placeholder word — say what the change does."
fi

echo
[ "$VERDICT_OK" -eq 1 ] && echo "**Name is consistent with this repository.**" ||
  echo "**Rename before pushing — see SKILL.md step 3.**"
