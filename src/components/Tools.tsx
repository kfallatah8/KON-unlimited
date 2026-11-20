// KON free tools: small calculators that give a business owner a real number in a minute.
// Everything is computed in the browser; nothing is stored or sent. Each tool can hand its
// result to the "request setup" sheet, so the number becomes the start of a conversation.
import { createContext, useContext, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import type { Lang } from '../content/site'
import type { ToolId } from '../content/solutions'
import { useStore } from '../state/store'

type T = { ar: string; en: string }
const t = (ar: string, en: string): T => ({ ar, en })

/** `kon`: a KON lens tool (people, attention, decisions): its next step is a conversation, not software. */
export const toolMeta: Record<ToolId, { name: T; sub: T; kon?: boolean }> = {
  breakhour: { name: t('الساعة التي يبدأ فيها ربحك', 'The hour your profit starts'), sub: t('حتى أي ساعة تعمل للإيجار والرواتب؟', 'Until what time are you working for rent and payroll?') },
  delivery: { name: t('حاسبة تطبيقات التوصيل', 'Delivery-app calculator'), sub: t('كم يبقى لك فعلًا من طلب هنقرستيشن أو كيتا؟', 'What’s really left for you from a HungerStation or Keeta order?') },
  recipe: { name: t('تكلفة الطبق الحقيقية', 'True plate cost'), sub: t('تكلفة الحصة مع الهدر، والسعر الذي يحمي هامشك', 'Portion cost with waste, and the price that protects your margin') },
  channel: { name: t('من المصنع إلى الرف', 'From kitchen to shelf'), sub: t('سعر الرف بعد الموزع والمتجر والضريبة، وكم يصلك منه', 'Shelf price after distributor, retailer and VAT, and what reaches you') },
  oee: { name: t('المصنع الخفي (OEE)', 'The hidden factory (OEE)'), sub: t('كم تنتج آلاتك فعلًا من طاقتها، وكم يضيع بصمت؟', 'How much of its capacity your line really delivers, and what leaks quietly') },
  stock: { name: t('نقد نائم على الرفوف', 'Cash asleep on the shelves'), sub: t('كم من مالك محبوس في بضاعة لا تتحرك؟', 'How much of your money is locked in stock that doesn’t move?') },
  home: { name: t('سعر يحسب تعبك', 'A price that counts your effort'), sub: t('سعر عادل يحسب وقتك، لا المكونات فقط', 'A fair price that counts your time, not just ingredients') },
  ceiling: { name: t('سقف النمو الخفي', 'Your hidden growth ceiling'), sub: t('الرقم الذي لن تتجاوزه مهما سوّقت، ولماذا', 'The number you won’t pass however much you market, and why'), kon: true },
  lever: { name: t('أي رافعة تحرّك ربحك؟', 'Which lever moves your profit?'), sub: t('السعر، العملاء، التكرار، أم التكلفة؟ الأرقام تختار', 'Price, customers, frequency or cost? Let the numbers choose'), kon: true },
  price: { name: t('اختبار السعر', 'The price test'), sub: t('كم عميلًا تستطيع أن تخسر بعد رفع السعر وتبقى رابحًا؟', 'How many customers can you lose after a price rise and still come out ahead?'), kon: true },
  focus: { name: t('ضريبة المقاطعة', 'The interruption tax'), sub: t('كم تدفع لتركيز فريقك الضائع؟', 'What are you paying for your team’s lost focus?'), kon: true },
  meeting: { name: t('ثمن الاجتماع', 'What a meeting really costs'), sub: t('الاجتماع الذي لا ينتهي بقرار، كم يكلّف؟', 'What does a meeting that ends with no decision cost?'), kon: true },
  turnover: { name: t('ثمن الاستقالة', 'The price of a resignation'), sub: t('ما لا يظهر في أي فاتورة حين يرحل موظف جيد', 'What no invoice shows when a good person leaves'), kon: true },
  founder: { name: t('ساعة المؤسس', 'The founder’s hour'), sub: t('كم تساوي ساعتك، وأين تذهب؟', 'What your hour is worth, and where it goes'), kon: true },
  viewing: { name: t('ثمن المعاينة الضائعة', 'The cost of wasted viewings'), sub: t('كم ساعة يقضيها فريقك مع مشترين غير جادّين؟', 'How many hours does your team spend with buyers who were never serious?') },
  delay: { name: t('ثمن التأجيل', 'The price of waiting'), sub: t('الانتظار يبدو مجانيًا، احسبه', 'Waiting feels free. Do the maths'), kon: true },
}

const ui = {
  ar: { sar: 'ر.س', result: 'النتيجة', vatIncl: 'الأسعار شاملة الضريبة 15%', add: 'أضف مكوّنًا', remove: 'احذف', unit: 'وحدة', perDay: 'يوميًا', perMonth: 'شهريًا' },
  en: { sar: 'SAR', result: 'Result', vatIncl: 'Prices include 15% VAT', add: 'Add ingredient', remove: 'Remove', unit: 'unit', perDay: 'per day', perMonth: 'per month' },
}

// ---- formatting and parsing ----
const AR_DIGITS = /[٠-٩]/g
const toNum = (s: string) => {
  const v = parseFloat(s.replace(AR_DIGITS, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[٫,]/g, '.').replace(/[^\d.-]/g, ''))
  return Number.isFinite(v) ? v : 0
}
export const fmt = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 }) : '—')
// Isolated left-to-right so "20%" never reads as "%20" inside Arabic text.
const pct = (n: number, d = 1) => (Number.isFinite(n) ? `\u2066${fmt(n * 100, d)}%\u2069` : '—')

function useForm<K extends string>(init: Record<K, number>) {
  const [raw, setRaw] = useState<Record<K, string>>(() => Object.fromEntries(Object.entries(init).map(([k, v]) => [k, String(v)])) as Record<K, string>)
  const v = useMemo(() => Object.fromEntries(Object.entries(raw).map(([k, s]) => [k, toNum(s as string)])) as Record<K, number>, [raw])
  const bind = (k: K) => ({ value: raw[k], onChange: (s: string) => setRaw((r) => ({ ...r, [k]: s })) })
  return { v, bind }
}

// A friendly nudge size for the − / + buttons: about 5% of the value, rounded to a clean step.
function nudge(v: number) {
  const a = Math.abs(v)
  if (a < 10) return 1
  const raw = a * 0.05
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag
}

function Num({ label, unit, value, onChange, hint, sec }: { label: string; unit?: string; value: string; onChange: (s: string) => void; hint?: string; sec?: string }) {
  const L = useStore((st) => st.lang) === 'ar'
  const fid = useId()
  const bump = (dir: 1 | -1) => {
    const v = toNum(value)
    const st = nudge(v || 1)
    const next = Math.max(0, v + dir * st)
    onChange(String(Math.round(next * 100) / 100))
  }
  return (
    <>
    {sec && <p className="tl-sec">{sec}</p>}
    <div className="tl-field">
      <label className="tl-label" htmlFor={fid}>{label}</label>
      <span className="tl-ctrl" dir="ltr">
        <button type="button" className="tl-btn" aria-label={L ? `أنقص ${label}` : `Decrease ${label}`} onClick={() => bump(-1)}>−</button>
        <span className="tl-input">
          <input id={fid} type="text" inputMode="decimal" dir="ltr" value={value} onChange={(e) => onChange(e.target.value)} onFocus={(e) => e.target.select()} />
          {unit && <i>{unit}</i>}
        </span>
        <button type="button" className="tl-btn" aria-label={L ? `زِد ${label}` : `Increase ${label}`} onClick={() => bump(1)}>+</button>
      </span>
      {hint && <small className="tl-hint">{hint}</small>}
    </div>
    </>
  )
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (b: boolean) => void }) {
  return (
    <label className="tl-toggle">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      <span aria-hidden="true" />
      {label}
    </label>
  )
}

// The reading under each result: split into short clauses, one idea per line, with every number
// lifted out so the eye lands on it first. The last clause is usually the move to make.
const NUM = /(\u2066?\d[\d,.:]*\u2069?(?:[\s  ]?%|[\s  ]?ر\.س|\s?SAR|[\s  ](?:م|ص)(?=[\s،,.]|$))?)/g
function marks(t: string) {
  return t.split(NUM).map((x, i) => (i % 2 ? <b key={i} className="tl-n" dir="ltr">{x}</b> : x))
}
function Insight({ body }: { body: ReactNode }) {
  const lang = useStore((st) => st.lang)
  if (typeof body !== 'string') return <div className="tl-insight">{body}</div>
  const parts = body.split(/(?<=[،.])\s+/).map((x) => x.replace(/[،.]$/, '').trim()).filter(Boolean)
  const lead = parts[0], why = parts.slice(1, -1).join(lang === 'ar' ? '، ' : ', '), move = parts.length > 1 ? parts[parts.length - 1] : ''
  const L = lang === 'ar'
  return (
    <div className="tl-insight">
      <div className="ti-row ti-says">
        <i aria-hidden="true">1</i>
        <div><span className="ti-k">{L ? 'ماذا يقول رقمك' : 'What your number says'}</span><p className="ti-lead">{marks(lead)}</p></div>
      </div>
      {why && (
        <div className="ti-row ti-why">
          <i aria-hidden="true">2</i>
          <div><span className="ti-k">{L ? 'لماذا يهمّك' : 'Why it matters'}</span><p>{marks(why)}</p></div>
        </div>
      )}
      {move && (
        <div className="ti-row ti-move">
          <i aria-hidden="true">{why ? 3 : 2}</i>
          <div><span className="ti-k">{L ? 'فرصتك الآن' : 'Your opportunity now'}</span><p>{marks(move)}</p></div>
        </div>
      )}
    </div>
  )
}

