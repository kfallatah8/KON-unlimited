// POST /api/pay/link { pass, amount, label, client, days }
// khalid's private tool: makes a signed payment link for any client and amount.
import { signInvoice, safeEqual, clip, origin } from '../_lib/digetpay.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'body' });
  if (!process.env.KON_PAY_ADMIN || !safeEqual(b.pass, process.env.KON_PAY_ADMIN)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    console.warn('KON_PAY_LINK_DENIED');
    return res.status(401).json({ ok: false, error: 'pass' });
  }
  const amount = Math.round(Number(b.amount) * 100) / 100;
  const label = clip(b.label, 80), client = clip(b.client, 80);
  const days = Math.min(Math.max(parseInt(b.days, 10) || 7, 1), 60);
  if (!(amount >= 1 && amount <= 500000)) return res.status(400).json({ ok: false, error: 'amount' });
  if (!label) return res.status(400).json({ ok: false, error: 'label' });
  try {
    const token = signInvoice({ amount, label, client, days });
    const url = `${origin(req)}/pay/?i=${token}`;
    console.log('KON_PAY_LINK ' + JSON.stringify({ amount, label, client, days }));
    return res.status(200).json({ ok: true, url, amount, label, client, expires: Date.now() + days * 864e5 });
  } catch (e) {
    return res.status(e.status || 500).json({ ok: false, error: 'not_configured' });
  }
}
