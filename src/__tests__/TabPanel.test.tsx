import { render } from '@testing-library/react'
import React from 'react'
import { byRole } from 'testing-library-selector'
import TabPanel from '../TabPanel'

function createTab() {
  render(<TabPanel active>Test</TabPanel>)
}

const ui = {
  tabpanel: byRole('tabpanel'),
}

describe('TabPanel', () => {
  beforeEach(() => {
    createTab()
  })

  it('should render the component with the right role', () => {
    expect(ui.tabpanel.get()).toBeInTheDocument()
  })
})
