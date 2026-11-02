// KON Talent: two short flows (people with talent, companies looking for talent) and the rules
// that turn a person's answers into a first "talent read". Option ids are shared across
// languages so answers survive a language switch. Everything runs client-side.
import type { Lang, Step } from './site'

export type TalentSide = 'talent' | 'company'

type T = { ar: string; en: string }
type Opt = { id: string } & T
interface QDef { id: string; kind: 'single' | 'multi' | 'text' | 'scale'; label: T; optional?: boolean; max?: number; placeholder?: T; options?: Opt[] }
interface StepDef { title: T; lede?: T; questions: QDef[] }

const o = (id: string, ar: string, en: string): Opt => ({ id, ar, en })

/** KON's eight business dimensions, used to say where a person adds value and what a company needs. */
export type Dim = 'strategy' | 'revenue' | 'marketing' | 'ops' | 'people' | 'finance' | 'cx' | 'tech'
export const dims: Record<Dim, T> = {
  strategy: { ar: 'الاستراتيجية', en: 'Strategy' },
  revenue: { ar: 'المبيعات والإيرادات', en: 'Sales & revenue' },
  marketing: { ar: 'التسويق والعلامة', en: 'Marketing & brand' },
  ops: { ar: 'التشغيل', en: 'Operations' },
  people: { ar: 'الفريق والناس', en: 'People & teams' },
  finance: { ar: 'المالية', en: 'Finance' },
  cx: { ar: 'تجربة العملاء', en: 'Customer experience' },
  tech: { ar: 'التقنية', en: 'Technology' },
}
const dimOpts: Opt[] = (Object.keys(dims) as Dim[]).map((d) => o(d, dims[d].ar, dims[d].en))

const sectors: Opt[] = [
  o('fnb', 'مطاعم ومقاهٍ وأغذية', 'Food, cafés & restaurants'),
  o('retail', 'تجزئة ومتاجر', 'Retail & stores'),
  o('realestate', 'عقار', 'Real estate'),
  o('hospitality', 'ضيافة وترفيه وفعاليات', 'Hospitality, entertainment & events'),
  o('services', 'خدمات مهنية', 'Professional services'),
  o('tech', 'تقنية وتطبيقات', 'Tech & apps'),
  o('industry', 'صناعة وسلاسل إمداد', 'Industry & supply chain'),
  o('health', 'صحة وتعليم', 'Health & education'),
]

