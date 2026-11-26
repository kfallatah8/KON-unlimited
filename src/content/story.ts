// KON Story (2026-11-26): the chapters that turn the homepage into one connected story, plus the
// three company packages. Arabic first. Every chapter has a deep line (for the expert reader) and a
// «بالمختصر» line (for anyone). Prices: SAR per month, from the Master Plan tiers (نواة / نمو / شريك).
// CONFIRM (khalid): package contents, prices, the 50k in-house team estimate, ميزان كُن name, payment by link.
import { useStore } from '../state/store'

export const STORY_TERMS = [
  { months: 3, mult: 1.12 },
  { months: 6, mult: 1 },
  { months: 12, mult: 1 },
] as const

// A starter in-house BD team, Riyadh, monthly (sources in the thread, 2026-11-26):
// BD manager ~22,000 (Glassdoor Riyadh median), business analyst ~12,000 (Payscale/Talentup 10-14.4k),
// sales & marketing coordinator ~8,000 (Payscale/Zerotax 5-12.5k) = 42,000 salaries,
// + ~20% employer costs (GOSI ~12-14%, end-of-service accrual ~4%, medical insurance) ≈ 50,000.
export const TEAM_COST = 50000
/** Hours in an average month (365 / 12 × 24), so "per hour" and "per day" use the same clock for both sides. */
export const MONTH_HOURS = 730
export const MONTH_DAYS = 30.4

export interface StoryTier {
  id: 'core' | 'growth' | 'partner'
  name: string
  mode: string
  price: number
  minMonths?: number
  tag?: string
  plus?: string
  line: string
  hours: string
  forWho: string
  pains: string[]
  gets: string[]
}