/** The big answer, its supporting numbers, and one sentence that says what it means. */
const LiveSlot = createContext<HTMLElement | null>(null)

function Result({ big, label, unit, tone, rows, insight, children }: { big: string; label: string; unit?: string; tone?: 'good' | 'warn' | 'bad'; rows: [string, string][]; insight?: ReactNode; children?: ReactNode }) {
  const slot = useContext(LiveSlot)
  return (
    <>
    {slot && createPortal(
      <span className={`tl-live-in${tone ? ` is-${tone}` : ''}`}><span className="tl-live-k">{label}</span><b dir="ltr">{big}</b>{unit && <em>{unit}</em>}</span>,
      slot,
    )}
    <div className={`tl-result${tone ? ` is-${tone}` : ''}`} aria-live="polite">
      <p className="tl-big-label">{label}</p>
      <p className="tl-big"><b dir="ltr">{big}</b>{unit && <span>{unit}</span>}</p>
      <dl className="tl-rows">
        {rows.map(([k, val]) => (
          <div key={k}><dt>{k}</dt><dd>{val}</dd></div>
        ))}
      </dl>
      {children}
      {insight && <Insight body={insight} />}
    </div>
    </>
  )
}

type ToolFn = (p: { lang: Lang; report: (s: string) => void }) => ReactNode
/** `report` must not set state: it is called during render (the parent keeps it in a ref). */

// ---- 1 · delivery apps ----
const Delivery: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const { v, bind } = useForm({ price: 35, food: 11, pack: 1.5, comm: 20, promo: 0, fee: 0, orders: 40 })
  const [vat, setVat] = useState(true)
  const k = vat ? 1.15 : 1
  const net = v.price / k
  const take = (v.price * (v.comm + v.promo)) / 100 + v.fee
  const profit = net - take - v.food - v.pack
  const inStore = net - v.food
  const den = 1 / k - (v.comm + v.promo) / 100
  const fair = den > 0 ? (inStore + v.food + v.pack + v.fee) / den : NaN
  const monthTake = take * v.orders * 30
  const L = lang === 'ar'
  const tone = profit <= 0 ? 'bad' : profit < inStore * 0.5 ? 'warn' : 'good'
  report(L
    ? `سعر الطبق ${fmt(v.price)} ر.س، عمولة ${fmt(v.comm)}%: الربح من طلب التطبيق ${fmt(profit)} ر.س مقابل ${fmt(inStore)} ر.س في الصالة، عمولات شهرية تقريبية ${fmt(monthTake, 0)} ر.س`
    : `Dish ${fmt(v.price)} SAR, ${fmt(v.comm)}% commission: ${fmt(profit)} SAR profit per app order vs ${fmt(inStore)} SAR in-store. About ${fmt(monthTake, 0)} SAR a month in fees`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'سعر الطبق على التطبيق' : 'Dish price on the app'} unit={u.sar} {...bind('price')} />
        <Num label={L ? 'تكلفة المكونات' : 'Ingredient cost'} unit={u.sar} {...bind('food')} />
        <Num label={L ? 'التغليف' : 'Packaging'} unit={u.sar} {...bind('pack')} />
        <Num label={L ? 'عمولة التطبيق' : 'App commission'} unit="%" {...bind('comm')} hint={L ? 'حسب عقدك: هنقرستيشن، كيتا، جاهز، تويو، مرسول…' : 'Per your contract: HungerStation, Keeta, Jahez, ToYou, Mrsool…'} />
        <Num label={L ? 'خصم عرض تتحمّله أنت' : 'Promo discount you fund'} unit="%" {...bind('promo')} />
        <Num label={L ? 'رسوم ثابتة لكل طلب' : 'Fixed fee per order'} unit={u.sar} {...bind('fee')} />
        <Num label={L ? 'طلبات التطبيق يوميًا' : 'App orders per day'} {...bind('orders')} />
        <Toggle label={u.vatIncl} on={vat} set={setVat} />
      </div>
      <Result
        tone={tone}
        label={L ? 'ربحك الحقيقي من كل طلب' : 'Your real profit per order'}
        big={fmt(profit)} unit={u.sar}
        rows={[
          [L ? 'يأخذ التطبيق من كل طلب' : 'The app takes per order', `${fmt(take)} ${u.sar} · ${pct(take / Math.max(v.price, 1e-9))}`],
          [L ? 'نفس الطبق في الصالة يربحك' : 'The same dish in-store earns', `${fmt(inStore)} ${u.sar}`],
          [L ? 'السعر العادل على التطبيق' : 'Fair price on the app', Number.isFinite(fair) ? `${fmt(Math.ceil(fair))} ${u.sar}` : '—'],
          [L ? 'تدفعه للتطبيقات شهريًا تقريبًا' : 'Paid to apps per month, roughly', `${fmt(monthTake, 0)} ${u.sar}`],
        ]}
        insight={profit <= 0
          ? (L ? 'كل طلب من التطبيق يخسّرك، ارفع السعر على التطبيق، أو انقل عملاءك الدائمين إلى قناتك الخاصة' : 'Every app order loses you money. Raise the app price, or move your regulars to your own channel')
          : (L ? `لتربح من التطبيق مثل الصالة، سعّر الطبق على التطبيق ${Number.isFinite(fair) ? fmt(Math.ceil(fair)) : '—'} ر.س، وعملاؤك الدائمون؟ الأفضل أن يطلبوا منك مباشرة` : `To earn on the app what you earn in-store, list it at ${Number.isFinite(fair) ? fmt(Math.ceil(fair)) : '—'} SAR. Your regulars? Better they order from you directly`)}
      />
    </>
  )
}

// ---- 2 · recipe / plate cost ----
interface Row { n: string; price: string; pack: string; use: string; waste: string }
const Recipe: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const [rows, setRows] = useState<Row[]>(() => [
    { n: L ? 'دجاج' : 'Chicken', price: '28', pack: '1000', use: '180', waste: '10' },
    { n: L ? 'خبز' : 'Bread', price: '12', pack: '6', use: '1', waste: '0' },
    { n: L ? 'صوص وخضار' : 'Sauce & greens', price: '15', pack: '500', use: '60', waste: '5' },
  ])
  const { v, bind } = useForm({ yield: 1, extra: 0.5, target: 30, current: 0 })
  const lines = rows.map((r) => {
    const pk = toNum(r.pack)
    const w = Math.min(95, toNum(r.waste))
    return pk > 0 ? (toNum(r.price) / pk) * toNum(r.use) / (1 - w / 100) : 0
  })
  const portion = lines.reduce((a, b) => a + b, 0) / Math.max(1, v.yield) + v.extra
  const priceEx = v.target > 0 ? portion / (v.target / 100) : NaN
  const priceInc = Math.ceil(priceEx * 1.15)
  const fc = v.current > 0 ? portion / (v.current / 1.15) : NaN
  const tone = Number.isFinite(fc) ? (fc > 0.38 ? 'bad' : fc > v.target / 100 + 0.03 ? 'warn' : 'good') : undefined
  report(L
    ? `تكلفة الحصة ${fmt(portion)} ر.س، السعر المقترح ${fmt(priceInc, 0)} ر.س شامل الضريبة${Number.isFinite(fc) ? `، نسبة التكلفة الحالية ${pct(fc)}` : ''}`
    : `Portion cost ${fmt(portion)} SAR, suggested price ${fmt(priceInc, 0)} SAR incl. VAT${Number.isFinite(fc) ? `, current food cost ${pct(fc)}` : ''}`)
  const set = (i: number, k: keyof Row, s: string) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: s } : r)))
  return (
    <>
      <div className="tl-form">
        <div className="tl-rows-edit">
          {rows.map((r, i) => (
            <fieldset key={i} className="tl-ing">
              <legend className="sr-only">{r.n}</legend>
              <input className="tl-ing-name" value={r.n} onChange={(e) => set(i, 'n', e.target.value)} aria-label={L ? 'المكوّن' : 'Ingredient'} />
              <Num label={L ? 'سعر العبوة' : 'Pack price'} unit={u.sar} value={r.price} onChange={(s) => set(i, 'price', s)} />
              <Num label={L ? 'حجم العبوة' : 'Pack size'} unit={L ? 'غ/حبة' : 'g/pc'} value={r.pack} onChange={(s) => set(i, 'pack', s)} />
              <Num label={L ? 'المستخدم' : 'Used'} unit={L ? 'غ/حبة' : 'g/pc'} value={r.use} onChange={(s) => set(i, 'use', s)} />
              <Num label={L ? 'الهدر' : 'Waste'} unit="%" value={r.waste} onChange={(s) => set(i, 'waste', s)} />
              {rows.length > 1 && <button type="button" className="tl-x" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} aria-label={`${u.remove} ${r.n}`}>×</button>}
              <span className="tl-ing-cost">{fmt(lines[i])} {u.sar}</span>
            </fieldset>
          ))}
          {rows.length < 12 && <button type="button" className="tl-add" onClick={() => setRows((rs) => [...rs, { n: L ? 'مكوّن' : 'Item', price: '0', pack: '1', use: '0', waste: '0' }])}>+ {u.add}</button>}
        </div>
        <Num label={L ? 'عدد الحصص من هذه الكميات' : 'Portions from these amounts'} {...bind('yield')} />
        <Num label={L ? 'إضافات لكل حصة (تغليف، تزيين)' : 'Extras per portion (packaging, garnish)'} unit={u.sar} {...bind('extra')} />
        <Num label={L ? 'نسبة التكلفة المستهدفة' : 'Target food cost'} unit="%" {...bind('target')} hint={L ? 'المطاعم الناجحة غالبًا بين 28% و35%' : 'Healthy restaurants usually sit between 28% and 35%'} />
        <Num label={L ? 'سعرك الحالي شامل الضريبة (اختياري)' : 'Your current price incl. VAT (optional)'} unit={u.sar} {...bind('current')} />
      </div>
      <Result
        tone={tone}
        label={L ? 'تكلفة الحصة الواحدة' : 'Cost per portion'}
        big={fmt(portion)} unit={u.sar}
        rows={[
          [L ? 'السعر المقترح قبل الضريبة' : 'Suggested price before VAT', `${fmt(priceEx)} ${u.sar}`],
          [L ? 'السعر المقترح شامل الضريبة' : 'Suggested price incl. VAT', `${fmt(priceInc, 0)} ${u.sar}`],
          ...(Number.isFinite(fc) ? [[L ? 'نسبة التكلفة بسعرك الحالي' : 'Food cost at your current price', pct(fc)] as [string, string]] : []),
        ]}
        insight={Number.isFinite(fc) && fc > v.target / 100 + 0.03
          ? (L ? 'سعرك الحالي يأكل هامشك، ارفعه، أو قلّل الهدر في أغلى مكوّن' : 'Your current price is eating your margin. Raise it, or cut waste on the priciest ingredient')
          : (L ? 'الهدر وحده قد يرفع تكلفتك 5% إلى 10% دون أن تلاحظ، احسبه دائمًا' : 'Waste alone can lift your cost 5–10% without you noticing. Always count it')}
      />
    </>
  )
}

