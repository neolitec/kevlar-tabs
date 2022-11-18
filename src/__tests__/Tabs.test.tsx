import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { byRole, byText } from 'testing-library-selector'
import Tab from '../Tab'
import TabList from '../TabList'
import TabPanel from '../TabPanel'
import type { TabsProps } from '../Tabs'
import Tabs from '../Tabs'

function displayComponent(props: Partial<TabsProps> = {}) {
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

function displayComponentWithSparses(props: Partial<TabsProps> = {}) {
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

function displayComponentWithNamedTabs(props: Partial<TabsProps> = {}) {
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

function displayComponentWithControls() {
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

function displayComponentWithExternals() {
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

function displayComponentWithDisabledTab(props: Partial<TabsProps> = {}) {
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
  prevButton: byRole('button', { name: 'Prev' }),
  nextButton: byRole('button', { name: 'Next' }),
  addButton: byRole('button', { name: 'Add' }),
  externalButton: byRole('button', { name: 'Action' }),
  externalParagraph: byText('text text'),
}

describe('Tabs', () => {
  beforeEach(() => {
    displayComponent()
  })

  it('should render the tab list', () => {
    expect(ui.tabList.get()).toBeInTheDocument()
  })

  it('should render the tabs', () => {
    expect(ui.tab1.get()).toBeInTheDocument()
    expect(ui.tab2.get()).toBeInTheDocument()
    expect(ui.tab3.get()).toBeInTheDocument()
  })

  it('should render all the tab panels', () => {
    expect(ui.tabPanel1.get()).toBeInTheDocument()
    expect(ui.tabPanel2.get()).toBeInTheDocument()
    expect(ui.tabPanel3.get()).toBeInTheDocument()
  })

  it('should set ids to tabs', () => {
    expect(ui.tab1.get()).toHaveAttribute(
      'id',
      expect.stringMatching(/-0-tab$/)
    )
    expect(ui.tab2.get()).toHaveAttribute(
      'id',
      expect.stringMatching(/-1-tab$/)
    )
    expect(ui.tab3.get()).toHaveAttribute(
      'id',
      expect.stringMatching(/-2-tab$/)
    )
  })

  it('should set aria-controls to tabs', () => {
    expect(ui.tab1.get()).toHaveAttribute(
      'aria-controls',
      expect.stringMatching(/-0-panel$/)
    )
    expect(ui.tab2.get()).toHaveAttribute(
      'aria-controls',
      expect.stringMatching(/-1-panel$/)
    )
    expect(ui.tab3.get()).toHaveAttribute(
      'aria-controls',
      expect.stringMatching(/-2-panel$/)
    )
  })

  it('should set ids to panels', () => {
    expect(ui.tabPanel1.get()).toHaveAttribute(
      'id',
      expect.stringMatching(/-0-panel$/)
    )
    expect(ui.tabPanel2.get()).toHaveAttribute(
      'id',
      expect.stringMatching(/-1-panel$/)
    )
    expect(ui.tabPanel3.get()).toHaveAttribute(
      'id',
      expect.stringMatching(/-2-panel$/)
    )
  })

  it('should set aria-labelledby to panels', () => {
    expect(ui.tabPanel1.get()).toHaveAttribute(
      'aria-labelledby',
      expect.stringMatching(/-0-tab$/)
    )
    expect(ui.tabPanel2.get()).toHaveAttribute(
      'aria-labelledby',
      expect.stringMatching(/-1-tab$/)
    )
    expect(ui.tabPanel3.get()).toHaveAttribute(
      'aria-labelledby',
      expect.stringMatching(/-2-tab$/)
    )
  })

  describe('by default', () => {
    it('should select the first tab', () => {
      expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
      expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
      expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
    })

    it('should show the first tab panel', () => {
      expect(ui.tabPanel1Content.get()).toBeInTheDocument()
      expect(ui.tabPanel2Content.query()).not.toBeInTheDocument()
      expect(ui.tabPanel3Content.query()).not.toBeInTheDocument()
    })
  })

  describe('when a tab is selected', () => {
    beforeEach(() => {
      cleanup()
      displayComponent({ selected: 1 })
    })

    it('should select the second tab', () => {
      expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
      expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'true')
      expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
    })

    it('should display the second tab panel', () => {
      expect(ui.tabPanel1Content.query()).not.toBeInTheDocument()
      expect(ui.tabPanel2Content.get()).toBeInTheDocument()
      expect(ui.tabPanel3Content.query()).not.toBeInTheDocument()
    })

    describe('when the select index is out of bound', () => {
      beforeEach(() => {
        cleanup()
        displayComponent({ selected: 3 })
      })

      it('should not select any tab', () => {
        expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
      })
    })
  })

  describe('when the panels are sparses', () => {
    describe('when the selected panel is the last', () => {
      beforeEach(() => {
        cleanup()
        displayComponentWithSparses({ selected: 2 })
      })

      it('should display the third panel', () => {
        expect(ui.tabPanel1Content.query()).not.toBeInTheDocument()
        expect(ui.tabPanel3Content.get()).toBeInTheDocument()
      })
    })

    describe('and the selected panel does not exist', () => {
      beforeEach(() => {
        cleanup()
        displayComponentWithSparses({ selected: 1 })
      })

      it('should display the 2 panels', () => {
        expect(ui.tabPanel1.get()).toBeInTheDocument()
        expect(ui.tabPanel3.get()).toBeInTheDocument()
      })

      it('should set the right id to the last panel', () => {
        expect(ui.tabPanel3.get()).toHaveAttribute(
          'id',
          expect.stringMatching(/-2-panel$/)
        )
      })
    })
  })

  describe('when using name tabs', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithNamedTabs({ selected: 'tab1' })
    })

    it('should be selectable by name', () => {
      expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
      expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
      expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
    })

    describe('when the name does not exist', () => {
      beforeEach(() => {
        cleanup()
        displayComponentWithNamedTabs({ selected: 'tab4' })
      })

      it('should not select any tab', () => {
        expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
      })
    })
  })

  describe('when index changes', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithControls()
    })

    describe('when changing the index', () => {
      beforeEach(async () => {
        await userEvent.click(ui.nextButton.get())
      })

      it('should select the second tab', () => {
        expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'true')
      })
    })

    describe('when adding a new tab', () => {
      beforeEach(async () => {
        expect(ui.tab3.query()).not.toBeInTheDocument()
        await userEvent.click(ui.addButton.get())
      })

      it('should add a third tab', () => {
        expect(ui.tab3.get()).toBeInTheDocument()
      })

      it('should give the right id to the third tab', () => {
        expect(ui.tab3.get()).toHaveAttribute(
          'id',
          expect.stringMatching(/-2-tab$/)
        )
      })

      it('should give the right id to the third panel', () => {
        expect(ui.tabPanel3.get()).toHaveAttribute(
          'id',
          expect.stringMatching(/-2-panel$/)
        )
      })

      describe('when selecting the third tab', () => {
        beforeEach(async () => {
          await userEvent.click(ui.tab3.get())
        })

        it('should select the third tab', () => {
          expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
        })
      })
    })
  })

  describe('keyboard management', () => {
    beforeEach(async () => {
      cleanup()
      displayComponent()

      await userEvent.click(ui.tabList.get())
    })

    describe('when hitting the left arrow', () => {
      beforeEach(async () => {
        await userEvent.type(ui.tab1.get(), '{arrowleft}')
      })

      it('should select the last tab', () => {
        expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
      })
    })

    describe('when hitting the right arrow', () => {
      beforeEach(async () => {
        await userEvent.type(ui.tab1.get(), '{arrowright}')
      })

      it('should select the next tab', () => {
        expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
        expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'true')
        expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
      })
    })

    describe('when the selected tab is the last one', () => {
      beforeEach(async () => {
        cleanup()
        displayComponent({ selected: 2 })

        await userEvent.click(ui.tabList.get())
      })

      describe('when hitting the left arrow', () => {
        beforeEach(async () => {
          await userEvent.type(ui.tab3.get(), '{arrowleft}')
        })

        it('should select the second tab', () => {
          expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'true')
          expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
        })
      })

      describe('when hitting the right arrow', () => {
        beforeEach(async () => {
          await userEvent.type(ui.tab3.get(), '{arrowright}')
        })

        it('should select the first tab', () => {
          expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
          expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
        })
      })
    })
  })

  describe('when external components are used', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithExternals()
    })

    it('should display the external components', () => {
      expect(ui.externalButton.get()).toBeInTheDocument()
      expect(ui.externalParagraph.get()).toBeInTheDocument()
    })

    it('should still display 3 tabs', () => {
      expect(ui.tabs.getAll()).toHaveLength(3)
    })
  })

  describe('when a tab is disabled', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithDisabledTab()
      expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
    })

    it('should not be clickable', async () => {
      await userEvent.click(ui.tab2.get())

      expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
    })

    describe('given first tab is selected and second is disabled', () => {
      describe('hitting the right arrow', () => {
        it('should select the third tab', async () => {
          await userEvent.type(ui.tab1.get(), '{arrowright}')

          expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
        })
      })
    })
  })
})
