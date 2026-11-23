// GET /api/pay/status?id=<gatewayTransactionId> | ?sessionId=<checkoutSessionId> | ?order=<merchantOrderId>
// Asks DigetPay directly whether a payment really succeeded. Never trust the redirect alone.
// With ?order=, the checkout session id comes from the kon_pay cookie set by /api/pay/create.
import { dp, readStatus } from '../_lib/digetpay.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const preview = () => process.env.VERCEL_ENV !== 'production';

function sessionFromCookie(req, order) {
  const m = String(req.headers.cookie || '').match(/(?:^|;\s*)kon_pay=([^;]+)/);
  if (!m) return null;
  const [o, s] = decodeURIComponent(m[1]).split('|');
  return o === order && UUID.test(s || '') ? s : null;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }); }
  const id = String(req.query.id || '');
  let sessionId = String(req.query.sessionId || '');
  const order = String(req.query.order || '').slice(0, 64);
  if (!UUID.test(sessionId) && order) sessionId = sessionFromCookie(req, order) || '';
  if (!UUID.test(id) && !UUID.test(sessionId)) return res.status(400).json({ ok: false, error: 'id' });

  // The docs show both forms (?id= gateway transaction ID, and ?sessionId= in the hosted examples).
  const tries = [];
  if (UUID.test(id)) tries.push(`/payment/checkout/status?id=${id}`);
  if (UUID.test(sessionId)) tries.push(`/payment/checkout/status?sessionId=${sessionId}`, `/payment/checkout/status?id=${sessionId}`);

  const seen = [];
  try {
    for (const path of tries) {
      const r = await dp('GET', path);
      const s = r.ok ? readStatus(r.json) : null;
      seen.push({ path: path.split('?')[1], status: r.status, body: r.json || r.text });
      console.log('KON_PAY_STATUS ' + JSON.stringify({ path: path.split('?')[1], status: r.status, result: s, raw: s ? undefined : (r.json || r.text) }));
      if (s) return res.status(200).json({ ok: true, sessionId: UUID.test(sessionId) ? sessionId : null, ...s });
    }
    return res.status(404).json({ ok: false, error: 'not_found', ...(preview() ? { gateway: seen } : {}) });
  } catch (e) {
    console.error('KON_PAY_STATUS_ERROR ' + e.message);
    return res.status(e.status || 502).json({ ok: false, error: 'gateway' });
  }
}
