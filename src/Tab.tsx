import classNames from 'classnames'
import type { FunctionComponent, HTMLAttributes } from 'react'
import React, { useEffect, useRef } from 'react'

export type TabProps = {
  active?: boolean
  children: React.ReactNode
  classNameActive?: string
  classNameDisabled?: string
  disabled?: boolean
  name?: string
  onClick?: () => void
} & HTMLAttributes<HTMLLIElement>

const Tab: FunctionComponent<TabProps> = ({
  active,
  children,
  className,
  classNameActive,
  classNameDisabled,
  disabled,
  onClick,
  ...liProps
}) => {
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (active && ref.current) {
      ref.current.focus()
    }
  }, [active])

  return (
    // Keyboard handled with the parent component.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <li
      ref={ref}
      role="tab"
      className={classNames([
        className || 'tab',
        {
          [classNameActive || 'tab--active']: active,
          [classNameDisabled || 'tab--disabled']: disabled,
        },
      ])}
      tabIndex={active ? 0 : -1}
      aria-selected={active}
      {...liProps}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </li>
  )
}

Tab.displayName = 'Tab'

export default Tab
