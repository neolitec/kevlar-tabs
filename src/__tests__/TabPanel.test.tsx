import { render } from '@testing-library/react'
import { byRole } from 'testing-library-selector'
import TabPanel from '../TabPanel'

const ui = {
  tabpanel: byRole('tabpanel'),
}

describe('TabPanel', () => {
  it('should render the component with the right role', () => {
    render(<TabPanel active>Test</TabPanel>)
    expect(ui.tabpanel.get()).toBeInTheDocument()
  })

  it('should be focusable by default', () => {
    render(<TabPanel active>Test</TabPanel>)
    expect(ui.tabpanel.get()).toHaveAttribute('tabindex', '0')
  })

  it('should allow overriding tabIndex', () => {
    render(
      <TabPanel active tabIndex={-1}>
        Test
      </TabPanel>,
    )
    expect(ui.tabpanel.get()).toHaveAttribute('tabindex', '-1')
  })
})
