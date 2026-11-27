// Renders the wallet pass artwork from the card's own scene (gems, clouds, glass KON).
//   npx vite build --mode card && node scripts/wallet-art.cjs && python3 scripts/wallet-art.py
const { chromium } = require('playwright')
const path = require('path')
;(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
  const file = 'file://' + path.resolve(__dirname, '../dist-card/card.html')
  const out = path.resolve(__dirname, '../public/wallet')
  const shots = [
    ['strip', 1125, 369, false],
    ['hero', 1032, 336, false],
    ['logo', 960, 392, true],
  ]
  for (const [art, w, h, clear] of shots) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    await p.goto(`${file}?art=${art}`)
    if (clear) await p.addStyleTag({ content: 'html,body,.kc{background:transparent!important}.kc-sky{display:none}' })
    await p.waitForTimeout(art === 'logo' ? 2500 : 7000)
    await p.screenshot({ path: `${out}/_${art}.png`, omitBackground: clear })
    await p.close()
  }
  await b.close()
})()
