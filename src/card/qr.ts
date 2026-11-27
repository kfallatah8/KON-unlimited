import qrcode from 'qrcode-generator'

/** Crisp SVG QR (error correction Q, so it still scans through glare on a phone screen). */
export function qrSvg(text: string): string {
  const q = qrcode(0, 'Q')
  q.addData(text)
  q.make()
  const n = q.getModuleCount()
  let d = ''
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="QR"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#eefcf9"/><path d="${d}" fill="#012f2e"/></svg>`
}