// ======================= KON lens: the numbers nobody calculates =======================
// Each one starts from something the owner already knows, and returns what they never see:
// the hour profit begins, the ceiling churn sets, the price of a meeting, a resignation, a delay.
// Every assumption is an input the visitor can change; nothing is hidden in the maths.

const hoursOf = (L: boolean) => (L ? 'ساعة' : 'h')
/** 19.67 → "7:40 م" / "7:40 pm". */
function clock(h: number, L: boolean) {
  if (!Number.isFinite(h)) return '—'
  const x = ((h % 24) + 24) % 24
  let hh = Math.floor(x)
  let mm = Math.round((x - hh) * 60)
  if (mm === 60) { hh = (hh + 1) % 24; mm = 0 }
  const pm = hh >= 12
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `⁦${h12}:${String(mm).padStart(2, '0')}⁩ ${L ? (pm ? 'م' : 'ص') : pm ? 'pm' : 'am'}`
}

// ---- the hour your profit starts (restaurants, cafés, salons, any place with opening hours) ----
const BreakHour: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ fixed: 60000, days: 30, open: 12, hours: 12, ticket: 45, varc: 38, guests: 110 })
  const days = Math.max(1, v.days)
  const dailyFixed = v.fixed / days
  const contrib = v.ticket * (1 - Math.min(99, v.varc) / 100)
  const need = contrib > 0 ? dailyFixed / contrib : NaN
  const frac = v.guests > 0 ? need / v.guests : NaN
  const ok = Number.isFinite(frac) && frac < 1
  const at = v.open + frac * v.hours
  const profitDay = v.guests * contrib - dailyFixed
  // A 10% higher average ticket with the same unit costs moves the hour earlier.
  const contribUp = v.ticket * 1.1 - v.ticket * (v.varc / 100)
  const atUp2 = v.open + (contribUp > 0 ? dailyFixed / contribUp / Math.max(1, v.guests) : NaN) * v.hours
  report(L
    ? `مصاريف ثابتة ${fmt(v.fixed, 0)} ر.س: تحتاج ${fmt(Math.ceil(need), 0)} عميلًا يوميًا للتعادل، ${ok ? `ربحك يبدأ الساعة ${clock(at, true)}` : 'لا تصل لنقطة التعادل يوميًا'}`
    : `Fixed costs ${fmt(v.fixed, 0)} SAR: ${fmt(Math.ceil(need), 0)} guests a day to break even. ${ok ? `Profit starts at ${clock(at, false)}` : 'You never reach break-even in a day'}`)
  return (
    <>
      <div className="tl-form">
        <Num sec={L ? 'التكاليف' : 'Costs'} label={L ? 'المصاريف الثابتة شهريًا' : 'Fixed costs per month'} unit={u.sar} {...bind('fixed')} hint={L ? 'إيجار، رواتب، كهرباء، اشتراكات، أقساط' : 'Rent, salaries, power, subscriptions, instalments'} />
        <Num label={L ? 'التكلفة المتغيرة من الفاتورة' : 'Variable cost share of the bill'} unit="%" {...bind('varc')} hint={L ? 'المكونات، التغليف، عمولات البطاقات والتطبيقات' : 'Ingredients, packaging, card and app fees'} />
        <Num sec={L ? 'المبيعات' : 'Sales'} label={L ? 'متوسط الفاتورة قبل الضريبة' : 'Average bill before VAT'} unit={u.sar} {...bind('ticket')} />
        <Num label={L ? 'عدد العملاء يوميًا' : 'Guests per day'} unit={L ? 'عميل' : 'guests'} {...bind('guests')} />
        <Num sec={L ? 'ساعات التشغيل' : 'Opening hours'} label={L ? 'أيام العمل في الشهر' : 'Days open per month'} unit={L ? 'يوم' : 'days'} {...bind('days')} />
        <Num label={L ? 'ساعة الافتتاح' : 'Opening hour'} unit="0–23" hint={L ? 'بنظام 24 ساعة، 12 تعني الظهر' : '24-hour clock, 12 means noon'} {...bind('open')} />
        <Num label={L ? 'ساعات العمل يوميًا' : 'Hours open per day'} unit={hoursOf(L)} {...bind('hours')} />
      </div>
      <Result
        tone={!ok ? 'bad' : frac > 0.75 ? 'warn' : 'good'}
        label={L ? 'ربحك يبدأ الساعة' : 'Your profit starts at'}
        big={ok ? clock(at, L) : (L ? 'لا يبدأ' : 'Never')}
        rows={[
          [L ? 'عملاء التعادل يوميًا' : 'Break-even guests per day', fmt(Math.ceil(need), 0)],
          [L ? 'من يومك تعمل فيه للمصاريف' : 'Share of your day spent covering costs', ok ? pct(frac, 0) : '100%'],
          [L ? 'ربح اليوم الكامل' : 'Profit for a full day', `${fmt(profitDay, 0)} ${u.sar}`],
          [L ? 'لو ارتفع متوسط الفاتورة 10%' : 'If the average bill rose 10%', Number.isFinite(atUp2) && atUp2 < v.open + v.hours ? clock(atUp2, L) : '—'],
        ]}
        insight={!ok
          ? (L ? 'بهذا العدد من العملاء لا يغطي يومك مصاريفه، ابدأ من متوسط الفاتورة قبل أن تبحث عن عملاء أكثر' : 'At this footfall the day never covers its costs. Start with the average bill before chasing more guests')
          : (L ? `حتى ${clock(at, true)} أنت تعمل للإيجار والرواتب، الحساب يفترض أن عملاءك يتوزعون على اليوم بالتساوي، وأغلبهم في الواقع يأتون وقت الذروة، فساعة الربح عندك قد تتأخر أكثر مما يظهر، رفع الفاتورة 10% يقدّمها إلى ${Number.isFinite(atUp2) ? clock(atUp2, true) : '—'}` : `Until ${clock(at, false)} you are working for the rent and the payroll. That assumes guests arrive evenly; most come at peak, so your real hour is usually later than it looks. A 10% higher bill brings it forward to ${Number.isFinite(atUp2) ? clock(atUp2, false) : '—'}`)}
      >
        {ok && (
          <div className="tl-day" aria-hidden="true" style={{ ['--f' as string]: `${Math.round(Math.min(1, frac) * 100)}%` }}>
            <span>{clock(v.open, L)}</span><span>{clock(v.open + v.hours, L)}</span>
          </div>
        )}
      </Result>
    </>
  )
}

