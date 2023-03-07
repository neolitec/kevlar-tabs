import { Tab, TabList, TabPanel, Tabs } from 'kevlar-tabs'
import './Example.scss'

export const Example = ({ className }: { className?: string }) => {
  return (
    <Tabs className={className}>
      <TabList>
        <Tab>Tab 1</Tab>
        <Tab>Tab 2</Tab>
      </TabList>
      <TabPanel>Content 1</TabPanel>
      <TabPanel>Content 2</TabPanel>
    </Tabs>
  )
}

export default Example