const defs: Record<TalentSide, StepDef[]> = {
  talent: [
    {
      title: { ar: 'أين أنت الآن؟', en: 'Where are you right now?' },
      questions: [
        { id: 'now', kind: 'single', label: { ar: 'وضعك اليوم', en: 'Your situation today' }, options: [
          o('student', 'أدرس', 'Studying'),
          o('grad', 'تخرّجت وأبحث عن بدايتي', 'Graduated, looking for my start'),
          o('under', 'أعمل، لكن قدراتي أكبر من دوري', 'Working, but I’m capable of more than my role'),
          o('free', 'أعمل حرًّا', 'Freelancing'),
          o('between', 'بين عملين', 'Between jobs'),
          o('switch', 'أريد أن أغيّر مساري', 'Changing direction'),
          o('own', 'أبني مشروعي الخاص', 'Building my own thing'),
        ] },
        { id: 'sectors', kind: 'multi', optional: true, label: { ar: 'مجالات تشدّك', en: 'Fields that pull you in' }, options: sectors },
      ],
    },
    {
      title: { ar: 'ما الذي يأتيك بسهولة؟', en: 'What comes easily to you?' },
      lede: { ar: 'اختر ثلاثة على الأكثر. ما تفعله دون جهد، ويتعب فيه غيرك، غالبًا هو موهبتك', en: 'Pick up to three. What you do without effort, while others struggle, is usually your talent' },
      questions: [
        { id: 'strengths', kind: 'multi', max: 3, label: { ar: 'نقاط قوتك', en: 'Your strengths' }, options: [
          o('fix', 'أحلّ المشكلات التي يتجنّبها الآخرون', 'I fix the problems others avoid'),
          o('order', 'أحوّل الفوضى إلى نظام', 'I turn chaos into a system'),
          o('persuade', 'أقنع الناس وأبيع الفكرة', 'I persuade people and sell ideas'),
          o('connect', 'أعرف الناس وأوصلهم ببعض', 'I know people and connect them'),
          o('create', 'أصمّم وأبتكر', 'I design and create'),
          o('words', 'أكتب وأحكي القصص', 'I write and tell stories'),
          o('numbers', 'أفهم الأرقام وما وراءها', 'I read numbers and what’s behind them'),
          o('tech', 'أبني بالتقنية، أو أتعلّمها بسرعة', 'I build with tech, or learn it fast'),
          o('teach', 'أشرح فيفهم الناس', 'I explain so people get it'),
          o('care', 'أُشعر الناس بالاهتمام', 'I make people feel looked after'),
          o('lead', 'يتبعني الناس حين تصعب الأمور', 'People follow me when things get hard'),
          o('detail', 'ألاحظ ما يفوت الجميع', 'I notice what everyone misses'),
        ] },
        { id: 'askedFor', kind: 'text', optional: true, label: { ar: 'ما الذي يطلبه منك الناس دائمًا؟', en: 'What do people always come to you for?' }, placeholder: { ar: 'حتى لو بدا لك أمرًا عاديًا', en: 'Even if it feels ordinary to you' } },
      ],
    },
    {
      title: { ar: 'أرِنا، لا تخبرنا', en: 'Show us, don’t tell us' },
      lede: { ar: 'هنا نرى ما لا تقوله السيرة الذاتية', en: 'This is where we see what a CV can’t say' },
      questions: [
        { id: 'proof', kind: 'text', label: { ar: 'احكِ لنا عن شيء صنعته، أو حللته، أو حسّنته. حتى لو لم يطلبه منك أحد', en: 'Tell us about something you built, solved or improved. Even if nobody asked you to' }, placeholder: { ar: 'ماذا كان الوضع؟ ماذا فعلت؟ ماذا تغيّر؟', en: 'What was the situation? What did you do? What changed?' } },
        { id: 'flow', kind: 'text', optional: true, label: { ar: 'متى تنسى الوقت وأنت تعمل؟', en: 'When do you lose track of time while working?' }, placeholder: { ar: 'جملة واحدة تكفي', en: 'One sentence is enough' } },
        { id: 'link', kind: 'text', optional: true, label: { ar: 'رابط لعمل لك', en: 'A link to your work' }, placeholder: { ar: 'معرض أعمال، أو حساب، أو LinkedIn', en: 'Portfolio, profile, or LinkedIn' } },
      ],
    },
    {
      title: { ar: 'ما الذي لم يُتح لك بعد؟', en: 'What hasn’t been open to you yet?' },
      lede: { ar: 'ليس عيبًا فيك. وهذا تحديدًا ما نريد أن نعرفه', en: 'It isn’t a flaw in you. It’s exactly what we want to know' },
      questions: [
        { id: 'barriers', kind: 'multi', optional: true, label: { ar: 'اختر ما ينطبق', en: 'Pick what applies' }, options: [
          o('paper', 'لا شهادة أو خبرة رسمية في المجال الذي أجيده', 'No degree or formal experience in what I’m good at'),
          o('network', 'لا أعرف أحدًا في المكان الصحيح', 'I don’t know anyone in the right place'),
          o('chance', 'لم يمنحني أحد الفرصة بعد', 'Nobody has given me the chance yet'),
          o('pitch', 'لا أعرف كيف أقدّم نفسي', 'I don’t know how to present myself'),
          o('place', 'الفرص بعيدة عن مدينتي', 'The opportunities are far from my city'),
          o('time', 'ظروفي لا تسمح بدوام كامل', 'My circumstances don’t allow full time'),
        ] },
      ],
    },
    {
      title: { ar: 'كيف نعمل معًا؟', en: 'How should we work together?' },
      questions: [
        { id: 'intent', kind: 'multi', label: { ar: 'ما الذي تريده', en: 'What you want' }, options: [
          o('collab', 'أن أعمل مع KON في مشاريع', 'To work with KON on projects'),
          o('match', 'أن ترشّحوني لشركة تناسبني', 'To be put forward to a company that fits me'),
          o('grow', 'أن أتعلّم وأنمو بجانبكم', 'To learn and grow alongside you'),
        ] },
        { id: 'avail', kind: 'single', label: { ar: 'وقتك المتاح', en: 'Your availability' }, options: [
          o('full', 'دوام كامل', 'Full time'),
          o('part', 'دوام جزئي', 'Part time'),
          o('project', 'بالمشروع', 'Project by project'),
          o('weekend', 'مساءً أو في نهاية الأسبوع', 'Evenings or weekends'),
        ] },
        { id: 'mode', kind: 'single', optional: true, label: { ar: 'طريقة العمل', en: 'Way of working' }, options: [
          o('onsite', 'حضوري', 'On site'), o('remote', 'عن بُعد', 'Remote'), o('hybrid', 'مزيج', 'Hybrid'), o('any', 'أيّها', 'Any'),
        ] },
      ],
    },
  ],

  company: [
    {
      title: { ar: 'عرّفنا بشركتك', en: 'Tell us about your company' },
      questions: [
        { id: 'sector', kind: 'single', label: { ar: 'القطاع', en: 'Sector' }, options: sectors },
        { id: 'size', kind: 'single', label: { ar: 'حجم الفريق', en: 'Team size' }, options: [
          o('s1', '1–10', '1–10'), o('s2', '11–50', '11–50'), o('s3', '51–200', '51–200'), o('s4', '+200', '200+'),
        ] },
      ],
    },
    {
      title: { ar: 'من تبحثون عنه؟', en: 'Who are you looking for?' },
      questions: [
        { id: 'areas', kind: 'multi', label: { ar: 'في أي مجال؟', en: 'In which area?' }, options: dimOpts },
        { id: 'role', kind: 'text', optional: true, label: { ar: 'الدور بكلماتكم', en: 'The role, in your words' }, placeholder: { ar: 'مثال: مشرف فرع يرفع المبيعات', en: 'e.g. a branch lead who lifts sales' } },
        { id: 'type', kind: 'single', label: { ar: 'نوع الارتباط', en: 'Type of engagement' }, options: [
          o('full', 'دوام كامل', 'Full time'),
          o('part', 'دوام جزئي', 'Part time'),
          o('project', 'مشروع محدد', 'A specific project'),
          o('trainee', 'تدريب ينتهي بالتوظيف', 'Training that leads to a hire'),
        ] },
        { id: 'count', kind: 'single', optional: true, label: { ar: 'كم شخصًا؟', en: 'How many people?' }, options: [
          o('c1', 'شخص واحد', 'One'), o('c2', '2–5', '2–5'), o('c3', '+6', '6+'),
        ] },
      ],
    },
    {
      title: { ar: 'ما الذي لم ينجح في التوظيف؟', en: 'What hasn’t worked in hiring?' },
      lede: { ar: 'اختر كل ما ينطبق', en: 'Pick all that apply' },
      questions: [
        { id: 'pains', kind: 'multi', label: { ar: 'التحديات', en: 'Challenges' }, options: [
          o('cv', 'سير ذاتية لامعة، وأداء لا يشبهها', 'Shiny CVs, performance that doesn’t match'),
          o('slow', 'التوظيف يأخذ وقتًا طويلًا', 'Hiring takes too long'),
          o('leave', 'الجيدون لا يبقون', 'The good ones don’t stay'),
          o('cost', 'الخبرات العالية خارج ميزانيتنا', 'Senior talent is out of our budget'),
          o('local', 'صعوبة إيجاد كفاءات وطنية مناسبة', 'Hard to find the right national talent'),
          o('culture', 'لا يناسبون ثقافة فريقنا', 'They don’t fit our team culture'),
          o('unclear', 'لسنا متأكدين ما الدور الذي نحتاجه فعلًا', 'We’re not sure what role we really need'),
        ] },
      ],
    },
    {
      title: { ar: 'كيف يبدو الشخص الصحيح؟', en: 'What does the right person look like?' },
      questions: [
        { id: 'traits', kind: 'multi', max: 3, label: { ar: 'أهم ثلاث صفات', en: 'The three traits that matter most' }, options: [
          o('own', 'يتحمّل المسؤولية', 'Takes ownership'),
          o('learn', 'يتعلّم بسرعة', 'Learns fast'),
          o('people', 'يجيد التعامل مع الناس', 'Good with people'),
          o('calm', 'هادئ تحت الضغط', 'Calm under pressure'),
          o('initiative', 'يبادر دون أن يُطلب منه', 'Acts without being asked'),
          o('honest', 'واضح وأمين', 'Straight and honest'),
        ] },
        { id: 'success', kind: 'text', optional: true, label: { ar: 'بعد 90 يومًا، ما الذي يجعلكم تقولون: هذا هو الشخص الصحيح؟', en: 'After 90 days, what would make you say “this is the right person”?' }, placeholder: { ar: 'نتيجة واحدة واضحة تكفي', en: 'One clear result is enough' } },
        { id: 'open', kind: 'single', label: { ar: 'هل تقبلون شخصًا بلا شهادة أو خبرة رسمية، إذا أثبت قدرته بعمل حقيقي؟', en: 'Would you take someone without a degree or formal experience, if they prove themselves with real work?' }, options: [
          o('yes', 'نعم', 'Yes'), o('depends', 'حسب الدور', 'Depends on the role'), o('no', 'لا', 'No'),
        ] },
        { id: 'urgency', kind: 'scale', label: { ar: 'كم تحتاجونه الآن؟', en: 'How soon do you need them?' } },
      ],
    },
  ],
}