// ---- cash asleep on the shelves (retail, wholesale, any stock) ----
const Stock: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ stock: 250000, cogs: 90000, slow: 25, carry: 25 })
  const days = v.cogs > 0 ? v.stock / (v.cogs / 30) : NaN
  const dead = v.stock * Math.min(100, v.slow) / 100
  const yearCost = v.stock * v.carry / 100
  const deadCost = dead * v.carry / 100
  const turns = v.stock > 0 ? (v.cogs * 12) / v.stock : NaN
  report(L
    ? `مخزون ${fmt(v.stock, 0)} ر.س يكفي ${fmt(days, 0)} يومًا، منه ${fmt(dead, 0)} ر.س راكد يكلّف ${fmt(deadCost, 0)} ر.س سنويًا`
    : `${fmt(v.stock, 0)} SAR of stock covers ${fmt(days, 0)} days. ${fmt(dead, 0)} SAR of it is slow and costs ${fmt(deadCost, 0)} SAR a year`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'قيمة المخزون الحالي (بالتكلفة)' : 'Current stock value (at cost)'} unit={u.sar} {...bind('stock')} />
        <Num label={L ? 'تكلفة البضاعة المباعة شهريًا' : 'Cost of goods sold per month'} unit={u.sar} {...bind('cogs')} />
        <Num label={L ? 'نسبة الراكد (لم يُبع منذ 90 يومًا)' : 'Slow stock (unsold for 90 days)'} unit="%" {...bind('slow')} />
        <Num label={L ? 'تكلفة الاحتفاظ بالمخزون سنويًا' : 'Yearly cost of holding stock'} unit="%" {...bind('carry')} hint={L ? 'المساحة، رأس المال المحبوس، التلف، التقادم، غالبًا بين 20% و30% من قيمته' : 'Space, tied-up capital, damage, obsolescence. Usually 20–30% of its value'} />
      </div>
      <Result
        tone={days > 120 ? 'bad' : days > 75 ? 'warn' : 'good'}
        label={L ? 'نقد نائم على الرفوف' : 'Cash asleep on the shelves'}
        big={fmt(dead, 0)} unit={u.sar}
        rows={[
          [L ? 'مخزونك يكفي' : 'Your stock lasts', `${fmt(days, 0)} ${L ? 'يومًا' : 'days'}`],
          [L ? 'يدور المخزون في السنة' : 'Stock turns per year', `${fmt(turns, 1)}×`],
          [L ? 'كلفة بقائه سنويًا (كل المخزون)' : 'Yearly cost of keeping it (all stock)', `${fmt(yearCost, 0)} ${u.sar}`],
          [L ? 'منها على الراكد وحده' : 'Of which the slow stock alone', `${fmt(deadCost, 0)} ${u.sar}`],
        ]}
        insight={L
          ? `البضاعة الراكدة لا تقف مجانًا: كل ريال فيها يكلّفك قرابة ${fmt(v.carry, 0)} هللة كل سنة وهو ينتظر، تسييل نصفها فقط يحرّر ${fmt(dead / 2, 0)} ر.س تشتري بها ما يبيع فعلًا`
          : `Slow stock doesn't sit for free: every riyal in it costs you about ${fmt(v.carry / 100, 2)} SAR a year while it waits. Clearing just half frees ${fmt(dead / 2, 0)} SAR to buy what actually sells`}
      />
    </>
  )
}

// ---- the cost of wasted viewings (real estate) ----
const Viewing: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ views: 40, waste: 60, hours: 2, rate: 80, deals: 3 })
  const wasted = v.views * Math.min(100, Math.max(0, v.waste)) / 100
  const wHours = wasted * v.hours
  const wCost = wHours * v.rate
  const perDeal = v.deals > 0 ? v.views / v.deals : NaN
  const more = Number.isFinite(perDeal) && perDeal > 0 ? (wasted / 2) / perDeal : 0
  report(L
    ? `${fmt(v.views, 0)} معاينة شهريًا، ${fmt(v.waste, 0)}% منها مع غير جادّين: ${fmt(wHours, 0)} ساعة ضائعة تكلّف ${fmt(wCost, 0)} ر.س شهريًا`
    : `${fmt(v.views, 0)} viewings a month, ${fmt(v.waste, 0)}% with non-serious buyers: ${fmt(wHours, 0)} lost hours costing ${fmt(wCost, 0)} SAR a month`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'عدد المعاينات شهريًا' : 'Viewings per month'} {...bind('views')} />
        <Num label={L ? 'نسبة المعاينات التي لم تكن جادّة' : 'Share of viewings that were never serious'} unit="%" {...bind('waste')} hint={L ? 'من قرّر من الدقيقة الأولى أن الوحدة ليست له' : 'Buyers who knew in the first minute the unit wasn’t for them'} />
        <Num label={L ? 'ساعات المعاينة الواحدة مع الطريق' : 'Hours per viewing, including the drive'} {...bind('hours')} />
        <Num label={L ? 'تكلفة ساعة المسوّق' : 'Cost of an agent’s hour'} unit={u.sar} {...bind('rate')} hint={L ? 'الراتب والعمولة والسيارة مقسومة على ساعات العمل' : 'Salary, commission and car, divided by working hours'} />
        <Num label={L ? 'الصفقات المغلقة شهريًا' : 'Deals closed per month'} {...bind('deals')} />
      </div>
      <Result
        tone={v.waste >= 50 ? 'bad' : v.waste >= 30 ? 'warn' : 'good'}
        label={L ? 'ساعات تذهب مع غير الجادّين كل شهر' : 'Hours spent on non-serious buyers each month'}
        big={fmt(wHours, 0)} unit={L ? 'ساعة' : 'hours'}
        rows={[
          [L ? 'كلفتها شهريًا' : 'What they cost a month', `${fmt(wCost, 0)} ${u.sar}`],
          [L ? 'وفي السنة' : 'And a year', `${fmt(wCost * 12, 0)} ${u.sar}`],
          [L ? 'معاينات لكل صفقة' : 'Viewings per deal', fmt(perDeal, 1)],
          [L ? 'صفقات إضافية محتملة شهريًا' : 'Possible extra deals a month', fmt(more, 1)],
        ]}
        insight={L
          ? `لو ذهب نصف هذا الوقت فقط إلى مشترين جادّين، فبمعدّلك الحالي يعني ذلك قرابة ${fmt(more, 1)} صفقة إضافية كل شهر، الفرز يبدأ قبل أن يركب أحد السيارة`
          : `If just half of that time went to serious buyers, at your current rate that is about ${fmt(more, 1)} extra deals a month. The filtering starts before anyone gets in the car`}
      />
    </>
  )
}

// ---- the hidden growth ceiling: churn sets the ceiling, not marketing ----
const Ceiling: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ now: 800, add: 120, churn: 8, rev: 150, margin: 40 })
  const c = Math.max(0, v.churn) / 100
  const cap = c > 0 ? v.add / c : Infinity
  const capRev = cap * v.rev
  // Two points less churn, or half of it when churn is already 4% or lower.
  const cut = c > 0.04 ? 0.02 : c / 2
  const pts = cut * 100
  const capLess = c > 0 ? v.add / (c - cut) : Infinity
  const churnWins = capLess / cap - 1 > 0.2
  const capMore = (v.add * 1.2) / Math.max(c, 1e-9)
  const life = c > 0 ? 1 / c : Infinity
  const ltv = life * v.rev * v.margin / 100
  const lost = v.now * c
  const grow = Number.isFinite(cap) && cap > v.now
  report(L
    ? `بخسارة ${fmt(v.churn)}% شهريًا و${fmt(v.add, 0)} عميل جديد: السقف ${fmt(cap, 0)} عميل مهما زاد التسويق، خفض الفقد ${fmt(pts, 1)} نقطة يرفعه إلى ${fmt(capLess, 0)}`
    : `Losing ${fmt(v.churn)}% a month with ${fmt(v.add, 0)} new customers: the ceiling is ${fmt(cap, 0)} customers, however much you market. ${fmt(pts, 1)} points less churn lifts it to ${fmt(capLess, 0)}`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'عملاؤك النشطون اليوم' : 'Active customers today'} {...bind('now')} />
        <Num label={L ? 'عملاء جدد كل شهر' : 'New customers per month'} {...bind('add')} />
        <Num label={L ? 'من يتوقف عن الشراء شهريًا' : 'Customers who stop buying each month'} unit="%" {...bind('churn')} hint={L ? 'من كل 100 عميل، كم واحدًا لا يعود الشهر القادم؟' : 'Out of every 100 customers, how many don’t come back next month?'} />
        <Num label={L ? 'إيراد العميل الواحد شهريًا' : 'Revenue per customer per month'} unit={u.sar} {...bind('rev')} />
        <Num label={L ? 'هامش الربح الإجمالي' : 'Gross margin'} unit="%" {...bind('margin')} />
      </div>
      <Result
        tone={!grow ? 'bad' : cap < v.now * 1.3 ? 'warn' : 'good'}
        label={L ? 'السقف الذي لن تتجاوزه بهذا الوضع' : 'The ceiling you can’t pass as things stand'}
        big={Number.isFinite(cap) ? fmt(cap, 0) : '∞'} unit={L ? 'عميل' : 'customers'}
        rows={[
          [L ? 'إيراد شهري عند السقف' : 'Monthly revenue at the ceiling', Number.isFinite(capRev) ? `${fmt(capRev, 0)} ${u.sar}` : '—'],
          [L ? 'تخسرهم الآن كل شهر' : 'You lose now, every month', `${fmt(lost, 0)} ${L ? 'عميل' : 'customers'}`],
          [L ? `لو خفّضت الفقد ${fmt(pts, 1)} نقطة` : `With ${fmt(pts, 1)} points less churn`, `${fmt(capLess, 0)} · +${fmt((capLess / cap - 1) * 100, 0)}%`],
          [L ? 'لو زدت العملاء الجدد 20%' : 'With 20% more new customers', `${fmt(capMore, 0)} · +20%`],
          [L ? 'ربح العميل طوال علاقته بك' : 'Profit from one customer over their life', Number.isFinite(ltv) ? `${fmt(ltv, 0)} ${u.sar}` : '—'],
        ]}
        insight={L
          ? (grow
            ? `مهما صرفت على الإعلان، ستتوقف عند ${fmt(cap, 0)} عميل تقريبًا، لأن الدلو يتسرّب من الأسفل، سدّ ${fmt(pts, 1)} نقطة من التسرّب يرفع سقفك ${fmt((capLess / cap - 1) * 100, 0)}%${churnWins ? '، أكثر مما تفعله زيادة العملاء الجدد 20%' : ''}`
            : `أنت فوق سقفك: كل شهر تخسر أكثر مما تكسب، وستنزل نحو ${fmt(cap, 0)} عميل، المشكلة ليست في التسويق، بل في سبب رحيلهم`)
          : (grow
            ? `However much you spend on ads, you'll level off around ${fmt(cap, 0)} customers, because the bucket leaks from the bottom. Plugging ${fmt(pts, 1)} points of the leak lifts your ceiling ${fmt((capLess / cap - 1) * 100, 0)}%${churnWins ? ', more than 20% more new customers would' : ''}`
            : `You're above your ceiling: each month you lose more than you win, and you'll slide toward ${fmt(cap, 0)}. The problem isn't marketing. It's why they leave`)}
      />
    </>
  )
}

