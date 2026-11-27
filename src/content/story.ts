// KON Story (2026-11-26): the chapters that turn the homepage into one connected story, plus the
// three company packages. Arabic first, plain white dialect, no diacritics (khalid, 2026-11-27). Prices: SAR per month, from the Master Plan tiers (نواة / نمو / شريك).
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
  gets: string[]
}

const ar = {
  idea: {
    eyebrow: 'الفكرة',
    title: 'تطوير الأعمال، كلمة يسمعها الكل',
    lede: 'وقليل اللي يعرف معناها. أغلب الناس يعرفونها بصورة من هذي الثلاث',
    mythK: 'الصورة الشائعة',
    truthK: 'والحقيقة',
    myths: [
      { myth: 'كلام استشاري على ورق', truth: 'الورق بداية بس، والشغل الحقيقي يصير مع فريقك على الأرض' },
      { myth: 'يوصل شركة بشركة', truth: 'الشراكة باب واحد، وتطوير الأعمال يشوف الشركة كلها' },
      { myth: 'مندوب يجيب عقود', truth: 'هذي مبيعات، والمبيعات جزء من الصورة مو الصورة كلها' },
    ],
    defK: 'وش هو فعلا؟',
    def: 'تطوير الأعمال إنك ترفع إنتاجية شركتك كلها: **ناسها**، و**طريقة شغلها**، و**طريقها للسوق**',
    close: 'نفس شركتك، بنفس ناسك، تطلع نتيجة أكبر بتعب أقل',
  },

  gaps: {
    eyebrow: 'وين تروح الفلوس',
    title: 'الفلوس ما تروح مرة وحدة',
    lede: 'تروح شوي شوي، من أماكن ما تنتبه لها',
    ring: 'شركتك',
    hint: 'اسحب الحلقة، أو انزل بهدوء وهي تلف معك',
    prev: 'السابق',
    next: 'التالي',
    inside: {
      k: 'من داخل الشركة',
      items: [
        { t: 'الناس', b: 'موظف ممتاز في مكان ما يناسبه، وطاقة تضيع في ضغط ما له داعي' },
        { t: 'طريقة الشغل', b: 'خطوات تتكرر، وشغل يوقف إذا غاب شخص واحد' },
        { t: 'المصاريف', b: 'مصاريف تطلع كل شهر وما أحد يسأل عنها' },
        { t: 'القرار', b: 'قرارات تنبني على الإحساس بدل الرقم' },
      ],
    },
    outside: {
      k: 'من خارج الشركة',
      items: [
        { t: 'البيع', b: 'قنوات ما جربتها، أو قناة تاخذ منك أكثر مما تعطيك' },
        { t: 'التسويق', b: 'رسالة تكلم الكل، فما توصل لأحد' },
        { t: 'المتابعة', b: 'عميل سأل وما أحد رد عليه، وعرض سعر ما أحد تابعه' },
        { t: 'الشراكات', b: 'علاقات وأصول عندك تقدر تصير دخل جديد' },
      ],
    },
    close: 'كل فجوة لحالها صغيرة، ومع بعض هي الفرق بين شركة تكبر وشركة واقفة مكانها',
  },

  mix: {
    eyebrow: 'ليش كُن',
    title: 'لأن اللي يحرك الأرقام بشر',
    lede: 'عشان كذا نشوف شركتك بثلاث عيون مع بعض',
    lenses: [
      { k: 'التشغيل', q: 'كيف يمشي الشغل؟', b: 'أدوار واضحة، وخطوات مكتوبة، وأرقام تنقاس كل أسبوع' },
      { k: 'علم النفس', q: 'ليش يتصرف الناس كذا؟', b: 'ليش يشتري العميل، وليش يتردد الموظف. نوصل لأصل المشكلة، مو بس لشكلها' },
      { k: 'الابتكار', q: 'وش اللي ناقص؟', b: 'لما الموجود ما يكفي، نبني الأداة أو النظام أو مصدر الدخل اللي تحتاجه' },
    ],
    close: 'لما تجتمع الثلاث، تشوف اللي ما يشوفه غيرك',
    outK: 'ووش يتغير عندك؟',
    outcomes: ['إنتاجية أعلى', 'مخاطر أقل', 'قرار أوضح', 'دخل من أكثر من باب', 'نمو يستمر بعد ما نطلع'],
  },

  how: {
    measureK: 'وكيف نقيس؟',
    measureTitle: 'ثلاثة أرقام، وبس',
    measure: [
      { n: '01', t: 'ريال وفرناه' },
      { n: '02', t: 'ريال كسبناه' },
      { n: '03', t: 'كم رجع لك كل ريال دفعته' },
    ],
    measureFoot: 'ومعها صحة فريقك، لأن النمو اللي يتعب الناس ما يدوم',
  },

  plans: {
    eyebrow: 'طريقة الشغل معنا',
    title: 'قسم تطوير أعمال كامل، بأقل من راتب موظف واحد',
    lede: 'بدل ما توظف فريق بخمسين ألف في الشهر وتنتظر شهور، يبدأ معك فريق جاهز من الأسبوع الأول',
    term: 'مدة الاتفاق',
    months: (n: number) => (n === 12 ? 'سنة' : `${n} أشهر`),
    termNotes: ['السعر أعلى 12%', 'السعر الأساسي', 'تثبيت السعر وإيقاف مؤقت 30 يوم'],
    notOn3: 'تبدأ من 6 أشهر',
    perMonth: 'ريال في الشهر',
    perDay: (d: string) => `يعني ${d} ريال في اليوم`,
    gets: 'كل شهر تستلم',
    pick: (name: string) => `ابدأ مع ${name}`,
    compare: {
      k: 'قارن بنفسك',
      you: 'لو وظفت الفريق بنفسك',
      youN: '50,000',
      youNote: 'ريال في الشهر، وشهرين توظيف قبل ما يبدأ',
      kon: 'مع كُن',
      konN: '8,800',
      konNote: 'ريال في الشهر كبداية، وتبدأ من الأسبوع الأول',
      src: 'تقدير فريق من ثلاثة في الرياض حسب متوسطات Glassdoor وPayscale، مع التأمينات ونهاية الخدمة',
    },
    // CONFIRM (khalid): a 90-day promise is proposed, not yet approved.
    promise: { k: 'التزامنا', t: 'إذا ما شفت أثر واضح بالأرقام خلال أول 90 يوم، الشهر الرابع علينا' },
    payNote: 'الأسعار قبل الضريبة · تقدر توقف بإشعار 60 يوم بعد الشهر الثالث',
    tiers: [
      {
        id: 'core', name: 'نواة', mode: 'عن بعد', price: 8800,
        line: 'لشركة مستقرة تبي ترتب بيتها من الداخل',
        gets: ['قراءة كاملة لشركتك وخطة 90 يوم', 'مكسب واضح كل 3 أشهر تشوفه في أرقامك', 'إجراءين مكتوبين كل شهر', 'متابعة كل أسبوعين وتقرير أثر بالريال'],
      },
      {
        id: 'growth', name: 'نمو', mode: 'عن بعد مع زيارة ميدانية', price: 18500, tag: 'الأنسب لأغلب الشركات',
        line: 'لشركة تنمو وتبي الداخل والسوق يمشون مع بعض',
        gets: ['كل اللي في نواة', 'نرجع العملاء اللي ما رجعوا ونتابع العروض المنسية', 'زيارة ميدانية وتدريب فريق البيع كل شهر', 'متسوق خفي كل 3 أشهر'],
      },
      {
        id: 'partner', name: 'شريك', mode: 'حضوري كل أسبوع', price: 34000, minMonths: 6,
        plus: 'و10% من الربح الإضافي الموثق، بحد أعلى يساوي الاشتراك',
        line: 'لشركة تتوسع وتبي أحد يشيل النتيجة معها',
        gets: ['كل اللي في نمو', 'يوم عمل حضوري كل أسبوع داخل شركتك', 'مصدر دخل جديد نبنيه معك', 'اجتماعات مع عملاء وشركاء محتملين'],
      },
    ] as StoryTier[],
    results: {
      k: 'أو',
      title: 'ادفع بس لما تشوف النتيجة',
      lede: 'نتفق على رقم البداية، نشتغل، وناخذ نسبة من الفرق اللي يظهر في نظامك أنت',
      offers: [
        { title: 'مصاريف تتسرب', share: '30% من التوفير لمدة سنة' },
        { title: 'عملاء ما رجعوا', share: '15 إلى 20% من مبيعاتهم' },
        { title: 'عروض أسعار منسية', share: '8% من الصفقات اللي تنقفل' },
      ],
      floor: 'كل نسبة لها سقف ومدة مكتوبة قبل ما نبدأ',
      cta: 'خلنا نشوف أرقامك',
    },
    unsure: 'محتار؟ الجلسة الأولى مجانية، ونقولك بصراحة وش يناسبك',
    unsureCta: 'احجز جلستك',
  },

  big: {
    eyebrow: 'القرارات الكبيرة',
    title: 'بعض القرارات ما تتصلح بعد ما تنبني',
    lede: 'أرض، مبنى، أو دخول سوق جديد: قرار واحد يحدد السنين اللي بعده، عشان كذا نقدم ++دراسات متخصصة++ لأصحاب القرار الكبير',
    pick: 'اختر الدراسة',
    studies: [
      {
        id: 'hbu', k: 'للمطورين وملاك الأراضي', name: 'دراسة أفضل استخدام', price: 85000, from: false,
        line: 'عندك أرض أو مبنى؟ نقولك وش أفضل شي ينبني فيه أو يتشغل، وكم يرجع',
        gets: ['قراءة الموقع ومحيطه: الطرق، المستشفيات، الجامعات، السكان، والمنافسين', 'الاستخدامات المسموحة نظاما واشتراطات البناء', 'ثلاث سيناريوهات بأرقامها: التكلفة، الدخل، العائد، ومدة الاسترداد', 'نموذج التشغيل: تبيع، تأجر، أو تشغل', 'خريطة المخاطر وطريقة تقليلها', 'ملف جاهز تعرضه على شريك أو ممول'],
        example: 'مثال: أرض قريبة من مستشفى ممكن تكون أعلى قيمة كاستوديوهات مفروشة لمرافقي المرضى، بدل عمارة سكنية عادية',
      },
      {
        id: 'compare', k: 'للمستثمرين', name: 'مقارنة الفرص', price: 120000, from: false,
        line: 'قدامك أكثر من فرصة ومحتار؟ نحطها جنب بعض بنفس المسطرة، وتختار وأنت مطمن',
        gets: ['حتى ثلاث فرص (أراضي أو مباني أو مشاريع) تنقرأ بنفس المعايير', 'أفضل استخدام لكل فرصة', 'مقارنة العائد والمخاطر والسيولة والمدة', 'توصية واضحة مع الأسباب', 'خطة أول 90 يوم للفرصة المختارة'],
        example: 'أرخص أرض أو أكبر أرض مو دايم أفضل أرض، الأفضل هي اللي ترجع أكثر بمخاطرة أقل',
      },
      {
        id: 'gtm', k: 'للشركات الداخلة للسوق', name: 'استراتيجية دخول السوق', price: 60000, from: true,
        line: 'داخل السعودية أو مدينة جديدة أو منتج جديد؟ نرسم لك الطريق من أول عميل لين يثبت اسمك',
        gets: ['قراءة السوق والمنافسين والأنظمة', 'العميل المثالي وأين تلقاه', 'التسعير وقنوات البيع والشراكات', 'خطة إطلاق 90 يوم بالأرقام', 'ننزل معك التنفيذ إذا تبي'],
        example: 'من خبرتنا: خطة دخول Telkomsel للسوق السعودي ونتيجتها 14 مليون ريال إيرادات',
      },
    ],
    priceK: 'ريال',
    fromK: 'يبدأ من',
    why: {
      k: 'ليش السعر كذا؟',
      title: 'لأنك ما تدفع على ورق، تدفع على قرار',
      points: [
        { t: 'نسبة صغيرة من القرار', b: 'في مشروع قيمته 20 مليون، دراسة بـ 85 ألف تساوي أقل من نص بالمية من القرار' },
        { t: 'الخطأ أغلى من الدراسة', b: 'غلطة 5% بس في قرار بـ 20 مليون تكلف مليون ريال، يعني 12 ضعف سعر الدراسة' },
        { t: 'تعرف وش تستلم', b: 'كل بند مكتوب قبل ما نبدأ، والسعر ثابت ما يزيد في النص' },
        { t: 'نقولك بصراحة إذا ما تحتاجها', b: 'قبل أي دراسة جلسة نقرأ فيها الفرصة، وإذا كانت واضحة وما تحتاج دراسة نقولك' },
      ],
    },
    calc: {
      k: 'جربها على مشروعك',
      value: 'قيمة القرار',
      share: 'الدراسة من قيمة القرار',
      mistake: 'تكلفة غلطة 5% في القرار',
      times: (x: string) => `يعني ${x} ضعف سعر الدراسة`,
      million: 'مليون ريال',
    },
    close: 'كل ما كبر القرار، صارت الدراسة أرخص من الغلطة',
    cta: 'اطلب دراسة',
    note: 'الدراسات نقدمها مع شركائنا المتخصصين في العقار والسوق، والأسعار قبل الضريبة',
  },

  team: {
    eyebrow: 'فريق كُن',
    title: 'كُن مو شخص واحد',
    lede: 'خبرات تكمل بعض، وكل مشروع ينبني له الفريق اللي يناسبه',
    people: [
      { name: 'خالد', role: 'المؤسس', b: 'علم النفس، والتشغيل، وتطوير الأعمال، والابتكار' },
      { name: 'فهد الشريف', role: 'المبيعات والتسويق والعقار', b: 'دراسات السوق والجدوى، ودراسات أفضل استخدام للأراضي والمخططات' },
      { name: 'شبكة خبراء', role: 'حسب كل مشروع', b: 'متخصصين نستعين فيهم في القانون والمالية والتقنية والتصميم' },
    ],
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
    mode: 'تفضل الشغل',
    modes: ['عن بعد', 'حضوري', 'الاثنين'],
    send: 'أرسل طلب الاشتراك',
    how: 'بعد الطلب نرسل لك العقد ورابط دفع آمن بالبطاقة على الواتساب خلال يوم عمل، ويبدأ القسم يشتغل من أول دفعة',
    alt: 'أو احجز مكالمة قصيرة قبل الاشتراك',
    close: 'إغلاق',
    need: 'نحتاج الاسم ورقم الجوال',
    wa: (o: { tier: string; term: string; price: string; name: string; company: string; phone: string; size: string; mode: string }) =>
      `السلام عليكم، أبي أشترك في باقة ${o.tier} (${o.term}، ${o.price} ريال شهريا)\nالاسم: ${o.name}\nالشركة: ${o.company || '-'}\nالجوال: ${o.phone}\nعدد الموظفين: ${o.size || '-'}\nأفضل الشغل: ${o.mode || '-'}`,
  },
}

