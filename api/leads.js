// GET /api/leads: the lead list for khalid's /leads page. Needs the LEADS_KEY passcode in x-kon-key.
import { timingSafeEqual } from 'node:crypto'
import { readAll } from './_lib/leads.js'

const same = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }) }
  const pass = process.env.LEADS_KEY
  if (!pass) return res.status(503).json({ ok: false, error: 'not_configured' })
  const given = req.headers['x-kon-key'] || (process.env.VERCEL_ENV !== 'production' ? req.query.key : '') || ''
  if (!same(given, pass)) {
    await new Promise((r) => setTimeout(r, 700)) // slows down guessing
    return res.status(401).json({ ok: false, error: 'passcode' })
  }
  try {
    const data = await readAll(Math.min(Number(req.query.limit) || 500, 2000))
    return res.status(200).json({ ok: true, ...data })
  } catch (e) {
    console.error('KON_LEADS_READ_FAILED', e && e.message)
    return res.status(500).json({ ok: false, error: 'read' })
  }
}
