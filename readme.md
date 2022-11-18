# Kevlar Tabs

## Install

```sh
npm install kevlar-tabs
```

## Usage

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

## Tabs properties

| Property | Type | Description |
| --- | --- | --- |
| `selected` | `number` \| `string` | The index or the name of the selected tab. |
| `onSelect` | `function` | Callback function that is called when a tab is selected. Gives the index as a parameter. |
| `onNameSelect` | `function` | Callback function that is called when a tab is selected. Gives the name as a parameter. |
| `children` | `ReactNode` | `TabList` and `TabPanel` components. |

## Styling

You can use CSS classes that are set on the components:

  - `Tabs` have no class (but you can create your own container).
  - `TabList` has the class `tablist`.
  - `Tab` has the class `tab` in addition to `tab--active` when selected and `tab--disabled` when disabled.
  - `TabPanel` has the class `tabpanel` in addition to `tabpanel--active` when selected.

## TODO

### Features

  - [ ] Customizable classes
  - [ ] styled-component compliance (might work but not tested yet)
  - [ ] Lazy loading
  - [ ] Prevent auto-activation of tabs when navigating with arrows

### Misc

  - [ ] Logo
  - [ ] Documentation site
  - [ ] Contribution easing
