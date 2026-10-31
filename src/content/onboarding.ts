// Persona questionnaires for the onboarding flow, plus the rules that turn answers into
// a situation overview and recommended services (primary + cross-sell). Option ids are shared
// across languages so answers survive a language switch.
import type { Lang, Persona, Question, Step } from './site'

type T = { ar: string; en: string }
type Opt = { id: string } & T
interface QDef { id: string; kind: Question['kind']; label: T; hint?: T; optional?: boolean; placeholder?: T; options?: Opt[] }
interface StepDef { title: T; lede?: T; questions: QDef[] }

const o = (id: string, ar: string, en: string): Opt => ({ id, ar, en })

const urgency: QDef = {
  id: 'urgency', kind: 'scale',
  label: { ar: 'كم يؤثر هذا عليك الآن؟', en: 'How much is this affecting you right now?' },
}

const sectors: Opt[] = [
  o('fnb', 'مطاعم ومقاهٍ وأغذية', 'Food, cafés & restaurants'),
  o('retail', 'تجزئة ومتاجر', 'Retail & stores'),
  o('realestate', 'عقار', 'Real estate'),
  o('hospitality', 'ضيافة وترفيه', 'Hospitality & entertainment'),
  o('services', 'خدمات مهنية', 'Professional services'),
  o('tech', 'تقنية وتطبيقات', 'Tech & apps'),
  o('industry', 'صناعة وسلاسل إمداد', 'Industry & supply chain'),
  o('health', 'صحة وتعليم', 'Health & education'),
]

