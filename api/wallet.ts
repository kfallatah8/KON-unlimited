// Wallet passes for the KON digital card.
//   GET /api/wallet?kind=apple&p=khalid  → a signed .pkpass (Apple Wallet)
//   GET /api/wallet?kind=google&p=khalid → { url } a "Save to Google Wallet" link (signed JWT)
// Until the accounts are connected (Vercel env vars below), both answer 503 and the card shows
// a friendly "coming soon" note instead of an error.
//
// Apple  (Apple Developer Program, Pass Type ID + certificate):
//   APPLE_PASS_TYPE_ID   e.g. pass.com.kon-unlimited.card
//   APPLE_TEAM_ID        10-character team id
//   APPLE_SIGNER_CERT    the pass certificate, PEM, base64-encoded
//   APPLE_SIGNER_KEY     its private key, PEM, base64-encoded
//   APPLE_SIGNER_PASS    the key's passphrase (if any)
//   APPLE_WWDR           Apple WWDR G4 intermediate certificate, PEM, base64-encoded
// Google (Google Wallet API issuer + a service account with the Wallet Object Issuer role):
//   GOOGLE_WALLET_ISSUER_ID
//   GOOGLE_WALLET_SA_EMAIL
//   GOOGLE_WALLET_SA_KEY  the service account private key, PEM, base64-encoded
import { createSign } from 'node:crypto'
import { PKPass } from 'passkit-generator'
import { COMPANY, findPerson, type Person } from '../src/card/people.js'

type Req = { method?: string; query: Record<string, string | string[] | undefined>; headers: Record<string, string | string[] | undefined> }
type Res = { status: (n: number) => Res; setHeader: (k: string, v: string) => void; send: (b: unknown) => void; json: (b: unknown) => void; end: () => void }

const env = (k: string) => process.env[k] || ''
const pem = (k: string) => (env(k) ? Buffer.from(env(k), 'base64').toString('utf8') : '')
const q = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ''

export default async function handler(req: Req, res: Res) {
  const kind = q(req.query.kind)
  const person = findPerson(q(req.query.p))
  const origin = `https://${q(req.headers['x-forwarded-host']) || q(req.headers.host) || 'kon-unlimited.com'}`
  try {
    if (kind === 'apple') {
      if (!env('APPLE_PASS_TYPE_ID') || !env('APPLE_SIGNER_CERT')) return res.status(503).json({ error: 'apple_not_configured' })
      if (req.method === 'HEAD') return res.status(200).end()
      const buf = await applePass(person, origin)
      res.setHeader('Content-Type', 'application/vnd.apple.pkpass')
      res.setHeader('Content-Disposition', `attachment; filename="KON-${person.slug}.pkpass"`)
      res.setHeader('Cache-Control', 'no-store')
      return res.status(200).send(buf)
    }
    if (kind === 'google') {
      if (!env('GOOGLE_WALLET_ISSUER_ID') || !env('GOOGLE_WALLET_SA_KEY')) return res.status(503).json({ error: 'google_not_configured' })
      return res.status(200).json({ url: `https://pay.google.com/gp/v/save/${googleJwt(person, origin)}` })
    }
    return res.status(400).json({ error: 'kind must be apple or google' })
  } catch (e) {
    console.error('wallet', kind, person.slug, e)
    return res.status(500).json({ error: 'pass_failed' })
  }
}

async function img(origin: string, name: string) {
  const r = await fetch(`${origin}/wallet/${name}`)
  if (!r.ok) throw new Error(`missing /wallet/${name}`)
  return Buffer.from(await r.arrayBuffer())
}

