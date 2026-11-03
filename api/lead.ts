// POST /api/lead — a visitor finished the diagnosis and gave consent. Alerts khalid (email +
// WhatsApp), creates the CRM lead with the full report, and returns a signed reference the
// visitor's page uses to send their 1–10 accuracy rating.
import { clip, crmCreateLead, json, readJson, sameOrigin, sendEmail, sendWebhook, sendWhatsApp, sign, siteUrl } from './_lib'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'origin' }, 403)
  const b = await readJson(req)
  if (!b) return json({ ok: false, error: 'bad_request' }, 400)
  if (b.website) return json({ ok: true }) // honeypot: bots fill hidden fields
  if (b.consent !== true) return json({ ok: false, error: 'consent_required' }, 400)

  const who = b.who ?? {}
  const lead = {
    name: clip(who.name, 120),
    company: clip(who.company, 160),
    email: clip(who.email, 160),
    phone: clip(who.phone, 40),
    city: clip(who.city, 120),
    prefer: clip(who.prefer, 20),
    persona: clip(b.persona, 20),
    support: b.support === true,
    fit: clip(b.fit, 10),
    urgency: Number(b.urgency) || 0,
    primary: clip(b.primary, 120),
    lang: b.lang === 'en' ? 'en' : 'ar',
    report: clip(b.report, 12_000),
    consentAt: new Date().toISOString(),
    consentVersion: clip(b.consentVersion, 20),
  }
  if (!lead.name || !(lead.phone || lead.email) || !lead.report) return json({ ok: false, error: 'missing_fields' }, 400)
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json({ ok: false, error: 'email' }, 400)

  const crmId = await crmCreateLead(lead).catch(() => null)
  const ref = crmId ?? `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

  const tag = lead.support ? ' · دعم مجاني' : ''
  const subject = `عميل جديد: ${lead.name}${lead.company ? ` (${lead.company})` : ''} · ${lead.fit || '-'}${tag}`
  const crmLine = crmId ? `\nCRM: lead ${crmId}` : '\nCRM: not connected yet'
  const [email, whatsapp, hook] = await Promise.all([
    sendEmail(subject, `${lead.report}\n\n—\nConsent: ${lead.consentAt} (v${lead.consentVersion || '1'})${crmLine}\nRef: ${ref}`, lead.email || undefined, `lead-${ref}`).catch(() => 'error'),
    sendWhatsApp(`KON · عميل جديد\n${lead.name}${lead.company ? ` · ${lead.company}` : ''}\nالمسار: ${lead.persona}${tag}\nالأولوية: ${lead.fit} · إلحاح ${lead.urgency}/5\nالتفاصيل في بريدك وفي الـ CRM`).catch(() => 'error'),
    sendWebhook('lead.created', { ref, lead }).catch(() => 'error'),
  ])
  console.info('lead', { ref, crm: !!crmId, email, whatsapp, hook }) // no personal data in logs

  return json({ ok: true, ref, token: await sign(ref), delivered: !!crmId || email === 'sent' || whatsapp === 'sent' || hook === 'sent', site: siteUrl() })
}
