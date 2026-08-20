#!/usr/bin/env bash
# Collects the deterministic context for a React front-end review: the diff
# target, the changed files grouped by kind, the project profile and the quality
# gates declared in package.json.
#
# Read-only: it never writes to the repository and never touches the network.
# Usage: bash .claude/skills/reviewing-react-code/scripts/collect-context.sh [base-ref]

# No `set -e`: a missing tool or a shallow clone must degrade into a reported
# gap, not abort the collection.
set -uo pipefail

BASE_ARG="${1:-}"

section() { printf '\n## %s\n\n' "$1"; }
note() { printf -- '- %s\n' "$1"; }

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf '# Review context\n'
  section 'Diff target'
  note 'Not a git repository — no diff available, review in full-file audit mode.'
  REPO_ROOT="$(pwd)"
else
  REPO_ROOT="$(git rev-parse --show-toplevel)"
  cd "$REPO_ROOT" || exit 1
  printf '# Review context\n\nRepository root: %s\n' "$REPO_ROOT"
fi

# ---------------------------------------------------------------------------
# Diff target
# ---------------------------------------------------------------------------
CHANGED=""
TARGET_LABEL=""

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  resolve_base() {
    local candidate
    # An explicit argument wins; then the tracked upstream; then the usual
    # default-branch names, local or on origin.
    for candidate in "$BASE_ARG" \
      "$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)" \
      origin/main origin/master upstream/main main master; do
      [ -n "$candidate" ] || continue
      if git rev-parse --verify --quiet "$candidate" >/dev/null 2>&1; then
        echo "$candidate"
        return 0
      fi
    done
    return 1
  }

  BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  BASE="$(resolve_base)"
  WORKING="$(git status --porcelain 2>/dev/null)"

  section 'Diff target'
  note "Branch: ${BRANCH:-unknown}"

  if [ -n "$WORKING" ]; then
    TARGET_LABEL='uncommitted working-tree changes'
    note "Target: $TARGET_LABEL"
    CHANGED="$(git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)"
    printf '\n```\n%s\n```\n' "$(git diff --stat HEAD 2>/dev/null | tail -20)"
    printf '\nUntracked files:\n```\n%s\n```\n' "$(git ls-files --others --exclude-standard | head -20)"
  fi

  if [ -n "$BASE" ]; then
    MERGE_BASE="$(git merge-base "$BASE" HEAD 2>/dev/null)"
    RANGE_FILES="$(git diff --name-only "${MERGE_BASE:-$BASE}"...HEAD 2>/dev/null)"
    if [ -n "$RANGE_FILES" ]; then
      note "Branch commits: ${BASE}...HEAD"
      CHANGED="$CHANGED
$RANGE_FILES"
      [ -n "$TARGET_LABEL" ] || TARGET_LABEL="${BASE}...HEAD"
      printf '\n```\n%s\n```\n' "$(git diff --stat "${MERGE_BASE:-$BASE}"...HEAD 2>/dev/null | tail -20)"
      printf '\nCommits under review:\n```\n%s\n```\n' "$(git log --oneline "${MERGE_BASE:-$BASE}"..HEAD 2>/dev/null | head -20)"
    fi
  else
    note 'No base ref resolved (shallow clone or no default branch). Pass one as $1.'
  fi

  if [ -z "$CHANGED" ]; then
    note 'No diff found — review in full-file audit mode against the paths the user named.'
  fi
fi

# ---------------------------------------------------------------------------
# Changed files, grouped
# ---------------------------------------------------------------------------
if [ -n "$CHANGED" ]; then
  CHANGED="$(printf '%s\n' "$CHANGED" | grep -v '^[[:space:]]*$' | sort -u)"
  section 'Changed files by kind'
  # Each file lands in exactly one group: the first pattern that matches wins,
  # so a spec file is not also listed as a component.
  REMAINING="$CHANGED"
  group() {
    local label="$1" pattern="$2" hits
    hits="$(printf '%s\n' "$REMAINING" | grep -E "$pattern")"
    if [ -n "$hits" ]; then
      printf '**%s**\n```\n%s\n```\n\n' "$label" "$hits"
      REMAINING="$(printf '%s\n' "$REMAINING" | grep -vE "$pattern")"
    fi
    return 0
  }
  group 'Tests (unit)'      '(__tests__|\.test\.|\.spec\.)(.*)?(ts|tsx|js|jsx)$'
  group 'Tests (e2e)'       '^(e2e|tests?/e2e|cypress|playwright)/'
  group 'Stories / docs'    '(\.stories\.|__stories__|\.mdx$|^docs?/|readme|CHANGELOG)'
  group 'Components'        '\.(tsx|jsx)$'
  group 'Hooks & logic'     '(^|/)(use[A-Z][A-Za-z0-9]*|helpers?|utils?|lib)/?.*\.(ts|js)$'
  group 'Styles'            '\.(css|scss|sass|less|styl)$'
  group 'Types'             '\.d\.ts$'
  group 'Config & CI'       '(package\.json|tsconfig|vite\.|next\.config|eslint|prettier|\.github/|Dockerfile|pnpm-lock|package-lock|yarn\.lock)'
  group 'Other'            '.'
fi

# ---------------------------------------------------------------------------
# Project profile
# ---------------------------------------------------------------------------
section 'Project profile'

if [ ! -f package.json ]; then
  note 'No package.json at the repository root — a monorepo? Locate the workspace package before reviewing.'
elif ! command -v node >/dev/null 2>&1; then
  note 'node not available; read package.json manually for the React version, framework and test runner.'
