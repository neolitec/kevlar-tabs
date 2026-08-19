<div align="center">
  <img width="200" height="200" src="logo.svg" alt="Kevlar Tabs" />
</div>

# Kevlar Tabs

**Accessible React tabs in ~2.4 kB, with no runtime dependencies.**

[![npm](https://img.shields.io/npm/v/kevlar-tabs)](https://www.npmjs.com/package/kevlar-tabs)
[![downloads](https://img.shields.io/npm/dm/kevlar-tabs)](https://www.npmjs.com/package/kevlar-tabs)
[![license](https://img.shields.io/npm/l/kevlar-tabs)](license)

Built to the [WAI-ARIA APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and checked with axe on Chromium, Firefox and WebKit. TypeScript types included, React 17, 18 and 19, ESM-only.

_Inspired by [react-tabs](https://www.npmjs.com/package/react-tabs)_

## Install

```sh
npm install kevlar-tabs
```

## Usage

**This package is ESM-only.** It ships a single ES module build and cannot be loaded with `require()` — use `import`, or any bundler that understands ES modules. In Node, `require('kevlar-tabs')` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`.

```tsx
import Tabs from 'kevlar-tabs';

export const MyTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Tabs selected={activeTab} onSelect={setActiveTab}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel>Tab 2 content</TabPanel>
      <TabPanel>Tab 3 content</TabPanel>
    </Tabs>
  )
}
```

You can also use named tabs and use the `onNameSelected` callback.

```tsx
<Tab name="tab1">Tab 1</Tab>
```

Some panels could not be defined for some reason. You can manually specify the index of the panel:

```tsx
<TabPanel>Tab 1 content</TabPanel>
<TabPanel index={2}>Tab 3 content</TabPanel>
```

Panels are keyboard-focusable by default (`tabIndex={0}`), as [the APG recommends](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) when a panel contains no focusable element. If your panel content starts with a focusable element, you can opt out:

```tsx
<TabPanel tabIndex={-1}>
  <input placeholder="Already focusable" />
</TabPanel>
```

## Tabs properties

| Property | Type | Description |
| --- | --- | --- |
| `autoActivate` | `boolean` | (default: `true`) If true, moving keyboard focus with the arrow, Home or End keys also activates the focused tab. If false, those keys only move focus and the tab is activated with Enter, Space or a click, [as described in the APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). |
| `focusOnInit` | `boolean` | (default: `false`) If true, the default selection tab takes the focus on init. |
| `selected` | `number` \| `string` | The index or the name of the selected tab. |
| `onSelect` | `function` | Callback function that is called when a tab is selected. Gives the index as a parameter. |
| `onNameSelect` | `function` | Callback function that is called when a tab is selected. Gives the name as a parameter. |
| `dir` | `'ltr'` \| `'rtl'` | (default: detected from the DOM) The writing direction of the tab list. In a right-to-left direction the horizontal arrow keys are mirrored: <kbd>ArrowRight</kbd> moves to the previous tab and <kbd>ArrowLeft</kbd> to the next one. |
| `orientation` | `'horizontal'` \| `'vertical'` | (default: `'horizontal'`) The orientation of the tab list. When `vertical`, the tab list gets `aria-orientation="vertical"` and keyboard navigation uses <kbd>ArrowUp</kbd>/<kbd>ArrowDown</kbd> instead of <kbd>ArrowLeft</kbd>/<kbd>ArrowRight</kbd>, [as the APG requires](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). |
| `children` | `ReactNode` | `TabList` and `TabPanel` components. |

## Right-to-left

The horizontal arrow keys follow the writing direction: in a right-to-left tab list, <kbd>ArrowRight</kbd> moves to the **previous** tab and <kbd>ArrowLeft</kbd> to the **next** one. <kbd>Home</kbd> and <kbd>End</kbd> are unaffected — [the APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) keeps them on the first and the last tab in DOM order — and neither is a vertical tab list, whose <kbd>ArrowUp</kbd>/<kbd>ArrowDown</kbd> navigation does not mirror.

You do not have to declare anything if the direction is already set on an ancestor, which is the usual case:

```html
<html dir="rtl">
```

`Tabs` reads the direction that actually applies to it, and follows a later change of the `dir` attribute. Set the `dir` prop when you want to state it explicitly, or when the direction comes from CSS alone and changes at runtime:

```tsx
<Tabs dir="rtl">
```

The prop always wins over the detected value, and is forwarded to the root element so the tabs are laid out in that direction too.

## Styling

The components ship unstyled by default. A minimal stylesheet is published with the package and can be imported explicitly if you want a working look out of the box:

```ts
import 'kevlar-tabs/styles.css'
```

For anything custom, you can use CSS classes that are set on the components:

  - `Tabs` have no class (but you can create your own container).
  - `TabList` has the class `tablist`.
  - `Tab` has the class `tab` in addition to `tab--active` when selected and `tab--disabled` when disabled.
  - `TabPanel` has the class `tabpanel` in addition to `tabpanel--active` when selected.

`Tabs` owns the orientation: it propagates its own value down to the `TabList`, overriding any `orientation` set on the `TabList` itself, so that the ARIA attribute and the arrow keys can never disagree.

The root `Tabs` element and the `TabList` also carry a `data-orientation` attribute (`horizontal` or `vertical`) you can target to lay the tabs out:

```css
.my-tabs[data-orientation='vertical'] {
  display: flex;
  align-items: flex-start;
}
```

### Custom classes

You use custom classes for the different states of the elements.

To do it, use the `classNames` property of `Tabs` and pass an object of this shape:

```ts
export type TabsClassNames = Partial<{
  tabList: string
  tab: string
  tabActive: string
  tabDisabled: string
  tabPanel: string
  tabPanelActive: string
  tabPanelDisabled: string
}>
```

You can also pass this configuration to sub-elements: `className`, `classNameActive` and `classNameDisabled` so that different tabs can have different styling since specific configuration takes precedence over the global one.

### With styled-components

Using `styled-components`, one important thing to know is that you have defined the _displayName_ of the component you want to wrap.

For instance:

```ts
import { Tab } from 'kevlar-tabs'
import styled from 'styled-components'

const CustomTab = styled(Tab)`
  color: white;
  background-color: purple;

  &[aria-active='true'] {
    font-weight: bold;
  }

  &[aria-disabled='true'] {
    color: #ccc;
    background-color: #544454;
  }
`

// THIS IS IMPORTANT
CustomTab.displayName = 'Tab'
```

`displayName` has to be set for `Tab`, `TabList` and `TabPanel`, and it takes the name of the component itself.

## Features

 - Disabled tabs
 - Vertical orientation
 - Right-to-left writing modes
 - Customizable classes
 - Styled-Components compliance
 - Lazy loading
 - Keyboard navigation
 - Auto activation

<details>
<summary>Full feature list</summary>

### Composition & selection

 - Works uncontrolled out of the box, or driven from your own state with `selected` (by index or by name) and the `onSelect`/`onNameSelect` callbacks
 - Named tabs (`name` prop) so selection and callbacks don't depend on array position
 - An invalid `selected` — an out-of-range index, an unknown name — falls back to the first non-disabled tab instead of rendering nothing, and says so in a development-only warning
 - Manual `index` override on `TabPanel`, for when a panel can't be defined in the same position as its tab
 - Panels render lazily and then stay mounted: a panel's children only render the first time it becomes active, and stay in the DOM afterwards, so scroll position, form input and fetched data survive a tab switch
 - Conditionally rendered tabs (`{condition && <Tab />}`) are skipped without breaking the pairing between tabs and panels

### Accessibility (WAI-ARIA Tabs pattern)

 - Built to the [WAI-ARIA APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) and checked with axe on Chromium, Firefox and WebKit in CI
 - Full keyboard navigation: arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> move focus/selection between tabs, skipping disabled ones
 - `autoActivate` toggle to choose between automatic activation (arrow/Home/End select immediately) and manual activation (arrow/Home/End only move focus; <kbd>Enter</kbd>/<kbd>Space</kbd>/click select), per the APG
 - `focusOnInit` to move keyboard focus to the initially selected tab
 - Only the active tab is in the tab order, so a single <kbd>Tab</kbd> press moves past the whole tab list
 - Tab panels are keyboard-focusable by default (`tabIndex={0}`) when they contain no focusable element, with an opt-out for panels that already start with one
 - Disabled tabs are skipped by the arrow keys and ignore clicks

### Orientation

 - Horizontal (default) or vertical tab lists: `orientation="vertical"` swaps the navigation axis (<kbd>ArrowUp</kbd>/<kbd>ArrowDown</kbd>) and sets `aria-orientation`, with a `data-orientation` attribute to hang your layout on

### Styling

 - Ships unstyled by default, with an optional minimal stylesheet (`kevlar-tabs/styles.css`) for a working look out of the box
 - Predictable state classes (`tab--active`, `tab--disabled`, `tabpanel--active`, `tabpanel--disabled`, etc.)
 - Fully customizable class names, both globally (`classNames` prop on `Tabs`) and per-element (`className`/`classNameActive`/`classNameDisabled`)
 - Styled-components compliance via `displayName`-based wrapping

### Footprint & compatibility

 - No runtime dependencies, ~2.4 kB min+gzip
 - React 17, 18 and 19
 - Ships TypeScript types for all components and props
 - Drops into the Next.js App Router and other React Server Components setups
 - ESM-only

</details>

## TypeScript

The build runs on TypeScript 7, but two TypeScript packages are installed on purpose:

| Package | Version | Role |
|---|---|---|
| `@typescript/native` (alias of `typescript`) | 7.x | provides the `tsc` binary — what `pnpm build` runs |
| `typescript` (alias of `@typescript/typescript6`) | 6.x | what `import 'typescript'` resolves to |

TypeScript 7.0 ships no compiler API; the new one is expected in 7.1. Until then, tools that need programmatic access to the compiler — `typescript-eslint` here — have to keep reading the TypeScript 6 API, and `typescript-eslint` throws outright when it resolves a major >= 7. This is the [side-by-side layout Microsoft recommends](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0) for exactly this case, so `tsc` is 7 while linting stays on 6.

One consequence: `node_modules/typescript` is the 6.x compatibility shim and ships no `tsserver`, so an editor set to "use the workspace TypeScript version" will fall back to its own. The aliases collapse back to a single `typescript` entry once `typescript-eslint` supports the 7.1 API.

## Testing

Unit tests run on every pull request:

```sh
pnpm test          # watch mode
pnpm test -- --run # single run
```

End-to-end tests drive the Ladle stories with Playwright in Chromium, Firefox and WebKit. They cover what jsdom cannot: focus management, real key events and cross-browser styling.

```sh
pnpm exec playwright install # once, to download the browsers
pnpm test:e2e                # builds the stories, serves them, runs the suite
pnpm test:e2e:ui             # same, in Playwright's UI mode
```

In CI, the e2e suite does not run on every pull request. It runs on:

 - release pull requests — the ones opened by release-please, or any pull request labelled `autorelease: pending`;
 - pull requests touching the library source (`src/`, except `__tests__` and `__stories__`) or the suite itself (`e2e/`, `playwright.config.ts`);
 - manual runs, from the Actions tab (`E2E` workflow).

## Roadmap
  
  - [ ] Documentation site
  - [ ] Contribution guide
