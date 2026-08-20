# Performance and rendering cost

## Contents

- Evidence rule
- Is the React Compiler enabled?
- Re-render smells
- Memoization done wrong
- Context and stores
- Lists
- Data fetching and waterfalls
- Layout, observers, animation
- Bundle size
- Images, fonts, CLS
- SSR and hydration cost

## Evidence rule

A performance finding needs a mechanism, not a vibe: *what re-renders / re-runs / re-downloads,
how often, and how much it costs*. "This could be slow" is not a finding. Acceptable evidence:
a render counted in the diff's logic, a `useEffect` that runs on every render, an import that
pulls a known-heavy module, an O(n²) inside a map, a missing `key` stability, a measured number.

Micro-optimisations that add complexity to a component rendered twice are not worth reporting.
A one-line win (a stable key, a formatter hoisted to module scope) is 🟢 *Auto-addressable*; a
trade-off that depends on measurement is 🔴, because the call is the author's to make.
Correctness beats speed: never accept a memoization that can serve stale output.

## Is the React Compiler enabled?

The collector reports it. If it is:

- Do **not** ask for new `useMemo`/`useCallback`/`React.memo` — the compiler inserts them.
- Do flag things that defeat it: mutation of values captured in render, refs read during render,
  and any `eslint-plugin-react-compiler` error, which means that component **bailed out** and is
  no longer being optimised.

If it is not enabled, manual memoization is meaningful but must be justified.

## Re-render smells

- A new object, array, function or JSX element created inline and passed to a `React.memo`
  child → the memo never hits. Either stabilise the prop or drop the `memo` (it costs a
  comparison for nothing).
- `style={{ ... }}` inline in a hot list → a new object per row per render.
- Parent state updated on every keystroke/scroll/mousemove while rendering a large subtree → hoist
  the input into its own component, or `useDeferredValue`/`useTransition` for the expensive part.
- State that lives higher than its only consumer → colocate it.
- A context or store value that changes identity on every render.
- An effect with a dependency that changes every render (see `react-correctness.md`).
- Expensive work in render: sorting/filtering thousands of items, `JSON.parse`, regex
  construction, `new Intl.NumberFormat` per row (hoist formatters to module scope).
- O(n²): a `.find`/`.includes` inside a `.map` over the same collection → build a `Map` once.
- Deriving the same computation in several siblings instead of once in the parent.

## Memoization done wrong

- `useMemo` around a primitive or a cheap expression → pure overhead.
- `useMemo`/`useCallback` whose dependencies change as often as the render → never hits.
- `useCallback` on a handler passed to a plain (non-memoized) DOM element → no effect.
- `React.memo` with a custom `areEqual` doing a deep compare on a large object → the comparison
  costs more than the render, and can serve stale UI when it misses a nested change.
- `React.memo` on a component that takes `children` → `children` is a new element every render,
  so it always re-renders.
- Memoizing a value that closes over state read stale later → correctness bug disguised as an
  optimisation.

## Context and stores

- One provider carrying both rarely-changing config and per-keystroke state → split by change
  frequency, or move to a store with selectors.
- Missing `useMemo` on a provider `value`.
- Selector functions returning new objects (`useStore((s) => ({ a: s.a }))`) → re-render every
  time; use a shallow-equality selector or select primitives.
- Provider mounted inside a component that re-renders often → whole subtree remounts if the
  element identity changes.

## Lists

- No windowing above roughly a thousand DOM-heavy rows (`react-virtual`,
  `react-window`) — but do not demand it for a list of ten.
- Unstable keys → full remount of rows on every change (see `react-correctness.md`).
- Whole-list re-render on a single row's change → memoize the row and pass primitives, not the
  row object rebuilt each render.
- `key` that includes an index inside a stable id (`${id}-${i}`) → defeats reconciliation on
  reorder.
- Pagination/infinite scroll that keeps every page mounted with no release strategy.

## Data fetching and waterfalls

- Sequential awaits that do not depend on one another → `Promise.all`.
- Parent fetches, then child fetches from the parent's result, then grandchild → a request
  waterfall; hoist or prefetch.
- A query key missing a variable the query depends on (TanStack Query, SWR) → wrong cached data
  served for different inputs. **Correctness**, not performance.
- `staleTime: 0` (the default) on data that barely changes → refetch storm on every focus/mount.
- Cache not invalidated after a mutation → stale UI.
- No `enabled` guard on a query depending on a value that is initially undefined.
- Fetching in a client component what a server component/loader could fetch.
- Missing debounce on search-as-you-type; missing cancellation on the superseded request.
- Polling with no backoff, no pause when the tab is hidden, and no cleanup.

## Layout, observers, animation

- Reading layout then writing style in a loop → layout thrashing; batch reads, then writes.
- `ResizeObserver`/`IntersectionObserver`/`scroll`/`mousemove` handlers doing work on every
  event → throttle with `requestAnimationFrame`, and always disconnect on cleanup.
- Non-passive `scroll`/`touchmove` listeners → blocks scrolling.
- Animating `width`, `height`, `top`, `left`, `margin`, `box-shadow`, or `filter` on many
  elements → layout/paint every frame. Animate `transform` and `opacity`.
- `will-change` left on permanently → memory pressure. Add and remove around the animation.
- `useLayoutEffect` doing heavy work → blocks paint.
- Autoplaying video/canvas/animation that keeps running when off-screen or on a hidden tab.

## Bundle size

- A heavy dependency imported for one function (`moment`, full `lodash`, `date-fns` root
  import) → import the submodule or inline the helper.
- Root-import of an icon or component library (`import { X } from 'ui'`) where the barrel file
  is not tree-shakeable → check `sideEffects` in that package.
- A local barrel `index.ts` re-exporting everything → one import drags the module graph in, and
  it defeats route-level splitting.
- A route, modal, editor, chart or locale bundle not behind `React.lazy`/dynamic `import()`.
- Polyfills or `core-js` pulled in for browsers the project does not support.
- Same library twice (two versions in the lockfile, or ESM+CJS both bundled).
- Dev-only code (mocks, fixtures, storybook helpers) reachable from production entry points.
- A published library must not bundle `react` — it belongs in `peerDependencies`
  (see `ssr-and-packaging.md`).

Verify with the project's own tooling when available (`vite build` output,
`source-map-explorer`, `@next/bundle-analyzer`); otherwise state the mechanism, not a number.

## Images, fonts, CLS

- `<img>` without `width`/`height` or `aspect-ratio` → layout shift.
- No `loading="lazy"`/`decoding="async"` on below-the-fold images; conversely `loading="lazy"`
  on the LCP image delays it.
- Unoptimised formats and no `srcset`/`sizes` for responsive layouts.
- Web font without `font-display: swap` and without a matched fallback metric → FOIT and shift.
- A skeleton whose dimensions differ from the loaded content.
- A spinner rendered for a fetch that resolves in 50ms → flash; delay it.

## SSR and hydration cost

- Whole page marked `'use client'` at the top of the tree → nothing stays on the server.
- Large serialized payload passed from server to client component props.
- Hydration mismatch (see `ssr-and-packaging.md`) — it forces a full client re-render of the
  subtree, and is a correctness bug first.
- Blocking data fetch above a layout that could stream behind `Suspense`.
- Duplicate work: the same data fetched on the server and refetched on mount.
