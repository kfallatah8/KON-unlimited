// DigetPay server helper. Runs only inside Vercel functions; the key never reaches the browser.
// Docs: https://docs.digetpay.com — one base URL for test and live; the x-api-key decides the mode.
export const API_BASE = 'https://api.digetpay.com/v1';

import crypto from 'node:crypto';

// Prices live here, on the server, so nobody can change the amount from the browser.
// recurring: true enrolls the card in DigetPay Checkout Recurring (payWithRecurring). The schedule (Monthly)
// and duration are set in the DigetPay dashboard, not here.
export const PRODUCTS = {
  test: { amount: 1, currency: 'SAR', ar: 'دفعة تجريبية', en: 'Test payment', previewOnly: true },
  'test-monthly': { amount: 1, currency: 'SAR', recurring: true, ar: 'اشتراك شهري تجريبي', en: 'Test monthly plan', previewOnly: true },
  team: { amount: 8800, currency: 'SAR', recurring: true, ar: 'فريق التطوير لشركتك', en: 'Your company’s development team' },
};

const isProd = () => process.env.VERCEL_ENV === 'production';

// Invoice links: khalid signs {amount, label, client, expiry}; the server re-checks the signature on payment.
const b64u = (buf) => Buffer.from(buf).toString('base64url');
function linkKey() {
  const s = process.env.KON_PAY_LINK_SECRET;
  return typeof s === 'string' && s.length >= 32 ? s : null;
}
export function signInvoice({ amount, label, client, days }) {
  const k = linkKey();
  if (!k) throw Object.assign(new Error('KON_PAY_LINK_SECRET is not set'), { status: 503 });
  const body = b64u(JSON.stringify({ a: amount, l: label, c: client || '', e: Date.now() + days * 864e5, n: crypto.randomBytes(4).toString('hex') }));
  const sig = b64u(crypto.createHmac('sha256', k).update(body).digest()).slice(0, 32);
  return `${body}.${sig}`;
}
export function verifyInvoice(token) {
  const k = linkKey();
  const [body, sig] = String(token || '').split('.');
  if (!k || !body || !sig || body.length > 800) return null;
  const want = b64u(crypto.createHmac('sha256', k).update(body).digest()).slice(0, 32);
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  let p; try { p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return null; }
  if (!p || !(p.a >= 1 && p.a <= 500000) || typeof p.l !== 'string') return null;
  if (!(p.e > Date.now())) return { expired: true };
  return { amount: Math.round(p.a * 100) / 100, label: p.l.slice(0, 80), client: String(p.c || '').slice(0, 80), expires: p.e };
}

// What is being paid for, from a product key or a signed invoice token. null = not allowed.
export function resolveOffer({ product, invoice }) {
  if (invoice) {
    const v = verifyInvoice(invoice);
    if (!v) return null;
    if (v.expired) return { error: 'expired' };
    return { kind: 'invoice', amount: v.amount, currency: 'SAR', ar: v.label, en: v.label, client: v.client, expires: v.expires };
  }
  const p = PRODUCTS[product];
  if (!p || (p.previewOnly && isProd())) return null;
  const amount = p.amountEnv ? Number(process.env[p.amountEnv]) : p.amount;
  if (!(amount >= 1)) return null;
  return { kind: product, amount, currency: p.currency, ar: p.ar, en: p.en, recurring: !!p.recurring, period: p.recurring ? 'month' : undefined };
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

export function apiKey() {
  const k = process.env.DIGETPAY_API_KEY;
  return typeof k === 'string' && k.trim() ? k.trim() : null;
}

export async function dp(method, path, body) {
  const key = apiKey();
  if (!key) throw Object.assign(new Error('DIGETPAY_API_KEY is not set'), { status: 503 });
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(API_BASE + path, {
      method,
      headers: { 'x-api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* not JSON */ }
    return { status: r.status, ok: r.ok, json, text: json ? null : text.slice(0, 500) };
  } finally {
    clearTimeout(t);
  }
}

// DigetPay wants a Saudi mobile without country code, e.g. 501223324.
export function normalizePhone(v) {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('00966')) d = d.slice(5);
  else if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^5\d{8}$/.test(d) ? d : null;
}

export const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function origin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `https://${host}`;
}

// Reads a status response defensively: the docs show { code, data: { content: [ {...} ] } }.
export function readStatus(json) {
  const body = json && (json.body || json);
  const row = body?.data?.content?.[0] || body?.data || null;
  if (!row || typeof row !== 'object') return null;
  const transactionStatus = row.transactionStatus || null;
  const paymentStatus = row.paymentStatus || null;
  return {
    transactionId: row.transactionId || null,
    amount: row.amount ?? null,
    transactionStatus,
    paymentStatus,
    refundStatus: row.refundStatus || null,
    cardScheme: row.cardScheme || null,
    // DigetPay: paid only when transactionStatus is SUCCESS and paymentStatus is APPROVED.
    paid: transactionStatus === 'SUCCESS' && paymentStatus === 'APPROVED',
  };
}
