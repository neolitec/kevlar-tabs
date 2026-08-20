# React correctness: hooks, state, effects, rendering

## Contents

- Rules of hooks
- Effects: the ones that should not exist
- Effects: writing the remaining ones correctly
- State: shape and updates
- Refs
- Keys and lists
- Context
- Event handling
- Concurrency, Strict Mode and external stores
- Children introspection (component libraries)
- Error boundaries and Suspense
- Version-portability (React 17 → 19)
- Render-purity smells

Each entry is **symptom → why it breaks → fix**. Report only what the changed code actually does.

## Rules of hooks

- **Hook inside a condition, loop, `try`, or after an early `return`** → the hook order shifts
  between renders and React reads the wrong slot. Move the condition inside the hook, or split
  the component so the branch chooses between two components.
- **Hook called from a plain function that is not a component or a `use*` hook** → same
  failure, harder to see. Rename to `useX` or inline it.
- **Conditional early `return` before hooks in a component that later adds a hook** → check the
  whole component, not just the diff hunk.

## Effects: the ones that should not exist

The most common defect class in React reviews. An effect that only writes state derived from
props or state is always wrong.

| Pattern in the diff | Replacement |
| --- | --- |
| `useEffect(() => setFullName(first + ' ' + last), [first, last])` | compute during render: `const fullName = first + ' ' + last` |
| effect that filters/sorts a list into state | compute during render; `useMemo` only if measurably expensive |
| effect that resets state when a prop changes | `key` on the component, or the *adjust-state-during-render* pattern (see below) |
| effect that runs in response to a click | do the work in the event handler |
| effect that calls a parent callback after a state change | call the callback in the same handler that sets the state |
| effect that fetches on mount in an RSC-capable app | fetch in the server component / loader |
| effect that "syncs" two pieces of state | delete one of them; keep a single source of truth |

The legitimate remainder: subscribing to something outside React (DOM events, sockets,
observers, timers), imperative DOM work (focus, scroll, measure), and analytics.

**Adjust state during render** is the documented alternative to a prop→state effect. Correct
shape — the previous value is stored in state and compared, and the update is unconditional
inside the branch:

```tsx
const [prev, setPrev] = useState(propValue)
if (prev !== propValue) {
  setPrev(propValue)          // both setters, in the same branch
  setDerived(compute(propValue))
}
```
Flag: a `setState` call during render **not** guarded by such a comparison (infinite loop), or
a comparison on an object identity that changes every render.

## Effects: writing the remaining ones correctly

- **Missing cleanup** for `addEventListener`, `setInterval`/`setTimeout`, `subscribe`,
  `ResizeObserver`/`IntersectionObserver`/`MutationObserver`, `AbortController`,
  `requestAnimationFrame`, media queries → leak plus updates after unmount. Every one of these
  needs its teardown in the returned function.
- **Async effect without cancellation** → race: the slower earlier request resolves last and
  overwrites fresh data.
  ```tsx
  useEffect(() => {
    let active = true
    load(id).then((data) => { if (active) setData(data) })
    return () => { active = false }
  }, [id])
  ```
  An `AbortController` is better when the transport supports it.
- **Incomplete dependency array** → stale closure: the effect keeps the first render's values.
  Do not "fix" it by removing the dep; either include it, move the value into a ref
  deliberately (with a comment), or restructure so the value is not needed.
- **Dependency that changes identity every render** (inline object/array/function, a `new
  Date()`, a `.filter()` result) → the effect runs on every render. Memoize the value or depend
  on primitives.
- **`async` passed directly to `useEffect`** → returns a promise where React expects a cleanup
  function. Declare the async function inside.
- **`useLayoutEffect` for work that does not read layout** → blocks paint for nothing. Also
  breaks SSR with a warning; use `useEffect` unless a measurement must land before paint.
- **Setting state unconditionally in an effect that depends on that state** → infinite loop.
- **Effect ordering assumptions** between parent and child (child effects run first) → fragile;
  make the dependency explicit.

