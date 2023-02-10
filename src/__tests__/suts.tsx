import { render } from '@testing-library/react'
import React, { useEffect, useRef, useState } from 'react'
import Tab from '../Tab'
import TabList from '../TabList'
import TabPanel from '../TabPanel'
import type { TabsProps } from '../Tabs'
import Tabs from '../Tabs'

export function displayComponent(props: Partial<TabsProps> = {}) {
  return render(
    <Tabs {...props}>
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

export function displayComponentWithSparses(props: Partial<TabsProps> = {}) {
  return render(
    <Tabs {...props}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel index={2}>Tab 3 content</TabPanel>
    </Tabs>
  )
}

export function displayComponentWithNamedTabs(props: Partial<TabsProps> = {}) {
  return render(
    <Tabs {...props}>
      <TabList>
        <Tab name="tab1">Tab 1</Tab>
        <Tab name="tab2">Tab 2</Tab>
        <Tab name="tab3">Tab 3</Tab>
      </TabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel index={2}>Tab 3 content</TabPanel>
    </Tabs>
  )
}

export function displayComponentWithControls() {
  const WithControls = () => {
    const [selected, setSelected] = React.useState(0)
    const [tabs, setTabs] = React.useState(['Tab 1', 'Tab 2'])

    const add = () => {
      setTabs([...tabs, `Tab ${tabs.length + 1}`])
    }

    return (
      <>
        <Tabs onSelect={setSelected} selected={selected}>
          <TabList>
            {tabs.map((tab) => (
              <Tab key={tab}>{tab}</Tab>
            ))}
          </TabList>
          {tabs.map((tab) => (
            <TabPanel key={tab}>{tab} content</TabPanel>
          ))}
        </Tabs>
        <button type="button" onClick={() => setSelected((i) => i - 1)}>
          Prev
        </button>
        <button type="button" onClick={() => setSelected((i) => i + 1)}>
          Next
        </button>
        <button type="button" onClick={add}>
          Add
        </button>
      </>
    )
  }

  return render(<WithControls />)
}

export function displayComponentWithExternals() {
  return render(
    <Tabs>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
        <button type="button">Action</button>
      </TabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel>Tab 2 content</TabPanel>
      <TabPanel>Tab 3 content</TabPanel>
      <p>text text</p>
    </Tabs>
  )
}

export function displayComponentWithDisabledTab(
  props: Partial<TabsProps> = {}
) {
  return render(
    <Tabs {...props}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab disabled>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel>Tab 2 content</TabPanel>
      <TabPanel>Tab 3 content</TabPanel>
    </Tabs>
  )
}

export function displayComponentWithCustomClassNames() {
  return render(
    <Tabs
      classNames={{
        tabList: 'x-tablist',
        tab: 'x-tab',
        tabActive: 'x-tab--active',
        tabDisabled: 'x-tab--disabled',
        tabPanel: 'x-tabpanel',
        tabPanelActive: 'x-tabpanel--active',
        tabPanelDisabled: 'x-tabpanel--disabled',
      }}
    >
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab disabled>Tab 2</Tab>
        <Tab>Tab 3</Tab>
        <Tab className="y-tab" classNameActive="y-tab--active">
          Tab 4
        </Tab>
        <Tab disabled classNameDisabled="y-tab--disabled">
          Tab 5
        </Tab>
      </TabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel>Tab 2 content</TabPanel>
      <TabPanel>Tab 3 content</TabPanel>
      <TabPanel className="y-tabpanel" classNameActive="y-tabpanel--active">
        Tab 4 content
      </TabPanel>
      <TabPanel disabled classNameDisabled="y-tabpanel--disabled">
        Tab 5 content
      </TabPanel>
    </Tabs>
  )
}

const TabWithAsyncContent = () => {
  const [content, setContent] = useState<string | null>(null)
  const timeoutId = useRef<NodeJS.Timeout | number | null>(null)

  useEffect(() => {
    timeoutId.current = setTimeout(() => {
      setContent('Async content loaded')
    }, 3000)

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  return (
    <Tabs>
      <TabList>
        <Tab>Async</Tab>
        <Tab>Tab 1</Tab>
      </TabList>
      <TabPanel>{content ? <b>{content}</b> : 'Loading...'}</TabPanel>
      <TabPanel>Content 1</TabPanel>
    </Tabs>
  )
}

export const displayComponentWithAsyncTab = () =>
  render(<TabWithAsyncContent />)

export const displayComponentWithoutAnyTab = () =>
  render(
    <Tabs>
      Before
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel>Tab 2 content</TabPanel>
      After
    </Tabs>
  )

export const displayComponentWithHiddenTab = () =>
  render(
    <Tabs>
      <TabList>
        {false && <Tab>Tab 1</Tab>}
        <Tab>Tab 2</Tab>
        <Tab>Tab 3</Tab>
      </TabList>
      {false && <TabPanel>Tab content 1</TabPanel>}
      <TabPanel>Tab content 2</TabPanel>
      <TabPanel>Tab content 3</TabPanel>
    </Tabs>
  )
