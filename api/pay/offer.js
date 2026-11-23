// GET /api/pay/offer?p=<product> | ?i=<signed invoice token>
// Tells the checkout page what is being paid for, as verified by the server.
import { resolveOffer } from '../_lib/digetpay.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const o = resolveOffer({ product: String(req.query.p || ''), invoice: String(req.query.i || '') });
  if (!o) return res.status(404).json({ ok: false, error: 'not_found' });
  if (o.error) return res.status(410).json({ ok: false, error: o.error });
  return res.status(200).json({ ok: true, ...o, test: process.env.VERCEL_ENV !== 'production' });
}
