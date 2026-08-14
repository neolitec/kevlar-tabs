import { expect, test } from '@playwright/test'
import { gotoStory } from './fixtures/story'

test.describe('Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await gotoStory(page, 'tabs--default')
  })

  test('selects the first tab on load', async ({ page }) => {
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tabpanel')).toHaveText('Tab 1 content')
    await expect(page.getByText('Selected index: 0')).toBeVisible()
  })

  test('selects a tab on click and shows its panel', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tab 4' }).click()

    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    await expect(page.getByRole('tabpanel')).toHaveText('Tab 4 content')
    await expect(page.getByText('Selected index: 3')).toBeVisible()
  })

  test('ignores clicks on a disabled tab', async ({ page }) => {
    const disabledTab = page.getByRole('tab', { name: 'Tab 2' })
    await expect(disabledTab).toHaveAttribute('aria-disabled', 'true')

    // force: Playwright would otherwise refuse to click an aria-disabled
    // element, and dispatching the click is the whole point of this test.
    await disabledTab.click({ force: true })

    await expect(disabledTab).toHaveAttribute('aria-selected', 'false')
    await expect(page.getByText('Selected index: 0')).toBeVisible()
  })

  test('links each tab to its panel with aria attributes', async ({ page }) => {
    const tab = page.getByRole('tab', { name: 'Tab 4' })
    await tab.click()

    const tabId = await tab.getAttribute('id')
    const panel = page.getByRole('tabpanel')

    await expect(panel).toHaveAttribute('aria-labelledby', `${tabId}`)
    await expect(tab).toHaveAttribute(
      'aria-controls',
      `${await panel.getAttribute('id')}`,
    )
  })

  test('keeps the selected tab when a tab is added', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tab 4' }).click()
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.getByRole('tab')).toHaveCount(6)
    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 3')).toBeVisible()
  })

  test('drives the selection from the Prev and Next buttons', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByText('Selected index: 1')).toBeVisible()

    await page.getByRole('button', { name: 'Prev' }).click()
    await expect(page.getByText('Selected index: 0')).toBeVisible()
  })
})

test.describe('Tabs with a hidden tab', () => {
  test('ignores falsy children when pairing tabs and panels', async ({
    page,
  }) => {
    await gotoStory(page, 'tabs--hidden-tab')

    await expect(page.getByRole('tab')).toHaveCount(2)
    await expect(page.getByRole('tab', { name: 'tab 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tabpanel')).toHaveText('content 2')

    await page.getByRole('tab', { name: 'tab 3' }).click()
    await expect(page.getByRole('tabpanel')).toHaveText('content 3')
  })
})

test.describe('Tabs styled with styled-components', () => {
  test('applies the active and disabled styles to the real DOM', async ({
    page,
  }) => {
    await gotoStory(page, 'tabs--styled-components')

    // The story styles the active tab #235a8e, an idle tab #003465 and a
    // disabled tab #ccc — only a real browser can confirm the cascade.
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveCSS(
      'background-color',
      'rgb(35, 90, 142)',
    )
    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveCSS(
      'background-color',
      'rgb(0, 52, 101)',
    )
    await expect(page.getByRole('tab', { name: 'Tab 2' })).toHaveCSS(
      'background-color',
      'rgb(204, 204, 204)',
    )

    await page.getByRole('tab', { name: 'Tab 4' }).click()

    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveCSS(
      'background-color',
      'rgb(35, 90, 142)',
    )
  })
})
