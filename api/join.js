// KON Gate waitlist: logs each entry to Vercel runtime logs (search "KON_JOIN")
// and forwards it to LEAD_WEBHOOK_URL (e.g. a Google Apps Script or Zapier hook) when that variable is set.
const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : v == null ? null : String(v).slice(0, n));

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false });
  const name = clip(b.name, 80), contact = clip(b.contact, 120);
  if (!name || !contact || contact.length < 5) return res.status(400).json({ ok: false });
  const entry = {
    at: new Date().toISOString(),
    country: req.headers['x-vercel-ip-country'] || null,
    name, contact,
    channel: clip(b.channel, 16), form: clip(b.form, 16), lang: clip(b.lang, 4), key: clip(b.key, 16),
    solved: !!b.solved, source: clip(b.source, 16), time: clip(b.time, 16),
    moves: Number(b.moves) || 0, attempts: Number(b.attempts) || 0, shards: Number(b.shards) || 0, seals: Number(b.seals) || 0,
    ref: clip(b.ref, 200)
  };
  console.log('KON_JOIN ' + JSON.stringify(entry));
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try { await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(entry) }); }
    catch (e) { console.error('KON_JOIN_FORWARD_FAILED ' + e.message); }
  }
  return res.status(200).json({ ok: true });
};