else
  node - <<'NODE'
const fs = require('fs')

let pkg
try {
  pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
} catch (error) {
  console.log(`- package.json unreadable (${error.message}); inspect it manually.`)
  process.exit(0)
}

const deps = { ...pkg.peerDependencies, ...pkg.devDependencies, ...pkg.dependencies }
const has = (name) => Object.prototype.hasOwnProperty.call(deps, name)
const found = (names) => names.filter(has)
const line = (label, value) => console.log(`- ${label}: ${value}`)

line('Package', `${pkg.name ?? '(unnamed)'}@${pkg.version ?? '?'} (${pkg.type === 'module' ? 'ESM' : 'CJS or unset'})`)
line('React', deps.react ?? 'not declared')

// A package that publishes an entry point and a files allowlist without an app
// framework is a library: its props are a public API under semver.
const isLibrary = Boolean((pkg.exports || pkg.main || pkg.module) && pkg.files) && !has('next')
line('Kind', isLibrary ? 'published library — props and exported types are a public API under semver' : 'application')

const framework = found(['next', '@remix-run/react', 'react-router', 'react-router-dom', 'vite', 'react-scripts', 'expo'])
line('Framework/bundler', framework.length ? framework.join(', ') : 'none detected')

const rsc = has('next') || fs.existsSync('app') || fs.existsSync('src/app')
if (rsc) line('RSC', "possible App Router / server components — check 'use client' boundaries")

const compiler = found(['babel-plugin-react-compiler', 'eslint-plugin-react-compiler', 'react-compiler-runtime'])
line('React Compiler', compiler.length ? `${compiler.join(', ')} — do not ask for new useMemo/useCallback` : 'not detected — manual memoization still meaningful')

const styling = found(['styled-components', '@emotion/react', 'tailwindcss', 'sass', 'less', '@stitches/react', '@vanilla-extract/css'])
line('Styling', styling.length ? styling.join(', ') : 'plain CSS or unknown')

const data = found(['@tanstack/react-query', 'swr', 'redux', '@reduxjs/toolkit', 'zustand', 'jotai', 'mobx', 'apollo-client', '@apollo/client'])
line('State/data', data.length ? data.join(', ') : 'local state only')

const unit = found(['vitest', 'jest', '@testing-library/react', '@testing-library/user-event'])
const e2e = found(['@playwright/test', 'cypress', '@axe-core/playwright', 'jest-axe', 'axe-core'])
line('Tests', [...unit, ...e2e].join(', ') || 'none detected')

const lint = found(['eslint', '@eslint-react/eslint-plugin', 'eslint-plugin-react', 'eslint-plugin-react-hooks', 'eslint-plugin-jsx-a11y', 'eslint-plugin-jsx-a11y-x'])
line('Lint', lint.join(', ') || 'none detected')

const gates = ['lint', 'typecheck', 'type-check', 'tsc', 'test', 'test:unit', 'test:e2e', 'build']
  .filter((name) => pkg.scripts && pkg.scripts[name])
line('Runnable gates', gates.length ? gates.map((name) => `\`${name}\``).join(', ') : 'no standard scripts — check package.json')

if (pkg.scripts) {
  console.log('\nGate commands:')
  const runner = fs.existsSync('pnpm-lock.yaml') ? 'pnpm' : fs.existsSync('yarn.lock') ? 'yarn' : 'npm run'
  for (const name of gates) console.log(`- ${runner} ${name}`)
  if (pkg.scripts.test && /vitest/.test(pkg.scripts.test)) {
    console.log(`- ${runner} test -- --run   # vitest defaults to watch mode; --run is required`)
  }
}
NODE
fi

# ---------------------------------------------------------------------------
# Local conventions to read before reviewing
# ---------------------------------------------------------------------------
section 'Local convention sources present'
SEEN=""
for f in CLAUDE.md AGENTS.md CONTRIBUTING.md README.md \
         eslint.config.js eslint.config.mjs eslint.config.ts .eslintrc.json .eslintrc.cjs \
         tsconfig.json .prettierrc .editorconfig \
         .claude/skills/reviewing-react-code/project-notes.md; do
  [ -f "$f" ] || continue
  # macOS filesystems are case-insensitive: readme.md and README.md are one file.
  KEY="$(printf '%s' "$f" | tr '[:upper:]' '[:lower:]')"
  case " $SEEN " in *" $KEY "*) continue ;; esac
  SEEN="$SEEN $KEY"
  note "$f"
done

if [ -f tsconfig.json ]; then
  STRICT="$(grep -E '"(strict|noUncheckedIndexedAccess|exactOptionalPropertyTypes)"' tsconfig.json | tr -d ' ')"
  [ -n "$STRICT" ] && printf '\nTypeScript strictness:\n```\n%s\n```\n' "$STRICT"
fi

# A disabled rule with a rationale is a decision, not a defect — surface them so
# the review does not re-report them.
ESLINT_CONFIG="$(ls eslint.config.* .eslintrc.* 2>/dev/null | head -1)"
if [ -n "$ESLINT_CONFIG" ]; then
  OFF="$(grep -nE "'off'|\"off\"" "$ESLINT_CONFIG" | head -20)"
  if [ -n "$OFF" ]; then
    printf '\nRules deliberately disabled in %s (do NOT report these as findings):\n```\n%s\n```\n' "$ESLINT_CONFIG" "$OFF"
  fi
fi

printf '\n## Next\n\nRead the reference files for the dimensions the changed files touch (see SKILL.md step 3).\n'
