// One entry per team member. The card lives at kon-unlimited.com/card/<slug>.
// Leave a field empty ('') and its line and button simply disappear: nothing is ever made up.
// `confirmed: false` marks details that still need the person's OK (shown only in the QA strip).

export interface Person {
  slug: string
  nameAr: string
  nameEn: string
  titleAr: string
  titleEn: string
  /** International format without +, e.g. 9665XXXXXXXX. Used for Call and WhatsApp. */
  phone: string
  whatsapp: string
  email: string
  linkedin: string
  /** Calendly (or other) booking link. Empty = the company booking link is used. */
  booking: string
  confirmed: boolean
  /** What still needs the person's OK, listed for the team (never shown to visitors). */
  pending: string[]
}

export const COMPANY = {
  nameAr: 'كُن غير محدود',
  nameEn: 'KON Unlimited',
  site: 'https://kon-unlimited.com',
  siteLabel: 'kon-unlimited.com',
  email: 'info@kon-unlimited.com',
  whatsapp: '966562399592',
  booking: 'https://calendly.com/k-fallatah8/30min',
  slogan: 'Any challenge...Any way...Anywhere…We’ll be there',
  cardBase: 'https://kon-unlimited.com/card/',
}

export const PEOPLE: Person[] = [
  {
    slug: 'khalid',
    nameAr: 'خالد عبدالرحمن',
    nameEn: 'Khalid Abdulrahman',
    titleAr: 'مطوّر أعمال',
    titleEn: 'Business Developer',
    phone: '',
    whatsapp: '966562399592',
    email: 'ceo@kon-unlimited.com',
    linkedin: '',
    booking: 'https://calendly.com/k-fallatah8/30min',
    confirmed: false,
    pending: ['English name spelling', 'English title', 'personal mobile (WhatsApp uses the company number for now)', 'LinkedIn (optional)'],
  },
  {
    slug: 'fahad',
    nameAr: 'فهد الشريف',
    nameEn: 'Fahad Al-Sharif',
    titleAr: '',
    titleEn: '',
    phone: '',
    whatsapp: '',
    email: '',
    linkedin: '',
    booking: '',
    confirmed: false,
    pending: ['Arabic name spelling', 'title', 'mobile / WhatsApp', 'email', 'LinkedIn (optional)'],
  },
]

export function findPerson(slug: string | null | undefined): Person {
  return PEOPLE.find((p) => p.slug === (slug || '').toLowerCase()) ?? PEOPLE[0]
}

/** /card/khalid on the live site, ?p=khalid or #khalid in previews. */
export function currentSlug(): string {
  const m = location.pathname.match(/\/card\/([a-z0-9-]+)/i)
  if (m) return m[1]
  const q = new URLSearchParams(location.search).get('p')
  if (q) return q
  const h = location.hash.replace('#', '').split(/[/&]/)[0]
  return h && h !== 'en' && h !== 'ar' ? h : 'khalid'
}
