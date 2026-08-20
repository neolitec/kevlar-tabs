# Accessibility review

## Contents

- Order of operations
- Semantics before ARIA
- Accessible names
- Keyboard contracts (ARIA APG)
- Focus management
- Roving tabindex vs aria-activedescendant
- State and live regions
- Forms and errors
- WCAG 2.2 AA criteria most often missed
- Colour, contrast, motion, zoom
- Internationalisation and RTL
- ARIA anti-patterns
- What automation catches, and what it cannot

Target: **WCAG 2.2 level AA**, plus the ARIA Authoring Practices Guide keyboard contracts for
composite widgets. An a11y defect that locks a keyboard or screen-reader user out belongs in
🔴 *Needs your review* as a plain concern — never as a `(suggestion)`.

## Order of operations

1. What is the element semantically? Native element or correct role?
2. Does it have an accessible name?
3. Can it be reached and operated with the keyboard alone?
4. Is its state exposed programmatically, not only visually?
5. Does focus go somewhere sensible when the UI changes?

## Semantics before ARIA

- **`<div onClick>` / `<span onClick>`** → not focusable, not keyboard operable, not announced.
  Use `<button type="button">`. If it must stay a `div`, it needs `role`, `tabIndex={0}`,
  `onKeyDown` for Enter **and** Space, and a disabled story — three chances to get it wrong.
- **`<button>` missing `type`** inside a form → submits the form. Always `type="button"` unless
  submitting.
- **`<a>` without `href`** → not in the tab order. A link that acts is a button; a button that
  navigates is a link.
- **Headings used for size** or skipped levels (`h2` → `h4`) → breaks document navigation.
- **List markup**: `role="tab"` items belong in the container the pattern prescribes; `<li>`
  outside `<ul>`/`<ol>` is invalid.
- **Icon-only control** with no text → no name (see below).
- **Interactive nesting**: a button inside a button, a link inside a link → invalid HTML and
  unpredictable AT behaviour.
- **`<table>` for layout**, or a data table without `<th scope>` and a `<caption>`.

## Accessible names

- Computation order: `aria-labelledby` → `aria-label` → native (`<label for>`, `alt`,
  `<caption>`, `<legend>`, `title` as last resort) → content.
- **`aria-label` on a non-interactive, role-less element** (`div`, `span`) → ignored by many
  ATs. Put it on the element with the role.
- **`aria-label` overriding visible text** → the visible label and the spoken name diverge;
  breaks voice control (2.5.3 Label in Name). Keep the visible text inside the name.
- **`aria-labelledby` pointing at a missing or hidden-by-`display:none` id** → empty name.
- **Placeholder as the only label** → disappears on input.
- **`alt=""`** is correct for decorative images and wrong for informative ones; an icon that
  carries the only meaning needs a name.
- Duplicate names across sibling controls ("Edit", "Edit", "Edit") → ambiguous out of context;
  add context via `aria-label` or visually hidden text.

## Keyboard contracts (ARIA APG)

Check the widget against its pattern; a partial implementation is worse than a native element.

| Widget | Contract |
| --- | --- |
| Button | Enter and Space activate; `aria-pressed` for toggles |
| Tabs | one tab stop for the whole tablist; Arrow keys move within it (Left/Right horizontal, Up/Down vertical), Home/End jump to first/last, optional automatic vs manual activation (`Enter`/`Space` when manual); `aria-selected`, `aria-controls`, panel `aria-labelledby` |
| Disclosure | Enter/Space toggles; `aria-expanded` on the trigger |
| Dialog (modal) | focus moves in on open, is trapped, returns to the trigger on close; Escape closes; `aria-modal`, labelled; background inert |
| Menu / menubar | Arrow keys, Home/End, type-ahead, Escape closes and returns focus; `role="menuitem"` children |
| Combobox / listbox | Arrows open and move, Enter selects, Escape closes; `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete` |
| Accordion | headings wrap the buttons; `aria-expanded`, `aria-controls` |
| Tooltip | shows on focus as well as hover, stays while pointer moves to it, Escape dismisses (1.4.13) |
| Slider | Arrows, Home/End, PageUp/Down; `aria-valuenow/min/max/text` |
| Tree / grid | two-dimensional Arrow navigation, one tab stop |