## State: shape and updates

- **Update based on the previous value without the updater form** — `setCount(count + 1)` in a
  handler that fires twice, or inside a loop/async callback → lost updates. Use
  `setCount((c) => c + 1)`.
- **Mutating state in place** (`state.items.push(x)`, `obj.field = y`, `array.sort()`) → React
  sees the same reference and skips the re-render, or renders stale UI. `sort`/`reverse`/
  `splice` mutate; `toSorted`/`slice`/spread do not.
- **A value never read in render kept in `useState`** → wasted renders; use `useRef`.
- **Server/props data duplicated into state** → the copy goes stale. Derive, or take the prop
  as the initial value only and name it `initialX` / `defaultX` so the contract is explicit.
- **Expensive initial value computed inline** — `useState(buildBigThing())` runs on every
  render. Pass the lazy form: `useState(() => buildBigThing())`.
- **Several `useState` that must change together** → intermediate renders with inconsistent
  state visible to children. Group into one object or one reducer.
- **Deeply nested state updated with spread chains** → prefer a flatter shape or a reducer.
- **Boolean explosion** (`isLoading`, `isError`, `isSuccess` all in state) → impossible
  combinations become representable. Use a status union.

## Refs

- **Reading or writing `ref.current` during render** → unsafe under concurrent rendering; the
  render may be thrown away or replayed. Read refs in effects and handlers only. A value needed
  during render must be state or derived.
- **`useRef` used to cache a derived value read during render** → use `useMemo`; it has the
  correct invalidation semantics.
- **Ref callback that never clears** — `ref={(el) => { list.current[i] = el }}` leaves stale
  nodes after unmount when indexes shift. In React 19 return a cleanup from the callback; in
  ≤18 null it out explicitly.
- **Ref forwarded but not merged** — a component that both needs its own ref and accepts one
  from the caller must write to both.
- **`ref` read in an effect with `[]` deps for an element rendered conditionally** → `null` on
  first run.

## Keys and lists

- **`key={index}`** on a list that can reorder, filter, or have items inserted → React reuses
  the wrong instance; component state and DOM focus follow the position, not the item. Only
  acceptable for append-only, never-reordered lists.
- **`key={Math.random()}` or a key built from the render** → remounts everything each render,
  destroys focus and animations.
- **Duplicate keys** → dropped or duplicated updates, a console warning nobody reads.
- **Key on the wrong element** — must be on the outermost element of the iteration, including
  inside a `Fragment` (`<Fragment key={id}>`, not `<>`).
- **`key` intentionally used to reset state** → good; make sure it is commented, since it looks
  like a mistake.

## Context

- **Provider `value={{ a, b }}` inline** → new identity every render, every consumer re-renders.
  `useMemo` the value, or split into a stable-value context and a changing-value context.
- **One context holding unrelated concerns** → unrelated consumers re-render. Split by change
  frequency (state vs dispatch is the classic split).
- **Consumer used outside its provider** → silent `undefined` default. The hook should throw a
  named error instead.
- **Context for high-frequency values** (mouse position, scroll, animation) → prefer a store
  with selectors (`useSyncExternalStore`).

## Event handling

- **`onClick` on a `div`/`span`** → see `accessibility.md`; it is both an a11y and a
  correctness issue (no keyboard, no `disabled` semantics).
- **Missing `event.preventDefault()`** on a form submit or on `Space` for a custom control
  (Space scrolls the page).
- **`stopPropagation` as a fix for an unrelated bug** → breaks outside-click handlers and
  bubbling elsewhere. Ask what it is really guarding.
- **Handler attached with `addEventListener` in an effect while an equivalent React prop
  exists** → duplicate handling, different ordering than expected.
- **Native listener on `document` for "click outside"** without `pointerdown`/capture
  consideration → fires before/after the intended toggle and immediately reopens.
- **Handler recreated per item in a large list** where the parent is memoized → see
  `performance-rendering.md`.

