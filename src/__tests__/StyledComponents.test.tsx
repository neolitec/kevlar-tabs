import { render } from '@testing-library/react'
import styled from 'styled-components'
import { byRole, byText } from 'testing-library-selector'
import Tab from '../Tab'
import TabList from '../TabList'
import TabPanel from '../TabPanel'
import type { TabsProps } from '../Tabs'
import Tabs from '../Tabs'

const CustomTabs = styled(Tabs)`
  background-color: pink;
`

const CustomTabList = styled(TabList)`
  background-color: purple;
`
CustomTabList.displayName = 'TabList'

const CustomTab = styled(Tab)`
  background-color: red;
`
CustomTab.displayName = 'Tab'

function displayComponent(props: Partial<TabsProps> = {}) {
  return render(
    <CustomTabs {...props}>
      <CustomTabList>
        <CustomTab>Tab 1</CustomTab>
        <CustomTab>Tab 2</CustomTab>
        <CustomTab>Tab 3</CustomTab>
      </CustomTabList>
      <TabPanel>Tab 1 content</TabPanel>
      <TabPanel>Tab 2 content</TabPanel>
      <TabPanel>Tab 3 content</TabPanel>
    </CustomTabs>,
  )
}

const ui = {
  tabs: byRole('tab'),
  tab1: byRole('tab', { name: 'Tab 1' }),
  tab2: byRole('tab', { name: 'Tab 2' }),
  tab3: byRole('tab', { name: 'Tab 3' }),
  tabPanel1: byRole('tabpanel', { name: 'Tab 1' }),
  tabPanel2: byRole('tabpanel', { name: 'Tab 2' }),
  tabPanel3: byRole('tabpanel', { name: 'Tab 3' }),
  tabPanel1Content: byText('Tab 1 content'),
  tabPanel2Content: byText('Tab 2 content'),
  tabPanel3Content: byText('Tab 3 content'),
  tabList: byRole('tablist'),
}

describe('StyledComponents', () => {
  beforeEach(() => {
    displayComponent()
  })

  it('should render the tabs', () => {
    expect(ui.tabList.get()).toBeInTheDocument()
    expect(ui.tabs.getAll()).toHaveLength(3)
  })

  it('should apply the color to the Tabs component', () => {
    expect(ui.tabList.get()).toHaveStyle('background-color: purple')
  })

  it('should apply the color to the Tab component', () => {
    expect(ui.tab1.getAll()[0]).toHaveStyle('background-color: red')
  })

  it('should apply the color to the TabList component', () => {
    expect(ui.tabList.get()).toHaveStyle('background-color: purple')
  })
})
