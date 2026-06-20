import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage()

// Live site - desktop
await page.setViewportSize({ width: 1440, height: 900 })
await page.goto('https://bluelunaevents.com', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1500)
await page.screenshot({ path: 'C:/tmp/live-desktop-full.png', fullPage: true })
console.log('live desktop done')

// Live site - mobile
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('https://bluelunaevents.com', { waitUntil: 'networkidle', timeout: 30000 })
await page.waitForTimeout(1500)
await page.screenshot({ path: 'C:/tmp/live-mobile-full.png', fullPage: true })
console.log('live mobile done')

// Current build - desktop (force reveal)
await page.setViewportSize({ width: 1440, height: 900 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 })
await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' })
await page.waitForTimeout(800)
await page.screenshot({ path: 'C:/tmp/new-desktop-full.png', fullPage: true })
console.log('new desktop done')

// Current build - mobile
await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 })
await page.addStyleTag({ content: '.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }' })
await page.waitForTimeout(800)
await page.screenshot({ path: 'C:/tmp/new-mobile-full.png', fullPage: true })
console.log('new mobile done')

await browser.close()
console.log('all done')
