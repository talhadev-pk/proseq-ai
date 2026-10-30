import { chromium } from 'playwright'
const shots = [
  { name: 'home', route: '/', width: 1366, dark: false },
  { name: 'home-dark', route: '/', width: 1366, dark: true },
  { name: 'pricing', route: '/pricing', width: 1366, dark: false },
  { name: 'app-overview', route: '/app', width: 1366, dark: false },
  { name: 'app-overview-mobile', route: '/app', width: 390, dark: false },
  { name: 'writer', route: '/app/writer', width: 1366, dark: false },
]
const browser = await chromium.launch()
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.width > 500 ? 860 : 900 } })
  if (s.dark) await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto(`http://localhost:4173/proseq-ai/#${s.route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  if (s.dark) {
    // switch to dark explicitly via the toggle (persisted theme)
    await page.getByLabel('Dark theme').first().click()
    await page.waitForTimeout(700)
  }
  await page.screenshot({ path: `screenshots/${s.name}.png`, fullPage: s.name === 'home' })
  await page.close()
  console.log('captured', s.name)
}
await browser.close()
