'use client'

import React, { useCallback, useId, useMemo, useRef, useState } from 'react'
import { getTabProps } from './helpers/childrenUtils'
import {
  isTabElement,
  isTabListElement,
  isTabPanelElement,
} from './helpers/elementTypes'
import type { TabProps } from './Tab'

export type TabsComponent<T> = ((props: T) => React.JSX.Element) & {
  tabsRole: string
}

export type TabsClassNames = Partial<{
  tabList: string
  tab: string
  tabActive: string
  tabDisabled: string
  tabPanel: string
  tabPanelActive: string
  tabPanelDisabled: string
}>

export interface TabsProps {
  autoActivate?: boolean
  children: React.ReactNode
  className?: string
  classNames?: TabsClassNames
  focusOnInit?: boolean
  onSelect?: (index: number, lastIndex: number) => void
  onNameSelect?: (name?: string, lastName?: string) => void
  selected?: number | string
}

const Tabs = ({
  autoActivate = true,
  children,
  className,
  classNames,
  focusOnInit,
  onNameSelect,
  onSelect,
  selected,
}: TabsProps) => {
  const id = useId()
  const tabProps = useMemo(() => getTabProps(children), [children])
  const tabNames = useMemo(() => tabProps.map((tab) => tab.name), [tabProps])
  // Derived, not a ref: reading and growing a ref during render is unsafe
  // under concurrent rendering. The ids are a pure function of the tab list.
  const tabIds = useMemo(
    () => tabNames.map((_, i) => `${id}-${i}`),
    [id, tabNames],
  )
  const tabRefs = useRef<HTMLLIElement[]>([])
  const [{ index: currentIndex, name: currentName }, setSelected] = useState(
    () => computeState(tabProps, selected),
  )
  const currentFocusIndex = useRef(currentIndex)

  // Compared as a string so that a children update producing an equal tab list
  // does not reset the selected tab.
  const tabNamesKey = tabNames.join(',')
  const [previous, setPrevious] = useState({ selected, tabNamesKey })

  // Adjusting state during render is React's documented alternative to
  // synchronising props into state from an effect: React re-runs the component
  // immediately, without committing the intermediate result or painting it.
  if (previous.selected !== selected || previous.tabNamesKey !== tabNamesKey) {
    setPrevious({ selected, tabNamesKey })
    setSelected(computeState(tabProps, selected))
  }

  const handleSelect = useCallback(
    (index: number, name?: string) => {
      setSelected({
        index,
        name,
      })
      onSelect?.(index, currentIndex)
      onNameSelect?.(name, currentName)
      currentFocusIndex.current = index
    },
    [currentIndex, currentName, onNameSelect, onSelect],
  )

  const selectNext = useCallback(() => {
    if (tabProps.every((tab) => tab.disabled)) {
      return
    }

    const nextIndex = getNextIndex(currentFocusIndex.current, tabProps)
    const nextName = tabNames[nextIndex]

    if (autoActivate) {
      handleSelect(nextIndex, nextName)
    } else {
      currentFocusIndex.current = nextIndex
      tabRefs.current[nextIndex].focus()
    }
  }, [autoActivate, handleSelect, tabNames, tabProps])

  const selectPrevious = useCallback(() => {
    if (tabProps.every((tab) => tab.disabled)) {
      return
    }

    const previousIndex = getPreviousIndex(currentFocusIndex.current, tabProps)
    const previousName = tabNames[previousIndex]

    if (autoActivate) {
      handleSelect(previousIndex, previousName)
    } else {
      currentFocusIndex.current = previousIndex
      tabRefs.current[previousIndex].focus()
    }
  }, [autoActivate, handleSelect, tabNames, tabProps])

  const getChildren = useCallback(() => {
    let tabPanelIndex = 0

    return React.Children.map(children, (child) => {
      if (isTabListElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          children: React.Children.toArray(child.props.children).map(
            (tab, index) => {
              if (isTabElement(tab)) {
                return React.cloneElement(tab, {
                  className: classNames?.tab,
                  classNameActive: classNames?.tabActive,
                  classNameDisabled: classNames?.tabDisabled,
                  ...tab.props,
                  autoFocus: focusOnInit && index === currentIndex,
                  active: index === currentIndex,
                  'aria-controls': `${tabIds[index]}-panel`,
                  id: `${tabIds[index]}-tab`,
                  onClick: () => handleSelect(index, tab.props.name),
                  onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      // Prevent Space from scrolling the page.
                      event.preventDefault()
                      handleSelect(index, tab.props.name)
                    }
                  },
                  ref: (elt: HTMLLIElement) => {
                    tabRefs.current[index] = elt
                  },
                })
              }

              return tab
            },
          ),
          className: classNames?.tabList,
          onArrowLeftKeyDown: selectPrevious,
          onArrowRightKeyDown: selectNext,
        })
      }

      if (isTabPanelElement(child)) {
        const panelIndex = Number.isInteger(child.props.index)
          ? (child.props.index as number)
          : tabPanelIndex
        const panelElement = React.cloneElement(child, {
          className: classNames?.tabPanel,
          classNameActive: classNames?.tabPanelActive,
          classNameDisabled: classNames?.tabPanelDisabled,
          ...child.props,
          active: panelIndex === currentIndex,
          disabled: tabProps[panelIndex]?.disabled,
          id: tabIds[panelIndex]
            ? `${tabIds[panelIndex]}-panel`
            : undefined,
          'aria-labelledby': tabIds[panelIndex]
            ? `${tabIds[panelIndex]}-tab`
            : undefined,
        })

        tabPanelIndex += 1

        return panelElement
      }

      return child
    })
  }, [
    children,
    classNames?.tab,
    classNames?.tabActive,
    classNames?.tabDisabled,
    classNames?.tabList,
    classNames?.tabPanel,
    classNames?.tabPanelActive,
    classNames?.tabPanelDisabled,
    currentIndex,
    focusOnInit,
    handleSelect,
    selectNext,
    selectPrevious,
    tabIds,
    tabProps,
  ])

  return <div className={className}>{getChildren()}</div>
}