const ar = {
  plainK: 'بالمختصر',

  idea: {
    eyebrow: 'الفكرة',
    title: 'وش يعني تطوير الأعمال فعلًا؟',
    lede: 'أغلب الناس يعرفونه بثلاث صور، وكل وحدة فيها جزء من الحقيقة',
    mythK: 'الفكرة الشائعة',
    truthK: 'الصورة الكاملة',
    myths: [
      { myth: 'كلام استشاري على ورق', truth: 'الورق بداية بس، الشغل الحقيقي في الميدان مع فريقك لين يتغيّر السلوك ويتحرك الرقم' },
      { myth: 'يوصّل شركة بشركة', truth: 'الشراكة باب واحد من أبواب كثيرة، والتطوير يشوف البيت كله' },
      { myth: 'مندوب يجيب عقود', truth: 'هذي مبيعات، والمبيعات جزء مهم من الصورة، مو الصورة كلها' },
    ],
    defK: 'التعريف عندنا',
    def: 'تطوير الأعمال هو رفع **إنتاجية الشركة وأدائها كنظام واحد**: الإنسان والإجراء والسوق، وكل واحد منها يأثّر في الثاني',
    plain: 'نفس شركتك، بنفس ناسك، تطلع ربح أكثر بتعب أقل',
  },

  gaps: {
    eyebrow: 'الفجوات',
    title: 'الربح ما يختفي، يتسرّب من فجوات ما أحد انتبه لها',
    lede: 'نقرأ شركتك من جهتين: **من الداخل** حيث ينصنع الشغل، **ومن الخارج** حيث ينكسب العميل',
    wall: 'جدار شركتك',
    inside: {
      k: 'من الداخل',
      items: [
        { t: 'الناس', b: 'موظف في غير مكانه، أو طاقة تضيع في ضغط ما له داعي' },
        { t: 'الإجراءات', b: 'خطوات تتكرر، وشغل يوقف إذا غاب شخص واحد' },
        { t: 'التكاليف', b: 'مصاريف تطلع كل شهر وما أحد يسأل عنها' },
        { t: 'القرار', b: 'قرارات مبنية على الإحساس بدل الرقم' },
      ],
    },
    outside: {
      k: 'من الخارج',
      items: [
        { t: 'قنوات البيع', b: 'قنوات ما جرّبتها، أو قناة تاخذ عمولة أكبر من قيمتها' },
        { t: 'التسويق', b: 'رسالة تكلّم الكل، فما توصل لأحد' },
        { t: 'التواصل', b: 'عميل سأل وما أحد ردّ، وعرض سعر ما أحد تابعه' },
        { t: 'الشراكات', b: 'علاقات وأصول عندك تقدر تصير مصدر دخل جديد' },
      ],
    },
    plain: 'نلقى وين يضيع ريالك، داخل الشركة وبرّاها، ونرجّعه لك',
  },

  mix: {
    eyebrow: 'المزيج',
    title: 'ثلاث خبرات قليل تجتمع في مكان واحد',
    lede: 'الشركة تشتغل بالأرقام، لكن اللي يحرّك الأرقام **بشر**، عشان كذا نشتغل بثلاث عدسات مع بعض',
    center: 'كُن',
    lenses: [
      { k: 'التشغيل', b: 'نرتّب كيف يمشي الشغل يوم بيوم: أدوار واضحة، إجراءات مكتوبة، ومؤشرات أداء تنقاس' },
      { k: 'علم النفس', b: 'نفهم ليش يشتري العميل وليش يتردد الموظف، فنوصل للسبب مو بس للعَرَض' },
      { k: 'الابتكار', b: 'ولما ما يكفي الموجود، نبني الأداة أو النظام أو مصدر الدخل اللي ناقصك' },
    ],
    outK: 'ووش يتغيّر عندك؟',
    outcomes: [
      { t: 'إنتاجية أعلى', b: 'نفس الفريق يخلّص شغل أكثر بجهد أقل' },
      { t: 'مخاطر أقل', b: 'تشوف المشكلة قبل ما تصير خسارة' },
      { t: 'قرار أسهل', b: 'رقم واضح قدامك بدل التخمين' },
      { t: 'دخل من أكثر من باب', b: 'ما يعتمد رزقك على قناة وحدة' },
      { t: 'نمو يكمّل', b: 'نظام يمشي حتى بعد ما نطلع' },
    ],
    plain: 'نفهم الإنسان، نرتّب الشغل، ونبتكر الجديد',
  },

  how: {
    measureK: 'وكيف نقيس؟',
    measureTitle: 'الأثر عندنا ثلاثة أرقام بس',
    measure: [
      { n: '01', t: 'ريال وفّرناه' },
      { n: '02', t: 'ريال كسبناه' },
      { n: '03', t: 'كم رجع لك كل ريال دفعته' },
    ],
    measureFoot: 'وجنبها صحة فريقك: الوضوح والانسجام والطاقة، لأن النمو اللي يكسر الناس ما ينحسب نمو',
    plain: 'جلسة، بعدها قراءة، بعدها شغل على الأرض، وكل شهر تشوف الأثر بالريال',
  },


  plans: {
    eyebrow: 'طريقة التعاون',
    title: 'قسم تطوير أعمال كامل، بدون ما توظّفه',
    lede: 'اختر اللي يناسب شركتك: **اشتراك شهري** بقسم يشتغل معك عن بُعد أو حضوريًا، أو **شراكة نتائج** ما ناخذ فيها نسبة إلا ++بعد ما يدخل الريال جيبك++',
    tabs: { monthly: 'باقات القسم الشهرية', results: 'شراكة النتائج' },
    every: 'في كل باقة',
    everyItems: ['تقرير أثر شهري بالريال', 'لوحة أرقام تتحدّث كل أسبوع', 'خط مباشر مع الفريق على الواتساب', 'كل شي مكتوب: الهدف والمدة وطريقة القياس'],
    term: 'مدة العقد',
    months: (n: number) => (n === 12 ? 'سنة' : `${n} أشهر`),
    termNotes: ['الإعداد على مدة أقصر', 'السعر الأساسي', 'نفس السعر + مزايا'],
    perks12: 'مع عقد السنة: تثبيت السعر سنتين، «قراءة كُن» هدية، وإيقاف مؤقت 30 يوم متى احتجت',
    notOn3: 'تبدأ من 6 أشهر',
    perMonth: 'ريال شهريًا',
    total: (n: string, m: number) => `${n} ريال على ${m === 12 ? '12 شهر' : `${m} أشهر`}، تدفعها شهريًا`,
    forWho: 'تناسب',
    pains: 'لو هذا وضعك',
    gets: 'وش يسوي القسم لك',
    pick: (name: string) => `اشترك في ${name}`,
    seats: 'نستقبل عدد محدود من الشركات في كل باقة، عشان الجودة ما تنزل',
    perHour: (h: string, d: string) => `يعني ${h} ريال في الساعة · ${d} ريال في اليوم`,
    vsTeam: (h: string) => `فريق موظّفين يكلّفك ${h} ريال في الساعة`,
    save: (n: string, pct: number) => `توفّر ${n} ريال كل شهر (${pct}%)`,
    team: {
      k: 'لو وظّفت فريق تطوير مبدئي بنفسك',
      total: 'حوالي 50,000 ريال شهريًا',
      roles: [
        { r: 'مدير تطوير أعمال', n: '22,000' },
        { r: 'محلل أعمال وبيانات', n: '12,000' },
        { r: 'منسّق مبيعات وتسويق', n: '8,000' },
        { r: 'تأمينات ومكافأة نهاية خدمة وتأمين طبي', n: '8,000' },
      ],
      foot: 'وقبلها شهرين أو ثلاثة توظيف وتدريب، والراتب يمشي حتى لو ما تحرّك الرقم',
      src: 'متوسطات رواتب الرياض من Glassdoor وPayscale (2025)، وتختلف حسب الخبرة',
    },
    payNote: 'تدفع شهريًا أو كل 3 أشهر أو سنة مقدّمًا · الأسعار قبل ضريبة القيمة المضافة · نخرج بإشعار 60 يوم بعد الشهر الثالث',
    tiers: [
      {
        id: 'core', name: 'نواة', mode: 'عن بُعد', price: 8800,
        line: 'قسم تطوير يرتّب بيتك من الداخل',
        hours: '4 ساعات مع خالد + 20 ساعة عمل من الفريق كل شهر',
        forWho: 'شركة مستقرة من 10 إلى 50 موظف',
        pains: ['المبيعات زينة والربح ما يتحرك', 'كل شي يرجع لك أنت', 'ما فيه إجراءات مكتوبة'],
        gets: ['قراءة كاملة للشركة في الشهر الأول وخطة 90 يوم', 'مكسب سريع واحد كل 3 أشهر تشوفه في أرقامك', 'إجراءين مكتوبين (SOP) كل شهر', 'اجتماع متابعة كل أسبوعين'],
      },
      {
        id: 'growth', name: 'نمو', mode: 'عن بُعد + زيارة ميدانية', price: 18500, tag: 'الأنسب لأغلب الشركات',
        line: 'قسم تطوير يشتغل على الداخل والسوق مع بعض',
        hours: '8 ساعات مع خالد + 50 ساعة عمل من الفريق كل شهر',
        forWho: 'شركة تنمو أو عندها فروع، من 50 إلى 200 موظف',
        pains: ['كل فرع جديد يكسر شي كان شغّال', 'فريق كبير وأداء متفاوت', 'عملاء يجون مرة وما يرجعون'],
        gets: ['كل اللي في نواة', 'نشتغل على قنوات البيع: عروض أسعار متروكة، عملاء ما رجعوا، وتسرّب في المبيعات', 'زيارة ميدانية كل شهر وتدريب الفريق على البيع والخدمة', 'متسوّق خفي كل 3 أشهر ومعايير لكل وردية'],
      },
      {
        id: 'partner', name: 'شريك', mode: 'حضوري كل أسبوع', price: 34000, minMonths: 6,
        plus: '+ 10% من الربح الإضافي الموثّق، بحد أعلى يساوي الاشتراك الشهري',
        line: 'قسم تطوير كامل داخل شركتك، ويتحمّل النتيجة معك',
        hours: '14 ساعة مع خالد + 110 ساعات عمل من الفريق كل شهر',
        forWho: 'شركة تتوسع أو تدخل سوق جديد',
        pains: ['تحتاج قسم كامل وتكلفة توظيفه عالية', 'تتوسع لمدينة أو سوق جديد', 'تبي أحد يشيل النتيجة معك'],
        gets: ['كل اللي في نمو', 'يوم عمل حضوري كل أسبوع داخل شركتك', 'شراكات ومصدر دخل جديد نبنيه معك', 'اجتماعات مؤهلة مع عملاء وشركاء محتملين'],
      },
    ] as StoryTier[],
    results: {
      title: 'ما نكسب إلا لما تكسب',
      lede: 'نقرأ بياناتك، نتفق على رقم البداية، نشتغل، وبعدها ناخذ نسبة من **الفرق اللي يظهر في نظامك أنت** فقط',
      steps: [
        { title: 'نقرأ أرقامك 14 يوم', body: 'بعد اتفاقية سرية نقرأ المبيعات والتكاليف والعملاء، ونطلع لك بخريطة فرص مسعّرة بالريال' },
        { title: 'عقد صفحة وحدة لكل فرصة', body: 'رقم البداية، ومؤشرات القياس، والمدة، ونسبتنا وسقفها، ويوقّعه الطرفين' },
        { title: 'نشتغل', body: 'احنا ننفّذ معك، ويوصلك تقرير أثر كل شهر بالأرقام' },
        { title: 'نتقاسم الفرق', body: 'نحسب الفرق عن رقم البداية من نظامك، وناخذ نسبتنا منه هو بس' },
      ],
      offers: [
        { title: 'صيد التسرّب', body: 'فلوس تطلع كل شهر بدون داعي: موردين، هدر، اشتراكات، عمولات تطبيقات التوصيل', share: '30% من التوفير', period: 'لمدة 12 شهر' },
        { title: 'العملاء النايمين', body: 'عملاء اشتروا منك قبل وما رجعوا، نرجّعهم', share: '15 إلى 20% من مبيعاتهم', period: '90 يوم' },
        { title: 'عروض الأسعار المنسية', body: 'عروض طلعت من عندك وما أحد تابعها، نتابعها لين تتقفل', share: '8% من الصفقات اللي تتقفل', period: '60 يوم' },
        { title: 'مصدر دخل جديد', body: 'خط إيراد جديد من أصول أو علاقات أو بيانات عندك وما تستفيد منها', share: '10% من ربحه', period: 'مدة وسقف في العقد' },
      ],
      clear: 'وش تعرف قبل ما نبدأ',
      clearItems: ['رقم البداية', 'مؤشرات القياس', 'المدة ومواعيد المراجعة', 'نسبتنا وسقفها وطريقة حسابها', 'متى وكيف ينتهي الاتفاق'],
      floor: 'كل اتفاق له حد أدنى يبدأ من 3,000 ريال، وكل نسبة لها سقف ومدة، وإذا ما شفنا فرصة تستاهل نقول لك بصراحة',
      cta: 'خلّنا نشوف أرقامك',
    },
    plain: 'تبي قسم يشتغل معك كل شهر؟ اختر باقة. تبي تدفع بس لما تشوف فلوس؟ شراكة النتائج',
    unsure: 'ما تدري أي وحدة تناسبك؟ الجلسة الأولى مجانية ونقولك بصراحة',
    unsureCta: 'احجز جلستك المجانية',
  },

  buy: {
    title: 'خطوة أخيرة وتبدأ',
    sum: (name: string, term: string) => `باقة ${name} · ${term}`,
    name: 'اسمك',
    company: 'اسم الشركة',
    phone: 'رقم الجوال',
    phoneHint: '05XXXXXXXX',
    size: 'عدد الموظفين',
    sizes: ['أقل من 10', '10 إلى 50', '50 إلى 200', 'أكثر من 200'],
    mode: 'تفضّل الشغل',
    modes: ['عن بُعد', 'حضوري', 'الاثنين'],
    send: 'أرسل طلب الاشتراك',
    how: 'بعد الطلب نرسل لك العقد ورابط دفع آمن بالبطاقة على الواتساب خلال يوم عمل، ويبدأ القسم يشتغل من أول دفعة',
    alt: 'أو احجز مكالمة قصيرة قبل الاشتراك',
    close: 'إغلاق',
    need: 'نحتاج الاسم ورقم الجوال',
    wa: (o: { tier: string; term: string; price: string; name: string; company: string; phone: string; size: string; mode: string }) =>
      `السلام عليكم، أبي أشترك في باقة ${o.tier} (${o.term}، ${o.price} ريال شهريًا)\nالاسم: ${o.name}\nالشركة: ${o.company || '-'}\nالجوال: ${o.phone}\nعدد الموظفين: ${o.size || '-'}\nأفضّل الشغل: ${o.mode || '-'}`,
  },
}

