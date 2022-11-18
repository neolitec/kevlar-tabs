import React, { useState } from 'react'
import './styles.scss'
import Tab from './Tab'
import TabList from './TabList'
import TabPanel from './TabPanel'
import Tabs from './Tabs'

// eslint-disable-next-line import/prefer-default-export
export const Default = () => {
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
