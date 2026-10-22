import { test, expect, type Page } from '@playwright/test'
import { scrollProgressForStory } from '../../src/lib/journey'

const viewports = [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]
const companyAmounts = { musk: 20e9, altman: 122e9, bezos: 128.3e9 }
async function scale(page: Page) {
  return page.locator('.scale-scene').evaluate(el => ({
    progress: Number(el.getAttribute('data-progress')), stage: el.getAttribute('data-stage'),
    upper: Number(el.getAttribute('data-upper-amount')), user: Number(el.getAttribute('data-user-pixels')),
    built: Number(el.getAttribute('data-built-amount')), face: Number(el.getAttribute('data-face-size')),
  }))
}
async function scrollToProgress(page: Page, progress: number) {
  await page.locator('#experience').evaluate((el, fraction) => {
    const top = el.getBoundingClientRect().top + scrollY
    window.scrollTo({ top: Math.ceil(top + (el.getBoundingClientRect().height - innerHeight) * fraction), behavior: 'instant' })
  }, scrollProgressForStory(progress))
  await expect.poll(async () => Math.abs((await scale(page)).progress - progress)).toBeLessThan(.002)
}
async function useAmount(page: Page, amount: string, currency = 'USD') {
  await page.getByRole('button', { name: /Change it/ }).click()
  await page.getByLabel('Your estimated net worth', { exact: true }).fill(amount)
  await page.getByLabel('Currency', { exact: true }).selectOption(currency)
  await page.getByRole('button', { name: 'Use this amount', exact: true }).click()
}
async function assertCompanyRatios(page: Page, personalAmount: number) {
  const state = await scale(page)
  await expect(page.locator('.money-wave')).toHaveCount(3)
  for (const [person, amount] of Object.entries(companyAmounts)) {
    const pixels = Number(await page.locator(`.money-wave[data-person="${person}"]`).getAttribute('data-pixels'))
    expect(pixels / state.user).toBeCloseTo(amount / personalAmount, 5)
    expect(Number.isFinite(pixels)).toBe(true)
  }
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
}

