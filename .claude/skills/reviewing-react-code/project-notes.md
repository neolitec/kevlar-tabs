# Project overlay — kevlar-tabs

Repo-specific context for `reviewing-react-code`. Authoritative for this repository. When the
skill is copied to another React project, rewrite or delete this file.

## What this package is

A published React tabs library (`kevlar-tabs`), ESM-only, built with Vite, styles shipped
separately as `kevlar-tabs/styles.css`. Props, exported types, emitted DOM structure, generated
ids and default class names are all **public API under semver**.

`peerDependencies: react ^17 || ^18 || ^19`. That range is a hard constraint: `forwardRef`
cannot be dropped, ref-callback cleanup and React 19-only hooks are unavailable, and
`useId`/`useSyncExternalStore` are the floor-18 APIs already relied on. Widening the API surface
downward is a breaking change.

## Compound-component architecture

`Tabs` inspects its `children` and clones `TabList`, `Tab` and `TabPanel` with the wiring they
need (ids, `aria-*`, handlers, active state, class names). Consequences for a review:

- `Children.map` / `Children.toArray` / `cloneElement` are the mechanism, not a smell — the
  matching `@eslint-react` rules are disabled on purpose in `eslint.config.js`. Never report them.
- Element identification goes through `src/helpers/elementTypes.ts` (`tabsRole` markers), not
  `type ===`. A new child type must be added there.
- Spread order in `cloneElement` is deliberate: presentation defaults (`className`,
  `classNameActive`, `classNameDisabled`) go **before** `...child.props` so the consumer wins;
  wiring the library must own (`id`, `aria-controls`, `aria-labelledby`, `active`, `onClick`,
  `onKeyDown`, `ref`) goes **after**. A change to that order is an API change.
- `TabPanel` supports both positional and explicit `index`; both paths must stay consistent,
  including with conditional children.

## Invariants worth protecting

- **ARIA APG Tabs pattern**: one tab stop for the tablist (roving `tabIndex`), Arrow keys within
  it, Home/End absolute, `autoActivate` toggling automatic vs manual activation, `aria-selected` /
  `aria-controls` / panel `aria-labelledby`. `e2e/keyboard-navigation.spec.ts` is the contract.
- **RTL**: only the horizontal arrows mirror. Home/End and the vertical axis never do.
  Direction is resolved by `src/helpers/useDirection.ts` through `useSyncExternalStore`, because
  the DOM `dir` is an external mutable source — do not replace it with an effect + state.
- **Ids come from `useId`** (`${id}-${i}`), so several instances and SSR stay correct. A module
  counter would break both.
- **No `ref.current` growth during render.** `tabIds` is derived with `useMemo` and the comment at
  `src/Tabs.tsx` says why; the prop→state sync uses the adjust-state-during-render pattern rather
  than an effect. Both are deliberate and commented.
- **`'use client'` at the top of every module using hooks**, and `scripts/verify-use-client.mjs`
  proves it survives the build. A new hook-using module must keep the directive and stay covered
  by that script.
- Styling: structural CSS only, every element's class name overridable through the `classNames`
  map, no `!important`. `styled-components` wrapping is a supported consumer pattern and is tested
  (`src/__tests__/StyledComponents.test.tsx`).

## Gates

```
pnpm lint          # eslint, with justified disables in eslint.config.js
pnpm test -- --run # vitest + Testing Library (happy-dom)
pnpm test:e2e      # Playwright against Ladle stories, incl. @axe-core scans
pnpm build         # tsc + vite + dts + sass + verify-use-client
```

`src/__tests__/suts.tsx` holds the shared render harnesses — new scenarios belong there rather
than inline in a test file. Stories in `src/__stories__/Tabs.stories.tsx` are the e2e fixtures:
a new behaviour that needs an e2e test needs a story, and `e2e/fixtures/story.ts` `STORY_IDS`
drives the axe sweep.

Commits follow conventional commits (commitlint + release-please): the type in the message
decides the released version, so a breaking change must say so.
