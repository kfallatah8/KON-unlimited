// POST /api/pay/create  { product | invoice, name, email, phone, lang }
// Creates a DigetPay hosted checkout session and returns its redirectUrl.
import { dp, resolveOffer, normalizePhone, clip, origin } from '../_lib/digetpay.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  // Preview-only smoke test: GET creates a fixed 1 SAR test session so setup can be checked without a form.
  const smoke = req.method === 'GET' && process.env.VERCEL_ENV === 'preview' && req.query.smoke === '1';
  if (req.method !== 'POST' && !smoke) { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }

  let b = smoke ? { product: 'test', name: 'TEST CUSTOMER', phone: '0501223324', lang: req.query.lang } : req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'body' });

  const offer = resolveOffer({ product: b.product, invoice: b.invoice });
  if (!offer || offer.error) return res.status(400).json({ ok: false, error: offer?.error || 'product' });

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
    amount: offer.amount,
    currency: offer.currency,
    customerName,
    ...(customerEmail ? { customerEmail } : {}),
    customerPhone,
    ...(offer.recurring ? { payWithRecurring: true } : {}),
    successUrl: `${back}&result=success`,
    failureUrl: `${back}&result=failure`,
  };

  try {
    const r = await dp('POST', '/payment/checkout/intiate', payload);
    const body = r.json?.body || r.json || {};
    const id = body.id, redirectUrl = body.redirectUrl;
    console.log('KON_PAY_CREATE ' + JSON.stringify({ merchantOrderId, kind: offer.kind, label: offer.en, recurring: offer.recurring || undefined, client: offer.client || undefined, amount: offer.amount, status: r.status, sessionId: id || null }));
    if (!r.ok || !redirectUrl) {
      console.error('KON_PAY_CREATE_FAILED ' + JSON.stringify({ status: r.status, json: r.json, text: r.text }));
      return res.status(502).json({ ok: false, error: 'gateway', gatewayStatus: r.status });
    }
    // Remember which checkout belongs to this order, so the return page can verify it even if the browser lost its tab state.
    res.setHeader('Set-Cookie', `kon_pay=${encodeURIComponent(merchantOrderId + '|' + id)}; Path=/api/pay; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`);
    return res.status(200).json({ ok: true, merchantOrderId, sessionId: id, redirectUrl });
  } catch (e) {
    console.error('KON_PAY_CREATE_ERROR ' + e.message);
    return res.status(e.status || 502).json({ ok: false, error: e.status === 503 ? 'not_configured' : 'gateway' });
  }
}
