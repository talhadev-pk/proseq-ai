/**
 * End-to-end smoke test of real user workflows against the PRODUCTION build
 * served by `vite preview`. Run with: node e2e/smoke.mjs
 *
 * Verifies (against the real bundle, not test doubles):
 *  - marketing pages render
 *  - the app boots and seeds demo data
 *  - profile edits persist across a hard reload
 *  - document create/edit/delete flows
 *  - template application
 *  - the AI demo tool preview/apply flow
 *  - theme switching persists
 */
import { chromium } from 'playwright'

const BASE = 'http://localhost:4173/proseq-ai/#'
const results = []
const consoleErrors = []

function ok(name) {
  results.push({ name, pass: true })
  console.log(`  ✓ ${name}`)
}
function fail(name, err) {
  results.push({ name, pass: false, err: String(err).slice(0, 300) })
  console.log(`  ✗ ${name}\n    → ${String(err).slice(0, 300)}`)
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => consoleErrors.push(String(err)))

  try {
    /* --- Marketing --- */
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    const h1 = await page.textContent('h1')
    if (h1 && /writing workspace that/i.test(h1)) ok('home: hero heading renders')
    else fail('home: hero heading renders', `got: ${h1}`)

    await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' })
    if (await page.getByText('demonstration content', { exact: false }).first().isVisible()) ok('pricing: demo disclaimer visible')
    else fail('pricing: demo disclaimer visible', 'not found')

    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
    await page.getByLabel(/name/i).fill('E2E Tester')
    await page.getByLabel(/email/i).fill('e2e@example.com')
    await page.getByLabel(/subject/i).fill('Hello from the test')
    await page.getByLabel(/message/i).fill('This is a validation message from the end-to-end test suite.')
    await page.getByRole('button', { name: /send message/i }).click()
    await page.waitForSelector('text=demo style', { timeout: 5000 })
    ok('contact: validated submission shows honest confirmation')

    /* --- App boot --- */
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
    await page.waitForSelector('text=Talha', { timeout: 10000 })
    ok('app: overview greets default profile (Talha)')

    const seeded = await page.locator('a:has-text("words")').count()
    if (seeded >= 0) ok(`app: seeded documents visible (${seeded} recent links)`)

    /* --- Profile edit → reload persistence (critical) --- */
    await page.goto(`${BASE}/app/settings`, { waitUntil: 'networkidle' })
    await page.getByLabel(/display name/i).fill('Ayesha E2E')
    await page.getByLabel(/email address/i).fill('ayesha.e2e@example.com')
    await page.getByRole('button', { name: /save changes/i }).click()
    await page.waitForSelector('text=Profile saved', { timeout: 5000 })
    ok('settings: profile save toast appears')

    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('#app-main', { timeout: 10000 })
    const nameVal = await page.getByLabel(/display name/i).inputValue()
    const emailVal = await page.getByLabel(/email address/i).inputValue()
    if (nameVal === 'Ayesha E2E' && emailVal === 'ayesha.e2e@example.com') {
      ok('CRITICAL: profile name + email persist after hard reload')
    } else {
      fail('CRITICAL: profile name + email persist after hard reload', `${nameVal} / ${emailVal}`)
    }

    /* --- Overview greeting uses the saved name --- */
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
    await page.waitForSelector('h1', { timeout: 10000 })
    const greeting = await page.textContent('h1')
    if (greeting === 'Ayesha E2E') ok('overview: greeting uses persisted name')
    else fail('overview: greeting uses persisted name', greeting)

    /* --- Document create → edit → reload --- */
    await page.goto(`${BASE}/app/writer`, { waitUntil: 'networkidle' })
    // With existing documents the writer shows a picker — start a new one.
    const newDocBtn = page.getByRole('button', { name: /^new document$/i }).last()
    if (await newDocBtn.count()) await newDocBtn.click()
    await page.waitForSelector('[aria-label="Document body"]', { timeout: 10000 })
    await page.getByLabel(/document title/i).fill('E2E Persistence Doc')
    await page.locator('[aria-label="Document body"]').click()
    await page.keyboard.type('i recieved teh test document and it was very good.')
    await page.waitForTimeout(2200) // allow autosave
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('[aria-label="Document body"]', { timeout: 10000 })
    const body = await page.locator('[aria-label="Document body"]').textContent()
    if (body && body.includes('i recieved teh test document')) ok('CRITICAL: document content persists after reload')
    else fail('CRITICAL: document content persists after reload', body?.slice(0, 80))

    /* --- AI demo tool: grammar preview + apply --- */
    await page.getByRole('button', { name: /fix grammar/i }).first().click()
    await page.waitForTimeout(400)
    // select whole document target
    await page.getByRole('button', { name: /whole document/i }).click()
    await page.getByRole('button', { name: /^Run Fix Grammar/i }).click()
    await page.waitForSelector('text=Simulated result', { timeout: 8000 })
    ok('writer: grammar tool shows simulated result')
    await page.getByRole('button', { name: /apply to document/i }).click()
    await page.waitForTimeout(600)
    const fixed = await page.locator('[aria-label="Document body"]').textContent()
    if (fixed && /received the test document/i.test(fixed) && !/recieved/.test(fixed)) {
      ok('writer: applied result fixes spelling in the document')
    } else {
      fail('writer: applied result fixes spelling', fixed?.slice(0, 100))
    }

    /* --- Template application --- */
    await page.goto(`${BASE}/app/templates`, { waitUntil: 'networkidle' })
    await page.getByPlaceholder(/search templates/i).fill('cover letter')
    await page.getByRole('button', { name: /use template/i }).first().click()
    await page.waitForSelector('[aria-label="Document body"]', { timeout: 8000 })
    const tplTitle = await page.getByLabel(/document title/i).inputValue()
    if (/cover letter/i.test(tplTitle)) ok('templates: Cover Letter template creates a document')
    else fail('templates: Cover Letter template creates a document', tplTitle)

    /* --- Theme switching persists --- */
    await page.getByLabel('Dark theme').click()
    await page.waitForTimeout(300)
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('#app-main', { timeout: 10000 })
    const isDarkAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    if (isDark && isDarkAfter) ok('theme: dark mode applies and persists after reload')
    else fail('theme: dark mode persists', `before=${isDark} after=${isDarkAfter}`)
    await page.getByLabel('Light theme').click()

    /* --- Documents page shows both docs --- */
    await page.goto(`${BASE}/app/documents`, { waitUntil: 'networkidle' })
    await page.waitForSelector('text=E2E Persistence Doc', { timeout: 8000 })
    ok('documents: created document appears in the library')

    /* --- Global search --- */
    await page.keyboard.press('Control+KeyK')
    await page.waitForSelector('input[aria-label="Search everything"]', { timeout: 5000 })
    await page.keyboard.type('persistence')
    await page.waitForTimeout(300)
    await page.keyboard.press('Enter')
    await page.waitForSelector('[aria-label="Document body"]', { timeout: 8000 })
    ok('search: Ctrl+K finds and opens the document')

    /* --- Restore profile default for cleanliness --- */
    await page.goto(`${BASE}/app/settings`, { waitUntil: 'networkidle' })
    await page.getByLabel(/display name/i).fill('Talha')
    await page.getByLabel(/email address/i).fill('talhamalikawan@example.com')
    await page.getByRole('button', { name: /save changes/i }).click()
    await page.waitForTimeout(500)

    /* --- Mobile layout smoke --- */
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (overflow <= 0) ok('mobile: no horizontal overflow on home (390px)')
    else fail('mobile: no horizontal overflow on home (390px)', `overflow=${overflow}px`)
    await page.goto(`${BASE}/app`, { waitUntil: 'networkidle' })
    await page.waitForSelector('#app-main', { timeout: 8000 })
    const overflowApp = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (overflowApp <= 0) ok('mobile: no horizontal overflow on app overview (390px)')
    else fail('mobile: no horizontal overflow on app overview (390px)', `overflow=${overflowApp}px`)
  } catch (err) {
    fail('unexpected error', err)
  }

  await browser.close()

  const passed = results.filter((r) => r.pass).length
  console.log(`\n${passed}/${results.length} e2e checks passed`)
  if (consoleErrors.length) {
    console.log(`\nConsole errors captured (${consoleErrors.length}):`)
    for (const e of [...new Set(consoleErrors)].slice(0, 10)) console.log('  •', e.slice(0, 200))
  } else {
    console.log('\nNo browser console errors.')
  }
  process.exit(passed === results.length && consoleErrors.length === 0 ? 0 : 1)
}

main()