## Concurrency, Strict Mode and external stores

- **Anything that breaks when an effect runs twice** (Strict Mode double-invoke in dev) is a
  real bug: non-idempotent setup, a counter incremented in an effect, an appended DOM node.
- **Module-level mutable state read during render** → tearing between concurrent renders, and
  leakage across requests in SSR.
- **Subscribing to an external mutable source with `useState` + effect** → torn reads. Use
  `useSyncExternalStore`, with a `getServerSnapshot` when the code runs on the server.
- **`getSnapshot` returning a new object each call** → infinite loop warning. Return a cached
  or primitive value.
- **Reading layout (`offsetWidth`, `getBoundingClientRect`) during render** → forces a sync
  reflow and is wrong under concurrent rendering.

## Children introspection (component libraries)

Only relevant for components that inspect their `children` (compound components: `Tabs/Tab`,
`Select/Option`). These libraries legitimately use `Children.map`/`toArray`/`cloneElement` —
do not report the API itself when the project has enabled it deliberately. Do check:

- **`cloneElement` spread order** — `{...injected, ...child.props}` lets the consumer win,
  `{...child.props, ...injected}` lets the library win. Both are valid; the review question is
  whether the chosen order matches the documented contract, and whether it is consistent across
  the injected props. Handlers the library must control (`onClick` wiring, `id`,
  `aria-controls`) go **after** the spread; presentation defaults (`className`) go **before**.
- **`Children.toArray` renumbers keys** (`.0`, `.1`) → a caller's explicit key is lost, so
  state can follow position. Fine for static children, wrong for a mapped list.
- **Index computed from position while a sparse/explicit `index` prop also exists** → check the
  two paths agree, including when children are conditional (`{cond && <Tab/>}` yields `false`,
  which `Children.map` visits).
- **Fragments or wrappers between the parent and the expected child type** → the type guard
  fails silently and the child renders unwired. Decide and document: throw, warn, or pass
  through.
- **`isValidElement` + `type ===` identity checks** break across duplicate copies of the
  library or through `React.memo`/`forwardRef` wrappers. A static marker property on the
  component (`Tab.tabsRole = 'Tab'`) is the robust check.

## Error boundaries and Suspense

- **`Suspense` without an error boundary** → a rejected promise unmounts the tree with no UI.
- **One page-level `Suspense`** → the whole page waits for the slowest fetch. Put boundaries
  where a fallback makes sense.
- **Error boundary that swallows and renders nothing** → invisible failure; log and offer a
  retry.
- **`try/catch` around a render expecting to catch a child's error** → it will not; only
  boundaries catch render errors. Async errors in handlers need their own handling.
- **Fallback of a different size than the content** → layout shift; see CLS in
  `performance-rendering.md`.

## Version-portability (React 17 → 19)

Check the `react` entry in `peerDependencies` before recommending a modern API.

- `forwardRef` is redundant in 19 but **required** if the supported range includes ≤18.
- `useId`, `useSyncExternalStore` need ≥18; `use`, `useActionState`, `useOptimistic`,
  `useFormStatus`, ref-callback cleanup, `<Context>` as a provider need 19.
- `ReactDOM.render`, string refs, legacy context, `defaultProps` on function components are
  removed in 19.
- A library that supports several majors cannot use version-conditional hooks — flag any
  attempt.

## Render-purity smells

Flag any of these in a component body or a `useMemo`:

- `Math.random()`, `Date.now()`, `new Date()` used in output → hydration mismatch, unstable
  snapshots. Pass the value in or compute it in an effect.
- Reading or writing `window`, `document`, `localStorage`, `matchMedia` at module scope or
  during render → crashes in SSR. Guard in an effect, or `useSyncExternalStore` with a server
  snapshot.
- Mutating a prop, a module-level object, or a captured array.
- Logging, analytics or a network call during render.
- A component defined inside another component's body → new type each render, full remount and
  state loss of the subtree.
