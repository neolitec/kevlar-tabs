import type { FunctionComponent, HTMLAttributes } from 'react'
import React, { useCallback } from 'react'

export type TabListProps = {
  children?: React.ReactNode
  onArrowLeftKeyDown?: () => void
  onArrowRightKeyDown?: () => void
} & HTMLAttributes<HTMLUListElement>

const TabList: FunctionComponent<TabListProps> = ({
  children,
  onArrowLeftKeyDown,
  onArrowRightKeyDown,
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
      }
    },
    [onArrowLeftKeyDown, onArrowRightKeyDown]
  )

  return (
    <ul
      role="tablist"
      className="tablist"
      {...ulProps}
      onKeyDown={handleKeyDown}
    >
      {children}
    </ul>
  )
}

TabList.displayName = 'TabList'

export default TabList
