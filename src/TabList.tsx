'use client'

import type { FunctionComponent, HTMLAttributes } from 'react'
import React, { useCallback } from 'react'

export type TabListProps = {
  children?: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  onArrowLeftKeyDown?: () => void
  onArrowRightKeyDown?: () => void
  onArrowUpKeyDown?: () => void
  onArrowDownKeyDown?: () => void
  onHomeKeyDown?: () => void
  onEndKeyDown?: () => void
} & HTMLAttributes<HTMLUListElement>

const TabList: FunctionComponent<TabListProps> = ({
  children,
  className,
  orientation = 'horizontal',
  onArrowLeftKeyDown,
  onArrowRightKeyDown,
  onArrowUpKeyDown,
  onArrowDownKeyDown,
  onHomeKeyDown,
  onEndKeyDown,
  ...ulProps
}: TabListProps & HTMLAttributes<HTMLUListElement>) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      const handlers: Record<string, (() => void) | undefined> = {
        ArrowLeft: onArrowLeftKeyDown,
        ArrowRight: onArrowRightKeyDown,
        ArrowUp: onArrowUpKeyDown,
        ArrowDown: onArrowDownKeyDown,
        Home: onHomeKeyDown,
        End: onEndKeyDown,
      }
      const handler = handlers[event.key]

      // Keys without a handler keep their default behavior: a horizontal
      // tablist must not swallow ArrowUp/ArrowDown page scrolling, and
      // vice versa.
      if (handler) {
        handler()
        event.preventDefault()
      }
    },
    [
      onArrowLeftKeyDown,
      onArrowRightKeyDown,
      onArrowUpKeyDown,
      onArrowDownKeyDown,
      onHomeKeyDown,
      onEndKeyDown,
    ]
  )

  return (
    <ul
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
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