async function applePass(p: Person, origin: string) {
  const files = ['icon.png', 'icon@2x.png', 'icon@3x.png', 'logo.png', 'logo@2x.png', 'logo@3x.png', 'strip.png', 'strip@2x.png', 'strip@3x.png']
  const buffers: Record<string, Buffer> = {}
  await Promise.all(files.map(async (f) => { buffers[f] = await img(origin, f) }))
  const url = COMPANY.cardBase + p.slug
  const tel = p.phone || p.whatsapp
  buffers['pass.json'] = Buffer.from(JSON.stringify({
    formatVersion: 1,
    passTypeIdentifier: env('APPLE_PASS_TYPE_ID'),
    teamIdentifier: env('APPLE_TEAM_ID'),
    serialNumber: `kon-card-${p.slug}`,
    organizationName: 'KON Unlimited',
    description: `${p.nameEn} · KON Unlimited`,
    logoText: 'Unlimited',
    backgroundColor: 'rgb(1, 13, 15)',
    foregroundColor: 'rgb(238, 252, 249)',
    labelColor: 'rgb(95, 227, 210)',
    sharingProhibited: false,
    storeCard: {
      headerFields: [],
      primaryFields: [],
      secondaryFields: [{ key: 'name', label: p.titleEn || 'KON Unlimited', value: p.nameEn }],
      auxiliaryFields: [{ key: 'ar', label: p.titleAr || 'كُن', value: p.nameAr, textAlignment: 'PKTextAlignmentRight' }],
      backFields: [
        ...(tel ? [{ key: 'tel', label: 'Mobile / WhatsApp', value: `+${tel}`, dataDetectorTypes: ['PKDataDetectorTypePhoneNumber'] }] : []),
        ...(p.email ? [{ key: 'email', label: 'Email', value: p.email }] : []),
        { key: 'card', label: 'Digital card', value: url, attributedValue: `<a href="${url}">${url.replace('https://', '')}</a>` },
        { key: 'site', label: 'Website', value: COMPANY.site },
        { key: 'slogan', label: 'KON', value: COMPANY.slogan },
      ],
    },
    barcodes: [{ format: 'PKBarcodeFormatQR', message: `${url}?src=wallet`, messageEncoding: 'iso-8859-1', altText: 'Scan to save' }],
  }))
  const pass = new PKPass(buffers, {
    wwdr: pem('APPLE_WWDR'), signerCert: pem('APPLE_SIGNER_CERT'), signerKey: pem('APPLE_SIGNER_KEY'), signerKeyPassphrase: env('APPLE_SIGNER_PASS') || undefined,
  })
  return pass.getAsBuffer()
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
const loc = (en: string, ar: string) => ({ defaultValue: { language: 'en', value: en }, translatedValues: ar ? [{ language: 'ar', value: ar }] : [] })

function googleJwt(p: Person, origin: string) {
  const iss = env('GOOGLE_WALLET_ISSUER_ID')
  const classId = `${iss}.kon_card`
  const url = COMPANY.cardBase + p.slug
  const tel = p.phone || p.whatsapp
  const payload = {
    iss: env('GOOGLE_WALLET_SA_EMAIL'), aud: 'google', typ: 'savetowallet', origins: [origin],
    payload: {
      genericClasses: [{ id: classId }],
      genericObjects: [{
        id: `${iss}.card_${p.slug}`, classId, state: 'ACTIVE',
        hexBackgroundColor: '#012f2e',
        logo: { sourceUri: { uri: `${origin}/wallet/google-logo.png` }, contentDescription: loc('KON Unlimited', 'كُن') },
        cardTitle: loc('KON Unlimited', 'كُن غير محدود'),
        header: loc(p.nameEn, p.nameAr),
        ...(p.titleEn ? { subheader: loc(p.titleEn, p.titleAr) } : {}),
        heroImage: { sourceUri: { uri: `${origin}/wallet/google-hero.png` }, contentDescription: loc('KON gemstones', 'أحجار كُن') },
        barcode: { type: 'QR_CODE', value: `${url}?src=wallet`, alternateText: 'Scan to save' },
        textModulesData: [
          ...(tel ? [{ id: 'tel', header: 'Mobile / WhatsApp', body: `+${tel}` }] : []),
          ...(p.email ? [{ id: 'email', header: 'Email', body: p.email }] : []),
          { id: 'slogan', header: 'KON', body: COMPANY.slogan },
        ],
        linksModuleData: { uris: [
          { id: 'card', uri: url, description: 'Digital card' },
          { id: 'site', uri: COMPANY.site, description: 'kon-unlimited.com' },
          ...(p.email ? [{ id: 'mail', uri: `mailto:${p.email}`, description: 'Email' }] : []),
          ...(tel ? [{ id: 'tel', uri: `tel:+${tel}`, description: 'Call' }] : []),
        ] },
      }],
    },
  }
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = b64u(JSON.stringify(payload))
  const sig = createSign('RSA-SHA256').update(`${head}.${body}`).sign(pem('GOOGLE_WALLET_SA_KEY'))
  return `${head}.${body}.${b64u(sig)}`
}
