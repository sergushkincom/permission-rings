import { expect, test, type Locator, type Page } from '@playwright/test'
import { UNDO_ENTER_MS, UNDO_HOLD_MS, UNDO_LIFETIME_MS } from '../lib/undo-countdown'

function toMs(duration: string) {
  const value = Number.parseFloat(duration)
  return duration.endsWith('ms') ? value : value * 1000
}

async function openUndoToast(page: Page) {
  const face = page.locator('button[data-avatar][aria-label*="In open hours"]:not([aria-label*="set by them"])').first()
  await expect(face).toBeVisible()
  await face.click()
  // The radio is visually hidden; the label is what a person clicks.
  await page.locator('label').filter({ hasText: 'Any time' }).click()
  const toast = page.locator('[data-undo-toast]')
  await expect(toast).toBeVisible()
  return toast
}

async function meterClock(meter: Locator) {
  return meter.evaluate((el) => {
    const animation = el.getAnimations().find((item) => item instanceof CSSAnimation && item.animationName === 'undo-meter')
    const style = getComputedStyle(el)
    return {
      current: animation ? Number(animation.currentTime) : null,
      playState: animation ? animation.playState : style.animationPlayState,
      duration: style.animationDuration,
      delay: style.animationDelay,
      name: style.animationName,
    }
  })
}

test('undo puts the person back and clears the toast', async ({ page }) => {
  await page.goto('/')
  const books = page.locator('dl > div').filter({ hasText: 'Books over focus' }).locator('dd .sr-only')
  await expect(books).toHaveText(/^\d+$/)
  const before = Number(await books.textContent())

  const toast = await openUndoToast(page)
  await expect(books).toHaveText(String(before + 1))
  await toast.getByRole('button', { name: 'Undo' }).click()
  await expect(toast).toBeHidden()
  await expect(books).toHaveText(String(before))
})

test('the bar shrinks across the six second hold', async ({ page }) => {
  await page.goto('/')
  const toast = await openUndoToast(page)
  const meter = toast.locator('.undo-meter')
  const fill = toast.locator('.undo-meter-fill')
  await expect(meter).toBeVisible()
  await expect(toast.locator('.undo-time')).toBeHidden()

  const clock = await meterClock(fill)
  expect(clock.name).toBe('undo-meter')
  expect(toMs(clock.duration)).toBe(UNDO_HOLD_MS)
  expect(toMs(clock.delay)).toBe(UNDO_ENTER_MS)
  expect(clock.playState).toBe('running')

  const start = clock.current ?? 0
  await page.waitForTimeout(400)
  const later = await meterClock(fill)
  expect(later.current ?? 0).toBeGreaterThan(start + 200)
})

test('hovering or focusing pauses the bar and keeps the toast', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto('/')
  const toast = await openUndoToast(page)
  const fill = toast.locator('.undo-meter-fill')

  await toast.hover()
  await expect.poll(async () => (await meterClock(fill)).playState).toBe('paused')
  const frozen = (await meterClock(fill)).current ?? 0
  await page.waitForTimeout(UNDO_LIFETIME_MS + 400)
  await expect(toast).toBeVisible()
  await expect(toast).not.toHaveClass(/anim-undo-out/)
  const held = (await meterClock(fill)).current ?? 0
  expect(Math.abs(held - frozen)).toBeLessThan(50)

  await toast.getByRole('button', { name: 'Undo' }).focus()
  expect((await meterClock(fill)).playState).toBe('paused')

  await page.mouse.move(0, 0)
  await expect.poll(async () => (await meterClock(fill)).playState).toBe('paused')
  await page.evaluate(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
  })
  await expect.poll(async () => (await meterClock(fill)).playState).toBe('running')
  await expect(toast).toBeHidden({ timeout: UNDO_LIFETIME_MS + 1000 })
})

test('reduced motion shows the seconds left and does not animate the bar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const toast = await openUndoToast(page)
  const time = toast.locator('.undo-time')
  const meter = toast.locator('.undo-meter')
  const fill = toast.locator('.undo-meter-fill')

  await expect(time).toBeVisible()
  await expect(time).toHaveText('6s')
  await expect(meter).toBeHidden()
  const clock = await meterClock(fill)
  expect(clock.name).toBe('none')

  await page.waitForTimeout(UNDO_ENTER_MS + 1100)
  const shown = (await time.textContent())?.trim()
  expect(shown).toMatch(/^[1-5]s$/)

  await toast.hover()
  await page.waitForTimeout(1500)
  await expect(time).toHaveText(shown ?? '')
  await expect(toast).toBeVisible()

  await page.mouse.move(0, 0)
  await expect.poll(async () => (await time.textContent())?.trim(), { timeout: 2500 }).not.toBe(shown)
})
