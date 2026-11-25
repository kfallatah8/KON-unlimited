// GET /api/health: is the lead pipeline able to save and alert? Used by the uptime check.
// Answers only yes/no flags, never data or settings values.
import { list } from '@vercel/blob'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  let store = false
  try {
    await list({ prefix: 'health/', limit: 1 })
    store = true
  } catch (e) {
    console.error('KON_HEALTH_STORE', e && e.message)
  }
  const alerts = {
    phone: !!process.env.NTFY_TOPIC,
    whatsapp: !!(process.env.CALLMEBOT_PHONE && process.env.CALLMEBOT_KEY),
    email: !!(process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_TO),
  }
  const ok = store && Object.values(alerts).some(Boolean)
  return res.status(ok ? 200 : 503).json({ ok, store, alerts })
}