export type Story = typeof ar

const en: Story = {
  idea: {
    eyebrow: 'The idea',
    title: 'Business development: a phrase everyone has heard',
    lede: 'Few know what it means. Most people picture one of these three',
    mythK: 'The common picture',
    truthK: 'The truth',
    myths: [
      { myth: 'Consulting talk on paper', truth: 'Paper is only the start. The real work happens on the floor with your team' },
      { myth: 'Connecting one company to another', truth: 'A partnership is one door. Business development looks at the whole company' },
      { myth: 'A rep who brings in contracts', truth: 'That is sales, and sales is part of the picture, not all of it' },
    ],
    defK: 'What it really is',
    def: 'Business development is raising the productivity of your whole company: **its people**, **the way it works**, and **its road to the market**',
    close: 'The same company, the same people, a bigger result with less strain',
  },

  gaps: {
    eyebrow: 'Where the money goes',
    title: 'Money never leaves all at once',
    lede: 'It slips away little by little, from places you don’t notice',
    ring: 'Your company',
    hint: 'Drag the ring, or scroll slowly and it turns with you',
    prev: 'Previous',
    next: 'Next',
    inside: {
      k: 'Inside the company',
      items: [
        { t: 'People', b: 'A great employee in the wrong seat, and energy lost to pressure that serves no one' },
        { t: 'Ways of working', b: 'Steps repeated again and again, and work that stops when one person is away' },
        { t: 'Spending', b: 'Costs that go out every month that nobody questions' },
        { t: 'Decisions', b: 'Calls made on gut feeling instead of numbers' },
      ],
    },
    outside: {
      k: 'Outside the company',
      items: [
        { t: 'Selling', b: 'Channels you never tried, or one that takes more than it gives' },
        { t: 'Marketing', b: 'A message for everyone, so it reaches no one' },
        { t: 'Follow-up', b: 'A customer who asked and got no reply, a quote nobody chased' },
        { t: 'Partnerships', b: 'Relationships and assets you already have that could become new income' },
      ],
    },
    close: 'Each gap is small on its own. Together they are the difference between a company that grows and one that stands still',
  },

  mix: {
    eyebrow: 'Why KON',
    title: 'Because people move the numbers',
    lede: 'So we look at your company through three lenses at once',
    lenses: [
      { k: 'Operations', q: 'How does the work flow?', b: 'Clear roles, written steps, and numbers measured every week' },
      { k: 'Psychology', q: 'Why do people act this way?', b: 'Why a customer buys and why a team member hesitates. We reach the root, not just the symptom' },
      { k: 'Innovation', q: 'What is missing?', b: 'When what exists is not enough, we build the tool, the system or the income stream you need' },
    ],
    close: 'When the three meet, you see what others miss',
    outK: 'What changes for you?',
    outcomes: ['Higher productivity', 'Lower risk', 'Clearer decisions', 'Income from more than one door', 'Growth that lasts after we leave'],
  },

  how: {
    measureK: 'How do we measure?',
    measureTitle: 'Three numbers, that’s all',
    measure: [
      { n: '01', t: 'Riyals saved' },
      { n: '02', t: 'Riyals earned' },
      { n: '03', t: 'What each riyal you paid brought back' },
    ],
    measureFoot: 'And beside them, your team’s health, because growth that wears people out does not last',
  },

  plans: {
    eyebrow: 'Working with us',
    title: 'A full business development department, for less than one salary',
    lede: 'Instead of hiring a team for fifty thousand a month and waiting months, a ready team starts with you in the first week',
    term: 'Agreement length',
    months: (n: number) => (n === 12 ? '1 year' : `${n} months`),
    termNotes: ['Price is 12% higher', 'Base price', 'Price locked, 30-day pause'],
    notOn3: 'From 6 months',
    perMonth: 'SAR / month',
    perDay: (d: string) => `That is SAR ${d} a day`,
    gets: 'Every month you get',
    pick: (name: string) => `Start with ${name}`,
    compare: {
      k: 'Compare for yourself',
      you: 'Hiring the team yourself',
      youN: '50,000',
      youNote: 'SAR a month, plus two months of hiring before it starts',
      kon: 'With KON',
      konN: '8,800',
      konNote: 'SAR a month to start, working from the first week',
      src: 'A three-person team in Riyadh at Glassdoor and Payscale averages, with social insurance and end of service',
    },
    promise: { k: 'Our commitment', t: 'If you don’t see a clear result in the numbers within the first 90 days, the fourth month is on us' },
    payNote: 'Prices before VAT · stop with 60 days’ notice after the third month',
    tiers: [
      {
        id: 'core', name: 'Core', mode: 'Remote', price: 8800,
        line: 'For a steady company that wants its house in order',
        gets: ['A full reading of your company and a 90-day plan', 'One clear win every 3 months, visible in your numbers', 'Two written procedures every month', 'A check-in every two weeks and an impact report in riyals'],
      },
      {
        id: 'growth', name: 'Growth', mode: 'Remote with a site visit', price: 18500, tag: 'Right for most companies',
        line: 'For a growing company that wants the inside and the market moving together',
        gets: ['Everything in Core', 'We win back lapsed customers and chase forgotten quotes', 'A monthly site visit and sales team training', 'A mystery shopper every 3 months'],
      },
      {
        id: 'partner', name: 'Partner', mode: 'On site every week', price: 34000, minMonths: 6,
        plus: 'plus 10% of verified extra profit, capped at one month’s fee',
        line: 'For a company that is expanding and wants someone to carry the result with it',
        gets: ['Everything in Growth', 'A working day on site every week', 'A new income stream we build with you', 'Meetings with potential customers and partners'],
      },
    ] as StoryTier[],
    results: {
      k: 'Or',
      title: 'Pay only when you see the result',
      lede: 'We agree on a starting number, we work, and we take a share of the difference that shows in your own system',
      offers: [
        { title: 'Leaking costs', share: '30% of savings for a year' },
        { title: 'Customers who didn’t return', share: '15 to 20% of their sales' },
        { title: 'Forgotten quotes', share: '8% of deals that close' },
      ],
      floor: 'Every share has a cap and a term, written before we start',
      cta: 'Let’s look at your numbers',
    },
    unsure: 'Not sure? The first session is free, and we will tell you honestly what fits',
    unsureCta: 'Book your session',
  },

  big: {
    eyebrow: 'The big decisions',
    title: 'Some decisions can’t be fixed once they’re built',
    lede: 'A plot, a building, or a new market: one decision shapes the years after it, so we offer ++specialist studies++ for people making big calls',
    pick: 'Choose the study',
    studies: [
      {
        id: 'hbu', k: 'For developers and landowners', name: 'Highest & Best Use study', price: 85000, from: false,
        line: 'Own land or a building? We tell you the best thing to build or run on it, and what it returns',
        gets: ['Site and surroundings: roads, hospitals, universities, population and competitors', 'Permitted uses and building regulations', 'Three scenarios with numbers: cost, income, return and payback', 'Operating model: sell, lease or operate', 'A risk map and how to reduce it', 'A file ready to show a partner or lender'],
        example: 'Example: a plot near a hospital may be worth more as furnished studios for patient companions than as an ordinary residential block',
      },
      {
        id: 'compare', k: 'For investors', name: 'Opportunity comparison', price: 120000, from: false,
        line: 'Several opportunities and can’t choose? We measure them side by side with one ruler, so you decide with confidence',
        gets: ['Up to three opportunities (land, buildings or projects) read on the same criteria', 'Best use for each one', 'Return, risk, liquidity and timeline compared', 'A clear recommendation with the reasons', 'A 90-day plan for the chosen opportunity'],
        example: 'The cheapest or biggest plot is not always the best one. The best one returns more at lower risk',
      },
      {
        id: 'gtm', k: 'For companies entering a market', name: 'Market entry strategy', price: 60000, from: true,
        line: 'Entering Saudi Arabia, a new city or a new product? We map the road from the first customer until your name holds',
        gets: ['Market, competitors and regulation', 'Your ideal customer and where to find them', 'Pricing, sales channels and partnerships', 'A 90-day launch plan in numbers', 'We can execute it with you'],
        example: 'From our work: Telkomsel’s entry plan for Saudi Arabia, with SAR 14M in revenue',
      },
    ],
    priceK: 'SAR',
    fromK: 'From',
    why: {
      k: 'Why this price?',
      title: 'You are not paying for paper, you are paying for a decision',
      points: [
        { t: 'A small share of the decision', b: 'On a SAR 20M project, an 85k study is less than half a percent of the decision' },
        { t: 'A mistake costs more than the study', b: 'Just a 5% mistake on a SAR 20M decision costs SAR 1M, twelve times the study' },
        { t: 'You know what you get', b: 'Every item is written before we start, and the price is fixed' },
        { t: 'We tell you if you don’t need it', b: 'Every study starts with a session on the opportunity, and if the answer is already clear we say so' },
      ],
    },
    calc: {
      k: 'Try it on your project',
      value: 'Value of the decision',
      share: 'Study as a share of the decision',
      mistake: 'Cost of a 5% mistake',
      times: (x: string) => `${x} times the price of the study`,
      million: 'SAR M',
    },
    close: 'The bigger the decision, the cheaper the study is than the mistake',
    cta: 'Request a study',
    note: 'Studies are delivered with our specialist partners in real estate and markets · prices before VAT',
  },

  team: {
    eyebrow: 'The KON team',
    title: 'KON is not one person',
    lede: 'Expertise that completes itself, and every project gets the team it needs',
    people: [
      { name: 'Khalid', role: 'Founder', b: 'Psychology, operations, business development and innovation' },
      { name: 'Fahad Al-Sharif', role: 'Sales, marketing and real estate', b: 'Market and feasibility studies, and best-use studies for land and master plans' },
      { name: 'Expert network', role: 'Per project', b: 'Specialists we bring in for legal, finance, technology and design' },
    ],
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
