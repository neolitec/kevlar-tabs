# Styling and CSS

## Contents

- Consistency with the project's strategy
- Tokens and hardcoded values
- Layout and overflow
- Logical properties and RTL
- Focus, states, and theming
- styled-components / Emotion
- Tailwind
- CSS Modules and plain CSS
- Sass
- Styling API of a component library
- Motion

## Consistency with the project's strategy

Find how the project styles things (the collector reports the dependencies) and require the
change to match. A styled-component added to a Tailwind codebase, or an inline `style` in a file
that uses classes everywhere, is a finding even when it works.

Mixed strategies also break specificity assumptions: a utility class and a generated class can
land in either order in the stylesheet.

## Tokens and hardcoded values

- A raw colour (`#3b82f6`, `rgb(...)`) where the project has variables/theme tokens → theming and
  dark mode silently break.
- Magic spacing/radii/z-index/duration values duplicating an existing token.
- A one-off font-size or line-height outside the type scale.
- `z-index: 9999` → there should be a scale; an arbitrary value moves the problem.
- Duplicated declarations that already exist in a shared class or a base component.

## Layout and overflow

- Fixed `height`/`width` on a container of text → clipping when the text grows (translation, user
  font size, 1.4.12 text spacing). Use `min-height`.
- Flex/grid child that will not shrink: text overflows because the item lacks `min-width: 0`
  (`min-height: 0` in a column) — the classic truncation bug.
- Truncation without a full value available (`title`, tooltip) → information loss.
- `overflow: hidden` used to hide a layout bug → also clips focus rings and dropdowns
  (WCAG 2.4.11).
- `position: absolute`/`fixed` without a positioned ancestor, or a sticky element with no
  `top`/`inset`.
- `100vh` on mobile → the browser chrome makes it overflow; prefer `100dvh`.
- No `gap` where margins on children were used, in a codebase that uses `gap` elsewhere.
- Nothing responsive: a fixed width that breaks reflow at 320px (1.4.10).
- Container-relative sizing that should be a container query in a component library, since the
  component cannot know the viewport.

## Logical properties and RTL

- `margin-left`/`right`, `padding-left/right`, `left`/`right`, `text-align: left`,
  `border-radius` corners → use `margin-inline-start`, `inset-inline-end`, `text-align: start`,
  `border-start-start-radius`. RTL then works with no second stylesheet.
- Directional icons (chevrons, arrows) must mirror in RTL — usually
  `[dir='rtl'] & { transform: scaleX(-1) }` or a logical transform.
- `transform: translateX()` does not mirror by itself.
- Physical properties are fine when the project has decided not to support RTL — check before
  reporting.

## Focus, states, and theming

- `outline: none` without a `:focus-visible` replacement → WCAG 2.4.7 failure (see
  `accessibility.md`).
- Focus style with insufficient contrast against both the component and the page background.
- `:hover` as the only affordance → no keyboard/touch equivalent; pair with `:focus-visible`.
- A disabled style with no `disabled`/`aria-disabled` attribute behind it, or a `disabled`
  attribute with no visual difference.
- `color` set without `background-color` (or the reverse) → unreadable under the other theme or a
  user stylesheet.
- Dark mode: a token overridden in only one of the two themes; `color-scheme` not declared so form
  controls and scrollbars stay light.
- `!important` — in application code a specificity smell; in a library it removes the consumer's
  ability to override. Either way, ask what it is fighting.

## styled-components / Emotion

- **`styled()` called inside a component body or a render** → a new component class on every
  render: the DOM node is recreated, state and focus are lost, and the stylesheet grows without
  bound. Must live at module scope.
- Interpolating a value that changes constantly (a mouse position, an animation progress) → a new
  class per value; put it in a CSS custom property or `style` instead.
- Prop-based interpolation without a transient prop (`$active`) → the prop leaks to the DOM as an
  unknown attribute and React warns.
- `attrs` used for a dynamic style that should be a CSS variable.
- Missing `shouldForwardProp` on a styled DOM element receiving custom props.
- Nested interpolation of another styled component before it is defined (a circular import) →
  `undefined` in the selector.
- `css` helper result passed where a component is expected.
- SSR without the stylesheet collector → flash of unstyled content.
- A styled wrapper around a component that does not forward `className` → the styles never apply.
  This is the standard integration test for a library component.

## Tailwind

- A dynamically built class string (`` `text-${color}-500` ``) → not present at build time, so
  the class does not exist in the output. Use a lookup map of complete class names.
- `class` instead of `className` in JSX.
- Conditional classes concatenated by hand with no `clsx`/`cn` helper → duplicate, conflicting
  classes whose winner is arbitrary (`tailwind-merge` exists for that).
- Long identical class lists repeated in several places → extract a component, not `@apply`.
- Arbitrary values (`w-[437px]`) replacing a scale value.
- Utilities on a component that also accepts `className` from the consumer, with no merge → the
  consumer cannot override.
- `important` in the config as a workaround.

## CSS Modules and plain CSS

- A global selector in a module file (`:global`, or an element selector like `button {}`) → leaks
  across the app.
- Class names composed from strings and thus unreachable by the module's typing.
- Deep descendant selectors reaching into another component's internals → breaks on their
  refactor.
- Duplicated rules that a shared class already provides; dead rules for elements no longer
  rendered (grep the class name before requesting deletion).
- Element and attribute selectors with high specificity that consumers cannot override.

## Sass

- Deep nesting (> 3 levels) → unreadable output and high specificity.
- `&--modifier` chains that make the final class name ungreppable in the codebase — the reason
  a class cannot be found before deleting it.
- `@extend` on a class used elsewhere → pulls unrelated selectors into the output; prefer a mixin.
- Deprecated `@import` where the project has moved to `@use`/`@forward`; division with `/` instead
  of `math.div`.
- A variable duplicating a CSS custom property, so runtime theming does not reach it.

## Styling API of a component library

- Class names are a public contract: renaming one is a breaking change (see
  `typescript-and-api.md`).
- Default class names must be overridable per-element (a `classNames` map or equivalent), and the
  override must actually replace, or compose, consistently across every element — a prop that
  works on the root and is ignored on a child is a defect.
- Ship structural CSS only; leave colours and typography to the consumer, or expose custom
  properties for them.
- The stylesheet must be a separate entry point (`package/styles.css`), never injected at import
  time in an SSR-unsafe way, and declared in `sideEffects`.
- No `!important`, no styles that cannot be overridden without one.

## Motion

- Transition/animation with no `@media (prefers-reduced-motion: reduce)` fallback (2.3.3).
- Animating layout properties instead of `transform`/`opacity` (see
  `performance-rendering.md`).
- Duration over ~300ms on a feedback interaction; an infinite animation with no stop control
  (2.2.2).
- A transition on `all` → animates properties that change for unrelated reasons.