// ---- which lever moves profit most (price, customers, frequency, cost) ----
const Lever: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ cust: 1000, freq: 1.5, ticket: 80, margin: 35, fixed: 30000, step: 5 })
  const rev = v.cust * v.freq * v.ticket
  const m = Math.min(99, v.margin) / 100
  const i = v.step / 100
  const gp = rev * m
  const base = gp - v.fixed
  const opts: [string, number][] = [
    [L ? `رفع السعر ${fmt(v.step)}%` : `Raise price ${fmt(v.step)}%`, rev * (m + i) - v.fixed],
    [L ? `خفض تكلفة البضاعة ${fmt(v.step)}%` : `Cut cost of goods ${fmt(v.step)}%`, rev - rev * (1 - m) * (1 - i) - v.fixed],
    [L ? `مبيعات أكثر ${fmt(v.step)}% (عملاء أو تكرار)` : `${fmt(v.step)}% more sales (customers or repeat)`, gp * (1 + i) - v.fixed],
  ]
  const ranked = opts.map(([k, p]) => [k, p, base !== 0 ? (p - base) / Math.abs(base) : NaN] as [string, number, number]).sort((a, b) => b[1] - a[1])
  const equiv = m > 0 ? i / m : NaN
  const top = ranked[0]
  report(L
    ? `ربح شهري ${fmt(base, 0)} ر.س، أقوى رافعة: ${top[0]} (+${fmt(top[1] - base, 0)} ر.س شهريًا)`
    : `Monthly profit ${fmt(base, 0)} SAR. Strongest lever: ${top[0]} (+${fmt(top[1] - base, 0)} SAR a month)`)
  const max = Math.max(...ranked.map((r) => r[1] - base), 1)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'عدد العملاء شهريًا' : 'Customers per month'} {...bind('cust')} />
        <Num label={L ? 'مرات شراء العميل في الشهر' : 'Purchases per customer per month'} {...bind('freq')} />
        <Num label={L ? 'متوسط الفاتورة' : 'Average ticket'} unit={u.sar} {...bind('ticket')} />
        <Num label={L ? 'هامش الربح الإجمالي' : 'Gross margin'} unit="%" {...bind('margin')} />
        <Num label={L ? 'المصاريف الثابتة شهريًا' : 'Fixed costs per month'} unit={u.sar} {...bind('fixed')} />
        <Num label={L ? 'حجم التحسين المقارَن' : 'Size of the improvement'} unit="%" {...bind('step')} />
      </div>
      <Result
        tone={base <= 0 ? 'bad' : undefined}
        label={L ? 'أقوى رافعة لربحك' : 'Your strongest profit lever'}
        big={base > 0 && Number.isFinite(top[2]) ? `+${fmt(top[2] * 100, 0)}%` : `+${fmt(top[1] - base, 0)}`}
        unit={base > 0 ? undefined : u.sar}
        rows={[
          [L ? 'ربحك الشهري الآن' : 'Monthly profit now', `${fmt(base, 0)} ${u.sar}`],
          ...ranked.map(([k, p]) => [k, `+${fmt(p - base, 0)} ${u.sar}`] as [string, string]),
        ]}
        insight={L
          ? `رفع السعر ${fmt(v.step)}% يعادل أن تكسب ${pct(equiv, 0)} عملاء إضافيين، دون إعلان واحد ودون ضغط إضافي على فريقك، أغلب الشركات تطارد العملاء أولًا، وأرقامها تقول العكس`
          : `A ${fmt(v.step)}% price rise is worth the same as ${pct(equiv, 0)} more customers, with no ads and no extra load on your team. Most businesses chase customers first; their numbers usually say the opposite`}
      >
        <div className="tl-levers" aria-hidden="true">
          {ranked.map(([k, p]) => <span key={k} style={{ ['--w' as string]: `${Math.max(4, Math.round(((p - base) / max) * 100))}%` }}><i>{k}</i></span>)}
        </div>
      </Result>
    </>
  )
}

// ---- the price test: how many customers you can lose after a rise; how many you need after a discount ----
const Price: ToolFn = ({ lang, report }) => {
  const L = lang === 'ar'
  const { v, bind } = useForm({ margin: 35, change: 8, cust: 1000 })
  const [cut, setCut] = useState(false)
  const m = Math.min(99, v.margin) / 100
  const p = Math.abs(v.change) / 100
  const canLose = p / (m + p)
  const ok = p < m
  const need = ok ? p / (m - p) : NaN
  report(L
    ? (cut ? `هامش ${fmt(v.margin)}% وخصم ${fmt(v.change)}%: تحتاج مبيعات أكثر بـ ${ok ? pct(need, 0) : '∞'} لتبقى مكانك` : `هامش ${fmt(v.margin)}% ورفع ${fmt(v.change)}%: يمكنك أن تخسر حتى ${pct(canLose, 0)} من عملائك وتربح نفس المبلغ`)
    : (cut ? `${fmt(v.margin)}% margin, ${fmt(v.change)}% off: you need ${ok ? pct(need, 0) : '∞'} more sales to stand still` : `${fmt(v.margin)}% margin, ${fmt(v.change)}% rise: you can lose up to ${pct(canLose, 0)} of customers and earn the same`))
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'هامش الربح الإجمالي الحالي' : 'Current gross margin'} unit="%" {...bind('margin')} />
        <Num label={cut ? (L ? 'نسبة الخصم' : 'Discount') : (L ? 'نسبة رفع السعر' : 'Price rise')} unit="%" {...bind('change')} />
        <Num label={L ? 'عملاؤك شهريًا' : 'Customers per month'} {...bind('cust')} />
        <Toggle label={L ? 'أفكّر في خصم، لا في رفع' : 'I’m thinking of a discount, not a rise'} on={cut} set={setCut} />
      </div>
      {!cut ? (
        <Result
          tone="good"
          label={L ? 'تستطيع أن تخسر حتى' : 'You can afford to lose up to'}
          big={pct(canLose, 0)} unit={L ? 'من العملاء' : 'of customers'}
          rows={[
            [L ? 'أي حتى' : 'That is up to', `${fmt(Math.floor(v.cust * canLose), 0)} ${L ? 'عميل شهريًا' : 'customers a month'}`],
            [L ? 'وتبقى بنفس الربح' : 'And still earn the same', '✓'],
          ]}
          insight={L
            ? `كثيرون يؤجلون رفع السعر خوفًا من خسارة بعض العملاء، والحساب يقول إنك تتحمّل خسارة ${pct(canLose, 0)} منهم وتبقى بنفس الربح، ومن يرحل بسبب زيادة صغيرة غالبًا هو الأقل ربحًا لك أصلًا`
            : `Many owners put off a price rise for fear of losing some customers; the maths says you can lose ${pct(canLose, 0)} and earn the same. Those who leave over a small rise are usually your least profitable anyway`}
        />
      ) : (
        <Result
          tone={!ok ? 'bad' : need > 0.5 ? 'warn' : 'good'}
          label={L ? 'تحتاج مبيعات أكثر بـ' : 'You need more sales of'}
          big={ok ? `+${fmt(need * 100, 0)}%` : '∞'}
          rows={[
            [L ? 'لتبقى بنفس الربح، بِع لـ' : 'To earn the same, serve', ok ? `${fmt(Math.ceil(v.cust * (1 + need)), 0)} ${L ? 'بدل' : 'instead of'} ${fmt(v.cust, 0)}` : '—'],
            [L ? 'هامشك بعد الخصم' : 'Margin after the discount', ok ? pct((m - p) / (1 - p)) : '—'],
          ]}
          insight={!ok
            ? (L ? 'الخصم أكبر من هامشك: كل بيعة خسارة، مهما زادت الزحمة' : 'The discount is bigger than your margin: every sale is a loss, however busy it gets')
            : (L ? 'الخصم يعلّم عميلك أن ينتظره، قبل أن تخفّض السعر، جرّب أن ترفع القيمة: باقة، أو هدية، أو تجربة لا يجدها عند غيرك' : 'A discount teaches customers to wait for it. Before cutting price, try raising value: a bundle, a gift, an experience they can’t find elsewhere')}
        />
      )}
    </>
  )
}

