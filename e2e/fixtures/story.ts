import { expect, type Page } from '@playwright/test'

/** Ladle story ids, as exposed by http://127.0.0.1:61000/meta.json */
export const STORY_IDS = [
  'tabs--default',
  'tabs--vertical',
  'tabs--lazy-loading',
  'tabs--styled-components',
  'tabs--auto-activation-disabled',
  'tabs--hidden-tab',
  'tabs--empty-tabs',
] as const

export type StoryId = (typeof STORY_IDS)[number]

/**
 * Opens a story in Ladle's preview mode (no sidebar, no addon toolbar), so the
 * page contains nothing but the component under test.
 */
export async function gotoStory(page: Page, story: StoryId) {
  await page.goto(`/?story=${story}&mode=preview`)
  await expect(page.getByRole('tablist')).toBeAttached()
}