Recurring defects: Space handled but not Enter (or vice versa); Space not
`preventDefault`ed so the page scrolls; `keyCode`/`which` instead of `event.key`; Arrow keys
that wrap when the pattern says clamp (or the reverse) without a decision; disabled items that
still receive focus and activation; Home/End mirrored in RTL (they must **not** be — they are
absolute, only the horizontal arrows mirror).

## Focus management

- **Focus lost to `<body>`** after a delete, a close, a route change, or a conditional unmount →
  the user restarts from the top of the page. Move focus to a sensible neighbour.
- **Focus not returned** to the trigger after a dialog/popover closes.
- **`autoFocus`** on page load steals focus and disorients; acceptable inside a dialog opened by
  the user.
- **Focus moved on every render** — an effect calling `.focus()` with unstable deps → traps the
  user's focus and fights their input.
- **`outline: none` / `:focus { outline: 0 }`** without a replacement → 2.4.7 failure. Style
  `:focus-visible`, and make sure the indicator has 3:1 contrast against both adjacent colours.
- **2.4.11 Focus Not Obscured (AA)** — a sticky header/footer, a toast, or a `overflow: hidden`
  scroll container hiding the focused element. Check `scroll-margin` and sticky offsets.
- **Focus trap that is not escapable** with the keyboard alone.
- **`tabIndex` > 0** → reorders the whole page tab sequence. Only `0` and `-1` are appropriate.
- **`aria-hidden="true"` on a container holding focusable elements** → focus lands on an element
  that does not exist for AT. Use `inert` or remove them from the tab order too.
- Tab order must follow the visual order (1.3.2); CSS `order`/`grid-area`/`flex-direction:
  row-reverse` desynchronises them.

## Roving tabindex vs aria-activedescendant

Composite widgets need exactly one of the two; a mix is a defect.

- **Roving tabindex**: the active item has `tabIndex={0}`, all others `-1`, and DOM focus moves.
  Check: exactly one `0` at all times, including after the active item unmounts, is disabled, or
  the list reorders; focus is applied imperatively after the index changes.
- **`aria-activedescendant`**: DOM focus stays on the container, which points at the active
  option's `id`. Check: the container is focusable, every option has a stable `id`, the pointed
  id always exists, and the active option is scrolled into view.

## State and live regions

- Visual-only state (a colour, a bold weight, an arrow) with no `aria-selected`,
  `aria-expanded`, `aria-checked`, `aria-current`, `aria-pressed`, `aria-disabled` equivalent.
- **`disabled` vs `aria-disabled`**: `disabled` removes the control from the tab order (fine for
  a form field, bad for a toolbar item the user must be able to discover). `aria-disabled` keeps
  it focusable — then the handler **must** also be neutralised.
- **Async result announced nowhere** — errors, "saved", search-result counts, loading finished.
  Needs `role="status"` (polite) or `role="alert"` (assertive).
- **Live region injected at the same time as its text** → nothing is announced; the container
  must already be in the DOM and then be updated.
- **`aria-live="assertive"` for non-urgent updates** → interrupts everything.
- **`aria-busy`** during a long update, so partial content is not read.
- **`title` as the only description** → not shown on touch, not read reliably.

## Forms and errors

- Every control programmatically labelled; grouped controls in a `<fieldset>` with a
  `<legend>`.
- Errors: `aria-invalid`, the message linked with `aria-describedby`, text identifying the field
  and how to fix it (3.3.1, 3.3.3), not colour alone.
- Focus moved to the first invalid field or to an error summary after a failed submit.
- Required communicated in the label, not only with an asterisk.
- `autocomplete` tokens on personal-data fields (1.3.5).
- **3.3.7 Redundant Entry (AA)**: do not ask again for information already given in the same
  process.
- **3.3.8 Accessible Authentication (AA)**: no cognitive test (puzzle, transcription, memory)
  without an alternative; do not block paste in password/OTP fields.