// ---- the interruption tax (psychology of attention) ----
const Focus: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ team: 10, inter: 12, mins: 10, salary: 9000, hours: 8 })
  const lostMin = v.inter * v.mins
  const share = Math.min(1, lostMin / Math.max(1, v.hours * 60))
  const fte = v.team * share
  const year = v.team * v.salary * 12 * share
  const weekH = (lostMin * 5 * v.team) / 60
  report(L
    ? `${fmt(v.team, 0)} موظفين، ${fmt(v.inter, 0)} مقاطعة يوميًا: يضيع ${pct(share, 0)} من يوم العمل، أي ما يعادل ${fmt(fte, 1)} موظف، و${fmt(year, 0)} ر.س سنويًا`
    : `${fmt(v.team, 0)} people, ${fmt(v.inter, 0)} interruptions a day: ${pct(share, 0)} of the workday lost, worth ${fmt(fte, 1)} employees and ${fmt(year, 0)} SAR a year`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'عدد أفراد الفريق' : 'Team size'} {...bind('team')} />
        <Num label={L ? 'مقاطعات للفرد يوميًا' : 'Interruptions per person per day'} {...bind('inter')} hint={L ? 'مكالمة، رسالة، «سؤال سريع»، اجتماع مفاجئ' : 'A call, a message, a “quick question”, a surprise meeting'} />
        <Num label={L ? 'دقائق ضائعة مع كل مقاطعة' : 'Minutes lost per interruption'} unit={L ? 'دقيقة' : 'min'} {...bind('mins')} hint={L ? 'المقاطعة نفسها، ثم وقت العودة لنفس التركيز، أبحاث الانتباه تشير إلى أن العودة الكاملة قد تأخذ نحو 20 دقيقة؛ بدأنا بتقدير متحفظ' : 'The interruption, then getting back to the same focus. Attention research suggests full recovery can take around 20 minutes; we start conservative'} />
        <Num label={L ? 'متوسط الراتب الشهري' : 'Average monthly salary'} unit={u.sar} {...bind('salary')} />
        <Num label={L ? 'ساعات العمل يوميًا' : 'Working hours per day'} unit={hoursOf(L)} {...bind('hours')} />
      </div>
      <Result
        tone={share > 0.25 ? 'bad' : share > 0.12 ? 'warn' : 'good'}
        label={L ? 'تدفع سنويًا لوقت لا يُستخدم' : 'You pay yearly for time nobody gets to use'}
        big={fmt(year, 0)} unit={u.sar}
        rows={[
          [L ? 'من يوم كل موظف' : 'Of each person’s day', pct(share, 0)],
          [L ? 'ساعات الفريق الضائعة أسبوعيًا' : 'Team hours lost per week', fmt(weekH, 0)],
          [L ? 'يعادل موظفين بدوام كامل' : 'Equivalent to full-time staff', fmt(fte, 1)],
        ]}
        insight={L
          ? `المقاطعة لا تأخذ دقيقتها فقط، بل تأخذ تركيزك معها، عندك ما يعادل ${fmt(fte, 1)} موظف يأخذون راتبًا ولا يُنتجون، دون أن يقصّر أحد، الحل نادرًا ما يكون توظيفًا جديدًا؛ غالبًا ساعات هادئة، وقناة تواصل واحدة، وأسئلة تُجمع بدل أن تُرسل واحدة واحدة`
          : `An interruption takes more than its minute; it takes the focus with it. You have the equivalent of ${fmt(fte, 1)} people drawing a salary and producing nothing, without anyone slacking. The fix is rarely a new hire. It's usually quiet hours, one channel, and questions batched instead of sent one by one`}
      />
    </>
  )
}

// ---- what a meeting really costs ----
const Meeting: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ people: 6, cost: 12000, mins: 60, week: 3, decided: 40 })
  const hourly = v.cost / (22 * 8)
  const one = v.people * hourly * v.mins / 60
  const year = one * v.week * 48
  const waste = year * (1 - Math.min(100, v.decided) / 100)
  const hrs = v.people * v.mins / 60 * v.week * 48
  report(L
    ? `اجتماع واحد يكلّف ${fmt(one, 0)} ر.س؛ سنويًا ${fmt(year, 0)} ر.س، منها ${fmt(waste, 0)} ر.س على اجتماعات بلا قرار`
    : `One meeting costs ${fmt(one, 0)} SAR; ${fmt(year, 0)} SAR a year, ${fmt(waste, 0)} SAR of it on meetings with no decision`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'عدد الحاضرين' : 'People in the room'} {...bind('people')} />
        <Num label={L ? 'متوسط التكلفة الشهرية للفرد' : 'Average monthly cost per person'} unit={u.sar} {...bind('cost')} hint={L ? 'الراتب مع البدلات والتأمينات' : 'Salary plus allowances and insurance'} />
        <Num label={L ? 'مدة الاجتماع' : 'Meeting length'} unit={L ? 'دقيقة' : 'min'} {...bind('mins')} />
        <Num label={L ? 'كم مرة في الأسبوع؟' : 'How many times a week?'} {...bind('week')} />
        <Num label={L ? 'كم منها ينتهي بقرار ومسؤول واضح؟' : 'How many end with a clear decision and owner?'} unit="%" {...bind('decided')} />
      </div>
      <Result
        tone={waste > year * 0.5 ? 'bad' : waste > year * 0.3 ? 'warn' : 'good'}
        label={L ? 'تدفع سنويًا لاجتماعات بلا قرار' : 'You pay yearly for meetings with no decision'}
        big={fmt(waste, 0)} unit={u.sar}
        rows={[
          [L ? 'الاجتماع الواحد' : 'One meeting', `${fmt(one, 0)} ${u.sar}`],
          [L ? 'كل الاجتماعات سنويًا' : 'All of them, per year', `${fmt(year, 0)} ${u.sar}`],
          [L ? 'ساعات بشرية سنويًا' : 'People-hours per year', fmt(hrs, 0)],
        ]}
        insight={L
          ? 'الاجتماع بلا قرار ليس مجانيًا؛ هو شراء بلا فاتورة، جرّب قاعدة بسيطة: لا اجتماع بلا هدف مكتوب، ولا نهاية بلا قرار واسم مسؤول وموعد'
          : 'A meeting with no decision isn’t free; it’s a purchase with no receipt. Try one simple rule: no meeting without a written goal, and no ending without a decision, a name and a date'}
      />
    </>
  )
}

// ---- the true price of one resignation ----
const Turnover: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ salary: 8000, value: 20000, vacant: 2, ramp: 3, hire: 6000, leavers: 4 })
  const vacancy = Math.max(0, v.value - v.salary) * v.vacant
  const ramp = v.value * v.ramp * 0.5
  const one = vacancy + ramp + v.hire
  const months = v.salary > 0 ? one / v.salary : NaN
  const year = one * v.leavers
  report(L
    ? `الاستقالة الواحدة تكلّف ${fmt(one, 0)} ر.س (${fmt(months, 1)} شهر من الراتب)، و${fmt(year, 0)} ر.س سنويًا بـ ${fmt(v.leavers, 0)} استقالات`
    : `One resignation costs ${fmt(one, 0)} SAR (${fmt(months, 1)} months of salary), ${fmt(year, 0)} SAR a year at ${fmt(v.leavers, 0)} leavers`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'راتب الدور شهريًا' : 'Monthly salary of the role'} unit={u.sar} {...bind('salary')} />
        <Num label={L ? 'ما ينتجه الدور شهريًا' : 'What the role produces per month'} unit={u.sar} {...bind('value')} hint={L ? 'إيراد يجلبه، أو قيمة عمل يغطيها، تقدير صادق يكفي' : 'Revenue it brings, or the value of work it covers. An honest estimate is enough'} />
        <Num label={L ? 'أشهر يبقى فيها المقعد فارغًا' : 'Months the seat stays empty'} {...bind('vacant')} />
        <Num label={L ? 'أشهر حتى يصل البديل لكامل أدائه' : 'Months until the new hire is fully up to speed'} {...bind('ramp')} />
        <Num label={L ? 'تكلفة التوظيف والتهيئة' : 'Hiring and onboarding cost'} unit={u.sar} {...bind('hire')} hint={L ? 'إعلانات، مكاتب توظيف، تدريب، أجهزة، وقت المقابلات' : 'Ads, agencies, training, equipment, interview time'} />
        <Num label={L ? 'استقالات في السنة' : 'Resignations per year'} {...bind('leavers')} />
      </div>
      <Result
        tone={months > 6 ? 'bad' : months > 3 ? 'warn' : 'good'}
        label={L ? 'ثمن الاستقالة الواحدة' : 'The price of one resignation'}
        big={fmt(one, 0)} unit={u.sar}
        rows={[
          [L ? 'بأشهر من راتبه' : 'In months of their salary', fmt(months, 1)],
          [L ? 'إنتاج ضائع والمقعد فارغ' : 'Lost output while the seat is empty', `${fmt(vacancy, 0)} ${u.sar}`],
          [L ? 'فجوة الأداء حتى يتقن البديل' : 'Gap until the new hire is up to speed', `${fmt(ramp, 0)} ${u.sar}`],
          [L ? 'سنويًا بعدد استقالاتك' : 'Per year, at your resignations', `${fmt(year, 0)} ${u.sar}`],
        ]}
        insight={L
          ? `الاستقالة الواحدة تكلّفك قرابة ${fmt(months, 1)} شهر من راتب صاحبها، وهذه تكلفة لا تظهر في أي فاتورة، وكثير من الاستقالات تبدأ قبل الورقة بأشهر: شخص جيد في مسار لا يناسب طريقة تفكيره، هنا تحديدًا يبدأ عملنا مع الفرق`
          : `One resignation costs you about ${fmt(months, 1)} months of that person's salary, and no invoice ever shows it. Many resignations start months before the letter: a good person in a lane that doesn't fit how they think. That is exactly where our work with teams begins`}
      />
    </>
  )
}

