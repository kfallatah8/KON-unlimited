// Sends a finished flow to /api/lead, which saves it and alerts khalid. Fire-and-forget: the visitor
// never waits on it, and the same lead is sent once per browser session (re-sent only if it changed).

export type LeadKind = 'diagnosis' | 'booked' | 'talent' | 'company' | 'solution' | 'contact'
export interface Lead {
  kind: LeadKind
  lang: 'ar' | 'en'
  name: string
  phone?: string
  email?: string
  company?: string
  city?: string
  title?: string
  priority?: string
  brief?: string
}

const SENT = 'kon-leads-sent'
const SID = 'kon-sid'

function session(key: string, fallback: () => string) {
  try {
    let v = sessionStorage.getItem(key)
    if (!v) { v = fallback(); sessionStorage.setItem(key, v) }
    return v
  } catch { return fallback() }
}

const hash = (s: string) => {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

function utm() {
  try {
    const q = new URLSearchParams(location.search)
    const keep = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'].filter((k) => q.get(k)).map((k) => `${k}=${q.get(k)}`)
    if (keep.length) session('kon-utm', () => keep.join('&'))
    return sessionStorage.getItem('kon-utm') || ''
  } catch { return '' }
}

export function sendLead(lead: Lead) {
  if (!lead.name?.trim() || !(lead.phone?.trim() || lead.email?.trim())) return
  const sid = session(SID, () => Math.random().toString(36).slice(2, 12))
  const body = JSON.stringify({ ...lead, sid, page: location.href.slice(0, 300), referrer: document.referrer.slice(0, 300), utm: utm() })
  const h = hash(`${lead.kind}|${lead.name}|${lead.phone}|${lead.email}|${lead.brief}`)
  let sent: string[] = []
  try { sent = JSON.parse(sessionStorage.getItem(SENT) || '[]') } catch { /* private mode */ }
  if (sent.includes(h)) return
  const remember = () => {
    try { sessionStorage.setItem(SENT, JSON.stringify([...sent, h].slice(-30))) } catch { /* private mode */ }
  }
  const attempt = (n: number) =>
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: body.length < 60000 })
      .then((r) => { if (r.ok || r.status === 400) remember(); else throw new Error(String(r.status)) })
      .catch(() => { if (n < 2) setTimeout(() => attempt(n + 1), 1500 * (n + 1)) })
  attempt(0)
}
