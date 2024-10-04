import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('can take the focus', async () => {
    await userEvent.click(ui.tabList.get())

    expect(ui.tabList.get()).toHaveFocus()
  })
})