// ---- the founder's hour ----
const Founder: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ income: 600000, week: 55, low: 20, rate: 40 })
  const hour = v.week > 0 ? v.income / (v.week * 48) : NaN
  const leak = Math.max(0, hour - v.rate) * v.low * 48
  const days = (v.low * 48) / 8
  const worth = hour > v.rate
  report(L
    ? `ساعتك تساوي ${fmt(hour, 0)} ر.س، ${fmt(v.low, 0)} ساعة أسبوعيًا في مهام قيمتها ${fmt(v.rate, 0)} ر.س تهدر ${fmt(leak, 0)} ر.س سنويًا`
    : `Your hour is worth ${fmt(hour, 0)} SAR. ${fmt(v.low, 0)} hours a week on ${fmt(v.rate, 0)}-SAR tasks leak ${fmt(leak, 0)} SAR a year`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'ما تريد أن يحققه لك عملك سنويًا' : 'What you want your business to earn you a year'} unit={u.sar} {...bind('income')} />
        <Num label={L ? 'ساعات عملك أسبوعيًا' : 'Your working hours per week'} unit={hoursOf(L)} {...bind('week')} />
        <Num label={L ? 'منها في مهام يقدر غيرك يقوم بها' : 'Of which on tasks someone else could do'} unit={hoursOf(L)} {...bind('low')} hint={L ? 'متابعة رسائل، مشتريات، إدخال بيانات، مشاوير، تصميم منشورات' : 'Chasing messages, purchasing, data entry, errands, designing posts'} />
        <Num label={L ? 'كم يكلّف تفويضها بالساعة؟' : 'What would delegating cost per hour?'} unit={u.sar} {...bind('rate')} />
      </div>
      <Result
        tone={!worth ? 'warn' : leak > v.income * 0.2 ? 'bad' : 'warn'}
        label={L ? 'قيمة ساعتك المستهدفة' : 'What your hour should be worth'}
        big={fmt(hour, 0)} unit={u.sar}
        rows={[
          [L ? 'تهدر سنويًا في مهام غيرك' : 'Leaked yearly on others’ tasks', `${fmt(leak, 0)} ${u.sar}`],
          [L ? 'أيام عمل كاملة تستعيدها' : 'Full workdays you’d win back', fmt(days, 0)],
        ]}
        insight={worth
          ? (L ? `كل ساعة تقضيها في مهمة قيمتها ${fmt(v.rate, 0)} ر.س، تدفع لنفسك ${fmt(hour, 0)} ر.س لتؤديها، المؤسس لا يتعثر غالبًا لأنه لا يعمل، بل لأنه يعمل في المكان الخطأ` : `Every hour you spend on a ${fmt(v.rate, 0)}-SAR task, you pay yourself ${fmt(hour, 0)} SAR to do it. Founders rarely stall from not working; they stall from working in the wrong place`)
          : (L ? 'التفويض ليس أرخص بعد، رافعتك الأكبر الآن أن ترفع قيمة ساعتك نفسها: سعر، أو منتج، أو عميل أكبر' : 'Delegating isn’t cheaper yet. Your bigger lever is raising the value of your hour itself: price, product, or bigger clients')}
      />
    </>
  )
}

// ---- the cost of waiting ----
const Delay: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ gain: 15000, wait: 4, odds: 70 })
  const odds = Math.min(100, v.odds) / 100
  const lost = v.gain * v.wait * odds
  const week = (v.gain * odds) / 4.33
  const day = (v.gain * odds) / 30
  report(L
    ? `تأجيل ${fmt(v.wait, 0)} أشهر لقرار يضيف ${fmt(v.gain, 0)} ر.س شهريًا يكلّف قرابة ${fmt(lost, 0)} ر.س (${fmt(week, 0)} ر.س كل أسبوع)`
    : `Waiting ${fmt(v.wait, 0)} months on a decision worth ${fmt(v.gain, 0)} SAR a month costs about ${fmt(lost, 0)} SAR (${fmt(week, 0)} SAR every week)`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'ما سيضيفه القرار شهريًا حين يعمل' : 'What the decision adds per month once working'} unit={u.sar} {...bind('gain')} hint={L ? 'نظام، موظف، قناة بيع، تسعير جديد…' : 'A system, a hire, a sales channel, new pricing…'} />
        <Num label={L ? 'كم شهرًا تفكر أن تؤجّل؟' : 'How many months are you thinking of waiting?'} {...bind('wait')} />
        <Num label={L ? 'احتمال أن ينجح كما تتوقع' : 'Chance it works as you expect'} unit="%" {...bind('odds')} />
      </div>
      <Result
        tone={lost > v.gain * 3 ? 'bad' : 'warn'}
        label={L ? 'ثمن الانتظار' : 'The price of waiting'}
        big={fmt(lost, 0)} unit={u.sar}
        rows={[
          [L ? 'كل أسبوع تأجيل' : 'Every week of delay', `${fmt(week, 0)} ${u.sar}`],
          [L ? 'كل يوم' : 'Every day', `${fmt(day, 0)} ${u.sar}`],
        ]}
        insight={L
          ? 'الانتظار يبدو مجانيًا لأن ثمنه لا يصلك في فاتورة، عقولنا تبالغ في تقدير مخاطر الفعل، وتتجاهل خسارة التأخير، والأرباح المؤجلة لا تعود؛ الشهر الذي يمر لا يُستردّ'
          : 'Waiting feels free because its price never arrives as a bill. Our minds overweight the risk of acting and ignore the loss of delay. And deferred profit doesn’t come back; a month that passes is gone'}
      />
    </>
  )
}


// ---- 7 · OEE ----
const Oee: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ planned: 480, down: 60, cycle: 30, total: 700, good: 665, cm: 8 })
  const run = Math.max(0, v.planned - v.down)
  const A = v.planned > 0 ? run / v.planned : 0
  const P = run > 0 ? Math.min(1, (v.cycle * v.total) / (run * 60)) : 0
  const Q = v.total > 0 ? Math.min(1, v.good / v.total) : 0
  const oee = A * P * Q
  const ideal = v.cycle > 0 ? (v.planned * 60) / v.cycle : 0
  const lost = Math.max(0, ideal - v.good)
  report(L
    ? `كفاءة الخط ${pct(oee)} (التوفر ${pct(A)}، الأداء ${pct(P)}، الجودة ${pct(Q)})، فاقد الوردية ${fmt(lost, 0)} وحدة ≈ ${fmt(lost * v.cm, 0)} ر.س`
    : `Line OEE ${pct(oee)} (availability ${pct(A)}, performance ${pct(P)}, quality ${pct(Q)}). Lost per shift ${fmt(lost, 0)} units ≈ ${fmt(lost * v.cm, 0)} SAR`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'وقت الوردية المخطط' : 'Planned shift time'} unit={L ? 'دقيقة' : 'min'} {...bind('planned')} />
        <Num label={L ? 'وقت التوقف' : 'Downtime'} unit={L ? 'دقيقة' : 'min'} {...bind('down')} />
        <Num label={L ? 'زمن الدورة المثالي للقطعة' : 'Ideal cycle time per unit'} unit={L ? 'ثانية' : 'sec'} {...bind('cycle')} />
        <Num label={L ? 'إجمالي ما أُنتج' : 'Total produced'} {...bind('total')} />
        <Num label={L ? 'القطع السليمة' : 'Good units'} {...bind('good')} />
        <Num label={L ? 'ربح القطعة الواحدة' : 'Profit per unit'} unit={u.sar} {...bind('cm')} />
      </div>
      <Result
        tone={oee >= 0.85 ? 'good' : oee >= 0.6 ? 'warn' : 'bad'}
        label={L ? 'الكفاءة الشاملة للخط' : 'Overall equipment effectiveness'}
        big={pct(oee)}
        rows={[
          [L ? 'التوفر' : 'Availability', pct(A)],
          [L ? 'الأداء' : 'Performance', pct(P)],
          [L ? 'الجودة' : 'Quality', pct(Q)],
          [L ? 'فاقد هذه الوردية' : 'Lost this shift', `${fmt(lost, 0)} ${L ? 'وحدة' : 'units'} · ${fmt(lost * v.cm, 0)} ${u.sar}`],
          [L ? 'شهريًا بوردية واحدة يوميًا' : 'Per month, one shift a day', `${fmt(lost * v.cm * 26, 0)} ${u.sar}`],
        ]}
        insight={L ? 'المرجع العالمي للمصانع المتميزة نحو 85%، الفرق بينك وبينه ربح موجود عندك، لكنه لا يصل' : 'World-class plants sit around 85%. The gap is profit you already have, but never collect'}
      >
        <div className="tl-bars" aria-hidden="true">
          {[A, P, Q].map((x, i) => <span key={i} style={{ ['--w' as string]: `${Math.round(x * 100)}%` }} />)}
        </div>
      </Result>
    </>
  )
}

