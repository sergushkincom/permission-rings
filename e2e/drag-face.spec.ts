import { expect, test, type Locator, type Page } from '@playwright/test'

// The main interaction: drag a face from "In open hours" onto the inner "Any time" ring
// and check that the counters at the top follow.

function counter(page: Page, label: string): Locator {
  // RollingNumber keeps the plain value in an sr-only span; the visible digits are animated.
  return page.locator('dl > div').filter({ hasText: label }).locator('dd .sr-only')
}

async function readCount(locator: Locator) {
  return Number(await locator.textContent())
}

async function center(locator: Locator) {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element has no bounding box')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

test('dragging a face onto the inner ring updates the top counters', async ({ page }) => {
  await page.goto('/')

  const anyTime = counter(page, 'Books over focus')
  const openHours = counter(page, 'Waits for open time')
  const askFirst = counter(page, 'Asks you first')
  await expect(anyTime).toHaveText(/^\d+$/)

  const before = {
    any: await readCount(anyTime),
    hours: await readCount(openHours),
    ask: await readCount(askFirst),
  }

  // A person the user may move (not "set by them") who sits on the "In open hours" ring.
  const candidates = page.locator('button[data-avatar][aria-label*="In open hours"]:not([aria-label*="set by them"])')
  await expect(candidates.first()).toBeVisible()
  const label = (await candidates.first().getAttribute('aria-label')) ?? ''
  const name = label.split(',')[0]
  const face = page.locator(`button[data-avatar][aria-label^="${name},"]`)

  const hub = await center(page.getByAltText('You, hiring manager'))
  const from = await center(face)

  // Same direction from the hub, moved from the "In open hours" radius (184) to the
  // "Any time" radius (120). Using the ratio keeps the target right at any field scale.
  const ratio = 120 / 184
  const to = { x: hub.x + (from.x - hub.x) * ratio, y: hub.y + (from.y - hub.y) * ratio }

  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps: 30 })
  await page.mouse.up()

  await expect(face).toHaveAttribute('aria-label', /Any time/)
  await expect(anyTime).toHaveText(String(before.any + 1))
  await expect(openHours).toHaveText(String(before.hours - 1))
  await expect(askFirst).toHaveText(String(before.ask))
})
