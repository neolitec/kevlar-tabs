import classNames from 'classnames'
import type { FunctionComponent, HTMLAttributes } from 'react'
import React from 'react'

export type TabPanelProps = {
  active?: boolean
  children?: React.ReactNode
  // Only used in the Tabs component to override the index of the tab panel.
  // eslint-disable-next-line react/no-unused-prop-types
  index?: number
} & HTMLAttributes<HTMLDivElement>

const TabPanel: FunctionComponent<TabPanelProps> = ({
  active,
  children,
  ...divProps
}) => (
  <div
    role="tabpanel"
    className={classNames('tab-panel', { 'tabpanel--active': active })}
    {...divProps}
  >
    {active && children}
  </div>
)

TabPanel.displayName = 'TabPanel'

export default TabPanel
