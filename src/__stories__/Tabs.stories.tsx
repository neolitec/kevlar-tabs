import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import '../styles.scss'
import Tab from '../Tab'
import TabList from '../TabList'
import TabPanel from '../TabPanel'
import Tabs from '../Tabs'

const CustomTabs = styled(Tabs)`
  background-color: pink;
`

const CustomTab = styled(Tab)`
  color: #fff;
  padding: 5px 8px;
  border-radius: 4px;

  background-color: #003465;

  &[aria-selected='true'] {
    background-color: #235a8e;
  }

  &[aria-disabled='true'] {
    background-color: #ccc;
    color: red;
  }
`
CustomTab.displayName = 'Tab'

const CustomTabPanel = styled(TabPanel)`
  background-color: orange;
`
CustomTabPanel.displayName = 'TabPanel'

function useTabs() {
  const [selected, setSelected] = useState(0)
  const [tabs, setTabs] = useState([
    'Tab 1',
    'Tab 2',
    'Tab 3',
    'Tab 4',
    'Tab 5',
  ])

  const add = () => {
    setTabs([...tabs, `Tab ${tabs.length + 1}`])
  }

  return {
    selected,
    setSelected,
    tabs,
    add,
  }
}

// eslint-disable-next-line import/prefer-default-export
export const Default = () => {
  const { selected, setSelected, tabs, add } = useTabs()

  return (
    <>
      <div>Selected index: {selected}</div>
      <Tabs onSelect={setSelected} selected={selected}>
        <TabList>
          {tabs.map((tab, i) => (
            <Tab key={tab} disabled={i >= 1 && i < 3}>
              {tab}
            </Tab>
          ))}
          <button type="button">Action</button>
        </TabList>
        {tabs.map((tab) => (
          <TabPanel key={tab}>{tab} content</TabPanel>
        ))}
        <p>text text</p>
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

// eslint-disable-next-line import/prefer-default-export
export const LazyLoading = () => {
  const [content, setContent] = useState<string | null>(null)
  const timeoutId = useRef<NodeJS.Timeout | number | null>(null)

  useEffect(() => {
    timeoutId.current = setTimeout(() => {
      setContent('Async content loaded')
    }, 5000)

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  return (
    <Tabs>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Async</Tab>
      </TabList>
      <TabPanel>Content 1</TabPanel>
      <TabPanel>{content ? <b>{content}</b> : 'Loading...'}</TabPanel>
    </Tabs>
  )
}

export const StyledComponents = () => {
  const { selected, setSelected, tabs, add } = useTabs()

  return (
    <>
      <div>Selected index: {selected}</div>
      <CustomTabs onSelect={setSelected} selected={selected}>
        <TabList>
          {tabs.map((tab, i) => (
            <CustomTab key={tab} disabled={i >= 1 && i < 3}>
              {tab}
            </CustomTab>
          ))}
          <button type="button">Action</button>
        </TabList>
        {tabs.map((tab) => (
          <CustomTabPanel key={tab}>{tab} content</CustomTabPanel>
        ))}
        <p>text text</p>
      </CustomTabs>
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

export const AutoActivationDisabled = () => {
  const { selected, setSelected, tabs, add } = useTabs()

  return (
    <>
      <div>Selected index: {selected}</div>
      <Tabs onSelect={setSelected} selected={selected} autoActivate={false}>
        <TabList>
          {tabs.map((tab, i) => (
            <Tab key={tab} disabled={i >= 1 && i < 3}>
              {tab}
            </Tab>
          ))}
          <button type="button">Action</button>
        </TabList>
        {tabs.map((tab) => (
          <TabPanel key={tab}>{tab} content</TabPanel>
        ))}
        <p>text text</p>
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
