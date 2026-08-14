'use client'

import type { FunctionComponent, HTMLAttributes } from 'react'
import React, { useCallback } from 'react'

export type TabListProps = {
  children?: React.ReactNode
  onArrowLeftKeyDown?: () => void
  onArrowRightKeyDown?: () => void
  onHomeKeyDown?: () => void
  onEndKeyDown?: () => void
} & HTMLAttributes<HTMLUListElement>

const TabList: FunctionComponent<TabListProps> = ({
  children,
  className,
  onArrowLeftKeyDown,
  onArrowRightKeyDown,
  onHomeKeyDown,
  onEndKeyDown,
  ...ulProps
}: TabListProps & HTMLAttributes<HTMLUListElement>) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      if (event.key === 'ArrowLeft') {
        onArrowLeftKeyDown?.()
        event.preventDefault()
      } else if (event.key === 'ArrowRight') {
        onArrowRightKeyDown?.()
        event.preventDefault()
      } else if (event.key === 'Home') {
        onHomeKeyDown?.()
        event.preventDefault()
      } else if (event.key === 'End') {
        onEndKeyDown?.()
        event.preventDefault()
      }
    },
    [onArrowLeftKeyDown, onArrowRightKeyDown, onHomeKeyDown, onEndKeyDown]
  )

  return (
    <ul
      role="tablist"
      className={className || 'tablist'}
      {...ulProps}
      onKeyDown={handleKeyDown}
    >
      {children}
    </ul>
  )
}

TabList.displayName = 'TabList'

export default TabList
