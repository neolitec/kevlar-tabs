import { act, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { byRole, byText } from 'testing-library-selector'
import {
  displayComponent,
  displayComponentWithAsyncTab,
  displayComponentWithControls,
  displayComponentWithCustomClassNames,
  displayComponentWithDisabledTab,
  displayComponentWithExternals,
  displayComponentWithHiddenTab,
  displayComponentWithNamedTabs,
  displayComponentWithoutAnyTab,
  displayComponentWithSparses,
} from './suts'

const ui = {
  tabs: byRole('tab'),
  tab1: byRole('tab', { name: 'Tab 1' }),
  tab2: byRole('tab', { name: 'Tab 2' }),
  tab3: byRole('tab', { name: 'Tab 3' }),
  tab4: byRole('tab', { name: 'Tab 4' }),
  tab5: byRole('tab', { name: 'Tab 5' }),
  tabPanel1: byRole('tabpanel', { name: 'Tab 1' }),
  tabPanel2: byRole('tabpanel', { name: 'Tab 2' }),
  tabPanel3: byRole('tabpanel', { name: 'Tab 3' }),
  tabPanel4: byRole('tabpanel', { name: 'Tab 4' }),
  tabPanel5: byRole('tabpanel', { name: 'Tab 5' }),
  getAllTabPanels: () => byRole('tabpanel', { hidden: true }).getAll(),
  getTabPanel: (index: number) => ui.getAllTabPanels()[index],
  tabPanel1Content: byText('Tab 1 content'),
  tabPanel2Content: byText('Tab 2 content'),
  tabPanel3Content: byText('Tab 3 content'),
  tabList: byRole('tablist'),
  prevButton: byRole('button', { name: 'Prev' }),
  nextButton: byRole('button', { name: 'Next' }),
  addButton: byRole('button', { name: 'Add' }),
  externalButton: byRole('button', { name: 'Action' }),
  externalParagraph: byText('text text'),
  asyncTab: byRole('tab', { name: 'Async' }),
  loadingContent: byText('Loading...'),
  asyncContent: byText('Async content loaded'),
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
    expect(ui.getTabPanel(1)).toBeInTheDocument()
    expect(ui.getTabPanel(2)).toBeInTheDocument()
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
    expect(ui.getTabPanel(1)).toHaveAttribute(
      'id',
      expect.stringMatching(/-1-panel$/)
    )
    expect(ui.getTabPanel(2)).toHaveAttribute(
      'id',
      expect.stringMatching(/-2-panel$/)
    )
  })

  it('should set aria-labelledby to panels', () => {
    expect(ui.tabPanel1.get()).toHaveAttribute(
      'aria-labelledby',
      expect.stringMatching(/-0-tab$/)
    )
    expect(ui.getTabPanel(1)).toHaveAttribute(
      'aria-labelledby',
      expect.stringMatching(/-1-tab$/)
    )
    expect(ui.getTabPanel(2)).toHaveAttribute(
      'aria-labelledby',
      expect.stringMatching(/-2-tab$/)
    )
  })

  it('should not give the focus by default if focusOnInit is falsy', () => {
    expect(ui.tab1.get()).not.toHaveFocus()
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
      displayComponent({ focusOnInit: true, selected: 1 })
    })

    it('should select the second tab', () => {
      expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
      expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'true')
      expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
    })

    it('should give the focus to the selected tab', () => {
      expect(ui.tab2.get()).toHaveFocus()
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
        expect(ui.getAllTabPanels()).toHaveLength(2)
        expect(ui.getTabPanel(0)).toBeInTheDocument()
        expect(ui.getTabPanel(1)).toBeInTheDocument()
      })

      it('should set the right id to the last panel', () => {
        expect(ui.getTabPanel(1)).toHaveAttribute(
          'id',
          expect.stringMatching(/-2-panel$/)
        )
      })
    })
  })

  describe('when using named tabs', () => {
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
        expect(ui.getTabPanel(2)).toHaveAttribute(
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
    beforeEach(() => {
      cleanup()
      displayComponent({ focusOnInit: true })
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

      it('should give the focus to the last tab', () => {
        expect(ui.tab3.get()).toHaveFocus()
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

      it('should give the focus to the next tab', () => {
        expect(ui.tab2.get()).toHaveFocus()
      })
    })

    describe('when the selected tab is the last one', () => {
      beforeEach(() => {
        cleanup()
        displayComponent({ focusOnInit: true, selected: 2 })
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

        it('should give the focus to the second tab', () => {
          expect(ui.tab2.get()).toHaveFocus()
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

        it('should give the focus to the first tab', () => {
          expect(ui.tab1.get()).toHaveFocus()
        })
      })
    })

    describe('when autoActivate is false', () => {
      beforeEach(() => {
        cleanup()
        displayComponent({ autoActivate: false })
      })

      describe('when hitting the left arrow', () => {
        beforeEach(async () => {
          await userEvent.type(ui.tab1.get(), '{arrowleft}')
        })

        it('should not change the selected tab', () => {
          expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
          expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
        })

        it('should give the focus to the last tab', () => {
          expect(ui.tab3.get()).toHaveFocus()
        })

        describe('when hitting space', () => {
          beforeEach(async () => {
            await userEvent.type(ui.tab3.get(), '{space}')
          })

          it('should select the last tab', () => {
            expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
          })
        })

        describe('when hitting enter', () => {
          beforeEach(async () => {
            await userEvent.type(ui.tab3.get(), '{enter}')
          })

          it('should select the last tab', () => {
            expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
          })
        })
      })

      describe('when hitting the right arrow', () => {
        beforeEach(async () => {
          await userEvent.type(ui.tab1.get(), '{arrowright}')
        })

        it('should not change the selected tab', () => {
          expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'true')
          expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
          expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
        })

        it('should give the focus to the next tab', () => {
          expect(ui.tab2.get()).toHaveFocus()
        })
      })

      describe('when the selected tab is the last one', () => {
        beforeEach(() => {
          cleanup()
          displayComponent({ selected: 2, autoActivate: false })
        })

        describe('when hitting the left arrow', () => {
          beforeEach(async () => {
            await userEvent.type(ui.tab3.get(), '{arrowleft}')
          })

          it('should not change the selected tab', () => {
            expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
          })

          it('should give the focus to the second tab', () => {
            expect(ui.tab2.get()).toHaveFocus()
          })
        })

        describe('when hitting the right arrow', () => {
          beforeEach(async () => {
            await userEvent.type(ui.tab3.get(), '{arrowright}')
          })

          it('should not change the selected tab', () => {
            expect(ui.tab1.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'false')
            expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'true')
          })

          it('should give the focus to the first tab', () => {
            expect(ui.tab1.get()).toHaveFocus()
          })
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

    it('should have the aria-disabled property', () => {
      expect(ui.tab2.get()).toHaveAttribute('aria-disabled', 'true')
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

  describe('when not using custom classNames', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithDisabledTab()
    })

    it('should set the default classNames', () => {
      expect(ui.tabList.get()).toHaveClass('tablist')
      expect(ui.tab1.get()).toHaveClass('tab--active')
      expect(ui.tab2.get()).toHaveClass('tab--disabled')
      expect(ui.tab3.get()).toHaveClass('tab')
      expect(ui.tabPanel1.get()).toHaveClass('tabpanel--active')
      expect(ui.getTabPanel(1)).toHaveClass('tabpanel--disabled')
      expect(ui.getTabPanel(2)).toHaveClass('tabpanel')
    })
  })

  describe('when using custom classNames', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithCustomClassNames()
    })

    it('should set the custom classNames', () => {
      expect(ui.tabList.get()).toHaveClass('x-tablist')
      expect(ui.tab1.get()).toHaveClass('x-tab--active')
      expect(ui.tab2.get()).toHaveClass('x-tab--disabled')
      expect(ui.tab3.get()).toHaveClass('x-tab')
      expect(ui.tabPanel1.get()).toHaveClass('x-tabpanel--active')
      expect(ui.getTabPanel(1)).toHaveClass('x-tabpanel--disabled')
      expect(ui.getTabPanel(2)).toHaveClass('x-tabpanel')
    })

    describe('when a className is set on a tab', () => {
      beforeEach(async () => {
        await userEvent.click(ui.tab4.get())
      })

      it('should use this className', () => {
        expect(ui.tab4.get()).toHaveClass('y-tab')
        expect(ui.tab4.get()).toHaveClass('y-tab--active')
        expect(ui.tab5.get()).toHaveClass('y-tab--disabled')
      })
    })

    describe('when a className is set on a panel', () => {
      beforeEach(async () => {
        await userEvent.click(ui.tab4.get())
      })

      it('should use this className', () => {
        expect(ui.tabPanel4.get()).toHaveClass('y-tabpanel')
        expect(ui.tabPanel4.get()).toHaveClass('y-tabpanel--active')
        expect(byRole('tabpanel', { hidden: true }).getAll()[4]).toHaveClass(
          'y-tabpanel--disabled'
        )
      })
    })
  })

  describe('with tab containing async content', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      cleanup()
      displayComponentWithAsyncTab()
    })

    it('should call the callback', () => {
      expect(ui.loadingContent.get()).toBeInTheDocument()
    })

    it('should show the loaded content', async () => {
      await act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(ui.asyncContent.get()).toBeInTheDocument()
    })

    describe('when already loaded', () => {
      beforeEach(async () => {
        await act(() => {
          vi.advanceTimersByTime(10000)
        })
        expect(ui.asyncContent.get()).toBeInTheDocument()
        vi.useRealTimers()
        await userEvent.click(ui.tab1.get())
        await userEvent.click(ui.asyncTab.get())
      })

      it('should show the loaded content directly', () => {
        expect(ui.asyncContent.get()).toBeInTheDocument()
      })
    })
  })

  describe('when the is no tab to display', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithoutAnyTab()
    })

    it('should still display the first panel by default', () => {
      expect(ui.tabPanel1Content.get()).toBeInTheDocument()
    })

    it('should display the text before and after', () => {
      expect(byText(/before/i).get()).toBeInTheDocument()
      expect(byText(/after/i).get()).toBeInTheDocument()
    })
  })

  describe('when a tab is programmatically hidden', () => {
    beforeEach(() => {
      cleanup()
      displayComponentWithHiddenTab()
    })

    it('should not show up', () => {
      expect(ui.tab1.query()).not.toBeInTheDocument()
      expect(ui.tab2.get()).toBeInTheDocument()
      expect(ui.tab3.get()).toBeInTheDocument()
    })

    it('should display the first available tab as selected', () => {
      expect(ui.tab2.get()).toHaveAttribute('aria-selected', 'true')
      expect(ui.tab3.get()).toHaveAttribute('aria-selected', 'false')
    })

    it('should display the first available tab panel', () => {
      expect(ui.tabPanel2.get()).toBeInTheDocument()
      expect(ui.tabPanel3.query()).not.toBeInTheDocument()
    })
  })
})
