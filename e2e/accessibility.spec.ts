import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { gotoStory, STORY_IDS } from './fixtures/story'

// Ladle's preview page is a bare story harness, not a full document: it has
// no landmark regions, so the page-level "region" rule would flag every
// story for reasons unrelated to the components under test.
async function scanStory(page: Page) {
  return new AxeBuilder({ page }).disableRules(['region']).analyze()
}

test.describe('Accessibility (axe-core)', () => {
  for (const story of STORY_IDS) {
    test(`${story} has no violations in its initial state`, async ({
      page,
    }) => {
      await gotoStory(page, story)

      const { violations } = await scanStory(page)

      expect(violations).toEqual([])
    })
  }

  test('tabs--default has no violations after keyboard navigation', async ({
    page,
  }) => {
    await gotoStory(page, 'tabs--default')
    await page.getByRole('tab', { name: 'Tab 1' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tabpanel')).toHaveText('Tab 4 content')

    const { violations } = await scanStory(page)

    expect(violations).toEqual([])
  })

  test('tabs--auto-activation-disabled has no violations while focus and selection differ', async ({
    page,
  }) => {
    await gotoStory(page, 'tabs--auto-activation-disabled')
    await page.getByRole('tab', { name: 'Tab 1' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: 'Tab 4' })).toBeFocused()

    const { violations } = await scanStory(page)

    expect(violations).toEqual([])
  })
})