for (const viewport of viewports) {
  test(`face, effort and three waves share a staged ruler at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    const face = page.locator('.you-meme')
    await expect(page).toHaveTitle('Sorry, You’re Plankton — Big money. Tiny you.')
    await expect(page.getByRole('link', { name: 'Sorry, You’re Plankton, back to your scale' })).toBeVisible()
    await expect(page.locator('.scroll-cue')).toHaveCSS('animation-name', 'scroll-nudge')
    await expect(face).toBeVisible()
    await expect.poll(() => face.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
    const start = await scale(page)
    expect(start.stage).toBe('you')
    expect(start.face).toBeGreaterThan(Math.min(viewport.width, viewport.height))
    expect((await face.boundingBox())!.width).toBeGreaterThan(viewport.width * .8)
    expect(start.upper).toBe(100000)
    expect(start.user).toBe(0)
    expect(start.built).toBe(0)
    await page.evaluate(() => window.scrollBy(0, 80))
    await expect.poll(async () => (await scale(page)).face).toBeLessThan(start.face)
    await scrollToProgress(page, 0)
    await expect(page.getByRole('button', { name: /Change it/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^(Elon Musk|Jeff Bezos|Sam Altman|Their wealth|Company money)$/ })).toHaveCount(0)
    await noOverflow(page)
    const stages = [start]
    for (const position of [.18, .28, .32, .6, .84, .95]) {
      await scrollToProgress(page, position)
      const state = await scale(page)
      expect(state.upper).toBeGreaterThanOrEqual(stages.at(-1)!.upper)
      expect(state.face).toBeLessThanOrEqual(stages.at(-1)!.face)
      expect([state.upper, state.user, state.built, state.face].every(Number.isFinite)).toBe(true)
      if (position <= .32) expect(state.upper).toBeCloseTo(100000, -3)
      if (position === .18 || position === .28) {
        expect(state.built).toBeGreaterThan(stages.at(-1)!.built)
        expect(state.built).toBeLessThan(25000)
        expect(state.user).toBeGreaterThan(stages.at(-1)!.user)
      }
      if (position >= .32) { expect(state.built).toBe(25000); await assertCompanyRatios(page, 25000) }
      if (position >= .28) await expect(page.getByRole('button', { name: /Change it/ })).toBeVisible()
      await noOverflow(page)
      stages.push(state)
    }
    const final = stages.at(-1)!
    expect(final.stage).toBe('waves')
    expect(final.upper).toBeCloseTo(128.3e9 / .78)
    expect(final.user).toBeLessThan(.001)
    expect(final.face).toBeLessThan(.001)
    expect(stages[4]!.user).toBeLessThan(stages[3]!.user)
    await expect(page.locator('.you-locator')).toBeVisible()
    await expect(page.locator('.axis-grid')).toContainText('$0')
    await expect(page.locator('.axis-grid')).toContainText('B')
    await expect(page.locator('.axis-title')).toHaveText('USD ↑')
    await expect(page.locator('.mogul-portrait')).toHaveCount(3)
    await expect(page.locator('.wave-caption')).toHaveCount(3)
    for (const person of Object.keys(companyAmounts)) {
      const portrait = page.locator(`.mogul-portrait[data-person="${person}"]`)
      await expect(portrait).toBeVisible()
      await expect.poll(() => portrait.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
      const bounds = (await portrait.boundingBox())!
      expect(bounds.y + bounds.height).toBeGreaterThan(0)
      expect(bounds.y).toBeLessThan(viewport.height)
      // Every rising surface ends on a plateau, before its fill closes to zero.
      const path = await page.locator(`.money-wave[data-person="${person}"]`).getAttribute('d')
      const ys = [...path!.matchAll(/[ML] [-\d.e+]+ ([-\d.e+]+)/g)].map(match => Number(match[1])).slice(0, -1)
      for (let index = 1; index < ys.length; index++) expect(ys[index]).toBeLessThanOrEqual(ys[index - 1]!)
      expect(ys.at(-1)).toBe(ys.at(-2))
    }
    await scrollToProgress(page, 1)
    expect((await scale(page)).upper).toBe(final.upper)
    expect((await scale(page)).user).toBe(final.user)
    expect(errors).toEqual([])
  })

  test(`editable amounts and reduced motion work at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = [], requests: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => requests.push(request.url()))
    await page.goto('/')
    await expect(page.locator('.scale-scene')).toHaveAttribute('data-progress', '1')
    await expect(page.getByRole('button', { name: 'Still view', exact: true })).toBeDisabled()
    await expect(page.locator('.scroll-cue')).toHaveCount(0)
    expect(await page.locator('#experience').evaluate(el => el.getBoundingClientRect().height <= innerHeight + 1)).toBe(true)
    await expect(page.locator('.mogul-portrait')).toHaveCount(3)
    await assertCompanyRatios(page, 25000)
    for (const step of await page.locator('.journey-steps button').all()) await expect(step).toBeDisabled()
    await useAmount(page, '12,34')
    const dialog = page.getByRole('dialog', { name: 'Make it your number.' })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('alert')).toContainText('Enter a number')
    await expect(page.getByLabel('Your estimated net worth', { exact: true })).toHaveAttribute('aria-invalid', 'true')
    await page.getByLabel('Your estimated net worth', { exact: true }).fill('123456.78')
    await page.getByLabel('Currency', { exact: true }).selectOption('EUR')
    await expect(dialog).toContainText('1.1234')
    await page.getByRole('button', { name: 'Use this amount', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await assertCompanyRatios(page, 123456.78 * 1.1234)
    await expect(page.locator('.edit-amount')).not.toContainText('example')
    for (const [amount, annotation] of [['0', 'zero'], ['-5000', 'below zero']]) {
      await useAmount(page, amount!)
      expect((await scale(page)).user).toBe(0)
      await expect(page.locator('.you-caption')).toContainText(annotation!)
    }
    await useAmount(page, '1000000000000')
    await assertCompanyRatios(page, 1e12)
    const huge = await scale(page)
    for (const wave of await page.locator('.money-wave').all()) expect(huge.user).toBeGreaterThan(Number(await wave.getAttribute('data-pixels')))
    await expect(page.locator('.you-caption')).toContainText(viewport.width < 650 ? '$1T' : '$1 trillion')
    await noOverflow(page)
    await page.getByRole('button', { name: /Change it/ }).click()
    await page.getByRole('button', { name: 'Use the $25,000 example', exact: true }).click()
    await expect(page.locator('.edit-amount')).toContainText('example')
    await assertCompanyRatios(page, 25000)
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
    expect(page.url()).not.toMatch(/123456|138691|1000000000000/)
    expect(requests.some(url => /123456|138691|1000000000000/.test(url))).toBe(false)
    expect(requests.filter(url => new URL(url).origin !== 'http://127.0.0.1:5173')).toEqual([])
    expect(errors).toEqual([])
  })
}

