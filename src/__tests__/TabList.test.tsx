import { render } from '@testing-library/react'
import { byRole } from 'testing-library-selector'
import TabList from '../TabList'

function createTab() {
  render(<TabList>Content</TabList>)
}

const ui = {
  tabList: byRole('tablist'),
}

describe('Tab', () => {
  beforeEach(() => {
    createTab()
  })

  it('should render the component with the right role', () => {
    expect(ui.tabList.get()).toBeInTheDocument()
  })

  it('is not in the tab sequence', () => {
    expect(ui.tabList.get()).not.toHaveAttribute('tabindex')
  })
})
