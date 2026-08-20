# Test adequacy and test quality

## Contents

- The coverage question
- Query priority
- Interaction: user-event over fireEvent
- Async and flakiness
- What to assert
- Mocking boundaries
- Accessibility assertions
- Edge cases reviewers forget to ask for
- End-to-end tests
- Test smells

## The coverage question

Ask it on **every** change, including one with no test in the diff. Two rules:

1. **New behaviour, new test.** Each new prop, branch, keyboard interaction, error path and
   public API addition needs at least one test that fails without the change.
2. **Bug fix, regression test.** A fix with no test is an invitation to reintroduce the bug.
   The test must reproduce the original failure, not merely exercise the touched line.

Missing coverage for new behaviour is `[important]`, not a nit. Line-coverage percentages are
not the metric — the metric is whether a plausible regression would be caught.

Also check: did the diff **delete or weaken** a test (a removed assertion, a `.skip`, a widened
matcher, a `toBeTruthy` replacing an equality)? That is a finding.

## Query priority

Testing Library, in order — going down the list needs a reason:

1. `getByRole(role, { name })` — mirrors what assistive tech exposes, so it tests the
   accessible name for free.
2. `getByLabelText` (form fields), `getByPlaceholderText`, `getByText`, `getByDisplayValue`.
3. `getByTestId` — last resort, for things with no accessible surface.

Findings: `getByTestId` where a role query works; `container.querySelector`, `.firstChild`,
class-name selectors → couples the test to the DOM shape, so a refactor breaks it without a
behaviour change; `getBy*` used to assert absence (throws) instead of `queryBy*`; `findBy*`
where the element is already there (adds latency for nothing).

## Interaction: user-event over fireEvent

`fireEvent.click` dispatches one event; a real click also focuses, fires pointer/mouse events and
respects `pointer-events: none`. `userEvent.click` reproduces the sequence, so it catches bugs
`fireEvent` cannot.

- `userEvent.setup()` once per test, before `render`.
- `await` every `userEvent` call — a missing `await` is the single most common source of
  intermittent failures and `act` warnings.
- Typing: `await user.type(input, 'text')`, not `fireEvent.change` with a whole value, when the
  component reacts per keystroke.
- Keyboard: `await user.keyboard('{ArrowRight}')` and `await user.tab()` — never simulate Tab by
  calling `.focus()`, which skips exactly the tab-order bug the test should catch.
- `fireEvent` remains correct for events users do not produce (`scroll`, `resize`, `animationend`)
  and for DOM-level tests of native listeners.

## Async and flakiness

- **Arbitrary waits** (`setTimeout`, `waitFor(() => {}, { timeout: 3000 })`, `page.waitForTimeout`)
  → flaky and slow. Wait for the observable consequence.
- `waitFor` containing several assertions or a side effect → it retries all of them; keep one
  assertion, no mutation, inside.
- Missing `await` on `findBy*`/`waitFor` → the assertion runs against the pre-update DOM and
  passes for the wrong reason.
- Fake timers without `advanceTimersByTime` / without restoring real timers afterwards; fake
  timers combined with `user-event` need `advanceTimers` in `setup`.
- An `act` warning is a symptom: some state update is not awaited. Fix the await, do not wrap the
  assertion in `act` to silence it.
- Shared mutable state between tests (a module singleton, a mocked date, a cache) with no reset →
  order-dependent suites.

## What to assert

- Assert the user-visible outcome (what is rendered, what is announced, what the callback
  received), not internal state or the number of renders.
- A callback assertion should check the arguments, not just `toHaveBeenCalled()`.
- Prefer `toHaveTextContent` / `toBeVisible` over comparing whole HTML strings.
- Snapshots: acceptable for a small, stable, meaningful structure; a large auto-updated snapshot
  proves nothing and hides real diffs. A snapshot committed in the same diff as the behaviour
  change it was supposed to guard is worthless.
- Negative assertions need a positive anchor first (assert the loaded state, then assert the
  spinner is gone) — otherwise the test passes on an empty render.
- One behaviour per test, and a name that states the behaviour, not the mechanics.

## Mocking boundaries

- Mock the network (MSW or a fetch stub), the clock, randomness, and third-party SDKs. Do not
  mock the component under test, its own hooks, or its children — a test that mocks the child
  asserts the mock.
- `jest.mock`/`vi.mock` of an internal module → the test stops covering the integration; usually a
  sign the component needs dependency injection instead.
- Over-specified mocks (asserting the exact call sequence of an internal helper) → break on every
  refactor.
- A mock that drifts from the real signature → the test passes while production fails. Type the
  mock (`vi.mocked`, `satisfies`).
- No unhandled-request handler on the network mock → silent fallthrough to the real network.

## Accessibility assertions

- `toHaveAccessibleName` / `toHaveAccessibleDescription` on interactive elements.
- `toHaveFocus` after every interaction that is supposed to move focus, and after close/delete.
- `toHaveAttribute('aria-selected', 'true')`, `aria-expanded`, `aria-current` — state assertions,
  not class-name assertions.
- `axe`/`jest-axe`/`@axe-core/playwright` on the rendered output, and on the **states** the
  component can reach (opened, error, after keyboard navigation), not only the initial one.
- Automated a11y checks do not replace an explicit keyboard test (see `accessibility.md`).

## Edge cases reviewers forget to ask for

Empty collection · a single item · a very long label · a disabled item (first, last, all) ·
duplicate values · a conditional child (`{cond && <Child/>}`) · children changing at runtime ·
rapid double interaction · unmount during an async operation · controlled **and** uncontrolled
usage · RTL direction · vertical orientation · keyboard-only path · both light and dark theme ·
error and rejected-promise paths · a boundary numeric value (0, negative, `NaN`).

For a component library, add: consumer-supplied `className`/`style`/`data-*` reaching the DOM ·
`ref` forwarding · several instances on one page (unique ids) · styling via
`styled-components`/wrapper preserving behaviour · SSR render without `window`.

## End-to-end tests

- Reserve them for what unit tests cannot see: real focus, real scrolling, real navigation, real
  network, cross-browser behaviour. Duplicating unit coverage in Playwright is slow and flaky.
- Web-first assertions (`await expect(locator).toHaveText(...)`) auto-retry; `expect(await
  locator.textContent())` does not.
- Role/label locators, not CSS chains. No `waitForTimeout`. No `nth-child` indexing.
- Each test independent and able to run in parallel: own state, no reliance on a previous test's
  side effects.
- Assert something after every navigation, so a failure points at the step that broke.

## Test smells

Conditionals or loops that change what is asserted · a `try/catch` that lets a failure pass ·
`expect` inside a callback that may never run · assertions on implementation details (state,
private methods, render counts) · a test that passes when the component is deleted · shared
fixtures mutated by tests · `.only` or `.skip` committed · console errors/warnings ignored (a
project can fail the suite on them — check whether this one does).
