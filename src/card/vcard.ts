import { COMPANY, type Person } from './people'

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

/** vCard 3.0: opens as "Create contact" on iPhone and Android, Arabic name first, English kept. */
export function vcard(p: Person, photoB64?: string): string {
  const [firstEn, ...restEn] = p.nameEn.split(' ')
  const L = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N;CHARSET=UTF-8:${esc(restEn.join(' '))};${esc(firstEn)};;;`,
    `FN;CHARSET=UTF-8:${esc(p.nameEn)} | ${esc(p.nameAr)}`,
    `X-PHONETIC-FIRST-NAME:${esc(firstEn)}`,
    `ORG;CHARSET=UTF-8:${COMPANY.nameEn}`,
  ]
  const title = [p.titleEn, p.titleAr].filter(Boolean).join(' | ')
  if (title) L.push(`TITLE;CHARSET=UTF-8:${esc(title)}`)
  const tel = p.phone || p.whatsapp
  if (tel) L.push(`TEL;TYPE=CELL,VOICE:+${tel}`)
  if (p.email) L.push(`EMAIL;TYPE=WORK,INTERNET:${p.email}`)
  L.push(`URL:${COMPANY.cardBase}${p.slug}`)
  L.push(`URL;TYPE=WORK:${COMPANY.site}`)
  if (p.linkedin) L.push(`X-SOCIALPROFILE;TYPE=linkedin:${p.linkedin}`)
  L.push(`NOTE;CHARSET=UTF-8:${esc(COMPANY.slogan)}`)
  if (photoB64) L.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoB64}`)
  L.push('END:VCARD')
  return L.join('\r\n') + '\r\n'
}

export function downloadVcard(p: Person, photoB64?: string) {
  const blob = new Blob([vcard(p, photoB64)], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${p.nameEn.replace(/\s+/g, '-')}-KON.vcf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** A small square contact photo: the KON gem mark drawn on a canvas (no image files needed). */
export function contactPhoto(): string {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(128, 110, 10, 128, 128, 180)
  g.addColorStop(0, '#0b4f4b'); g.addColorStop(1, '#010d0f')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
  const t = x.createLinearGradient(60, 60, 200, 200)
  t.addColorStop(0, '#a8f5ea'); t.addColorStop(0.5, '#14ab9a'); t.addColorStop(1, '#04524d')
  x.fillStyle = t
  x.font = '900 92px "Arial Black", Arial, sans-serif'
  x.textAlign = 'center'; x.textBaseline = 'middle'
  x.fillText('KON', 128, 134)
  return c.toDataURL('image/jpeg', 0.86).split(',')[1]
}
