// Serve the actual upload folder without Vite or an SPA fallback.
import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import assert from 'node:assert/strict'
import sharp from 'sharp'

const root = resolve('dist'), base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/')
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain' }
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    if (!pathname.startsWith(base)) throw Error('Outside site base')
    let file = resolve(root, pathname.slice(base.length) || 'index.html')
    if (!file.startsWith(root + '/')) throw Error('Outside upload folder')
    if ((await stat(file)).isDirectory()) file += '/index.html'
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream')
    res.end(await readFile(file))
  } catch { res.writeHead(404); res.end('Not found') }
})
await new Promise(r => server.listen(0, '127.0.0.1', r))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch()
await mkdir('test-results/production', { recursive: true })
try {
  const assets = JSON.parse(await readFile('src/data/assets.json', 'utf8'))
  assert.equal(Object.keys(assets).length, 9)
  for (const asset of Object.values(assets)) {
    const image = sharp(resolve(root, asset.web)), metadata = await image.metadata(), stats = await image.stats()
    assert(metadata.hasAlpha && stats.channels[3].min === 0, `Missing transparency: ${asset.web}`)
    assert.equal(metadata.width, asset.pose === 'head' ? 1254 : 900)
  }
  for (const name of ['social.png', 'share/bezos.png', 'share/musk.png', 'share/altman.png']) {
    const meta = await sharp(resolve(root, name)).metadata()
    assert.equal(meta.width, 1200); assert.equal(meta.height, 630)
  }
  for (const name of ['big-shoulders-display', 'dm-sans']) {
    assert((await readFile(resolve(root, `licenses/${name}.txt`), 'utf8')).includes('SIL OPEN FONT LICENSE'))
  }
  console.log('PASS all 9 transparent image exports, 4 social images, and bundled font licenses')

  for (const [name, width, height] of [['desktop', 1440, 1000], ['laptop', 1280, 720], ['tablet', 768, 1024], ['mobile', 390, 844], ['small-mobile', 360, 740]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' })
    const errors = [], failed = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('requestfailed', request => failed.push(request.url()))
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()) })
    await page.goto(origin + base, { waitUntil: 'networkidle' })
    assert.equal(await page.title(), 'Sorry, You’re Plankton — Big money. Tiny you.')
    assert(await page.locator('.you-meme').evaluate(el => el.complete && el.naturalWidth === 1254))
    assert(await page.locator('.brand-symbol').evaluate(el => el.complete && el.naturalWidth > 0))
    const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
    assert.equal((await page.request.get(origin + favicon)).headers()['content-type'], 'image/svg+xml')
    await page.evaluate(() => document.fonts.ready)
    assert(await page.evaluate(() => document.fonts.check('900 16px "Big Shoulders Display"') && document.fonts.check('400 16px "DM Sans"')))
    await page.screenshot({ path: `test-results/production/${name}-start.png` })
    for (const [label, progress] of [['effort', .22], ['built', .315], ['zoom', .60], ['full', .94]]) {
      const physical = progress <= .32 ? progress * .20 / .32 : .20 + (progress - .32) * .80 / .68
      await page.locator('#experience').evaluate((el, fraction) => {
        window.scrollTo({ top: Math.ceil(el.getBoundingClientRect().top + scrollY + (el.clientHeight - innerHeight) * fraction), behavior: 'instant' })
      }, physical)
      await page.waitForFunction(target => Math.abs(Number(document.querySelector('.scale-scene')?.getAttribute('data-progress')) - target) < .002, progress)
      await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())))
      if (label === 'full') {
        assert.equal(await page.locator('.mogul-portrait').count(), 3)
        for (const portrait of await page.locator('.mogul-portrait').all()) {
          const bounds = await portrait.boundingBox()
          assert(bounds.x >= -.5 && bounds.x + bounds.width <= width + .5, `${name}: portrait clipped horizontally`)
          assert(bounds.y >= 64 && bounds.y + bounds.height <= height - 90, `${name}: portrait clipped vertically`)
        }
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`)
      assert(await page.locator('.scroll-footer').evaluate(el => el.getBoundingClientRect().bottom <= innerHeight + 1), `${name}: hidden stage controls`)
      await page.screenshot({ path: `test-results/production/${name}-${label}.png` })
    }
    await page.getByRole('button', { name: 'Reduce motion', exact: true }).click()
    assert.equal(await page.locator('.scale-scene').getAttribute('data-progress'), '1')
    assert.equal(await page.locator('.mogul-portrait').count(), 3)
    assert.deepEqual(errors, []); assert.deepEqual(failed, [])
    console.log(`PASS ${name} ${width}×${height}: face, effort, pullback, 3 portraits, icon, fonts, and reduced motion`)
    await page.close()
  }

  for (const person of ['bezos', 'musk', 'altman']) {
    const page = await browser.newPage({ reducedMotion: 'reduce' }), failed = []
    page.on('pageerror', error => failed.push(error.message))
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()) })
    await page.goto(origin + base + `share/${person}/`, { waitUntil: 'networkidle' })
    assert((await page.title()).includes('Sorry, You’re Plankton'))
    assert.equal(await page.locator('.mogul-portrait').count(), 3)
    const socialImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    assert.equal((await page.request.get(new URL(socialImage, origin).href)).status(), 200)
    assert.deepEqual(failed, [])
    console.log(`PASS ${base}share/${person}/: direct static route, all 3 waves, branded metadata, and social image`)
    await page.close()
  }
} finally { await browser.close(); await new Promise(r => server.close(r)) }
