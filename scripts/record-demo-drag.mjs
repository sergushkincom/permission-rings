import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const OUTPUT_DIR = path.resolve(process.cwd(), '.recordings')
const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:3000'

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 },
    recordVideo: { dir: OUTPUT_DIR, size: { width: 1200, height: 900 } },
  })

  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  const avatar = page.locator('button[data-avatar][aria-label^="Jonas Becker"]')
  const manager = page.locator('img[alt="You, hiring manager"]')
  await Promise.all([avatar.waitFor({ state: 'visible' }), manager.waitFor({ state: 'visible' })])

  const avatarBox = await avatar.boundingBox()
  const managerBox = await manager.boundingBox()
  if (!avatarBox || !managerBox) {
    throw new Error('Unable to resolve avatar positions for drag recording')
  }

  const fromX = avatarBox.x + avatarBox.width / 2
  const fromY = avatarBox.y + avatarBox.height / 2
  const toX = managerBox.x + managerBox.width / 2
  const toY = managerBox.y + managerBox.height / 2

  await page.mouse.move(fromX, fromY)
  await page.mouse.down()
  await page.mouse.move(toX, toY, { steps: 60 })
  await page.mouse.up()

  await page.waitForTimeout(2600)

  const video = page.video()
  if (!video) throw new Error('Video recording is unavailable')
  await context.close()
  await browser.close()

  const sourcePath = await video.path()
  const outPath = path.join(OUTPUT_DIR, 'demo-drag.webm')
  await fs.copyFile(sourcePath, outPath)
  console.log(outPath)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