## WCAG 2.2 AA criteria most often missed

| Criterion | Review question |
| --- | --- |
| 2.4.11 Focus Not Obscured (Min) | is any part of the focused element always visible? |
| 2.5.7 Dragging Movements | can every drag be done with a single-pointer alternative (click source, click target; or buttons)? |
| 2.5.8 Target Size (Min) | is every pointer target ≥ 24×24 CSS px, or spaced so a 24px circle does not overlap a neighbour? |
| 3.2.6 Consistent Help | is the help affordance in the same relative order on every page? |
| 1.4.13 Content on Hover or Focus | is hover/focus content dismissable (Escape), hoverable, and persistent? |
| 2.5.3 Label in Name | does the accessible name contain the visible text? |
| 1.3.5 Identify Input Purpose | `autocomplete` present where applicable? |
| 2.1.4 Character Key Shortcuts | single-character shortcuts must be remappable or disableable, and must not fire while typing in a field |
| 1.4.10 Reflow | usable at 320 CSS px wide with no two-dimensional scrolling |
| 1.4.12 Text Spacing | survives increased line-height/letter-spacing without clipping (no fixed heights on text containers) |

## Colour, contrast, motion, zoom

- Text contrast ≥ 4.5:1 (≥ 3:1 for ≥ 24px, or ≥ 19px bold); UI components and graphical
  objects ≥ 3:1 (1.4.11). Check disabled, placeholder and hover states too — and both themes.
- **Colour as the only carrier of meaning** (1.4.1): a red border, a green dot, a coloured line
  in a chart. Add text, an icon, or a pattern.
- **`prefers-reduced-motion` unhandled** on transitions/parallax/autoplay (2.3.3).
- Anything moving/auto-updating for > 5s needs pause/stop/hide (2.2.2); no flashing > 3Hz
  (2.3.1).
- Zoom to 200% and reflow at 320px must not clip content; avoid fixed `px` heights on text,
  `overflow: hidden` on growing containers, and `maximum-scale=1` / `user-scalable=no`.
- `text-transform: uppercase` changes how some screen readers pronounce text; prefer styling the
  original casing.

## Internationalisation and RTL

- `lang` on `<html>` and on any inline language change (3.1.1, 3.1.2) — affects pronunciation.
- Direction: use logical CSS properties (`margin-inline-start`, `inset-inline-end`,
  `padding-block`) instead of left/right so RTL mirrors without a separate stylesheet.
- Mirror the **horizontal** arrow keys in RTL; leave vertical arrows, Home and End alone.
- Do not read direction from `document.dir` alone — an ancestor `dir` attribute or
  `getComputedStyle(el).direction` is the accurate source for a nested subtree.
- No text baked into images; no concatenated sentence fragments; allow for 30–40% expansion.

## ARIA anti-patterns

- Redundant roles: `<button role="button">`, `<nav role="navigation">`.
- A role that overrides working native semantics (`<ul role="tablist">` is intentional and fine;
  `<button role="link">` is not).
- Required owned elements missing: `tablist` without `tab` children, `list` without
  `listitem`, `radiogroup` without `radio`.
- `aria-controls`/`aria-labelledby`/`aria-describedby` pointing at ids that do not exist or are
  duplicated — ids must be unique per document, so generate them with `useId`, never a
  module counter (breaks SSR and multiple instances).
- `role="presentation"` on an element that has interactive descendants or its own semantics.
- ARIA attributes on the wrong element (`aria-selected` on the panel instead of the tab).
- Inventing attributes (`aria-active`, `aria-hidden="false"` expecting it to reveal).

## What automation catches, and what it cannot

Run what the project has: `eslint-plugin-jsx-a11y`, `axe-core`/`@axe-core/playwright`,
`jest-axe`. Cite the violation id when it fires.

Automation **cannot** verify: keyboard contracts and focus order, whether a name is
*meaningful*, focus return after close, whether an announcement is useful, reading order,
alt-text accuracy, colour-only meaning, or 2.5.7/2.5.8/3.2.6. Those need the manual pass above —
and an axe-clean diff is not an accessible diff. Say which of the two was done.
