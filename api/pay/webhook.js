// POST /api/pay/webhook — DigetPay payment notifications.
// DigetPay does not sign webhooks, so a webhook is only a hint: we re-check every payment
// with the Status API before believing it. Logged to Vercel runtime logs (search "KON_PAY_HOOK").

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object' || !/^[\w-]{6,64}$/.test(String(b.transactionId || ''))) return res.status(400).end();

  const hint = {
    transactionId: b.transactionId, orderId: String(b.orderId || '').slice(0, 64), type: b.type, status: b.status,
    amount: b.amount, currencyCode: b.currencyCode, cardScheme: b.cardScheme, declineReason: b.declineReason,
  };

  // DigetPay's status API needs the checkout sessionId, which the webhook does not carry.
  // Until orders are stored (order -> sessionId), the webhook is logged only and never trusted on its own.
  const verified = null;
  console.log('KON_PAY_HOOK ' + JSON.stringify({ at: new Date().toISOString(), hint, verified }));
  // Next step when going live: save the verified result (order + transactionId) and notify khalid.
  return res.status(200).json({ ok: true });
}
