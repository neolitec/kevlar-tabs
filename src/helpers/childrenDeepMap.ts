/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ReactNode } from 'react'
import { Children, cloneElement, isValidElement } from 'react'
import { isTabElement, isTabListElement } from './elementTypes'

type ChildType =
  | string
  | number
  | boolean
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>
  | React.ReactFragment
  | React.ReactPortal
  | null
  | undefined

function isTabChild(object: unknown) {
  return isTabElement(object) || isTabListElement(object)
}

// eslint-disable-next-line import/prefer-default-export
export function deepMap(
  children: ReactNode,
  callback: (child: ChildType) => ReactNode
): ChildType {
  return Children.map(children, (child) => {
    if (child === null) return null

    if (isTabChild(child)) {
      return callback(child)
    }
    
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.props &&
      child.props?.children &&
      typeof child.props.children === 'object'
    ) {
      // Clone the child that has children and map them too
      return cloneElement(child, {
        ...child.props,
        children: deepMap(child.props.children, callback),
      })
    }

    return child
  })
}
