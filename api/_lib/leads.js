// Lead storage + alerts for kon-unlimited.com.
// Every lead is written to the private Vercel Blob store "kon-leads" first (durable, owner-only),
// then khalid is alerted on every channel that is configured. A channel with no settings is skipped,
// so the site never breaks because an alert provider is missing.
//
// Settings (Vercel project variables):
//   BLOB_READ_WRITE_TOKEN            private store token (added when the store was connected)
//   LEADS_KEY                        passcode for the /leads page
//   NTFY_TOPIC                       secret ntfy.sh channel name: instant phone push (free ntfy app)
//   CALLMEBOT_PHONE, CALLMEBOT_KEY   WhatsApp alert via CallMeBot (optional)
//   RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM   email alert with the full brief (optional)
//   LEAD_WEBHOOK_URL                 extra copy to Zapier / Make / Google Sheets (optional)
import { put, list, get } from '@vercel/blob'

export const KINDS = {
  diagnosis: { ar: 'تشخيص مجاني', en: 'Free diagnosis', tag: 'gem' },
  booked: { ar: 'حجز موعد', en: 'Booked a call', tag: 'calendar' },
  talent: { ar: 'موهبة', en: 'Talent', tag: 'star' },
  company: { ar: 'شركة تبحث عن موهبة', en: 'Company hiring', tag: 'office' },
  solution: { ar: 'طلب حل', en: 'Solution request', tag: 'hammer_and_wrench' },
  contact: { ar: 'تواصل', en: 'Contact', tag: 'speech_balloon' },
}

const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
const cfg = (k) => process.env[k]
// Test links (preview branches) keep their leads apart, so the live /leads page shows only real ones.
const PREFIX = cfg('VERCEL_ENV') === 'production' ? 'leads/' : 'preview-leads/'

export function siteUrl() {
  if (cfg('VERCEL_ENV') === 'production') return 'https://kon-unlimited.com'
  const u = cfg('VERCEL_BRANCH_URL') || cfg('VERCEL_URL')
  return u ? `https://${u}` : 'https://kon-unlimited.com'
}

/** Cleans what the browser sent. Returns null when it is not a usable lead. */
export function clean(b) {
  if (!b || typeof b !== 'object') return null
  const kind = KINDS[b.kind] ? b.kind : null
  if (!kind) return null
  const lead = {
    kind,
    lang: b.lang === 'en' ? 'en' : 'ar',
    name: clip(b.name, 120),
    phone: clip(b.phone, 40),
    email: clip(b.email, 160),
    company: clip(b.company, 160),
    city: clip(b.city, 120),
    title: clip(b.title, 200), // persona / solution name / talent archetype
    priority: clip(b.priority, 40),
    brief: clip(b.brief, 12000),
    sid: clip(b.sid, 40), // groups a diagnosis with its later booking
    page: clip(b.page, 300),
    referrer: clip(b.referrer, 300),
    utm: clip(b.utm, 300),
  }
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) lead.email = ''
  if (!lead.name || !(lead.phone || lead.email)) return null
  return lead
}

export async function store(lead) {
  const at = new Date()
  const id = `${at.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${Math.random().toString(36).slice(2, 8)}`
  const rec = { id, at: at.toISOString(), ...lead }
  await put(`${PREFIX}${id}.json`, JSON.stringify(rec), {
    access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false,
  })
  return rec
}

export async function readAll(limit = 500) {
  const all = []
  let cursor
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 })
    all.push(...page.blobs)
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor && all.length < 10000)
  all.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)) // ids start with a timestamp: newest first
  const recs = await Promise.all(all.slice(0, limit).map(async (bl) => {
    try {
      const r = await get(bl.pathname, { access: 'private', useCache: false })
      if (!r || r.statusCode !== 200) return null
      return JSON.parse(await new Response(r.stream).text())
    } catch { return null }
  }))
  return { total: all.length, leads: recs.filter(Boolean) }
}

const ksaTime = (iso) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' })

async function withTimeout(run, ms = 6000) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), ms)
  try { return await run(ctl.signal) } finally { clearTimeout(t) }
}

async function ntfy(rec, link) {
  const topic = cfg('NTFY_TOPIC')
  if (!topic) return 'off'
  const k = KINDS[rec.kind]
  const body = {
    topic,
    title: `KON · ${k.ar}: ${rec.name}`,
    message: [rec.title, rec.company, rec.city, rec.priority && `أولوية ${rec.priority}`].filter(Boolean).join(' · ') || k.en,
    priority: rec.kind === 'booked' || rec.kind === 'diagnosis' ? 5 : 4,
    tags: [k.tag],
    click: link,
  }
  const r = await withTimeout((signal) => fetch('https://ntfy.sh/', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' }, signal }))
  return r.ok ? 'sent' : `http ${r.status}`
}

async function whatsapp(rec, link) {
  const phone = cfg('CALLMEBOT_PHONE'), key = cfg('CALLMEBOT_KEY')
  if (!phone || !key) return 'off'
  const k = KINDS[rec.kind]
  const text = [`KON · ${k.ar}`, rec.name, rec.phone, rec.title, rec.company, link].filter(Boolean).join('\n')
  const u = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(key)}&text=${encodeURIComponent(text)}`
  const r = await withTimeout((signal) => fetch(u, { signal }), 9000)
  return r.ok ? 'sent' : `http ${r.status}`
}

async function email(rec, link) {
  const key = cfg('RESEND_API_KEY'), to = cfg('LEAD_EMAIL_TO')
  if (!key || !to) return 'off'
  const k = KINDS[rec.kind]
  const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:15px;line-height:1.7">
<h2 style="margin:0 0 8px">${esc(k.ar)}: ${esc(rec.name)}</h2>
<p style="margin:0 0 12px;color:#555">${esc(ksaTime(rec.at))} (KSA) · <a href="${link}">كل العملاء</a></p>
<pre style="white-space:pre-wrap;font-family:inherit;background:#f4f7f6;padding:14px;border-radius:8px">${esc(rec.brief)}</pre>
<p style="color:#777;font-size:13px">Page: ${esc(rec.page)}<br>Ref: ${esc(rec.referrer || '-')} ${esc(rec.utm)}<br>ID: ${esc(rec.id)}</p></div>`
  const r = await withTimeout((signal) => fetch('https://api.resend.com/emails', {
    method: 'POST', signal,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `lead-${rec.id}` },
    body: JSON.stringify({
      from: cfg('LEAD_EMAIL_FROM') || 'KON Leads <onboarding@resend.dev>',
      to: to.split(',').map((x) => x.trim()).filter(Boolean),
      reply_to: rec.email || undefined,
      subject: `KON · ${k.ar}: ${rec.name}${rec.company ? ` (${rec.company})` : ''}`,
      html,
    }),
  }))
  return r.ok ? 'sent' : `http ${r.status}`
}

async function webhook(rec) {
  const u = cfg('LEAD_WEBHOOK_URL')
  if (!u) return 'off'
  const r = await withTimeout((signal) => fetch(u, { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rec) }))
  return r.ok ? 'sent' : `http ${r.status}`
}

export async function notify(rec) {
  const link = `${siteUrl()}/leads/`
  const jobs = { ntfy, whatsapp, email, webhook }
  const names = Object.keys(jobs)
  const res = await Promise.allSettled(names.map((n) => jobs[n](rec, link)))
  return Object.fromEntries(names.map((n, i) => [n, res[i].status === 'fulfilled' ? res[i].value : 'error']))
}
