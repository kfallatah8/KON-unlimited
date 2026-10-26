// One source of truth for the "KON" letterforms: the gems sample these glyphs, and the DOM
// wordmark draws the same glyphs, so the crisp outline and the gem letters line up exactly.
export const KON = { W: 900, H: 320, gap: 40, font: '900 270px "Arial Black", "Helvetica Neue", Arial, sans-serif' }
const LETTERS = ['K', 'O', 'N']

export function measureKon(ctx: CanvasRenderingContext2D) {
  ctx.font = KON.font
  ctx.direction = 'ltr'
  const widths = LETTERS.map((l) => ctx.measureText(l).width)
  const total = widths.reduce((a, b) => a + b, 0) + KON.gap * 2
  return { widths, total }
}

/** Draws the letters with their left edge at x0 and vertical centre at the canvas middle. */
export function drawKon(ctx: CanvasRenderingContext2D, x0: number, draw: (l: string, x: number, y: number) => void) {
  const { widths } = measureKon(ctx)
  ctx.textBaseline = 'middle'
  // The page is RTL in Arabic; canvas text would inherit that and right-align each glyph.
  ctx.direction = 'ltr'
  ctx.textAlign = 'left'
  let x = x0
  LETTERS.forEach((l, i) => {
    draw(l, x, KON.H / 2 + 8)
    x += widths[i] + KON.gap
  })
}

/** World-space layout of the word, shared by the 3D layer and the DOM overlay. */
export function konLayout(vw: number, vh: number, narrow: boolean) {
  const width = Math.min(vw * (narrow ? 0.86 : 0.66), vh * 1.7)
  const centerY = vh * (narrow ? 0.09 : 0.075)
  return { width, centerY }
}