const defs: Record<Persona, StepDef[]> = {
  founder: [
    {
      title: { ar: 'أين أنت الآن؟', en: 'Where are you right now?' },
      questions: [
        { id: 'stage', kind: 'single', label: { ar: 'مرحلة مشروعك', en: 'Your stage' }, options: [
          o('idea', 'فكرة فقط', 'Just an idea'),
          o('mvp', 'أعمل على نموذج أولي', 'Building a first version'),
          o('launched', 'أطلقت، ولديّ أوائل العملاء', 'Launched, with early customers'),
          o('scaling', 'أنمو، وأحتاج نظامًا', 'Growing, and I need a system'),
        ] },
        { id: 'sector', kind: 'single', label: { ar: 'المجال', en: 'Sector' }, options: sectors },
      ],
    },
    {
      title: { ar: 'ما الذي يوقفك؟', en: 'What’s holding you back?' },
      lede: { ar: 'اختر كل ما ينطبق. لا توجد إجابة خاطئة', en: 'Pick all that apply. There are no wrong answers' },
      questions: [
        { id: 'pains', kind: 'multi', label: { ar: 'التحديات', en: 'Challenges' }, options: [
          o('start', 'لا أعرف من أين أبدأ', 'I don’t know where to start'),
          o('model', 'نموذج العمل غير واضح', 'The business model isn’t clear'),
          o('gtm', 'دخول السوق (GTM)', 'Go-to-market'),
          o('customers', 'الوصول لأول العملاء', 'Getting first customers'),
          o('pricing', 'التسعير', 'Pricing'),
          o('funding', 'التمويل', 'Funding'),
          o('team', 'بناء الفريق وأول موظف', 'Building the team, first hire'),
          o('focus', 'الوقت والتركيز', 'Time and focus'),
        ] },
        { id: 'tried', kind: 'text', optional: true, label: { ar: 'ماذا جرّبت حتى الآن؟', en: 'What have you tried so far?' }, placeholder: { ar: 'باختصار، بكلماتك', en: 'Briefly, in your own words' } },
      ],
    },
    {
      title: { ar: 'إلى أين تريد أن تصل؟', en: 'Where do you want to get to?' },
      questions: [
        { id: 'goals', kind: 'multi', label: { ar: 'أهدافك في 90 يومًا', en: 'Your 90-day goals' }, options: [
          o('launch', 'إطلاق المنتج', 'Launch the product'),
          o('first10', 'أول 10 عملاء', 'First 10 customers'),
          o('mrr', 'إيراد شهري ثابت', 'Steady monthly revenue'),
          o('invest', 'جاهزية للاستثمار', 'Investor-ready'),
          o('plan', 'خطة واضحة أثق بها', 'A clear plan I trust'),
        ] },
        { id: 'dream', kind: 'text', optional: true, label: { ar: 'بعد سنة من الآن، ما الذي يجعلك تقول: نجحت؟', en: 'A year from now, what would make you say “I made it”?' }, placeholder: { ar: 'اكتب ما تتمنّاه فعلًا', en: 'Write what you really want' } },
      ],
    },
    {
      title: { ar: 'ما المتاح لديك؟', en: 'What do you have to work with?' },
      questions: [
        { id: 'time', kind: 'single', label: { ar: 'وقتك للمشروع', en: 'Your time on this' }, options: [
          o('full', 'بدوام كامل', 'Full time'),
          o('side', 'بجانب وظيفتي', 'Alongside my job'),
        ] },
        { id: 'budget', kind: 'single', label: { ar: 'الميزانية', en: 'Budget' }, options: [
          o('none', 'لا توجد ميزانية الآن', 'No budget right now'),
          o('limited', 'محدودة', 'Limited'),
          o('ready', 'جاهز للاستثمار في النمو', 'Ready to invest in growth'),
        ] },
        urgency,
      ],
    },
  ],

  business: [
    {
      title: { ar: 'عرّفنا بشركتك', en: 'Tell us about your company' },
      questions: [
        { id: 'sector', kind: 'single', label: { ar: 'القطاع', en: 'Sector' }, options: sectors },
        { id: 'size', kind: 'single', label: { ar: 'حجم الفريق', en: 'Team size' }, options: [
          o('s1', '1–10', '1–10'), o('s2', '11–50', '11–50'), o('s3', '51–200', '51–200'), o('s4', '+200', '200+'),
        ] },
        { id: 'revenue', kind: 'single', optional: true, label: { ar: 'الإيراد الشهري التقريبي (ر.س)', en: 'Approx. monthly revenue (SAR)' }, options: [
          o('r1', 'أقل من 100 ألف', 'Under 100K'), o('r2', '100 ألف – 500 ألف', '100K–500K'), o('r3', '500 ألف – 2 مليون', '500K–2M'), o('r4', 'أكثر من 2 مليون', 'Over 2M'), o('r0', 'أفضّل ألا أذكر', 'Prefer not to say'),
        ] },
      ],
    },
    {
      title: { ar: 'كيف تصف وضعك بصدق؟', en: 'How would you honestly describe things?' },
      questions: [
        { id: 'stage', kind: 'single', label: { ar: 'الوضع الحالي', en: 'Current situation' }, options: [
          o('struggling', 'نتعثّر ونحتاج تدخّلًا', 'Struggling, we need intervention'),
          o('stable', 'مستقرون، لكن نستطيع أكثر', 'Stable, but capable of more'),
          o('growing', 'ننمو بسرعة، والتشغيل لا يلحق', 'Growing fast, operations can’t keep up'),
        ] },
        { id: 'role', kind: 'single', label: { ar: 'دورك', en: 'Your role' }, options: [
          o('owner', 'مالك', 'Owner'), o('partner', 'شريك', 'Partner'), o('ceo', 'رئيس تنفيذي', 'CEO'), o('manager', 'مدير', 'Manager'),
        ] },
      ],
    },
    {
      title: { ar: 'ما الذي يثقلك؟', en: 'What’s weighing on you?' },
      lede: { ar: 'اختر كل ما ينطبق. كثير من الشركات تختار أكثر من ثلاثة', en: 'Pick all that apply. Most companies pick more than three' },
      questions: [
        { id: 'pains', kind: 'multi', label: { ar: 'التحديات', en: 'Challenges' }, options: [
          o('profit', 'الأرباح لا تتبع المبيعات', 'Profit doesn’t follow sales'),
          o('team', 'الموظفون والأداء', 'Staff and performance'),
          o('ops', 'الخطة التشغيلية', 'The operating plan'),
          o('owner', 'كل شيء يعتمد عليّ', 'Everything depends on me'),
          o('costs', 'التكاليف', 'Costs'),
          o('sales', 'المبيعات والتسويق', 'Sales and marketing'),
          o('cx', 'تجربة العملاء', 'Customer experience'),
          o('expand', 'التوسّع وفتح فروع', 'Expansion and new branches'),
          o('systems', 'غياب الأنظمة والإجراءات', 'No systems or SOPs'),
          o('digital', 'التحوّل الرقمي', 'Going digital'),
        ] },
        { id: 'cost', kind: 'text', optional: true, label: { ar: 'ماذا يكلّفك هذا اليوم؟', en: 'What is this costing you today?' }, placeholder: { ar: 'مالًا، أو وقتًا، أو راحة بال', en: 'Money, time, or peace of mind' } },
      ],
    },
    {
      title: { ar: 'ماذا تريد أن يتغيّر؟', en: 'What do you want to change?' },
      questions: [
        { id: 'goals', kind: 'multi', label: { ar: 'أهدافك', en: 'Your goals' }, options: [
          o('margin', 'رفع الأرباح', 'Higher profit'),
          o('cut', 'خفض التكاليف', 'Lower costs'),
          o('free', 'تشغيل لا يعتمد عليّ', 'A business that runs without me'),
          o('strong', 'فريق أقوى', 'A stronger team'),
          o('scale', 'التوسّع', 'Expansion'),
          o('cxup', 'تجربة عملاء أفضل', 'Better customer experience'),
        ] },
        { id: 'tried', kind: 'text', optional: true, label: { ar: 'ما الذي جرّبتموه ولم ينجح؟', en: 'What have you tried that didn’t work?' }, placeholder: { ar: 'سيساعدنا ألا نكرّره', en: 'So we don’t repeat it' } },
      ],
    },
    {
      title: { ar: 'آخر سؤالين', en: 'Two last questions' },
      questions: [
        urgency,
        { id: 'budget', kind: 'single', label: { ar: 'الاستعداد للاستثمار في الحل', en: 'Readiness to invest in a fix' }, options: [
          o('none', 'لا توجد ميزانية الآن', 'No budget right now'),
          o('limited', 'ميزانية محدودة', 'Limited budget'),
          o('ready', 'جاهزون إذا كان العائد واضحًا', 'Ready if the return is clear'),
        ] },
      ],
    },
  ],

  investor: [
    {
      title: { ar: 'عرّفنا بك', en: 'Tell us about you' },
      questions: [
        { id: 'type', kind: 'single', label: { ar: 'نوع المستثمر', en: 'Investor type' }, options: [
          o('individual', 'مستثمر فرد', 'Individual'),
          o('family', 'مكتب عائلي', 'Family office'),
          o('fund', 'صندوق أو شركة استثمار', 'Fund or investment company'),
        ] },
        { id: 'ticket', kind: 'single', optional: true, label: { ar: 'حجم الاستثمار المعتاد (ر.س)', en: 'Typical ticket size (SAR)' }, options: [
          o('t1', 'أقل من مليون', 'Under 1M'), o('t2', '1 – 5 ملايين', '1–5M'), o('t3', '5 – 20 مليونًا', '5–20M'), o('t4', 'أكثر من 20 مليونًا', 'Over 20M'), o('t0', 'أفضّل ألا أذكر', 'Prefer not to say'),
        ] },
      ],
    },
    {
      title: { ar: 'ما الذي تبحث عنه؟', en: 'What are you looking for?' },
      questions: [
        { id: 'stage', kind: 'single', label: { ar: 'تركيزك الآن', en: 'Your focus now' }, options: [
          o('new', 'فرص جديدة', 'New opportunities'),
          o('manage', 'إدارة استثمارات قائمة', 'Managing existing investments'),
          o('evaluate', 'تقييم فرصة محددة', 'Evaluating a specific deal'),
          o('operate', 'تشغيل أصل أملكه', 'Operating an asset I own'),
        ] },
        { id: 'sectors', kind: 'multi', optional: true, label: { ar: 'القطاعات التي تهمّك', en: 'Sectors of interest' }, options: sectors },
      ],
    },
    {
      title: { ar: 'ما الذي يقلقك؟', en: 'What concerns you?' },
      questions: [
        { id: 'pains', kind: 'multi', label: { ar: 'التحديات', en: 'Challenges' }, options: [
          o('read', 'صعوبة قراءة الفرص بصدق', 'Hard to read deals honestly'),
          o('under', 'استثمار قائم أداؤه أقل من المتوقع', 'An investment underperforming'),
          o('report', 'غياب تقارير واضحة', 'No clear reporting'),
          o('operate', 'إدارة الأصل وتشغيله', 'Running the asset day to day'),
          o('sourcing', 'قلة الفرص الجيدة', 'Too few good deals'),
          o('time', 'لا وقت للمتابعة', 'No time to follow up'),
        ] },
        { id: 'horizon', kind: 'single', label: { ar: 'الأفق الزمني', en: 'Time horizon' }, options: [
          o('h1', 'أقل من سنة', 'Under a year'), o('h2', '1 – 3 سنوات', '1–3 years'), o('h3', 'أكثر من 3 سنوات', '3+ years'),
        ] },
      ],
    },
    {
      title: { ar: 'إلى أين؟', en: 'Where to?' },
      questions: [
        { id: 'goals', kind: 'multi', label: { ar: 'ما تريده من استثماراتك', en: 'What you want from your investments' }, options: [
          o('yield', 'عائد أعلى', 'Higher returns'),
          o('safety', 'حماية رأس المال', 'Capital protection'),
          o('clarity', 'وضوح وتقارير منتظمة', 'Clarity and regular reporting'),
          o('diversify', 'تنويع', 'Diversification'),
          o('handsoff', 'استثمار لا يحتاج وقتي', 'Hands-off investing'),
        ] },
        { id: 'deal', kind: 'text', optional: true, label: { ar: 'هل لديك فرصة محددة تفكّر فيها الآن؟', en: 'Is there a specific deal on your mind right now?' }, placeholder: { ar: 'وصف قصير يكفي', en: 'A short description is enough' } },
        urgency,
      ],
    },
  ],
}

