import { expect, test } from '@playwright/test'
import { gotoStory } from './fixtures/story'

test.describe('Keyboard navigation with auto activation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoStory(page, 'tabs--default')
    await page.getByRole('tab', { name: 'Tab 1' }).focus()
  })

  test('ArrowRight skips the disabled tabs', async ({ page }) => {
    // Tab 2 and Tab 3 are disabled in the story, so Tab 1 → Tab 4.
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 3')).toBeVisible()

    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Tab 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('ArrowLeft wraps around to the last tab', async ({ page }) => {
    await page.keyboard.press('ArrowLeft')

    await expect(page.getByRole('tab', { name: 'Tab 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 4')).toBeVisible()
  })

  test('ArrowRight wraps around to the first tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tab 5' }).click()
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 0')).toBeVisible()
  })

  test('Enter activates the focused tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tab 4' }).focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 3')).toBeVisible()
  })

  test('Space activates the focused tab', async ({ page }) => {
    await page.getByRole('tab', { name: 'Tab 5' }).focus()
    await page.keyboard.press(' ')

    await expect(page.getByRole('tab', { name: 'Tab 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 4')).toBeVisible()
  })

  test('only the selected tab is reachable with Tab', async ({ page }) => {
    // Roving tabindex: the selected tab holds tabindex=0, the others -1.
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'tabindex',
      '0',
    )
    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })

})

test.describe('Tab stops', () => {
  test('a single Tab press moves focus onto the active tab', async ({
    page,
  }) => {
    await gotoStory(page, 'tabs--default')

    // The tablist itself must not be a tab stop.
    await expect(page.getByRole('tablist')).not.toHaveAttribute('tabindex')

    // From a fresh page, the first Tab press must land on the active tab,
    // not on the tablist container.
    await page.keyboard.press('Tab')

    await expect(page.getByRole('tab', { name: 'Tab 1' })).toBeFocused()
  })
})

test.describe('Keyboard navigation without auto activation', () => {
  test.beforeEach(async ({ page }) => {
    await gotoStory(page, 'tabs--auto-activation-disabled')
    await page.getByRole('tab', { name: 'Tab 1' }).focus()
  })

  test('arrow keys move the focus without changing the selection', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Tab 4' })).toBeFocused()
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 0')).toBeVisible()
  })

  test('Enter activates the focused tab', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('tab', { name: 'Tab 4' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('tabpanel')).toHaveText('Tab 4 content')
    await expect(page.getByText('Selected index: 3')).toBeVisible()
  })

  test('Space activates the focused tab', async ({ page }) => {
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press(' ')

    await expect(page.getByRole('tab', { name: 'Tab 5' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Selected index: 4')).toBeVisible()
  })
})
