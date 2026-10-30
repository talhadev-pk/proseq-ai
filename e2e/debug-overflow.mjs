import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto('http://localhost:4173/proseq-ai/#/app', { waitUntil: 'networkidle' })
await page.waitForSelector('#app-main', { timeout: 10000 })
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth
  const main = document.getElementById('app-main')
  const out = {
    vw,
    mainWidth: Math.round(main.getBoundingClientRect().width),
    scrollWidth: document.documentElement.scrollWidth,
    sections: [],
  }
  for (const child of main.firstElementChild ? main.firstElementChild.children : []) {
    const r = child.getBoundingClientRect()
    out.sections.push({
      cls: String(child.className).split(' ').slice(0, 3).join('.'),
      w: Math.round(r.width),
      scrollW: child.scrollWidth,
    })
  }
  // also check recharts containers
  for (const el of document.querySelectorAll('.recharts-responsive-container')) {
    out.sections.push({ cls: 'recharts-container', w: Math.round(el.getBoundingClientRect().width), scrollW: el.scrollWidth })
  }
  return out
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