export function stepsFor(persona: Persona, lang: Lang): Step[] {
  return defs[persona].map((s) => ({
    title: s.title[lang],
    lede: s.lede?.[lang],
    questions: s.questions.map((q) => ({
      id: q.id,
      kind: q.kind,
      label: q.label[lang],
      hint: q.hint?.[lang],
      optional: q.optional,
      placeholder: q.placeholder?.[lang],
      options: q.options?.map((op) => ({ id: op.id, label: op[lang] })),
    })),
  }))
}

export function optionLabel(persona: Persona, qid: string, id: string, lang: Lang): string {
  for (const s of defs[persona]) for (const q of s.questions) if (q.id === qid) {
    const hit = q.options?.find((x) => x.id === id)
    if (hit) return hit[lang]
  }
  return id
}

// ---- recommendations ----
export type ServiceId = 'diagnosis' | 'strategy' | 'gtm' | 'ops' | 'mystery' | 'training' | 'digital' | 'ai' | 'invest' | 'turnaround'

export const serviceNames: Record<ServiceId, T> = {
  diagnosis: { ar: 'التشخيص الشامل', en: 'Full diagnosis' },
  strategy: { ar: 'الاستراتيجية ونموذج العمل', en: 'Strategy & business model' },
  gtm: { ar: 'دخول السوق (GTM)', en: 'Go-to-market' },
  ops: { ar: 'تحسين العمليات والإجراءات (SOPs)', en: 'Operations & SOPs' },
  mystery: { ar: 'المتسوق الخفي', en: 'Mystery Shopper' },
  training: { ar: 'تدريب الفريق', en: 'Team training' },
  digital: { ar: 'الحلول الرقمية', en: 'Digital tools' },
  ai: { ar: 'الذكاء الاصطناعي في التشغيل', en: 'AI in operations' },
  invest: { ar: 'الاستشارات الاستثمارية وإدارة الفرص', en: 'Investment advisory & deal management' },
  turnaround: { ar: 'خطة إنقاذ وتثبيت', en: 'Turnaround & stabilisation' },
}