export function talentSteps(side: TalentSide, lang: Lang): Step[] {
  return defs[side].map((s) => ({
    title: s.title[lang],
    lede: s.lede?.[lang],
    questions: s.questions.map((q) => ({
      id: q.id,
      kind: q.kind,
      label: q.label[lang],
      optional: q.optional,
      max: q.max,
      placeholder: q.placeholder?.[lang],
      options: q.options?.map((op) => ({ id: op.id, label: op[lang] })),
    })),
  }))
}

export function talentOption(side: TalentSide, qid: string, id: string, lang: Lang): string {
  for (const s of defs[side]) for (const q of s.questions) if (q.id === qid) {
    const hit = q.options?.find((x) => x.id === id)
    if (hit) return hit[lang]
  }
  return id
}

// ---- the talent read ----
// Strengths cluster into archetypes. Each archetype says, in plain words, where that person
// creates value, and which of KON's eight dimensions it feeds. Rule-based, not an AI model.
export type Archetype = 'solver' | 'builder' | 'connector' | 'creator' | 'analyst' | 'maker' | 'developer' | 'host' | 'leader'

export const archetypes: Record<Archetype, { name: T; where: T; dims: Dim[] }> = {
  solver: {
    name: { ar: 'مفكّك المشكلات', en: 'The Problem-solver' },
    where: { ar: 'تضيف قيمة حيث تتعطّل الأمور ولا يعرف أحد لماذا', en: 'You add value where things break and nobody knows why' },
    dims: ['strategy', 'ops'],
  },
  builder: {
    name: { ar: 'صانع الأنظمة', en: 'The Systems-builder' },
    where: { ar: 'تضيف قيمة حيث الفوضى، وحيث يجب أن يستمر العمل دون أن يعتمد على شخص', en: 'You add value where there’s chaos, and work must run without depending on one person' },
    dims: ['ops'],
  },
  connector: {
    name: { ar: 'صانع العلاقات', en: 'The Connector' },
    where: { ar: 'تضيف قيمة حيث تحتاج الشركة عملاء جددًا وشراكات تفتح الأبواب', en: 'You add value where a company needs new customers and partnerships that open doors' },
    dims: ['revenue', 'marketing'],
  },
  creator: {
    name: { ar: 'المبدع', en: 'The Creator' },
    where: { ar: 'تضيف قيمة حيث تحتاج العلامة أن تُرى، وتُفهم، وتُتذكّر', en: 'You add value where a brand needs to be seen, understood and remembered' },
    dims: ['marketing', 'cx'],
  },
  analyst: {
    name: { ar: 'قارئ الأرقام', en: 'The Analyst' },
    where: { ar: 'تضيف قيمة حيث تُتّخذ قرارات كبيرة دون أرقام واضحة', en: 'You add value where big decisions are made without clear numbers' },
    dims: ['finance', 'strategy'],
  },
  maker: {
    name: { ar: 'الباني', en: 'The Maker' },
    where: { ar: 'تضيف قيمة حيث ما زال العمل يدويًا، ويمكن أن يصبح أذكى', en: 'You add value where work is still manual and could be smarter' },
    dims: ['tech', 'ops'],
  },
  developer: {
    name: { ar: 'مطوّر الناس', en: 'The People-developer' },
    where: { ar: 'تضيف قيمة حيث يحتاج الفريق أن يتعلّم، وينمو، ويثبت', en: 'You add value where a team needs to learn, grow and stay' },
    dims: ['people'],
  },
  host: {
    name: { ar: 'المضيف', en: 'The Host' },
    where: { ar: 'تضيف قيمة في اللحظة التي يقرّر فيها العميل: هل يعود أم لا', en: 'You add value in the moment a customer decides whether to come back' },
    dims: ['cx'],
  },
  leader: {
    name: { ar: 'القائد', en: 'The Leader' },
    where: { ar: 'تضيف قيمة حيث يحتاج فريق إلى من يحمله في الأيام الصعبة', en: 'You add value where a team needs someone to carry it through hard days' },
    dims: ['people', 'ops'],
  },
}

const strengthTo: Record<string, Archetype[]> = {
  fix: ['solver'], order: ['builder'], persuade: ['connector'], connect: ['connector'],
  create: ['creator'], words: ['creator'], numbers: ['analyst'], tech: ['maker'],
  teach: ['developer'], care: ['host'], lead: ['leader'], detail: ['analyst', 'builder'],
}

/** Top one or two archetypes plus the dimensions they feed, in order of strength. */
export function talentRead(a: Record<string, unknown>): { top: Archetype[]; dims: Dim[] } {
  const picked = (a.strengths as string[] | undefined) ?? []
  const score = new Map<Archetype, number>()
  picked.forEach((s, i) => (strengthTo[s] ?? []).forEach((k, j) => score.set(k, (score.get(k) ?? 0) + 3 - i * 0.4 - j)))
  const top = [...score.entries()].sort((x, y) => y[1] - x[1]).map(([k]) => k).slice(0, 2)
  const out: Dim[] = []
  top.forEach((k) => archetypes[k].dims.forEach((d) => !out.includes(d) && out.push(d)))
  return { top, dims: out }
}
