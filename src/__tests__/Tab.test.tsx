import { render } from '@testing-library/react'
import { byRole } from 'testing-library-selector'
import Tab from '../Tab'

function createTab() {
  render(<Tab>Test</Tab>)
}

const ui = {
  tab: byRole('tab'),
}

describe('Tab', () => {
  beforeEach(() => {
    createTab()
  })

  it('should render the component with the right role', () => {
    expect(ui.tab.get()).toBeInTheDocument()
  })
})
