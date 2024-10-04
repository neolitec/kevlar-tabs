import classNames from 'classnames'
import type { ForwardRefRenderFunction, HTMLAttributes } from 'react'
import React, { forwardRef, useEffect, useRef } from 'react'

export type TabProps = {
  active?: boolean
  autoFocus?: boolean
  children: React.ReactNode
  classNameActive?: string
  classNameDisabled?: string
  disabled?: boolean
  name?: string
  onClick?: () => void
} & HTMLAttributes<HTMLLIElement>

const Tab: ForwardRefRenderFunction<HTMLLIElement, TabProps> = (
  {
    active,
    autoFocus,
    children,
    className,
    classNameActive,
    classNameDisabled,
    disabled,
    onClick,
    ...liProps
  },
  ref,
) => {
  const privateRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    if (active && privateRef.current && autoFocus) {
      privateRef.current.focus()
    }
  }, [active, autoFocus])

  return (
    // Keyboard handled with the parent component.
    <li
      ref={(elt) => {
        privateRef.current = elt
        if (typeof ref === 'function') {
          ref(elt)
        } else if (ref) {
          ref.current = elt
        }
      }}
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
      aria-disabled={disabled}
      {...liProps}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </li>
  )
}

Tab.displayName = 'Tab'

const TabWithRef = forwardRef<HTMLLIElement, TabProps>(Tab)
TabWithRef.displayName = 'Tab'

export default TabWithRef