test('each wave has its own scoped source and AI assistance is acknowledged', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#surfer=altman')
  await expect(page.locator('.wave-caption')).toHaveCount(3)
  await page.getByRole('button', { name: 'Sources ↗', exact: true }).click()
  const features = page.locator('.source-feature')
  await expect(features).toHaveCount(3)
  for (const [company, amount] of [['Amazon', '$128.3 billion'], ['xAI', '$20 billion'], ['OpenAI', '$122 billion']]) {
    const feature = features.filter({ has: page.getByRole('heading', { name: `${company} · ${amount}`, exact: true }) })
    await expect(feature).toHaveCount(1)
    await expect(feature.locator('a')).toHaveAttribute('href', /^https:\/\//)
  }
  await expect(features.filter({ hasText: 'OpenAI ·' })).toContainText('not Sam Altman’s wealth')
  await expect(features.filter({ hasText: 'Amazon ·' })).toContainText(/Amazon-wide|company-wide/)
  await expect(page.locator('.source-inner')).toContainText('AI-generated')
  await page.keyboard.press('Escape')
  await page.locator('#made-with-ai').scrollIntoViewIfNeeded()
  await expect(page.locator('#made-with-ai')).toBeVisible()
  await expect(page.locator('#made-with-ai')).toContainText(/made this with AI/i)
  await expect(page.locator('#made-with-ai')).toContainText(/exciting/i)
  await noOverflow(page)
})

test('stage buttons, native dialog focus and motion controls support keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Story stages' })
  for (const [name, stage, progress] of [['The grind', 'build', .22], ['Zoom out', 'zoom', .45], ['The big waves', 'waves', .94], ['You', 'you', 0]] as const) {
    const button = nav.getByRole('button', { name: new RegExp(`^\\d+ ${name}$`) })
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.scale-scene')).toHaveAttribute('data-stage', stage)
    await expect.poll(async () => Math.abs((await scale(page)).progress - progress)).toBeLessThan(.002)
    await expect(button).toHaveAttribute('aria-current', 'step')
  }
  await expect(page.getByRole('button', { name: /Change it/ })).toHaveCount(0)
  await scrollToProgress(page, .2)
  const edit = page.getByRole('button', { name: /Change it/ })
  await expect(edit).toBeVisible()
  await edit.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Make it your number.' })).toBeVisible()
  expect(await page.evaluate(() => document.querySelector('.amount-dialog')?.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(edit).toBeFocused()
  const source = page.getByRole('button', { name: 'Sources ↗', exact: true })
  await source.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'The numbers.' })).toBeVisible()
  expect(await page.evaluate(() => document.querySelector('.source-dialog')?.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(source).toBeFocused()
  await page.getByRole('button', { name: 'Reduce motion', exact: true }).click()
  await expect(page.locator('.scale-scene')).toHaveAttribute('data-progress', '1')
  expect(await page.locator('#experience').evaluate(el => el.getBoundingClientRect().height <= innerHeight + 1)).toBe(true)
  await page.getByRole('button', { name: 'Still view', exact: true }).click()
  expect(await page.locator('#experience').evaluate(el => el.getBoundingClientRect().height > innerHeight * 5)).toBe(true)
  await page.reload()
  await page.keyboard.press('Tab')
  await expect(page.locator('.skip-link')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#comparison-end$/)
  await expect(page.locator('#comparison-end')).toBeFocused()
})

async function settledAt(page: Page, progress: number) {
  await expect.poll(async () => Math.abs((await scale(page)).progress - progress)).toBeLessThan(.002)
  await expect(page.locator('#experience')).toHaveAttribute('data-snapping', 'false')
}

test('a hard trackpad fling lands on one beat and absorbs its momentum tail', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.mouse.move(700, 500)
  for (const delta of [2400, 1600, 1000, 700, 400, 200, 100, 60, 30, 10, 4, 2, 1]) {
    await page.mouse.wheel(0, delta)
    await page.waitForTimeout(85)
  }
  await settledAt(page, .18)
  await expect(page.locator('.scene-heading h2')).toHaveText('You work.')
  await page.waitForTimeout(240)
  await page.mouse.wheel(0, 500)
  await settledAt(page, .22)
  await expect(page.locator('.scene-heading h2')).toHaveText('Rent. Bills. Repeat.')
  await page.waitForTimeout(240)
  await page.mouse.wheel(0, -500)
  await settledAt(page, .18)
})

