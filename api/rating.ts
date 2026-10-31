// POST /api/rating — the visitor scores how accurate their diagnosis felt (1–10), with an optional
// comment. Stored on the CRM lead as a note and emailed, so the diagnosis rules can be tuned.
import { clip, crmAddNote, json, readJson, sameOrigin, sendEmail, sendWebhook, verify } from './_lib'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: 'origin' }, 403)
  const b = await readJson(req, 4_000)
  if (!b || !(await verify(b.ref, b.token))) return json({ ok: false, error: 'bad_request' }, 400)
  const score = Math.round(Number(b.score))
  if (!(score >= 1 && score <= 10)) return json({ ok: false, error: 'score' }, 400)
  const comment = clip(b.comment, 1_000)
  const primary = clip(b.primary, 120)
  const persona = clip(b.persona, 20)

  const isCrm = !b.ref.startsWith('w')
  const text = `Diagnosis accuracy: ${score}/10\nPersona: ${persona}\nRecommended: ${primary}${comment ? `\nComment: ${comment}` : ''}`
  const [crm, email, hook] = await Promise.all([
    isCrm ? crmAddNote(b.ref, `Diagnosis accuracy ${score}/10`, text).catch(() => 'error') : 'skipped',
    sendEmail(`تقييم دقة التشخيص: ${score}/10`, `${text}\nRef: ${b.ref}`).catch(() => 'error'),
    sendWebhook('lead.rated', { ref: b.ref, score, comment, persona, primary }).catch(() => 'error'),
  ])
  console.info('rating', { ref: b.ref, score, crm, email, hook })
  return json({ ok: true })
}