// ---- 8 · home product pricing ----
const Home: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ mat: 60, pcs: 12, pack: 1.5, hours: 3, rate: 25, other: 0, profit: 20, fee: 0, current: 0 })
  const pcs = Math.max(1, v.pcs)
  const keep = 1 - Math.min(90, v.profit + v.fee) / 100
  const cpp = (v.mat + v.hours * v.rate) / pcs + v.pack + v.other
  const price = cpp / keep
  const noTime = (v.mat / pcs + v.pack + v.other) / keep
  const hourly = v.current > 0 && v.hours > 0 ? ((v.current * (1 - v.fee / 100) - v.mat / pcs - v.pack - v.other) * pcs) / v.hours : NaN
  report(L
    ? `السعر العادل للقطعة ${fmt(Math.ceil(price), 0)} ر.س (تكلفتها مع وقتك ${fmt(cpp)} ر.س)${Number.isFinite(hourly) ? `. بسعرك الحالي تكسب ${fmt(hourly, 0)} ر.س في الساعة` : ''}`
    : `Fair price per piece ${fmt(Math.ceil(price), 0)} SAR (cost incl. your time ${fmt(cpp)} SAR)${Number.isFinite(hourly) ? `. At your current price you earn ${fmt(hourly, 0)} SAR an hour` : ''}`)
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'تكلفة المكونات والخامات للدفعة' : 'Ingredients and materials per batch'} unit={u.sar} {...bind('mat')} />
        <Num label={L ? 'عدد القطع في الدفعة' : 'Pieces per batch'} {...bind('pcs')} />
        <Num label={L ? 'التغليف لكل قطعة' : 'Packaging per piece'} unit={u.sar} {...bind('pack')} />
        <Num label={L ? 'ساعات عملك على الدفعة' : 'Your hours on the batch'} unit={L ? 'ساعة' : 'h'} {...bind('hours')} />
        <Num label={L ? 'كم تستحق ساعتك؟' : 'What is your hour worth?'} unit={u.sar} {...bind('rate')} />
        <Num label={L ? 'توصيل أو مصاريف أخرى لكل قطعة' : 'Delivery or other cost per piece'} unit={u.sar} {...bind('other')} />
        <Num label={L ? 'ربحك المستهدف' : 'Your target profit'} unit="%" {...bind('profit')} />
        <Num label={L ? 'عمولة منصة أو معرض' : 'Platform or bazaar fee'} unit="%" {...bind('fee')} />
        <Num label={L ? 'سعرك الحالي (اختياري)' : 'Your current price (optional)'} unit={u.sar} {...bind('current')} />
      </div>
      <Result
        tone={Number.isFinite(hourly) ? (hourly < v.rate * 0.5 ? 'bad' : hourly < v.rate ? 'warn' : 'good') : undefined}
        label={L ? 'السعر العادل للقطعة' : 'Fair price per piece'}
        big={fmt(Math.ceil(price), 0)} unit={u.sar}
        rows={[
          [L ? 'التكلفة مع وقتك' : 'Cost incl. your time', `${fmt(cpp)} ${u.sar}`],
          [L ? 'السعر لو نسيت وقتك' : 'Price if you forget your time', `${fmt(Math.ceil(noTime), 0)} ${u.sar}`],
          ...(Number.isFinite(hourly) ? [[L ? 'بسعرك الحالي تكسب في الساعة' : 'At your current price, per hour', `${fmt(hourly, 0)} ${u.sar}`] as [string, string]] : []),
        ]}
        insight={L ? 'وقتك تكلفة حقيقية، من لا يحسبه، يعمل مجانًا وهو يظن أنه يربح' : 'Your time is a real cost. Leave it out and you work for free while thinking you profit'}
      />
    </>
  )
}

// ---- 9 · kitchen to shelf ----
const Channel: ToolFn = ({ lang, report }) => {
  const u = ui[lang]
  const L = lang === 'ar'
  const { v, bind } = useForm({ cost: 4, mine: 30, dist: 15, ret: 25 })
  const [useDist, setUseDist] = useState(true)
  const mineP = v.cost / (1 - Math.min(v.mine, 95) / 100)
  const distP = useDist ? mineP / (1 - Math.min(v.dist, 95) / 100) : mineP
  const shelfEx = distP / (1 - Math.min(v.ret, 95) / 100)
  const shelf = shelfEx * 1.15
  const share = mineP / shelf
  report(L
    ? `تكلفة ${fmt(v.cost)} ر.س ← سعر الرف ${fmt(shelf)} ر.س شامل الضريبة، يصلك ${fmt(mineP)} ر.س (${pct(share, 0)})`
    : `Cost ${fmt(v.cost)} SAR → shelf ${fmt(shelf)} SAR incl. VAT. You receive ${fmt(mineP)} SAR (${pct(share, 0)})`)
  const steps: [string, number][] = [
    [L ? 'التكلفة' : 'Cost', v.cost],
    [L ? 'سعرك' : 'Your price', mineP],
    ...(useDist ? [[L ? 'الموزع' : 'Distributor', distP] as [string, number]] : []),
    [L ? 'الرف قبل الضريبة' : 'Shelf before VAT', shelfEx],
    [L ? 'الرف شامل الضريبة' : 'Shelf incl. VAT', shelf],
  ]
  return (
    <>
      <div className="tl-form">
        <Num label={L ? 'تكلفة إنتاج الوحدة' : 'Production cost per unit'} unit={u.sar} {...bind('cost')} />
        <Num label={L ? 'هامشك أنت' : 'Your margin'} unit="%" {...bind('mine')} />
        <Toggle label={L ? 'أبيع عبر موزع' : 'I sell through a distributor'} on={useDist} set={setUseDist} />
        {useDist && <Num label={L ? 'هامش الموزع' : 'Distributor margin'} unit="%" {...bind('dist')} />}
        <Num label={L ? 'هامش المتجر' : 'Retailer margin'} unit="%" {...bind('ret')} />
      </div>
      <Result
        label={L ? 'سعر منتجك على الرف' : 'Your product’s shelf price'}
        big={fmt(shelf)} unit={u.sar}
        rows={[
          [L ? 'يصلك من كل وحدة' : 'You receive per unit', `${fmt(mineP)} ${u.sar} · ${pct(share, 0)}`],
          [L ? 'ربحك من كل وحدة' : 'Your profit per unit', `${fmt(mineP - v.cost)} ${u.sar}`],
        ]}
        insight={L ? 'إن بدا سعر الرف مرتفعًا للمستهلك، فالحل غالبًا في التكلفة أو القناة، لا في هامشك وحدك' : 'If the shelf price looks high to shoppers, the fix is usually cost or channel, not your margin alone'}
      >
        <ol className="tl-chain" aria-hidden="true">
          {steps.map(([k, n]) => <li key={k} style={{ ['--w' as string]: `${Math.max(8, Math.round((n / shelf) * 100))}%` }}><span>{k}</span><b dir="ltr">{fmt(n)}</b></li>)}
        </ol>
      </Result>
    </>
  )
}

const TOOLS: Record<ToolId, ToolFn> = {
  delivery: Delivery, recipe: Recipe, oee: Oee, home: Home, channel: Channel, breakhour: BreakHour, stock: Stock,
  ceiling: Ceiling, lever: Lever, price: Price, focus: Focus, meeting: Meeting, turnover: Turnover, founder: Founder, delay: Delay, viewing: Viewing,
}

/** Renders one tool. `report` receives a one-line summary each render, for the request sheet. */
export function Tool({ id, lang, report }: { id: ToolId; lang: Lang; report: (s: string) => void }) {
  const C = TOOLS[id]
  // Keyed by tool and language: switching either starts from clean, localised defaults.
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  return (
    <div className="tl-body">
      {/* on phones, the answer rides along at the top while you change the numbers */}
      <div className="tl-live" ref={setSlot} aria-hidden="true" />
      <LiveSlot.Provider value={slot}><C key={`${id}-${lang}`} lang={lang} report={report} /></LiveSlot.Provider>
    </div>
  )
}
