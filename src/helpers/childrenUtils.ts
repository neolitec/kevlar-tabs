import type { ReactElement } from 'react'
import React from 'react'
import type { TabProps } from '../Tab'
import type { TabListProps } from '../TabList'
import { isTabElement, isTabListElement } from './elementTypes'

export function getTabsElements(children: React.ReactNode) {
  const tabListElement = React.Children.toArray(children).find((child) =>
    isTabListElement(child)
  ) as ReactElement<TabListProps> | undefined

  if (!tabListElement) {
    return []
  }

  return React.Children.toArray(tabListElement.props.children).filter(
    (child): child is ReactElement<TabProps> => isTabElement(child)
  )
}

export function getTabProps(children: React.ReactNode) {
  return getTabsElements(children).map((tab) => tab.props)
}
