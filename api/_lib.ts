// Shared helpers for the lead endpoints. Files starting with "_" are not exposed as routes on Vercel.
// Every integration is optional: if its environment variables are missing it is skipped, so the
// site keeps working while accounts are being set up. Personal data is never written to logs.

const env = (k: string) => (globalThis as any).process?.env?.[k] as string | undefined

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

export const clip = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function readJson(req: Request, maxBytes = 24_000): Promise<any | null> {
  const text = await req.text()
  if (text.length > maxBytes) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** Only accept posts from our own pages. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return false
  const host = new URL(origin).host
  const allowed = (env('LEAD_ALLOWED_HOSTS') || 'konunlimited.vercel.app,kon-unlimited.com,www.kon-unlimited.com,localhost:5173,localhost:4173').split(',')
  return allowed.includes(host) || (host.startsWith('konunlimited') && host.endsWith('.vercel.app'))
}

// ---------- signed reference (lets the visitor rate their own report, and nothing else) ----------

async function hmac(data: string) {
  const secret = env('LEAD_SIGNING_SECRET') || 'dev-only-secret'
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]!)
}
export const sign = (ref: string) => hmac(ref)
export async function verify(ref: string, token: string) {
  return typeof ref === 'string' && typeof token === 'string' && ref.length < 80 && (await hmac(ref)) === token
}

// ---------- email (Resend) ----------

// idempotencyKey stops Resend sending the same alert twice if a request is retried.
export async function sendEmail(subject: string, text: string, replyTo?: string, idempotencyKey?: string) {
  const key = env('RESEND_API_KEY')
  const to = env('LEAD_NOTIFY_EMAIL')
  if (!key || !to) return 'skipped'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}) },
    body: JSON.stringify({
      from: env('LEAD_FROM_EMAIL') || 'KON Leads <leads@notify.kon-unlimited.com>',
      to: to.split(','),
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })
  return res.ok ? 'sent' : `failed ${res.status}`
}

// ---------- WhatsApp alert to khalid's phone (CallMeBot, free personal API) ----------
// Kept short on purpose (data minimisation): no answers or report go through this channel.

export async function sendWhatsApp(text: string) {
  const phone = env('CALLMEBOT_PHONE')
  const key = env('CALLMEBOT_APIKEY')
  if (!phone || !key) return 'skipped'
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`
  const res = await fetch(url)
  return res.ok ? 'sent' : `failed ${res.status}`
}

// ---------- CRM: Zoho CRM (Saudi data centre by default) ----------

const ZOHO_DC = () => env('ZOHO_DC') || 'sa'
const zohoAccounts = () => `https://accounts.zoho.${ZOHO_DC()}`
const zohoApi = () => `https://www.zohoapis.${ZOHO_DC()}/crm/v6`

async function zohoToken() {
  const id = env('ZOHO_CLIENT_ID'), secret = env('ZOHO_CLIENT_SECRET'), refresh = env('ZOHO_REFRESH_TOKEN')
  if (!id || !secret || !refresh) return null
  const q = new URLSearchParams({ refresh_token: refresh, client_id: id, client_secret: secret, grant_type: 'refresh_token' })
  const res = await fetch(`${zohoAccounts()}/oauth/v2/token?${q}`, { method: 'POST' })
  const data: any = await res.json().catch(() => ({}))
  return (data.access_token as string) || null
}

export interface CrmLead {
  name: string; company: string; email: string; phone: string; city: string
  persona: string; fit: string; urgency: number; primary: string; support: boolean; lang: string
  report: string; consentAt: string
}

export async function crmCreateLead(l: CrmLead): Promise<string | null> {
  const token = await zohoToken()
  if (!token) return null
  const [first, ...rest] = l.name.split(/\s+/)
  const record = {
    First_Name: rest.length ? first : undefined,
    Last_Name: rest.length ? rest.join(' ') : l.name,
    Company: l.company || l.name,
    Email: l.email || undefined,
    Mobile: l.phone || undefined,
    City: l.city || undefined,
    // Lead_Source is a picklist in Zoho: add a "Website diagnosis" value there, then set ZOHO_LEAD_SOURCE.
    Lead_Source: env('ZOHO_LEAD_SOURCE') || undefined,
    Description: `Source: website diagnosis · fit ${l.fit} · urgency ${l.urgency}/5${l.support ? ' · free support request' : ''}\n\n${l.report}\n\n— PDPL consent given ${l.consentAt} (language: ${l.lang})`,
  }
  const res = await fetch(`${zohoApi()}/Leads`, {
    method: 'POST',
    headers: { authorization: `Zoho-oauthtoken ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ data: [record], trigger: ['workflow'] }),
  })
  const data: any = await res.json().catch(() => ({}))
  const id = data?.data?.[0]?.details?.id
  if (!id) console.warn('zoho lead create failed', res.status, data?.data?.[0]?.code)
  return id ?? null
}

export async function crmAddNote(leadId: string, title: string, content: string) {
  const token = await zohoToken()
  if (!token) return 'skipped'
  const res = await fetch(`${zohoApi()}/Leads/${encodeURIComponent(leadId)}/Notes`, {
    method: 'POST',
    headers: { authorization: `Zoho-oauthtoken ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ data: [{ Note_Title: title, Note_Content: content }] }),
  })
  return res.ok ? 'sent' : `failed ${res.status}`
}

// ---------- optional generic webhook (Make, n8n, Frappe, HubSpot, Google Sheets…) ----------

export async function sendWebhook(event: string, payload: unknown) {
  const url = env('LEAD_WEBHOOK_URL')
  if (!url) return 'skipped'
  const body = JSON.stringify({ event, ...(payload as object) })
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-kon-signature': await hmac(body) }, body })
  return res.ok ? 'sent' : `failed ${res.status}`
}

export const siteUrl = () => env('SITE_URL') || 'https://konunlimited.vercel.app'