function computeState(
  tabProps: TabProps[],
  selected?: number | string,
): {
  index: number
  name?: string
} {
  if (Number.isInteger(selected)) {
    const index = selected as number
    if (index >= 0 && index < tabProps.length) {
      return { index, name: tabProps[index].name }
    }
    return fallbackState(tabProps, `no tab exists at index ${index}`)
  }
  if (selected) {
    const index = tabProps.findIndex((tab) => tab.name === selected)
    if (index !== -1) {
      return { index, name: selected as string }
    }
    return fallbackState(tabProps, `no tab is named "${selected}"`)
  }
  return { index: 0, name: tabProps[0]?.name }
}

// The library ships without node's ambient types: `process.env.NODE_ENV` is
// left in the bundle for the consumer's bundler to substitute and eliminate.
declare const process: { env: { NODE_ENV?: string } }

function fallbackState(tabProps: TabProps[], reason: string) {
  const index = Math.max(
    tabProps.findIndex((tab) => !tab.disabled),
    0,
  )

  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn(
      `kevlar-tabs: ${reason}; falling back to the first non-disabled tab`,
    )
  }

  return { index, name: tabProps[index]?.name }
}

function getNextIndex(currentIndex: number, tabProps: TabProps[]) {
  let nextIndex = currentIndex < tabProps.length - 1 ? currentIndex + 1 : 0
  while (tabProps[nextIndex].disabled) {
    nextIndex = nextIndex < tabProps.length - 1 ? nextIndex + 1 : 0
  }

  return nextIndex
}

function getPreviousIndex(currentIndex: number, tabProps: TabProps[]) {
  let previousIndex = currentIndex > 0 ? currentIndex - 1 : tabProps.length - 1
  while (tabProps[previousIndex].disabled) {
    previousIndex = previousIndex > 0 ? previousIndex - 1 : tabProps.length - 1
  }

  return previousIndex
}

export default Tabs
