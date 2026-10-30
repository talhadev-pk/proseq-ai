import { chromium } from 'playwright'
const routes = ['/', '/features', '/templates', '/pricing', '/about', '/contact', '/nosuchpage',
  '/app', '/app/writer', '/app/documents', '/app/templates', '/app/brand-voice', '/app/planner', '/app/history', '/app/settings']
const widths = [390, 768, 1366]
const browser = await chromium.launch()
let fails = 0
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  for (const r of routes) {
    await page.goto(`http://localhost:4173/proseq-ai/#${r}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (over > 1) { console.log(`✗ ${w}px ${r}: overflow ${over}px`); fails++ }
  }
  await page.close()
}
await browser.close()
console.log(fails === 0 ? `PASS: no horizontal overflow on ${routes.length} routes × ${widths.length} widths` : `FAIL: ${fails} overflows`)
process.exit(fails === 0 ? 0 : 1)