const painToService: Record<string, ServiceId[]> = {
  start: ['strategy'], model: ['strategy'], gtm: ['gtm'], customers: ['gtm', 'digital'], pricing: ['strategy'],
  funding: ['strategy', 'invest'], focus: ['ops', 'ai'],
  profit: ['diagnosis', 'ops'], team: ['training', 'ops'], ops: ['ops'], owner: ['ops', 'ai'], costs: ['ops', 'ai'],
  sales: ['gtm', 'mystery'], cx: ['mystery', 'training'], expand: ['strategy', 'ops'], systems: ['ops', 'digital'], digital: ['digital', 'ai'],
  read: ['invest'], under: ['invest', 'diagnosis'], report: ['digital', 'invest'], operate: ['ops', 'invest'], sourcing: ['invest'], time: ['ai', 'invest'],
}

export interface Answers { [qid: string]: string | string[] | number | undefined }

export function recommend(persona: Persona, a: Answers): { primary: ServiceId; also: ServiceId[] } {
  const score = new Map<ServiceId, number>()
  const add = (s: ServiceId, w: number) => score.set(s, (score.get(s) ?? 0) + w)
  const pains = (a.pains as string[] | undefined) ?? []
  pains.forEach((p, i) => (painToService[p] ?? []).forEach((s, j) => add(s, 3 - Math.min(i, 2) * 0.5 - j)))
  if (persona === 'business' && a.stage === 'struggling') add('turnaround', 6)
  if (persona === 'business' && a.stage === 'growing') add('ops', 2)
  if (persona === 'founder' && (a.stage === 'idea' || a.stage === 'mvp')) add('strategy', 3)
  if (persona === 'founder' && a.stage === 'launched') add('gtm', 3)
  if (persona === 'investor') add('invest', 5)
  const ranked = [...score.entries()].sort((x, y) => y[1] - x[1]).map(([s]) => s)
  const primary = ranked[0] ?? (persona === 'investor' ? 'invest' : persona === 'founder' ? 'strategy' : 'diagnosis')
  const also = ranked.filter((s) => s !== primary).slice(0, 3)
  if (!also.includes('diagnosis') && primary !== 'diagnosis' && also.length < 3) also.push('diagnosis')
  return { primary, also }
}

/** Internal lead read for KON (goes in the brief, not shown as a score to the visitor). */
export function leadRead(a: Answers): { fit: 'high' | 'medium' | 'low'; urgency: number } {
  const urgencyN = typeof a.urgency === 'number' ? a.urgency : 3
  let pts = urgencyN
  if (a.budget === 'ready') pts += 3
  else if (a.budget === 'limited') pts += 1
  if (['r3', 'r4', 't3', 't4'].includes(String(a.revenue ?? a.ticket))) pts += 2
  pts += Math.min(3, ((a.pains as string[] | undefined) ?? []).length)
  return { fit: pts >= 9 ? 'high' : pts >= 6 ? 'medium' : 'low', urgency: urgencyN }
}
