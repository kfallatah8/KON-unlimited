// GET /api/pay/status?id=<gatewayTransactionId>  or  ?sessionId=<checkoutSessionId>
// Asks DigetPay directly whether a payment really succeeded. Never trust the redirect alone.
import { dp, readStatus } from '../_lib/digetpay.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }); }
  const id = String(req.query.id || '');
  const sessionId = String(req.query.sessionId || '');
  if (!UUID.test(id) && !UUID.test(sessionId)) return res.status(400).json({ ok: false, error: 'id' });

  // The docs show both forms (?id= gateway transaction ID, and ?sessionId= in the hosted examples).
  const tries = [];
  if (UUID.test(id)) tries.push(`/payment/checkout/status?id=${id}`);
  if (UUID.test(sessionId)) tries.push(`/payment/checkout/status?sessionId=${sessionId}`);

  try {
    for (const path of tries) {
      const r = await dp('GET', path);
      const s = r.ok ? readStatus(r.json) : null;
      console.log('KON_PAY_STATUS ' + JSON.stringify({ path: path.split('?')[1].split('=')[0], status: r.status, result: s }));
      if (s) return res.status(200).json({ ok: true, ...s });
    }
    return res.status(404).json({ ok: false, error: 'not_found' });
  } catch (e) {
    console.error('KON_PAY_STATUS_ERROR ' + e.message);
    return res.status(e.status || 502).json({ ok: false, error: 'gateway' });
  }
}
