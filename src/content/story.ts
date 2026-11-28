// KON Story (2026-11-26): the chapters that turn the homepage into one connected story, plus the
// three company packages. Arabic first, plain white dialect, no diacritics (khalid, 2026-11-27).
// Round 2 (2026-11-28): mid-range packages انطلاقة / نمو / القسم الكامل. CONFIRM (khalid): names, prices, field days, the 90k estimate.
import { useStore } from '../state/store'

export const STORY_TERMS = [
  { months: 3, mult: 1.1 },
  { months: 6, mult: 1 },
  { months: 12, mult: 0.92 },
] as const

// An in-house BD department of four, Saudi Arabia, monthly (estimate, 2026-11-28):
// BD manager ~25,000 + two specialists ~14,000 each + business analyst ~12,000 = 65,000 salaries,
// + ~20% employer costs (GOSI, end-of-service accrual, medical) ≈ 78,000, + CRM, data and tools ≈ 90,000.
export const TEAM_COST = 90000
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
    title: 'وش يعني تطوير أعمال؟',
    lede: 'الكل يسمع فيها، وقليل اللي يعرف وش تسوي فعلا. خلنا نصحح ثلاث صور شائعة',
    mythK: 'اللي يقولونه',
    truthK: 'والصح',
    myths: [
      { myth: 'دراسة على ورق وتنحط في الدرج', truth: 'الدراسة أول خطوة بس. الشغل الحقيقي مع فريقك في الميدان، لين يتغير الرقم' },
      { myth: 'شخص يعرفك على شركات ثانية', truth: 'العلاقات باب واحد. تطوير الأعمال يشوف الشركة كلها، من الداخل لين السوق' },
      { myth: 'مندوب مبيعات بمسمى أكبر', truth: 'المبيعات جزء. احنا نشتغل على اللي قبلها واللي بعدها: العرض، والتسعير، والمتابعة، والتشغيل' },
    ],
    defK: 'طيب وش هو؟',
    def: 'تطوير الأعمال يدور لشركتك على **نمو مربح**: سوق جديد، عميل أكبر، شراكة صح، أو مصروف يتقفل. ويتأكد إن **التشغيل يقدر يشيل** هذا النمو',
    close: 'نفس الشركة، ونفس الفريق، بس بنتيجة أكبر وصداع أقل',
  },

  gaps: {
    eyebrow: 'وين يضيع الربح',
    title: 'الربح ما يضيع مرة وحدة',
    lede: 'يتسرب شوي شوي، من داخل الشركة ومن السوق، وغالبا من أماكن محد يراقبها',
    ring: 'شركتك',
    hint: 'اسحب يمين ويسار، أو استخدم الأسهم',
    prev: 'السابق',
    next: 'التالي',
    inside: {
      k: 'داخل الشركة',
      items: [
        { t: 'الناس', b: 'موظف شاطر في المكان الغلط، وفريق يشتغل كثير وينتج قليل' },
        { t: 'التشغيل', b: 'نفس الغلطة تتكرر كل أسبوع، والشغل يوقف إذا غاب شخص واحد' },
        { t: 'المصاريف', b: 'اشتراكات وعقود ومصاريف تمشي كل شهر، ومحد يسأل ليش' },
        { t: 'القرار', b: 'قرارات تنبني على الإحساس، لأن الرقم مو قدامك وقت ما تحتاجه' },
      ],
    },
    outside: {
      k: 'في السوق',
      items: [
        { t: 'المبيعات', b: 'عملاء مهتمين محد قفل معهم، وعروض أسعار تنرسل وتنتسى' },
        { t: 'التسويق', b: 'ميزانية إعلانات تجيب ضغطات كثيرة وعملاء قليل' },
        { t: 'العملاء', b: 'عميل اشترى مرة وما رجع، ومحد سأله ليش' },
        { t: 'الشراكات', b: 'علاقات وأصول عندك تقدر تصير دخل جديد، وهي نايمة' },
      ],
    },
    close: 'كل وحدة لحالها شي بسيط. ومع بعض، هي الفرق بين شركة تكبر وشركة تلف مكانها',
  },

  mix: {
    eyebrow: 'ليش كُن',
    title: 'الأرقام يحركها بشر',
    lede: 'عشان كذا نشوف شركتك بثلاث عيون في نفس الوقت',
    lenses: [
      { k: 'التشغيل', q: 'كيف يمشي الشغل؟', b: 'نرسم الطريق من أول طلب لين التسليم: مين يسوي وش، ومتى، وكيف ينقاس' },
      { k: 'علم النفس', q: 'ليش الناس يتصرفون كذا؟', b: 'ليش العميل يتردد قبل الدفع، وليش الموظف يتحمس أو يطفي. نعالج السبب، مو العرض' },
      { k: 'الابتكار', q: 'وش الناقص؟', b: 'إذا الموجود ما يكفي، نبني الأداة أو النظام أو مصدر الدخل اللي يسد الفجوة' },
    ],
    close: 'لما تجتمع الثلاث، تشوف اللي غيرك ما يشوفه',
    outK: 'ووش يتغير عندك؟',
    outcomes: ['ربح أعلى بنفس الفريق', 'تكاليف أوضح وأقل', 'قرارات بالأرقام', 'أكثر من مصدر دخل', 'شغل يمشي حتى لو غبت'],
  },

  how: {
    measureK: 'وكيف نقيس النجاح؟',
    measureTitle: 'ثلاثة أرقام، ما نخبيها',
    measure: [
      { n: '01', t: 'كم ريال وفرنا لك' },
      { n: '02', t: 'كم ريال زدنا لك' },
      { n: '03', t: 'كم رجع لك كل ريال دفعته' },
    ],
    measureFoot: 'ونراقب معها صحة فريقك، لأن النمو اللي يحرق الناس ما يعيش',
  },

  // CONFIRM (khalid): names, prices, field days, the cities where field days are included, the 90-day line.
  plans: {
    eyebrow: 'قسم تطوير الأعمال',
    title: 'قسم تطوير أعمال كامل، يشتغل لشركتك من أول شهر',
    lede: 'بناء القسم داخليا ياخذ شهور توظيف وتكلفة عالية كل شهر. معنا تستلم فريق جاهز بخبرته وأدواته، وتختار الحجم اللي يناسب مرحلتك',
    term: 'مدة الاتفاق',
    months: (n: number) => (n === 12 ? 'سنة' : `${n} أشهر`),
    termNotes: ['أقل التزام، والسعر أعلى 10%', 'السعر الأساسي', 'توفر 8% وتثبت سعرك سنة كاملة'],
    notOn3: 'تبدأ من 6 أشهر',
    perMonth: 'ريال في الشهر',
    perDay: (d: string) => `يعني ${d} ريال في اليوم`,
    gets: 'وش يشتغل عليه القسم',
    pick: (name: string) => `ابدأ مع ${name}`,
    why: {
      k: 'ليش هذا السعر؟',
      points: [
        { t: 'تستلم قسم، مو موظف', b: 'خبرة في التشغيل والمبيعات والسوق، وفريق يغطي بعضه' },
        { t: 'بدون مخاطرة توظيف', b: 'لا شهور بحث، ولا راتب على شخص ما ناسب' },
        { t: 'تكبر أو تصغر براحتك', b: 'تنقل بين الباقات حسب مرحلتك، بإشعار شهر' },
      ],
    },
    compare: {
      k: 'قارن بنفسك',
      you: 'لو بنيت القسم بنفسك',
      youNote: 'ريال في الشهر لمدير وأخصائيين ومحلل وأدوات، وأربعة إلى ستة شهور قبل ما يشتغل',
      kon: 'مع كُن',
      konN: '27,500',
      konNote: 'ريال في الشهر لباقة نمو، والشغل يبدأ من الأسبوع الأول',
      src: 'تقدير لفريق من أربعة في السعودية حسب متوسطات الرواتب المعلنة، مع التأمينات ونهاية الخدمة والأدوات',
    },
    // CONFIRM (khalid): a 90-day promise is proposed, not yet approved.
    promise: { k: 'التزامنا', t: 'إذا ما شفت أثر واضح بالأرقام خلال أول 90 يوم، الشهر الرابع علينا' },
    travel: { k: 'الأيام الميدانية', t: 'مشمولة داخل جدة والمدينة المنورة. خارجها نجيك بنفس الجودة، وتنضاف تكاليف السفر والسكن بالتكلفة الفعلية بعد موافقتك' },
    payNote: 'الأسعار بالريال قبل الضريبة · بعد أول 3 أشهر تقدر توقف بإشعار 30 يوم',
    tiers: [
      {
        id: 'core', name: 'انطلاقة', mode: 'عن بعد ويوم ميداني كل شهر', price: 14500,
        line: 'لشركة تبي ترتب أساسها وتعرف من وين يجي نموها',
        gets: ['قراءة كاملة لشركتك وسوقك، وخطة 90 يوم بأهداف واضحة', 'لوحة أرقام شهرية: المبيعات، والتكاليف، والفرص', 'مراجعة العرض والتسعير ورسالة البيع', 'إجراءات تشغيل مكتوبة لأهم عمليتين عندك', 'اجتماع متابعة كل أسبوعين'],
      },
      {
        id: 'growth', name: 'نمو', mode: 'عن بعد ويومين ميدانيين كل شهر', price: 27500, tag: 'الأنسب لأغلب الشركات',
        line: 'لشركة شغالة وتبي مبيعاتها وتشغيلها يكبرون مع بعض',
        gets: ['كل اللي في انطلاقة', 'نبني مسار المبيعات: من أول تواصل لين قفل الصفقة', 'تدريب فريق المبيعات على المكالمات والاعتراضات', 'قناة بيع أو شراكة جديدة كل ربع', 'تقييم تجربة العميل بزيارة متسوق خفي كل 3 أشهر', 'اجتماع متابعة كل أسبوع'],
      },
      {
        id: 'partner', name: 'القسم الكامل', mode: 'يوم حضوري كل أسبوع داخل شركتك', price: 46000, minMonths: 6,
        line: 'لشركة تتوسع وتبي قسم يمسك الملف كامل معها',
        gets: ['كل اللي في نمو', 'مدير تطوير أعمال مخصص لشركتك', 'خطة توسع: مدينة جديدة، أو منتج جديد، أو سوق جديد', 'تجهيز العروض الكبيرة والمناقصات واجتماعات كبار العملاء', 'تقرير ربعي للشركاء أو مجلس الإدارة'],
      },
    ] as StoryTier[],
    unsure: 'محتار وش يناسبك؟ الجلسة الأولى مجانية، ونقولك بصراحة',
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
    title: 'What is business development, really?',
    lede: 'Everyone has heard the phrase. Few know what it actually does. Let’s fix three common pictures',
    mythK: 'What people say',
    truthK: 'What it is',
    myths: [
      { myth: 'A report that ends up in a drawer', truth: 'The report is only step one. The real work happens on the floor with your team, until the number moves' },
      { myth: 'Someone who introduces you to other companies', truth: 'Relationships are one door. Business development looks at the whole company, from the inside out to the market' },
      { myth: 'A sales rep with a bigger title', truth: 'Sales is one part. We work on what comes before and after it: the offer, the pricing, the follow-up, the operation' },
    ],
    defK: 'So what is it?',
    def: 'Business development finds your company **profitable growth**: a new market, a bigger client, the right partner, a cost that stops. Then it makes sure **operations can carry** that growth',
    close: 'The same company, the same team, a bigger result and fewer headaches',
  },

  gaps: {
    eyebrow: 'Where profit leaks',
    title: 'Profit never leaves all at once',
    lede: 'It slips away little by little, inside the company and out in the market, usually where nobody is watching',
    ring: 'Your company',
    hint: 'Swipe left and right, or use the arrows',
    prev: 'Previous',
    next: 'Next',
    inside: {
      k: 'Inside the company',
      items: [
        { t: 'People', b: 'A strong employee in the wrong seat, a team that works hard and produces little' },
        { t: 'Operations', b: 'The same mistake every week, and work that stops when one person is away' },
        { t: 'Costs', b: 'Subscriptions, contracts and costs that run every month, and nobody asks why' },
        { t: 'Decisions', b: 'Calls made on gut feeling, because the number is not in front of you when you need it' },
      ],
    },
    outside: {
      k: 'In the market',
      items: [
        { t: 'Sales', b: 'Interested buyers nobody closed, quotes sent and forgotten' },
        { t: 'Marketing', b: 'An ad budget that buys many clicks and few customers' },
        { t: 'Customers', b: 'Someone bought once and never came back, and nobody asked why' },
        { t: 'Partnerships', b: 'Relationships and assets that could be new income, sitting idle' },
      ],
    },
    close: 'Each one is small on its own. Together they are the difference between a company that grows and one that runs in place',
  },

  mix: {
    eyebrow: 'Why KON',
    title: 'People move the numbers',
    lede: 'So we look at your company through three lenses at once',
    lenses: [
      { k: 'Operations', q: 'How does the work flow?', b: 'We map the path from first order to delivery: who does what, when, and how it is measured' },
      { k: 'Psychology', q: 'Why do people act this way?', b: 'Why a customer hesitates before paying, why a team member lights up or switches off. We treat the cause, not the symptom' },
      { k: 'Innovation', q: 'What is missing?', b: 'When what exists is not enough, we build the tool, system or income stream that closes the gap' },
    ],
    close: 'When the three meet, you see what others miss',
    outK: 'What changes for you?',
    outcomes: ['More profit, same team', 'Clearer, lower costs', 'Decisions on numbers', 'More than one income stream', 'Work that runs even when you are away'],
  },

  how: {
    measureK: 'How do we measure success?',
    measureTitle: 'Three numbers, out in the open',
    measure: [
      { n: '01', t: 'Riyals we saved you' },
      { n: '02', t: 'Riyals we added' },
      { n: '03', t: 'What each riyal you paid brought back' },
    ],
    measureFoot: 'And beside them, your team’s health, because growth that burns people out does not last',
  },

  plans: {
    eyebrow: 'Business development department',
    title: 'A full business development department, working for you from month one',
    lede: 'Building one in-house takes months of hiring and a heavy monthly cost. With us you get a ready team with its experience and tools, sized to your stage',
    term: 'Agreement length',
    months: (n: number) => (n === 12 ? '1 year' : `${n} months`),
    termNotes: ['Lowest commitment, price 10% higher', 'Base price', 'Save 8% and lock your price for a year'],
    notOn3: 'From 6 months',
    perMonth: 'SAR / month',
    perDay: (d: string) => `That is SAR ${d} a day`,
    gets: 'What the department works on',
    pick: (name: string) => `Start with ${name}`,
    why: {
      k: 'Why this price?',
      points: [
        { t: 'A department, not one hire', b: 'Experience across operations, sales and market, and a team that covers for each other' },
        { t: 'No hiring risk', b: 'No months of searching, no salary on the wrong person' },
        { t: 'Scale up or down', b: 'Move between packages as your stage changes, with a month’s notice' },
      ],
    },
    compare: {
      k: 'Compare for yourself',
      you: 'Building it yourself',
      youNote: 'SAR a month for a manager, specialists, an analyst and tools, and four to six months before it works',
      kon: 'With KON',
      konN: '27,500',
      konNote: 'SAR a month for Growth, starting in week one',
      src: 'Estimate for a team of four in Saudi Arabia from published salary averages, with GOSI, end of service and tools',
    },
    promise: { k: 'Our commitment', t: 'If you see no clear impact in the numbers within the first 90 days, month four is on us' },
    travel: { k: 'Field days', t: 'Included in Jeddah and Madinah. Elsewhere we come to you with the same quality, and travel and lodging are added at actual cost after your approval' },
    payNote: 'Prices in SAR before VAT · after the first 3 months you can stop with 30 days’ notice',
    tiers: [
      {
        id: 'core', name: 'Launch', mode: 'Remote, one field day a month', price: 14500,
        line: 'For a company that wants solid foundations and to know where its growth will come from',
        gets: ['A full reading of your company and market, and a 90-day plan with clear targets', 'A monthly numbers board: sales, costs and opportunities', 'A review of your offer, pricing and sales message', 'Written operating procedures for your two key processes', 'A follow-up meeting every two weeks'],
      },
      {
        id: 'growth', name: 'Growth', mode: 'Remote, two field days a month', price: 27500, tag: 'Right for most companies',
        line: 'For a running company that wants sales and operations to grow together',
        gets: ['Everything in Launch', 'We build your sales path, from first contact to a closed deal', 'Sales team training on calls and objections', 'A new sales channel or partnership every quarter', 'A mystery shopper review of the customer experience every 3 months', 'A weekly follow-up meeting'],
      },
      {
        id: 'partner', name: 'Full department', mode: 'One day a week on site', price: 46000, minMonths: 6,
        line: 'For a company that is expanding and wants a department that owns the whole file',
        gets: ['Everything in Growth', 'A business development manager dedicated to you', 'An expansion plan: a new city, product or market', 'Big proposals, tenders and key-account meetings prepared', 'A quarterly report for partners or the board'],
      },
    ] as StoryTier[],
    unsure: 'Not sure which fits? The first session is free, and we will tell you honestly',
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
