'use client'

import type { RefObject } from 'react'
import { useCallback, useRef, useSyncExternalStore } from 'react'

export type Direction = 'ltr' | 'rtl'

/**
 * Resolves the writing direction that applies to `ref`.
 *
 * An explicit `dir` always wins. Otherwise the direction is read from the DOM,
 * so that a tab list nested under `<html dir="rtl">` behaves correctly without
 * the consumer having to repeat the value on every `Tabs`.
 *
 * The DOM is an external mutable source here, hence `useSyncExternalStore`:
 * the resolved value is cached and only recomputed once the subscription
 * reports a change, so that rendering never forces a style recalculation.
 */
export function useDirection(
  ref: RefObject<HTMLElement | null>,
  dir?: Direction,
): Direction {
  // `null` means "not resolved yet"; reading is deferred to the first snapshot
  // taken after mount, when there is an element to measure.
  const cache = useRef<Direction | null>(null)

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const element = ref.current

      // Nothing to observe when the caller states the direction itself.
      if (dir || !element) {
        return () => {}
      }

      const invalidate = () => {
        cache.current = null
        onStoreChange()
      }

      // The element is only measurable now, and the snapshot taken during the
      // first render could not account for it.
      invalidate()

      // A `dir` attribute anywhere up the tree — typically on `<html>`, flipped
      // by a language switcher — changes the direction that applies here, and
      // never re-renders this component on its own. A direction set purely in
      // CSS and changed at runtime is not covered; pass `dir` for that.
      const observer = new MutationObserver(invalidate)
      observer.observe(element.ownerDocument.documentElement, {
        attributeFilter: ['dir'],
        attributes: true,
        subtree: true,
      })

      return () => observer.disconnect()
    },
    [dir, ref],
  )

  const getSnapshot = useCallback(() => {
    if (dir) {
      return dir
    }

    cache.current ??= ref.current ? resolveDirection(ref.current) : 'ltr'

    return cache.current
  }, [dir, ref])

  // There is no DOM to measure while server-rendering, and the direction only
  // matters once a key is pressed, long after hydration.
  const getServerSnapshot = useCallback(() => dir ?? 'ltr', [dir])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function resolveDirection(element: HTMLElement): Direction {
  // The computed style is the ground truth — it accounts for a direction set
  // in CSS as well as by the `dir` attribute.
  if (getComputedStyle(element).direction === 'rtl') {
    return 'rtl'
  }

  // `dir="auto"` is deliberately not matched: its outcome depends on the
  // content, which only the computed style above can settle.
  const explicit = element.closest('[dir="rtl"], [dir="ltr"]')

  return explicit?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr'
}
