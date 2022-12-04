/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  FunctionComponent,
  JSXElementConstructor,
  ReactElement,
  RefAttributes
} from 'react'
import { isValidElement } from 'react'
import type { TabProps } from '../Tab'
import type { TabListProps } from '../TabList'
import type { TabPanelProps } from '../TabPanel'

interface ReactElementWithName<
  P = any,
  T extends string | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>
> extends ReactElement<P, T> {
  type: T & { displayName?: string }
}

export function isNamedElement<P>(
  object: unknown
): object is ReactElementWithName<P> {
  return (
    isValidElement(object) &&
    !!(object.type as FunctionComponent<P>).displayName
  )
}

export function isTabListElement(
  object: unknown
): object is ReactElementWithName<TabListProps> {
  return isNamedElement(object) && object.type.displayName === 'TabList'
}

export function isTabElement(
  object: unknown
): object is ReactElementWithName<TabProps & RefAttributes<HTMLLIElement>> {
  return isNamedElement(object) && object.type.displayName === 'Tab'
}

export function isTabPanelElement(
  object: unknown
): object is ReactElementWithName<TabPanelProps> {
  return isNamedElement(object) && object.type.displayName === 'TabPanel'
}
