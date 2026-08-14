import { expect, test } from '@playwright/test'
import { gotoStory } from './fixtures/story'

test.describe('Lazy panel content', () => {
  test.beforeEach(async ({ page }) => {
    await gotoStory(page, 'tabs--lazy-loading')
  })

  test('does not render the content of a never activated panel', async ({
    page,
  }) => {
    const panels = page.getByRole('tabpanel', { includeHidden: true })

    await expect(panels).toHaveCount(2)
    await expect(panels.nth(0)).toHaveText('Content 1')
    await expect(panels.nth(1)).toBeEmpty()
  })

  test('renders the content once the panel becomes active', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Async' }).click()

    // The story resolves its async content after 5s; before that the panel
    // shows its own loading state.
    await expect(page.getByRole('tabpanel')).toHaveText(
      /Loading\.\.\.|Async content loaded/,
    )
    await expect(page.getByRole('tabpanel').locator('b')).toHaveText(
      'Async content loaded',
      { timeout: 15_000 },
    )
  })

  test('keeps the content mounted after switching away and back', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Async' }).click()
    await expect(page.getByRole('tabpanel').locator('b')).toBeVisible({
      timeout: 15_000,
    })

    await page.getByRole('tab', { name: 'Tab 1' }).click()
    await expect(page.getByRole('tabpanel')).toHaveText('Content 1')

    // The panel keeps its rendered content while hidden.
    await expect(
      page.getByRole('tabpanel', { includeHidden: true }).nth(1),
    ).toHaveText('Async content loaded')

    await page.getByRole('tab', { name: 'Async' }).click()
    await expect(page.getByRole('tabpanel')).toHaveText('Async content loaded')
  })
})
