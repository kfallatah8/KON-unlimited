// POST /api/lead: a visitor finished a flow (diagnosis, talent, company, solution request) or booked.
// Saves the lead durably, then alerts khalid. The visitor's flow never waits on it.
import { clean, notify, store } from './_lib/leads.js'

const ALLOWED = /^(https:\/\/([a-z0-9-]+\.)*(kon-unlimited\.com|kon\.sa)|https:\/\/konunlimited[a-z0-9-]*\.vercel\.app|http:\/\/localhost(:\d+)?)$/

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  // Test links only: GET ?selftest=1 sends one sample lead end to end (store + alerts).
  if (req.method === 'GET' && req.query.selftest === '1' && process.env.VERCEL_ENV !== 'production') {
    req.body = { kind: 'diagnosis', lang: 'ar', name: 'اختبار النظام (تجربة)', phone: '0500000000', title: 'رائد أعمال · اختبار', priority: 'high · 5/5', brief: 'عميل تجريبي للتأكد من وصول التنبيهات، تجاهله', page: 'selftest' }
  } else if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }) }
  const origin = String(req.headers.origin || '')
  if (origin && !ALLOWED.test(origin)) return res.status(403).json({ ok: false, error: 'origin' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
  if (body && body.website) return res.status(200).json({ ok: true }) // honeypot
  if (JSON.stringify(body || {}).length > 40000) return res.status(413).json({ ok: false })
  const lead = clean(body)
  if (!lead) return res.status(400).json({ ok: false, error: 'missing_fields' })

  let rec
  try {
    rec = await store(lead)
  } catch (e) {
    console.error('KON_LEAD_STORE_FAILED', e && e.message)
    // Storage down: still alert, and keep the lead in the runtime log as a last resort.
    rec = { id: `nostore-${Date.now()}`, at: new Date().toISOString(), ...lead }
    console.error('KON_LEAD_FALLBACK', JSON.stringify(rec))
  }
  const sent = await notify(rec)
  console.info('KON_LEAD', rec.id, rec.kind, JSON.stringify(sent)) // no personal data in this line
  return res.status(200).json({ ok: true, id: rec.id, ...(process.env.VERCEL_ENV !== 'production' ? { sent } : {}) })
}