export type Story = typeof ar

const en: Story = {
  plainK: 'In short',
  idea: {
    eyebrow: 'The idea',
    title: 'What is business development, really?',
    lede: 'Most people know it in one of three pictures, and each holds only part of the truth',
    mythK: 'The common picture',
    truthK: 'The full picture',
    myths: [
      { myth: 'Consulting talk on paper', truth: 'Paper is only the start. The real work is on the floor with your team, until behaviour changes and the number moves' },
      { myth: 'Connecting one company to another', truth: 'A partnership is one door among many. Development looks at the whole house' },
      { myth: 'A rep who brings in contracts', truth: 'That is sales. Sales is an important part of the picture, not the whole of it' },
    ],
    defK: 'Our definition',
    def: 'Business development is raising **a company’s productivity and performance as one system**: people, process and market, each shaping the others',
    plain: 'The same company, with the same people, making more profit with less strain',
  },
  gaps: {
    eyebrow: 'The gaps',
    title: 'Profit doesn’t vanish, it leaks through gaps nobody noticed',
    lede: 'We read your company from two sides: **inside**, where the work is made, **and outside**, where the customer is won',
    wall: 'Your company’s wall',
    inside: {
      k: 'Inside',
      items: [
        { t: 'People', b: 'Someone in the wrong seat, or energy lost to pressure that serves no one' },
        { t: 'Process', b: 'Repeated steps, and work that stops when one person is away' },
        { t: 'Costs', b: 'Monthly spend nobody questions' },
        { t: 'Decisions', b: 'Calls made on feeling instead of numbers' },
      ],
    },
    outside: {
      k: 'Outside',
      items: [
        { t: 'Sales channels', b: 'Channels never tried, or one that takes more commission than it is worth' },
        { t: 'Marketing', b: 'A message for everyone that reaches no one' },
        { t: 'Communication', b: 'A customer who asked and got no reply, a quote nobody followed up' },
        { t: 'Partnerships', b: 'Relationships and assets you own that could become new income' },
      ],
    },
    plain: 'We find where your riyal is leaking, inside and outside, and bring it back',
  },
  mix: {
    eyebrow: 'The blend',
    title: 'Three disciplines that rarely meet in one place',
    lede: 'Companies run on numbers, but **people** move the numbers, so we work through three lenses at once',
    center: 'KON',
    lenses: [
      { k: 'Operations', b: 'How the work runs day by day: clear roles, written procedures, KPIs that get measured' },
      { k: 'Psychology', b: 'Why a customer buys and why an employee hesitates, so we reach the cause, not the symptom' },
      { k: 'Innovation', b: 'When what exists is not enough, we build the tool, system or income stream you are missing' },
    ],
    outK: 'What changes for you?',
    outcomes: [
      { t: 'Higher productivity', b: 'The same team gets more done with less effort' },
      { t: 'Lower risk', b: 'You see the problem before it becomes a loss' },
      { t: 'Easier decisions', b: 'A clear number in front of you instead of a guess' },
      { t: 'Income from more doors', b: 'Your revenue no longer hangs on one channel' },
      { t: 'Growth that lasts', b: 'A system that keeps running after we leave' },
    ],
    plain: 'Understand the people, order the work, invent what is missing',
  },
  how: {
    measureK: 'And how do we measure?',
    measureTitle: 'Impact, for us, is three numbers',
    measure: [
      { n: '01', t: 'Riyals saved' },
      { n: '02', t: 'Riyals earned' },
      { n: '03', t: 'What each riyal you paid returned' },
    ],
    measureFoot: 'Alongside them, your team’s health: clarity, alignment and energy, because growth that breaks people does not count as growth',
    plain: 'A session, then a reading, then work on the ground, and every month you see the impact in riyals',
  },
  plans: {
    eyebrow: 'Working together',
    title: 'A full business development department, without hiring one',
    lede: 'Pick what fits your company: a **monthly subscription** to a department that works with you remotely or on site, or a **results partnership** where we take a share only ++after the riyal is in your pocket++',
    tabs: { monthly: 'Monthly department packages', results: 'Results partnership' },
    every: 'In every package',
    everyItems: ['A monthly impact report in riyals', 'A numbers board updated weekly', 'A direct WhatsApp line to the team', 'Everything in writing: goal, timeline and how we measure'],
    term: 'Contract length',
    months: (n: number) => (n === 12 ? '1 year' : `${n} months`),
    termNotes: ['Shorter setup', 'Base price', 'Same price + extras'],
    perks12: 'With a 1-year contract: price locked for 2 years, a gifted KON Reading, and a 30-day pause whenever you need it',
    notOn3: 'From 6 months',
    perMonth: 'SAR / month',
    total: (n: string, m: number) => `SAR ${n} over ${m} months, paid monthly`,
    forWho: 'Fits',
    pains: 'If this sounds like you',
    gets: 'What the department does',
    pick: (name: string) => `Subscribe to ${name}`,
    seats: 'We take a limited number of companies per package, so quality never drops',
    perHour: (h: string, d: string) => `That is SAR ${h} an hour · SAR ${d} a day`,
    vsTeam: (h: string) => `An in-house team costs SAR ${h} an hour`,
    save: (n: string, pct: number) => `You save SAR ${n} every month (${pct}%)`,
    team: {
      k: 'If you hired a starter BD team yourself',
      total: 'About SAR 50,000 a month',
      roles: [
        { r: 'Business development manager', n: '22,000' },
        { r: 'Business & data analyst', n: '12,000' },
        { r: 'Sales & marketing coordinator', n: '8,000' },
        { r: 'GOSI, end-of-service and medical cover', n: '8,000' },
      ],
      foot: 'Plus two or three months to hire and train, and salaries run whether or not the numbers move',
      src: 'Riyadh salary averages from Glassdoor and Payscale (2025); they vary with experience',
    },
    payNote: 'Pay monthly, quarterly or a year upfront · prices before VAT · exit with 60 days’ notice after month 3',
    tiers: [
      {
        id: 'core', name: 'Core', mode: 'Remote', price: 8800,
        line: 'A department that puts your house in order',
        hours: '4 hours with Khalid + 20 team hours each month',
        forWho: 'A stable company of 10 to 50 staff',
        pains: ['Sales are fine but profit is flat', 'Everything comes back to you', 'Nothing is written down'],
        gets: ['A full company reading in month one and a 90-day plan', 'One quick win every 3 months you can see in your numbers', 'Two written procedures (SOPs) every month', 'A follow-up meeting every two weeks'],
      },
      {
        id: 'growth', name: 'Growth', mode: 'Remote + field visit', price: 18500, tag: 'Right for most companies',
        line: 'A department that works the inside and the market together',
        hours: '8 hours with Khalid + 50 team hours each month',
        forWho: 'A growing or multi-branch company of 50 to 200 staff',
        pains: ['Every new branch breaks something that worked', 'A big team with uneven performance', 'Customers who come once and never return'],
        gets: ['Everything in Core', 'Sales channel work: open quotes, lapsed customers, leaks in the funnel', 'A field visit every month and team training in sales and service', 'Mystery shopper every 3 months and standards for every shift'],
      },
      {
        id: 'partner', name: 'Partner', mode: 'On site every week', price: 34000, minMonths: 6,
        plus: '+ 10% of verified extra profit, capped at one month’s fee',
        line: 'A full department inside your company that shares the outcome',
        hours: '14 hours with Khalid + 110 team hours each month',
        forWho: 'A company expanding or entering a new market',
        pains: ['You need a full department and hiring one is costly', 'You are expanding to a new city or market', 'You want someone to own the result with you'],
        gets: ['Everything in Growth', 'One on-site working day every week', 'Partnerships and a new income stream built with you', 'Qualified meetings with prospective clients and partners'],
      },
    ],
    results: {
      title: 'We only earn when you earn',
      lede: 'We read your data, agree a starting number, do the work, then take a share of **the difference that shows up in your own system** only',
      steps: [
        { title: 'A 14-day data read', body: 'Under NDA we read sales, costs and customers, and map your opportunities priced in riyals' },
        { title: 'A one-page contract per opportunity', body: 'Starting number, KPIs, timeline, our share and its cap, signed by both sides' },
        { title: 'We do the work', body: 'We execute with you, and a monthly impact report shows the numbers' },
        { title: 'We split the difference', body: 'We measure the gain over the starting number in your system and take our share of that only' },
      ],
      offers: [
        { title: 'Leak Hunt', body: 'Money leaving every month for no reason: suppliers, waste, subscriptions, delivery-app commissions', share: '30% of savings', period: 'for 12 months' },
        { title: 'Dormant customers', body: 'Customers who bought before and never came back, we bring them back', share: '15 to 20% of their sales', period: '90 days' },
        { title: 'Forgotten quotes', body: 'Quotes you sent that nobody followed up, we follow them to a close', share: '8% of closed deals', period: '60 days' },
        { title: 'A new income stream', body: 'New revenue from assets, relationships or data you already own', share: '10% of its profit', period: 'term and cap in the contract' },
      ],
      clear: 'What you know before we start',
      clearItems: ['The starting number', 'The KPIs', 'Timeline and review dates', 'Our share, its cap and how it is calculated', 'When and how the agreement ends'],
      floor: 'Every agreement has a minimum from SAR 3,000, every share has a cap and a term, and if we see no worthwhile opportunity we tell you plainly',
      cta: 'Let’s look at your numbers',
    },
    plain: 'Want a department working with you every month? Pick a package. Want to pay only when you see money? Results partnership',
    unsure: 'Not sure which fits? The first session is free and we will tell you honestly',
    unsureCta: 'Book your free session',
  },
  buy: {
    title: 'One last step and you begin',
    sum: (name: string, term: string) => `${name} package · ${term}`,
    name: 'Your name',
    company: 'Company name',
    phone: 'Mobile number',
    phoneHint: '05XXXXXXXX',
    size: 'Team size',
    sizes: ['Under 10', '10 to 50', '50 to 200', 'Over 200'],
    mode: 'You prefer',
    modes: ['Remote', 'On site', 'Both'],
    send: 'Send subscription request',
    how: 'After your request we send the contract and a secure card payment link on WhatsApp within one working day, and the department starts from the first payment',
    alt: 'Or book a short call before subscribing',
    close: 'Close',
    need: 'We need your name and mobile number',
    wa: (o) =>
      `Hello, I would like to subscribe to the ${o.tier} package (${o.term}, SAR ${o.price}/month)\nName: ${o.name}\nCompany: ${o.company || '-'}\nMobile: ${o.phone}\nTeam size: ${o.size || '-'}\nPreference: ${o.mode || '-'}`,
  },
}

export const story: Record<'ar' | 'en', Story> = { ar, en }
export const useStory = () => story[useStore((s) => s.lang)]
