// DigetPay server helper. Runs only inside Vercel functions; the key never reaches the browser.
// Docs: https://docs.digetpay.com — one base URL for test and live; the x-api-key decides the mode.
export const API_BASE = 'https://api.digetpay.com/v1';

// Prices live here, on the server, so nobody can change the amount from the browser.
export const PRODUCTS = {
  test: { amount: 1, currency: 'SAR', label: 'KON test payment' },
};

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
