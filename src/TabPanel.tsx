import classNames from 'classnames'
import type { FunctionComponent, HTMLAttributes } from 'react'
import React from 'react'

export type TabPanelProps = {
  active?: boolean
  children?: React.ReactNode
  classNameActive?: string
  classNameDisabled?: string
  disabled?: boolean
  // Only used in the Tabs component to override the index of the tab panel.
  // eslint-disable-next-line react/no-unused-prop-types
  index?: number
} & HTMLAttributes<HTMLDivElement>

const TabPanel: FunctionComponent<TabPanelProps> = ({
  active,
  children,
  className,
  classNameActive,
  classNameDisabled,
  disabled,
  ...divProps
}) => (
  <div
    role="tabpanel"
    className={classNames(className || 'tabpanel', {
      [classNameActive || 'tabpanel--active']: active,
      [classNameDisabled || 'tabpanel--disabled']: disabled,
    })}
    {...divProps}
  >
    {active && children}
  </div>
)

TabPanel.displayName = 'TabPanel'

export default TabPanel