test('keyboard beats hold the completed personal line, travel out, and release into the afterword', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  for (const progress of [.18, .22, .27, .315, .45, .60, .75, .87, .94]) {
    await page.keyboard.press('PageDown')
    await settledAt(page, progress)
    if (progress === .315) {
      await expect(page.locator('.scene-heading h2')).toHaveText('You built this.')
      expect((await scale(page)).built).toBe(25000)
    }
  }
  await expect(page.locator('.mogul-portrait')).toHaveCount(3)
  await page.keyboard.press('PageDown')
  await expect(page.locator('#experience')).toHaveAttribute('data-snapping', 'false')
  await expect.poll(() => page.locator('#made-with-ai').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(700)
  await page.keyboard.press('PageUp')
  await settledAt(page, .94)
  await page.getByRole('link', { name: 'Sorry, You’re Plankton, back to your scale' }).click()
  await settledAt(page, 0)
})

test('a renewed swipe escapes a live momentum tail without waiting for silence', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.mouse.move(700, 500)
  for (const delta of [180, 140, 100, 70, 50, 35, 24, 16, 10, 7, 5, 4, 3, 3, 3, 3, 3, 3, 3, 3]) {
    await page.mouse.wheel(0, delta)
    await page.waitForTimeout(45)
  }
  for (const delta of [4, 8, 18, 36]) {
    await page.mouse.wheel(0, delta)
    await page.waitForTimeout(25)
  }
  await settledAt(page, .22)
})

test('a second swipe during travel is retained and steady scrolling cannot stay locked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.mouse.move(700, 500)
  await page.mouse.wheel(0, 150)
  await page.waitForTimeout(250)
  await page.mouse.wheel(0, 150)
  await settledAt(page, .22)
  await page.getByRole('link', { name: 'Sorry, You’re Plankton, back to your scale' }).click()
  for (let index = 0; index < 40; index++) {
    await page.mouse.wheel(0, 3)
    await page.waitForTimeout(40)
  }
  await expect.poll(async () => (await scale(page)).progress).toBeGreaterThan(.20)
})

test('snapping leaves dialogs, pinch zoom and reduced motion alone', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.locator('.scale-scene').dispatchEvent('wheel', { deltaY: 700, ctrlKey: true, cancelable: true })
  await page.locator('.scale-scene').dispatchEvent('wheel', { deltaX: 700, deltaY: 20, cancelable: true })
  await settledAt(page, 0)
  await page.getByRole('button', { name: '02 The grind' }).click()
  await page.getByRole('button', { name: 'Sources ↗', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'The numbers.' })
  await dialog.hover()
  await page.mouse.wheel(0, 500)
  await expect.poll(() => dialog.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
  await settledAt(page, .22)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Reduce motion', exact: true }).click()
  await page.mouse.move(600, 400)
  await page.mouse.wheel(0, 500)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  await settledAt(page, 1)
})

test('a mobile swipe advances only one beat and the afterword remains freely scrollable', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:5173')
  const touch = await context.newCDPSession(page)
  async function swipe(from: number, to: number) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: from }] })
    for (let step = 1; step <= 8; step++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 200, y: from + (to - from) * step / 8 }] })
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  await swipe(700, 180)
  await settledAt(page, .18)
  await swipe(700, 180)
  await settledAt(page, .22)
  await swipe(180, 700)
  await settledAt(page, .18)
  await page.getByRole('button', { name: '04 The big waves' }).tap()
  await swipe(700, 180)
  await expect(page.locator('#experience')).toHaveAttribute('data-snapping', 'false')
  await expect.poll(() => page.locator('#comparison-end').evaluate(el => el.getBoundingClientRect().top)).toBeLessThan(60)
  const before = await page.evaluate(() => scrollY)
  const available = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)
  await swipe(700, 180)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + Math.min(50, available / 2))
  await expect(page.locator('#experience')).toHaveAttribute('data-snapping', 'false')
  await context.close()
})
