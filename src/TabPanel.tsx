'use client'

import type { FunctionComponent, HTMLAttributes } from 'react'
import React, { useState } from 'react'
import { classNames } from './helpers/classNames'

export type TabPanelProps = {
  active?: boolean
  children?: React.ReactNode
  classNameActive?: string
  classNameDisabled?: string
  disabled?: boolean
  // Only used in the Tabs component to override the index of the tab panel.
  index?: number
  // The APG requires the panel itself to be focusable when it contains no
  // focusable element; pass a different value (e.g. -1) to opt out.
  tabIndex?: number
} & HTMLAttributes<HTMLDivElement>

const TabPanel: FunctionComponent<TabPanelProps> = ({
  active,
  children,
  className,
  classNameActive,
  classNameDisabled,
  disabled,
  tabIndex = 0,
  ...divProps
}) => {
  // State rather than a ref: this value is read during render to decide
  // whether children stay mounted, which a ref cannot safely provide.
  // Adjusting it during render lets React re-run the component immediately,
  // where a layout effect would only apply it on the following pass.
  const [hasBeenActive, setHasBeenActive] = useState(active)

  if (active && !hasBeenActive) {
    setHasBeenActive(true)
  }

  return (
    <div
      role="tabpanel"
      className={classNames(className || 'tabpanel', {
        [classNameActive || 'tabpanel--active']: active,
        [classNameDisabled || 'tabpanel--disabled']: disabled,
      })}
      style={!active ? { display: 'none' } : undefined}
      tabIndex={tabIndex}
      {...divProps}
    >
      {(active || hasBeenActive) && children}
    </div>
  )
}

TabPanel.displayName = 'TabPanel'

export default TabPanel
