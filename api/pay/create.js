// POST /api/pay/create  { product, name, email, phone, lang }
// Creates a DigetPay hosted checkout session and returns its redirectUrl.
import { dp, PRODUCTS, normalizePhone, clip, origin } from '../_lib/digetpay.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // Preview-only smoke test: GET creates a fixed 1 SAR test session so setup can be checked without a form.
  const smoke = req.method === 'GET' && process.env.VERCEL_ENV === 'preview' && req.query.smoke === '1';
  if (req.method !== 'POST' && !smoke) { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }

  let b = smoke ? { product: 'test', name: 'TEST CUSTOMER', phone: '0501223324', lang: req.query.lang } : req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'body' });

  const product = PRODUCTS[b.product];
  if (!product) return res.status(400).json({ ok: false, error: 'product' });

  const customerName = clip(b.name, 80);
  const customerEmail = clip(b.email, 120);
  const customerPhone = normalizePhone(b.phone);
  if (!customerName) return res.status(400).json({ ok: false, error: 'name' });
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return res.status(400).json({ ok: false, error: 'email' });
  if (!customerPhone) return res.status(400).json({ ok: false, error: 'phone' });

  const lang = b.lang === 'en' ? 'en' : 'ar';
  const merchantOrderId = `KON-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const back = `${origin(req)}/pay/result/?order=${encodeURIComponent(merchantOrderId)}&lang=${lang}`;

  const payload = {
    merchantOrderId,
    amount: product.amount,
    currency: product.currency,
    customerName,
    ...(customerEmail ? { customerEmail } : {}),
    customerPhone,
    successUrl: `${back}&result=success`,
    failureUrl: `${back}&result=failure`,
  };

  try {
    const r = await dp('POST', '/payment/checkout/intiate', payload);
    const body = r.json?.body || r.json || {};
    const id = body.id, redirectUrl = body.redirectUrl;
    console.log('KON_PAY_CREATE ' + JSON.stringify({ merchantOrderId, product: b.product, amount: product.amount, status: r.status, sessionId: id || null }));
    if (!r.ok || !redirectUrl) {
      console.error('KON_PAY_CREATE_FAILED ' + JSON.stringify({ status: r.status, json: r.json, text: r.text }));
      return res.status(502).json({ ok: false, error: 'gateway', gatewayStatus: r.status });
    }
    return res.status(200).json({ ok: true, merchantOrderId, sessionId: id, redirectUrl });
  } catch (e) {
    console.error('KON_PAY_CREATE_ERROR ' + e.message);
    return res.status(e.status || 502).json({ ok: false, error: e.status === 503 ? 'not_configured' : 'gateway' });
  }
}
