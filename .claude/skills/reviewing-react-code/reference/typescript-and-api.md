# TypeScript and component API design

## Contents

- Types that hide bugs
- Props: making misuse impossible
- Extending DOM element props
- Controlled, uncontrolled, or both
- Events, refs and DOM types
- Generics
- Narrowing and exhaustiveness
- Module boundaries and public API
- Breaking changes and semver
- Naming and documentation

## Types that hide bugs

- **`any`** (explicit or via an untyped import) → every check downstream is fiction. `unknown`
  plus narrowing, or a real type.
- **`as` assertions** used to silence an error → the compiler was right. Acceptable for a
  genuinely unrepresentable invariant, with a comment; not as a habit.
- **`as unknown as T`** → always worth a question.
- **Non-null `!`** on something that can be null (an array index, a `querySelector`, a `Map.get`,
  a ref before mount) → runtime crash. Guard instead.
- **`@ts-ignore`** → use `@ts-expect-error` with a reason, so it fails once fixed.
- **`object`, `Function`, `{}`** as types → no information.
- **Optional everything** (`a?: X; b?: Y`) when the real contract requires one of two shapes →
  see discriminated unions below.
- **Index access without `noUncheckedIndexedAccess`** → `arr[i]` is typed as present but can be
  `undefined`. Check whether the project enables the flag before trusting an index.
- **A type that lies about the runtime** — a parsed API response typed as the ideal shape with no
  validation at the boundary.
- **`enum`** in new code → prefer a union of string literals (no runtime cost, structural).
- **Mutable arrays in props** where the component must not mutate → `readonly T[]`.

## Props: making misuse impossible

- **Boolean soup**: `isPrimary`, `isSecondary`, `isDanger` → one `variant` union. Two booleans
  that cannot both be true are a union.
- **Mutually exclusive props** → discriminated union, so the compiler rejects the invalid combo:
  ```ts
  type Props =
    | { as: 'link'; href: string; onClick?: never }
    | { as: 'button'; onClick: () => void; href?: never }
  ```
- **A prop that only matters when another is set** → same technique, or move it into the object
  it belongs to.
- **`string` where a closed set is meant** → union of literals.
- **Too many props on one component** (a dozen booleans) → probably two components, or
  composition via `children`/slots.
- **A render prop and a `children` element accepted for the same slot** → pick one, document it.
- **A prop whose default differs between the type and the implementation** → the type is the
  contract; align them and document the default.
- **New required prop on an existing public component** → breaking change.
- **Callback naming**: `onX` for events, `onXChange` for value changes; a callback receiving
  `(next, previous)` should be documented, since the order is not guessable.
- **Passing whole objects where two fields are used** → widens the re-render surface and the
  contract. Pass what is needed.
- **`className` and `style` accepted but dropped** → consumers cannot style it; either forward
  them or do not accept them.

## Extending DOM element props

For a component that renders a DOM element, extend the element's props instead of re-declaring
a subset:

```ts
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'ghost' }
```

Check: `ComponentPropsWithRef` when a ref is forwarded; the rest spread onto the element
(`{...rest}`), so `data-*`, `aria-*`, `id` and handlers reach the DOM; **spread order** — props
the component must control go after `{...rest}`, defaults before; a handler that the component
also uses is composed, not overwritten (`onClick={(e) => { rest.onClick?.(e); doOwnThing(e) }}`).

## Controlled, uncontrolled, or both

- A `value` prop with no `onChange` → the field is frozen; either accept both, or name it
  `defaultValue`.
- Both `value` and `defaultValue` accepted with no documented precedence → ambiguous.
- Internal state initialised from a prop that then changes → the prop is ignored afterwards. That
  is fine for `defaultX`, wrong for `x`.
- A component that switches between controlled and uncontrolled at runtime → flag it.
- The controlled path must not keep a duplicate copy of the value in state.

## Events, refs and DOM types

- Handlers typed `(e: any)` → `React.MouseEvent<HTMLButtonElement>`,
  `React.ChangeEvent<HTMLInputElement>`, `React.KeyboardEvent`.
- `React.FC` adds nothing and historically implied `children`; a plain function with typed props
  is clearer.
- Refs: `useRef<HTMLDivElement>(null)` for DOM, `useRef<number | undefined>(undefined)` for
  values; `RefObject<T | null>` in prop types.
- `forwardRef<Element, Props>` argument order is `<ref element, props>` — easy to invert.
- `displayName` set on wrapped components, or React DevTools and the library's own element
  checks show `Anonymous`.
- Component element types: `React.ReactNode` for anything renderable, `React.ReactElement` when
  the element itself is inspected, `React.ComponentType<P>` for a component passed as a prop.

## Generics

- A generic used once and never inferred → delete it.
- A generic parameter that appears only in the return type → the caller must annotate; usually a
  design smell.
- Missing constraints (`<T>` where `<T extends object>` is meant) → useless errors deep inside.
- `satisfies` instead of a type annotation where literal inference must be preserved.
- A generic component must keep the generic through `forwardRef`/`memo`, or the type collapses to
  `unknown`.

## Narrowing and exhaustiveness

- `switch` on a union with no `default` handling → adding a member silently falls through. Use an
  exhaustive check:
  ```ts
  default: { const _never: never = kind; throw new Error(`Unhandled: ${String(_never)}`) }
  ```
- Truthiness checks on values that can legitimately be `0` or `''` → use `=== undefined` /
  `!= null`.
- `?.` chains that swallow a real absence and produce `undefined` further away from the cause.
- `catch (e)` where `e` is `unknown` → narrow before reading `.message`.
- Type predicates (`x is T`) that do not actually verify the shape → a lie the compiler trusts.

## Module boundaries and public API

- Everything exported from the package entry point is a contract. Check the diff against
  `index.ts`/`exports`: is the new export intended to be public?
- Internal types leaking into a public signature drag internals into the contract.
- `export *` from an internal module → accidental API.
- Types used by consumers must be exported (a props type referenced by an exported component but
  not exported itself forces `Parameters<typeof X>[0]` on the consumer side).
- Deep imports (`package/dist/internal/thing`) either work by accident or are blocked by the
  `exports` map — decide deliberately.

## Breaking changes and semver

In a published library (the collector says so), these go to 🔴 *Needs your review* unless the
change is intentional and the version reflects it:

- removed or renamed export, prop, or type;
- prop type narrowed (a union member removed, an optional prop made required);
- changed default value or changed callback signature/argument order;
- changed DOM structure, element type, or class names that consumers style;
- changed ARIA/id generation that consumers query in their own tests;
- tightened peer-dependency range;
- new required peer dependency.

Additive, non-breaking equivalents exist for most of these — suggest one.

## Naming and documentation

- Names describing the mechanism instead of the intent (`data2`, `handleStuff`, `flag`).
- A boolean whose name does not read as a predicate (`open` vs `isOpen` — be consistent with the
  file).
- Public props deserve a one-line TSDoc: what it does, the default, and the units where
  relevant. Skip the comment that restates the name.
- Comments that explain *why*, especially above a non-obvious workaround or a deliberate
  lint suppression, are the ones worth requesting.
- The readme/changelog updated when a public prop is added or changed.
