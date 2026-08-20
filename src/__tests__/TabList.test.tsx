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

  it('should be horizontal by default', () => {
    expect(ui.tabList.get()).toHaveAttribute('aria-orientation', 'horizontal')
    expect(ui.tabList.get()).toHaveAttribute('data-orientation', 'horizontal')
  })
})

describe('TabList with a vertical orientation', () => {
  beforeEach(() => {
    render(<TabList orientation="vertical">Content</TabList>)
  })

  it('should set the orientation attributes', () => {
    expect(ui.tabList.get()).toHaveAttribute('aria-orientation', 'vertical')
    expect(ui.tabList.get()).toHaveAttribute('data-orientation', 'vertical')
  })
})
