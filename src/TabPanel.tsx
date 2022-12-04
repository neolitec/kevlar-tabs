import classNames from 'classnames'
import type { FunctionComponent, HTMLAttributes } from 'react'
import React, { useLayoutEffect, useRef } from 'react'

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
}) => {
  const hasBeenActive = useRef(active)

  useLayoutEffect(() => {
    if (!hasBeenActive.current && active) {
      hasBeenActive.current = true
    }
  }, [active])

  return (
    <div
      role="tabpanel"
      className={classNames(className || 'tabpanel', {
        [classNameActive || 'tabpanel--active']: active,
        [classNameDisabled || 'tabpanel--disabled']: disabled,
      })}
      style={!active ? { display: 'none' } : undefined}
      {...divProps}
    >
      {(active || hasBeenActive.current) && children}
    </div>
  )
}

TabPanel.displayName = 'TabPanel'

export default TabPanel
