import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

await mkdir('test-results', { recursive: true })
const browser = await chromium.launch({ headless: true })
for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'no-preference' })
  const errors = [], stages = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  for (const [label, progress] of [['start', 0], ['effort', .23], ['built', .31], ['zoom', .6], ['full', .95]]) {
    await page.locator('#experience').evaluate((el, fraction) => {
      const top = el.getBoundingClientRect().top + scrollY
      window.scrollTo({ top: Math.ceil(top + (el.getBoundingClientRect().height - innerHeight) * fraction), behavior: 'instant' })
    }, progress <= .32 ? progress * .20 / .32 : .20 + (progress - .32) * .80 / .68)
    await page.waitForFunction(target => Math.abs(Number(document.querySelector('.scale-scene')?.getAttribute('data-progress')) - target) < .002, progress)
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))))
    await page.screenshot({ path: `test-results/${name}-${label}.png` })
    stages.push(await page.locator('.scale-scene').evaluate(el => ({
      stage: el.getAttribute('data-stage'), progress: el.getAttribute('data-progress'), upper: el.getAttribute('data-upper-amount'),
      userPixels: el.getAttribute('data-user-pixels'), builtAmount: el.getAttribute('data-built-amount'), faceSize: el.getAttribute('data-face-size'),
      waves: [...el.querySelectorAll('.money-wave')].map(wave => ({ person: wave.getAttribute('data-person'), pixels: wave.getAttribute('data-pixels') })),
    })))
  }
  await page.locator('#comparison-end').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `test-results/${name}-comparison.png` })
  await page.locator('#made-with-ai').scrollIntoViewIfNeeded()
  await page.screenshot({ path: `test-results/${name}-ai-ending.png` })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForFunction(() => document.querySelector('#experience')?.classList.contains('is-still'))
  await page.screenshot({ path: `test-results/${name}-still.png` })
  console.log(JSON.stringify({ name, stages, errors, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) }))
  await page.close()
}
await browser.close()
