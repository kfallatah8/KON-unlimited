// All site copy, Arabic first. Sections marked LOCKED use khalid's approved wording verbatim.
// Anything marked CONFIRM is an assumption waiting for khalid's sign-off.

export type Lang = 'ar' | 'en'
export type Persona = 'founder' | 'business' | 'investor'
export type IconId =
  | 'flex' | 'aligned' | 'spark' | 'layers' | 'ai' | 'cycle' | 'mind' | 'field'
  | 'storm' | 'anchor' | 'rise' | 'seed' | 'compass'
  | 'eye' | 'people' | 'train' | 'bulb'
  | 'tour' | 'web' | 'brand' | 'guest' | 'sales' | 'growth' | 'systems'

/** Solutions. Demos for each one live in content/ready.ts. */
export type ServiceId = 'tours' | 'web' | 'brand' | 'guest' | 'sales' | 'growth' | 'systems'

export interface Option { id: string; label: string }
export interface Question {
  id: string
  label: string
  hint?: string
  kind: 'single' | 'multi' | 'text' | 'scale'
  options?: Option[]
  optional?: boolean
  placeholder?: string
}
export interface Step { title: string; lede?: string; questions: Question[] }

export interface CaseItem {
  sector: string
  title: string
  body: string
  metric?: string
  metricLabel?: string
  extra?: string
  tag: string
  /** Shown as a small "to confirm" mark until khalid confirms the detail. */
  confirm?: boolean
}

/** Where onboarding briefs go. Empty = not connected yet (the form says so plainly). */
/** Embeddable 360° tour (Kuula). The page loads it only when a visitor asks for it. */
export const tourUrl = 'https://kuula.co/share/collection/7MZVN?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1'

export const contact = {
  email: 'info@kon-unlimited.com',
  whatsapp: '966562399592', // international format without +, e.g. 9665XXXXXXXX
}

const ar = {
  meta: {
    switchTo: 'EN', switchLabel: 'Switch to English', menu: 'القائمة', close: 'إغلاق', skip: 'تخطَّ إلى المحتوى',
    title: 'KON Unlimited · نرفع كفاءة مشروعك',
  },
  nav: [
    { href: '#who', label: 'من نساعد' },
    { href: '#why', label: 'لماذا KON' },
    { href: '#offer', label: 'العرض' },
    { href: '#work', label: 'أعمالنا' },
    { href: '#ready', label: 'الحلول' },
    { href: '#founder', label: 'المؤسس' },
  ],
  headerCta: 'ابدأ التشخيص',

  hero: {
    eyebrow: 'استشارات · تطوير أعمال · تشغيل',
    rotating: ['نرفع كفاءة مشروعك', 'نحسّن كفاءة التشغيل', 'نحوّل فكرتك إلى مشروع يعمل', 'نجعل استثمارك يعمل بذكاء'],
    promise: 'وعدنا بسيط: **نطوّر أي عملية تشغيلية، ونحسّنها**',
    lede: 'من **الفكرة الأولى** إلى **شركة تعمل بانتظام**، دون أن تحمل كل شيء وحدك',
    primary: 'ابدأ تشخيصك المجاني',
    secondary: 'شاهد النتائج',
    slogan: 'أينما كان التحدي، وكيفما كان، سنكون هناك',
    scroll: 'مرّر',
    proof: [
      { n: '+4,200', l: 'ساعة استشارية' },
      { n: '11', l: 'قطاعًا' },
      { n: '14M', l: 'إيرادات في دخول سوق واحد' },
      { n: '+161%', l: 'نمو إيرادات أحد عملائنا خلال 30 يومًا' },
    ],
  },

  // LOCKED (khalid, 2026-10-21)
  problem: {
    title: 'ما تعرف المشكلة فين بالضبط؟',
    lines: ['الموظفين؟ الخطة التشغيلية؟ التوسّع؟'],
    closing: 'بإذن الله، سنجد الحل',
    paths: [
      { persona: 'founder' as Persona, label: 'أنا رائد أعمال', q: ['الفكرة؟', 'نموذج العمل؟', 'أول العملاء؟', 'أول موظف؟'] },
      { persona: 'business' as Persona, label: 'أنا كيان تجاري', q: ['الموظفين؟', 'الخطة التشغيلية؟', 'التوسّع؟', 'المبيعات؟', 'التكاليف؟'] },
      { persona: 'investor' as Persona, label: 'أنا مستثمر', q: ['فرص جديدة؟', 'قراءة الفرصة؟', 'أداء الاستثمار؟', 'التقارير؟'] },
    ],
    hint: 'اختر ما يشبهك، ونكمل من عندك',
  },

  loops: {
    eyebrow: 'أسئلة لا تقولها بصوت عالٍ',
    title: 'هل سألت نفسك يومًا…',
    pick: 'اختر ما يشبهك:',
    groups: [
      { persona: 'business' as Persona, label: 'كيان تجاري', qs: ['مبيعاتك تزيد. فلماذا لا يزيد ربحك؟', 'لماذا يتوقف كل شيء حين تأخذ يوم إجازة؟'] },
      { persona: 'founder' as Persona, label: 'رائد أعمال', qs: ['مقتنع بفكرتك تمامًا. فلماذا لم تبدأ حتى الآن؟', 'ماذا لو كان أول عميل لك أقرب مما تظن؟'] },
      { persona: 'investor' as Persona, label: 'مستثمر', qs: ['استثماراتك: هل تعمل لك، أم تعمل أنت لها؟', 'كم فرصة تركتها لأن أحدًا لم يقرأ أرقامها بصدق؟'] },
    ],
    tail: 'الإجابة نادرًا ما تكون حيث تبحث. **ونحن نعرف أين نبحث**',
    cta: 'اكتشف إجابتك',
  },

  who: {
    eyebrow: 'من نساعد',
    title: 'أينما كنت اليوم، نعرف الخطوة التالية',
    groups: [
      { icon: 'storm' as IconId, persona: 'business' as Persona, title: 'شركات تتعثّر', line: 'نوقف النزيف أولًا', body: 'حين تضغط التكاليف والسيولة والفريق في وقت واحد، **نثبّت الوضع**، ثم نعيد البناء على أساس صحيح' },
      { icon: 'anchor' as IconId, persona: 'business' as Persona, title: 'شركات مستقرة', line: 'الاستقرار الطويل يخفي فرصًا ضائعة', body: 'تعمل جيدًا، وتشعر أنها قادرة على أكثر. نجد **الهدر الصامت**، ونحوّله إلى **هامش ربح**' },
      { icon: 'rise' as IconId, persona: 'business' as Persona, title: 'شركات تنمو', line: 'النمو يكسر ما كان يعمل', body: 'فروع جديدة، وفريق أكبر، وأنظمة لم تُصمَّم لهذا الحجم. نبني **تشغيلًا يتحمّل التوسّع**' },
      { icon: 'seed' as IconId, persona: 'founder' as Persona, title: 'روّاد أعمال', line: 'من الفكرة إلى أول ريال', body: 'عندك فكرة أو شركة ناشئة ولا تعرف من أين تبدأ؟ **نموذج العمل، ودخول السوق، وأول العملاء**، وأول موظف. خطوة بخطوة، معك' },
      { icon: 'compass' as IconId, persona: 'investor' as Persona, title: 'مستثمرون', line: 'فرص أوضح، واستثمارات تُدار بعقل', body: 'نبحث معك عن **فرص جديدة** ونقرؤها بصدق، وندير استثماراتك القائمة **بنظام يحميها وينمّيها**' },
    ],
    cta: 'هذا أنا',
  },

  // CONFIRM: written as a commitment of effort, not as a fee term. See the note to khalid.
  commit: {
    eyebrow: 'التزامنا',
    work: { n: '80%', label: 'من العمل علينا' },
    you: { n: '20%', label: 'عليك: القرار والرؤية' },
    badge: 'أتعابنا على النتائج',
    title: 'نحمل 80% من العمل. وأجرنا على النتائج',
    body: 'لا نسلّمك تقريرًا ونختفي. **ننزل إلى الميدان، ونبني، وندرّب، ونتابع حتى يعمل.** وأجرنا **مرتبط بالنتائج التي نصنعها لك**: حين تتحرك أرقامك، نستحق أتعابنا',
    fine: 'طريقة ربط الأتعاب بالنتائج نتفق عليها معك بوضوح، ومكتوبة، قبل أن نبدأ',
  },

  why: {
    eyebrow: 'لماذا KON',
    title: 'لأنك لا تحتاج مستشارًا آخر. تحتاج من يُكمل معك الطريق',
    items: [
      { icon: 'flex' as IconId, title: 'مرنون مع أي وضع', body: 'ميزانية محدودة؟ وقت ضيّق؟ وضع معقّد؟ نصمّم طريقة العمل **حول واقعك**، لا العكس' },
      { icon: 'aligned' as IconId, title: 'نربح حين تربح', body: '**مصلحتنا مربوطة بنتيجتك.** إن لم تتحرك أرقامك، فلم ننجز عملنا بعد' },
      { icon: 'spark' as IconId, title: 'مبتكرون', body: 'حين لا يكفي الموجود، نبني **ما لم يكن موجودًا**: أنظمة، وأدوات، وتجارب' },
      { icon: 'layers' as IconId, title: 'خبرة في 11 قطاعًا', body: 'اتصالات، وعقار، وضيافة، وترفيه، وأغذية، وفعاليات، وسلاسل إمداد. **ننقل ما نجح هناك إلى عندك**' },
      { icon: 'ai' as IconId, title: 'آلاف الموظفين، بجزء من التكلفة', body: 'نوظّف **الذكاء الاصطناعي** ليقوم **بعمل فرق كاملة**: تحليل، ومتابعة، وتقارير، وخدمة عملاء. والقرار يبقى بشريًا' },
      { icon: 'cycle' as IconId, title: 'استدامة، لا مسكّنات', body: 'أنظمة، وإجراءات تشغيل (SOPs)، وفريق يعرف ماذا يفعل. فتبقى **النتيجة بعد أن ننتهي**' },
      { icon: 'mind' as IconId, title: 'نفهم الإنسان قبل الرقم', body: 'خلفيتنا في علم النفس تجعلنا نقرأ **سلوك العميل وعقلية الموظف**. وهما خلف كل رقم' },
      { icon: 'field' as IconId, title: 'ننفّذ، لا ننصح فقط', body: 'نقف مع فريقك في الميدان حتى يصبح الجديد **عادة يومية**' },
    ],
  },

  human: {
    eyebrow: 'ما يميّزنا',
    title: 'خلف كل رقم إنسان. ونحن نبدأ منه',
    lede: 'الشركات لا تتعثّر بسبب الجداول. تتعثّر حين **لا يُفهم العميل، ولا يُفهم الموظف**. هنا تبدأ ميزتنا',
    pillars: [
      { icon: 'eye' as IconId, title: 'سلوك المستهلك', body: 'لماذا يشتري عميلك؟ ولماذا يتردد؟ ولماذا لا يعود؟ نقرأ القرار من داخله، و**نعيد تصميم التجربة** حوله' },
      { icon: 'people' as IconId, title: 'عقلية الموظف', body: 'الموظف لا يقاوم التغيير. **يقاوم الغموض.** نجعل التغيير واضحًا، فيصبح الفريق جزءًا منه' },
      { icon: 'train' as IconId, title: 'تدريب يغيّر السلوك', body: 'تدريب **يظهر أثره في الميدان** من الأسبوع الأول، لا شهادة تُعلَّق على الجدار' },
      { icon: 'bulb' as IconId, title: 'ابتكار عملي', body: 'أنظمة تشغيل داخلية، وأدوات ميدانية، وتجارب رقمية. نبتكر **ما يُستخدم كل يوم**، لا ما يُعرض مرة' },
    ],
  },

  // From the locked v3 services list, with Mystery Shopper.
  services: {
    eyebrow: 'خدماتنا',
    title: 'ست أدوات. هدف واحد: تشغيل أفضل',
    items: [
      { title: 'التشخيص', body: 'نرى شركتك من ثمانية أبعاد' },
      { title: 'الاستراتيجية', body: 'نحدد وجهتك، وما يجب أن تتركه خلفك' },
      { title: 'العمليات', body: 'نزيل ما يُبطئك' },
      { title: 'المتسوق الخفي', body: 'نزورك كعميل عادي، ونرى ما يراه عملاؤك فعلًا' },
      { title: 'الحلول الرقمية', body: 'نبني الأداة التي تحتاجها، لا التي تُباع لك' },
      { title: 'الذكاء الاصطناعي', body: 'يُسرّع التحليل، ويبقى القرار بشريًا' },
    ],
  },

  // Confirmed by khalid 2026-10-27: 60 minutes, limited number each month.
  offer: {
    eyebrow: 'العرض',
    title: 'التشخيص الأول علينا',
    lede: 'جلسة تشخيص مع **خبير أول** من فريقنا. تخرج منها **بصورة أوضح لوضعك**، حتى لو لم نعمل معًا بعدها',
    includes: [
      'جلسة تشخيص مركّزة، 60 دقيقة',
      'قراءة لوضعك من ثمانية أبعاد',
      'أهم 3 فرص يمكنك البدء بها فورًا',
      'خريطة طريق مبدئية مكتوبة',
    ],
    value: 'بلا تكلفة. بلا التزام',
    guarantee: 'إن لم تخرج **بفكرة واحدة على الأقل تستحق وقتك**، فنحن من خسر الوقت، لا أنت',
    cta: 'احجز تشخيصك المجاني',
    note: 'عدد الجلسات محدود كل شهر، لأننا نحضّر لكل جلسة بعناية',
  },

  work: {
    eyebrow: 'أعمالنا',
    title: 'أرقام حقيقية، من مشاريع حقيقية',
    lede: 'ما أنجزناه نقول إنه أُنجز. وما زلنا نبنيه نقول إننا نبنيه',
    confirmMark: 'بانتظار التأكيد',
    featured: [
      { sector: 'الاتصالات', tag: 'تطوير أعمال · GTM', title: 'دخول Telkomsel إلى السوق السعودي', body: 'تطوير الأعمال، وبناء استراتيجية دخول السوق وتنفيذها لشركة الاتصالات الإندونيسية Telkomsel في السعودية', metric: '14M', metricLabel: 'ريال إيرادات تحققت' },
      { sector: 'الترفيه والضيافة', tag: 'تطوير أعمال · تشغيل', title: 'Games Club (GC)', body: 'إعادة بناء التشغيل كاملًا: هندسة القائمة، وتدريب الفريق، وتجربة الضيف، وإجراءات تشغيل قياسية (SOPs)، وشراكات جديدة', metric: '+161.11%', metricLabel: 'نمو الإيرادات خلال 30 يومًا', extra: '+511.11% متوسط الإيرادات الشهرية' },
      { sector: 'الأغذية والمشروبات', tag: 'من الفكرة إلى السوق', title: 'روسـيـلا: علامة عصائر من الصفر', body: 'بناء العلامة وتشغيلها من مجرد فكرة: المنتج، والتشغيل، والبيع', metric: '4K', metricLabel: 'ريال إيراد يومي' },
      { sector: 'العقار والاستثمار', tag: 'استراتيجية · تنفيذ', title: 'صفقة عقارية مع مستثمر خاص', body: 'بناء الاستراتيجية الكاملة وتنفيذ الصفقة مع مستثمر من القطاع الخاص', metric: '1.4M', metricLabel: 'ريال قيمة الصفقة' },
    ] as CaseItem[],
    more: [
      { sector: 'التسويق العقاري', tag: 'تطوير أعمال', title: 'وثاق للتسويق العقاري', body: 'تطوير الأعمال لشركة وثاق للتسويق العقاري، بدور مطوّر أعمال' },
      { sector: 'التسويق العقاري', tag: 'أدوات تشغيل', title: 'روافد للتسويق العقاري', body: 'بناء أدوات تشغيل داخلية تختصر وقت الفريق وتنظّم عمله' },
      { sector: 'الفعاليات', tag: 'أنظمة من ابتكارنا', title: 'اللجنة المنظمة المحلية (LOC)', body: 'ابتكار أنظمة تشغيل داخلية وبناؤها للجنة المنظمة المحلية' },
      { sector: 'سلاسل الإمداد', tag: 'الولايات المتحدة', title: 'شركة أمريكية في أبيلين، تكساس', body: 'تحسين عمليات سلسلة الإمداد من الطلب إلى التسليم' },
      { sector: 'الاستثمار', tag: 'إدارة فرص', title: 'مستثمرون من القطاع الخاص', body: 'إنشاء فرص استثمارية جديدة، وإدارة الفرص القائمة' },
      { sector: 'ريادة الأعمال', tag: 'مجتمع · ورش عمل', title: 'مجتمع KON لروّاد الأعمال', body: 'تأسيس المجتمع في المدينة المنورة، وتشغيله، وتقديم ورش العمل فيه', metric: '+3,000', metricLabel: 'ساعة مع روّاد الأعمال' },
    ] as CaseItem[],
    tail: 'وأكثر من 12 مشروعًا آخر في 11 قطاعًا، من الضيافة إلى الواقع المعزّز',
    tour: { eyebrow: 'جولة افتراضية 360°', title: 'ادخل أحد مشاريعنا', body: 'تجوّل داخل إحدى الفلل، وانتقل بين الغرف كما لو كنت هناك', cta: 'ابدأ الجولة', open: 'افتح في نافذة جديدة', close: 'إغلاق الجولة' },
  },


  // Solutions. Each one opens with the client's pain, then what changes for them.
  // Add a solution: give it an id in ServiceId, an icon, and an entry here (both languages).
  // Live demos go in content/ready.ts, business apps in content/apps.ts.
  ready: {
    eyebrow: 'الحلول',
    title: 'كل حل هنا بدأ من مشكلة حقيقية',
    lede: 'اختر المشكلة التي تشبه مشكلتك، وشاهد كيف نحلّها، **بنماذج حيّة** من أعمالنا',
    pain: 'هل تعرف هذا الشعور؟',
    includes: 'ما الذي يتغيّر عندك',
    demos: 'شاهد بنفسك',
    open: 'افتح النموذج',
    proof: 'حدث فعلًا مع',
    cta: 'أريد هذا الحل',
    browseApps: 'تصفّح مكتبة التطبيقات',
    noDemo: 'نريك نماذج هذا الحل في جلسة التشخيص، بتفاصيل لا ننشرها هنا احترامًا لعملائنا',
    tail: 'مشكلتك ليست هنا؟ **أخبرنا بها، ونبني حلها**',
    apps: {
      eyebrow: 'مكتبة التطبيقات',
      title: 'أكثر من 100 تطبيق أعمال جاهز، نختار لك منها ما يحتاجه نشاطك فقط',
      lede: 'لا تحتاج أن تعرف أسماءها. اختر قطاعك، وشاهد ما نجهّزه لأمثالك: **بالعربية، ومربوطًا ببعضه، مع تدريب فريقك**',
      teaser: 'أنظمة جاهزة لـ 21 قطاعًا، من المطاعم إلى المصانع',
      count: (n: number) => `${n} تطبيقًا لهذا القطاع`,
      showAll: (n: number) => `اعرض الكل (${n})`,
      showLess: 'اعرض أقل',
      foot: 'كل التطبيقات مفتوحة المصدر ومجرّبة عالميًا. نحن نختار، ونجهّز، وندرّب، ونتابع',
    },
    items: [
      {
        id: 'tours' as ServiceId, icon: 'tour' as IconId, title: 'الجولات الافتراضية للعقارات',
        pain: 'تحجز موعد المعاينة، وتقطع الطريق، ثم يقول العميل من أول دقيقة: ليس هذا ما أبحث عنه',
        line: 'المشتري يتجوّل في العقار من جواله، فلا يصلك للمعاينة إلا الجادّ',
        includes: ['وقت فريقك يذهب للمشترين الجادّين، لا لمعاينات بلا نتيجة', 'المشتري من مدينة أو دولة أخرى يرى العقار كاملًا قبل أن يسافر', 'إعلانك يبقى في ذهن العميل أطول، لأنه دخل العقار ولم يكتفِ بالصور'],
      },
      {
        id: 'web' as ServiceId, icon: 'web' as IconId, title: 'تصميم المواقع',
        pain: 'عميلك يبحث عنك قبل أن يتصل بك. وما يجده اليوم لا يعكس حجمك الحقيقي',
        line: 'موقع يجعل الزائر يثق بك قبل أول مكالمة، ثم يطلب',
        includes: ['عميلك الخليجي يقرأ بلغته، والشريك الأجنبي يفهمك دون وسيط', 'انطباع فاخر من أول ثانية يبرّر سعرك، فلا تضطر للمنافسة بالخصومات', 'يفتح بسرعة على الجوال، حيث يتصفّح عملاؤك ويقرّرون'],
      },
      {
        id: 'brand' as ServiceId, icon: 'brand' as IconId, title: 'هندسة الهوية التجارية',
        pain: 'منتجك جيد، لكن العميل لا يتذكّر اسمك، ويقارنك بالأرخص',
        line: 'هوية تجعل العميل يختارك، حتى حين لا تكون الأرخص',
        includes: ['رسالة يفهمها العميل في ثوانٍ: لماذا أنت، ولماذا الآن', 'حضور واحد في كل مكان، من اللوحة إلى الكوب إلى الإعلان، يبني الثقة بالتكرار', 'دليل يحمي هويتك من اجتهادات كل مصمم أو موظف جديد'],
        proof: { label: 'روسـيـلا للعصائر', href: '#work' },
      },
      {
        id: 'guest' as ServiceId, icon: 'guest' as IconId, title: 'تحسين تجربة الضيف',
        pain: 'الضيف يأتي مرة، ولا يعود. ولا أحد يخبرك لماذا',
        line: 'تجربة يعود الضيف من أجلها، ويحكي عنها لغيره',
        includes: ['تعرف ما يحدث فعلًا في غيابك، عبر زيارات المتسوّق الخفي', 'كل لحظة في رحلة الضيف مصمَّمة، من الاستقبال إلى الوداع', 'فريقك يقدّم المستوى نفسه في كل وردية، بمعايير وإجراءات تشغيل (SOPs) مكتوبة'],
        proof: { label: 'Games Club (GC)', href: '#work' },
      },
      {
        id: 'sales' as ServiceId, icon: 'sales' as IconId, title: 'تدريب فرق المبيعات',
        pain: 'العملاء يسألون كثيرًا، ويشترون قليلًا. والصفقة تضيع غالبًا في لحظة واحدة من المحادثة',
        line: 'فريق يعرف كيف يحوّل السؤال إلى صفقة',
        includes: ['تدريب على المواقف التي يواجهها فريقك كل يوم، لا على أمثلة من الكتب', 'ردود جاهزة على «السعر غالي» و«خلّني أفكّر»، فلا تضيع الصفقة عند الاعتراض', 'نتابع الفريق في الميدان بعد التدريب، حتى يتحوّل الكلام إلى عادة، والعادة إلى أرقام'],
        proof: { label: 'Games Club (GC)', href: '#work' },
      },
      {
        id: 'growth' as ServiceId, icon: 'growth' as IconId, title: 'استراتيجيات تطوير الأعمال',
        pain: 'وصلت إلى سقف: العملاء أنفسهم، والأرقام نفسها، ولا تعرف من أين يأتي النمو القادم',
        line: 'خطة نمو بأرقام، ننفّذها معك خطوة بخطوة',
        includes: ['نحدّد السوق أو الشريحة التالية، ونحسب تكلفة دخولها قبل أن تدفع ريالًا', 'شراكات وقنوات بيع توصلك إلى عملاء لم تكن تصل إليهم', 'مؤشرات أسبوعية تريك إن كنت تتقدّم فعلًا، لا مجرد شعور بالحركة'],
        proof: { label: 'دخول Telkomsel إلى السوق السعودي', href: '#work' },
      },
      {
        id: 'systems' as ServiceId, icon: 'systems' as IconId, title: 'أنظمة وتطبيقات الأعمال',
        pain: 'كل شيء في رأسك، وفي واتساب، وفي ملفات إكسل. وإن غبت يومًا، تعطّل العمل',
        line: 'أنظمة تحفظ عملك وأرقامك، فيستمر مشروعك حتى في غيابك',
        includes: ['تعرف مبيعاتك ومخزونك وأداء فريقك اليوم، لا في آخر الشهر', 'أنظمة مجرّبة عالميًا، دون رسوم ترخيص على كل مستخدم، نجهّزها بالعربية لنشاطك', 'ندرّب فريقك حتى يصبح النظام جزءًا من يومه، لا عبئًا عليه'],
        proof: { label: 'روافد للتسويق العقاري', href: '#work' },
      },
    ],
  },

  // CONFIRM: how requests are selected.
  support: {
    eyebrow: 'مبادرة KON',
    title: 'مشروعك يتعثّر، ولا تملك الميزانية؟ هذا لك',
    body: 'نقدّم الاستشارة المتقدّمة والدعم التشغيلي الكامل **مجانًا** للمشاريع المتعثّرة التي لا تستطيع تحمّل تكلفته. بلا مقابل، وبلا شروط خفية',
    dedication: 'صدقةً عن والدي رحمه الله، وعن جميع المسلمين',
    note: 'نستقبل الطلبات بحسب طاقتنا، ونردّ على كل طلب',
    cta: 'قدّم طلب الدعم',
  },

  // LOCKED (khalid, 2026-10-25)
  founder: {
    eyebrow: 'كلمة المؤسس',
    paragraphs: [
      'أنا خالد. منذ عام 2007 وأنا تحت إشراف الإدارة العامة لتربية الموهوبين بالمدينة المنورة',
      'أخصائي نفسي، ورائد أعمال، ومطوّر أعمال',
      'عملت في مناصب مختلفة وقطاعات مختلفة، وقدّمت أكثر من **4,200 ساعة استشارية** لروّاد أعمال ومشاريع متنوعة. وخضت مشاريع لم تنجح، فكانت أصدق مدرسة مررت بها',
      'شغفي **الابتكار**، وأؤمن بقدرتي على إضافة قيمة حقيقية لأي كيان تجاري ولأي رائد أعمال',
    ],
    punch: 'كلّنا لدينا مشكلات. لكن المشكلة بداية الحل',
    cta: 'ابدأ تشخيصك',
  },

  onboarding: {
    eyebrow: 'ابدأ هنا',
    title: 'دقيقتان. وتحصل على صورة أوضح لوضعك',
    lede: 'أسئلة قليلة، **مصمّمة لتفهمك أنت**. كلما كانت إجاباتك أصدق، كانت جلستك أنفع',
    start: 'لنبدأ',
    next: 'التالي',
    back: 'رجوع',
    finish: 'الخطوة الأولى',
    skip: 'تخطَّ',
    stepOf: (a: number, b: number) => `الخطوة ${a} من ${b}`,
    otherPlaceholder: 'أخرى؟ اكتبها هنا',
    required: 'اختر إجابة واحدة على الأقل للمتابعة',
    personaQ: 'من أنت؟',
    personas: {
      founder: { label: 'رائد أعمال', sub: 'عندي فكرة أو شركة ناشئة' },
      business: { label: 'كيان تجاري', sub: 'أملك شركة أو أديرها' },
      investor: { label: 'مستثمر', sub: 'أبحث عن فرص أو أدير استثمارات' },
    } as Record<Persona, { label: string; sub: string }>,
    supportToggle: 'أتقدّم لمبادرة الدعم المجاني (لا أملك ميزانية الآن)',
    scaleLow: 'يمكن أن ينتظر',
    scaleHigh: 'عاجل جدًا',
    contact: {
      title: 'أين نجدك؟',
      lede: 'لن نشارك بياناتك مع أحد. نستخدمها فقط للتواصل معك بخصوص طلبك',
      name: 'الاسم',
      company: 'اسم المشروع أو الشركة',
      phone: 'رقم الجوال (واتساب)',
      email: 'البريد الإلكتروني',
      city: 'المدينة والدولة',
      prefer: 'كيف تفضّل أن نتواصل؟',
      preferOpts: [{ id: 'whatsapp', label: 'واتساب' }, { id: 'call', label: 'اتصال' }, { id: 'email', label: 'بريد' }],
      needOne: 'أضف اسمك ووسيلة تواصل واحدة على الأقل',
    },
    summary: {
      title: 'هذه خطوتك الأولى',
      lede: 'قرأنا إجاباتك. هذا ما نراه، وهذه أول خطوة نقترحها',
      persona: 'المسار',
      stage: 'الوضع الحالي',
      pains: 'ما يثقلك',
      goals: 'ما تريده',
      urgency: 'درجة الإلحاح',
      urgencyLevels: ['يمكن التخطيط له بهدوء', 'مهم، ويستحق البدء قريبًا', 'عاجل، كل أسبوع له ثمن'],
      primary: 'نقترح أن نبدأ بـ',
      also: 'وقد يفيدك أيضًا',
      next: 'الخطوة التالية',
      nextBody: 'جلسة التشخيص المجانية. نأتيك وقد قرأنا كل هذا، فلا نبدأ من الصفر',
      sendWhatsapp: 'أرسلها لنا عبر واتساب',
      sendEmail: 'أرسل بالبريد',
      copy: 'انسخ الملخص',
      copied: 'نُسخ',
      download: 'نزّل الملخص',
      edit: 'عدّل إجاباتي',
      raw: 'اعرض نص الملخص',
      notConnected: 'نسخة تجريبية: النموذج غير مربوط بعد بأي جهة استقبال، ولا يُرسل شيء تلقائيًا. انسخ ملخصك وأرسله لنا بنفسك',
      supportBadge: 'طلب ضمن مبادرة الدعم المجاني',
    },
  },

  finale: {
    line: 'كل القطع كانت هنا من البداية',
    line2: 'كانت تحتاج فقط من يرتّبها',
    cta: 'ابدأ الآن',
  },

  footer: {
    rights: '© 2026 KON Unlimited. جميع الحقوق محفوظة',
    slogan: 'أينما كان التحدي، وكيفما كان، سنكون هناك',
    top: 'إلى الأعلى',
  },
}

export type Content = typeof ar

const en: Content = {
  meta: {
    switchTo: 'ع', switchLabel: 'التبديل إلى العربية', menu: 'Menu', close: 'Close', skip: 'Skip to content',
    title: 'KON Unlimited · We make your business run better',
  },
  nav: [
    { href: '#who', label: 'Who we help' },
    { href: '#why', label: 'Why KON' },
    { href: '#offer', label: 'The offer' },
    { href: '#work', label: 'Work' },
    { href: '#ready', label: 'Solutions' },
    { href: '#founder', label: 'Founder' },
  ],
  headerCta: 'Start diagnosis',

  hero: {
    eyebrow: 'Advisory · Business development · Operations',
    rotating: ['We make your business run better', 'We sharpen how you operate', 'We turn ideas into working businesses', 'We make your capital work smarter'],
    promise: 'Our promise is simple: **we optimise and develop any operation**',
    lede: 'From **the first idea** to **a company that runs steadily**, without you carrying all of it alone',
    primary: 'Start your free diagnosis',
    secondary: 'See the results',
    slogan: 'Anywhere. Any challenge. Any way. We’ll be there',
    scroll: 'Scroll',
    proof: [
      { n: '4,200+', l: 'advisory hours' },
      { n: '11', l: 'sectors' },
      { n: '14M', l: 'revenue from one market entry' },
      { n: '+161%', l: 'client revenue growth in 30 days' },
    ],
  },

  problem: {
    title: 'Not sure exactly where the problem is?',
    lines: ['Your team? Your operating plan? Expansion?'],
    closing: 'Insha’Allah, we’ll find the answer',
    paths: [
      { persona: 'founder', label: 'I’m an entrepreneur', q: ['The idea?', 'The business model?', 'First customers?', 'First hire?'] },
      { persona: 'business', label: 'I run a business', q: ['The team?', 'The operating plan?', 'Expansion?', 'Sales?', 'Costs?'] },
      { persona: 'investor', label: 'I’m an investor', q: ['New deals?', 'Reading a deal?', 'Underperformance?', 'Reporting?'] },
    ],
    hint: 'Pick what sounds like you. We’ll take it from there',
  },

  loops: {
    eyebrow: 'Questions you don’t say out loud',
    title: 'Have you ever asked yourself…',
    pick: 'Pick what sounds like you:',
    groups: [
      { persona: 'business', label: 'Business', qs: ['Sales keep rising. So why doesn’t profit?', 'Why does everything stop the day you take off?'] },
      { persona: 'founder', label: 'Entrepreneur', qs: ['You believe in your idea. So why haven’t you started?', 'What if your first customer is closer than you think?'] },
      { persona: 'investor', label: 'Investor', qs: ['Are your investments working for you, or are you working for them?', 'How many deals did you pass on because no one read the numbers honestly?'] },
    ],
    tail: 'The answer is rarely where you’re looking. **We know where to look**',
    cta: 'Find your answer',
  },

  who: {
    eyebrow: 'Who we help',
    title: 'Wherever you are today, we know the next move',
    groups: [
      { icon: 'storm', persona: 'business', title: 'Companies under pressure', line: 'First, we stop the bleeding', body: 'When costs, cash and people squeeze you at once, **we stabilise things**, then rebuild on solid ground' },
      { icon: 'anchor', persona: 'business', title: 'Stable companies', line: 'Long stability hides missed upside', body: 'It works, and you sense it could do more. We find **the silent waste** and turn it into **margin**' },
      { icon: 'rise', persona: 'business', title: 'Growing companies', line: 'Growth breaks what used to work', body: 'New branches, a bigger team, systems never built for this size. We build **operations that can carry the scale**' },
      { icon: 'seed', persona: 'founder', title: 'Entrepreneurs', line: 'From idea to first riyal', body: 'An idea or an early startup, and no clear place to begin? **Business model, go-to-market, first customers**, first hire. Step by step, with you' },
      { icon: 'compass', persona: 'investor', title: 'Investors', line: 'Clearer deals. Smarter portfolios', body: 'We source **new opportunities** with you, read them honestly, and run your existing investments with **a system that protects and grows them**' },
    ],
    cta: 'That’s me',
  },

  commit: {
    eyebrow: 'Our commitment',
    work: { n: '80%', label: 'of the work is ours' },
    you: { n: '20%', label: 'is yours: the vision and the call' },
    badge: 'Paid on results',
    title: 'We carry 80% of the work. We get paid on results',
    body: 'We don’t hand you a report and disappear. **We go into the field, build, train and follow through until it works.** Our fees are **tied to the results we create for you**: when your numbers move, we earn our fee',
    fine: 'How fees link to results is agreed with you clearly, in writing, before we start',
  },

  why: {
    eyebrow: 'Why KON',
    title: 'You don’t need another consultant. You need someone who stays for the whole road',
    items: [
      { icon: 'flex', title: 'Flexible with any situation', body: 'Tight budget? Short timeline? Messy situation? We shape the way we work **around your reality**, not the other way round' },
      { icon: 'aligned', title: 'We win when you win', body: '**Our interest is tied to your outcome.** If your numbers haven’t moved, our work isn’t done' },
      { icon: 'spark', title: 'Genuinely innovative', body: 'When what exists isn’t enough, we build **what doesn’t exist yet**: systems, tools, experiences' },
      { icon: 'layers', title: 'Experience across 11 sectors', body: 'Telecoms, real estate, hospitality, entertainment, food, events, supply chain. **What worked there, we bring to you**' },
      { icon: 'ai', title: 'Thousands of staff, at a fraction of the cost', body: 'We put **AI** to work doing **what whole teams do**: analysis, follow-up, reporting, customer service. People still make the decisions' },
      { icon: 'cycle', title: 'Sustainability, not painkillers', body: 'Systems, SOPs and a team that knows what to do. So **results last long after we leave**' },
      { icon: 'mind', title: 'People before numbers', body: 'Our background in psychology lets us read **customer behaviour and employee mindset**, the two things behind every figure' },
      { icon: 'field', title: 'We execute, not just advise', body: 'We stand in the field with your team until the new way becomes **the daily habit**' },
    ],
  },

  human: {
    eyebrow: 'What sets us apart',
    title: 'Behind every number is a person. That’s where we start',
    lede: 'Companies don’t stall because of spreadsheets. They stall when **customers aren’t understood, and staff aren’t either**. That’s our edge',
    pillars: [
      { icon: 'eye', title: 'Consumer behaviour', body: 'Why does your customer buy? Why do they hesitate? Why don’t they come back? We read the decision from the inside and **redesign the experience** around it' },
      { icon: 'people', title: 'Employee mindset', body: 'People don’t resist change. **They resist uncertainty.** We make change clear, so your team becomes part of it' },
      { icon: 'train', title: 'Training that changes behaviour', body: 'Training **you can see on the floor** in week one, not a certificate on the wall' },
      { icon: 'bulb', title: 'Practical innovation', body: 'Internal operating systems, field tools, digital experiences. We invent **what gets used every day**, not what gets demoed once' },
    ],
  },

  services: {
    eyebrow: 'Services',
    title: 'Six tools. One goal: a better-run business',
    items: [
      { title: 'Diagnosis', body: 'We see your company from eight angles' },
      { title: 'Strategy', body: 'Where you’re going, and what to leave behind' },
      { title: 'Operations', body: 'We remove what slows you down' },
      { title: 'Mystery Shopper', body: 'We visit as an ordinary customer and see what your customers really see' },
      { title: 'Digital', body: 'The tool you need, not the one you’re sold' },
      { title: 'AI', body: 'Faster analysis, human decisions' },
    ],
  },

  offer: {
    eyebrow: 'The offer',
    title: 'Your first diagnosis is on us',
    lede: 'A diagnosis session with a **senior advisor**. You leave with **a clearer picture of where you stand**, even if we never work together after',
    includes: [
      'A focused 60-minute diagnosis session',
      'A read of your situation across eight dimensions',
      'Your top 3 quick wins, ready to start on',
      'A written first-draft roadmap',
    ],
    value: 'No cost. No commitment',
    guarantee: 'If you don’t leave with **at least one idea worth your time**, we’re the ones who lost the hour, not you',
    cta: 'Book your free diagnosis',
    note: 'Sessions are limited each month, because each one is prepared with care',
  },

  work: {
    eyebrow: 'Work',
    title: 'Real numbers, from real projects',
    lede: 'If it’s delivered, we say delivered. If we’re still building it, we say so',
    confirmMark: 'Pending confirmation',
    featured: [
      { sector: 'Telecoms', tag: 'Business development · GTM', title: 'Telkomsel’s entry into Saudi Arabia', body: 'Business development, plus building and executing the go-to-market strategy that brought Indonesian telecom operator Telkomsel into the Saudi market', metric: '14M', metricLabel: 'SAR revenue generated' },
      { sector: 'Entertainment & hospitality', tag: 'Business development · Operations', title: 'Games Club (GC)', body: 'A full operational rebuild: menu engineering, staff training, guest experience, standard operating procedures and new partnerships', metric: '+161.11%', metricLabel: 'revenue growth in 30 days', extra: '+511.11% average monthly revenue' },
      { sector: 'Food & beverage', tag: 'Idea to market', title: 'Rosella: a juice brand, from zero', body: 'Building and running the brand from a bare idea: product, operations and sales', metric: '4K', metricLabel: 'SAR revenue per day' },
      { sector: 'Real estate & investment', tag: 'Strategy · Execution', title: 'A private-investor property deal', body: 'Building the full strategy and executing a real estate deal with a private investor', metric: '1.4M', metricLabel: 'SAR deal value' },
    ],
    more: [
      { sector: 'Real estate marketing', tag: 'Business development', title: 'Wethaq Real Estate Marketing', body: 'Business development for Wethaq Real Estate Marketing, in the role of Business Developer' },
      { sector: 'Real estate marketing', tag: 'Operating tools', title: 'Rwafed Real Estate Marketing', body: 'Internal operating tools that save the team time and organise its work' },
      { sector: 'Events', tag: 'Systems we invented', title: 'Local Organising Committee (LOC)', body: 'Inventing and building internal operating systems for the Local Organising Committee' },
      { sector: 'Supply chain', tag: 'United States', title: 'A U.S. company in Abilene, Texas', body: 'Optimising the supply chain process from order to delivery' },
      { sector: 'Investment', tag: 'Opportunity management', title: 'Private investors', body: 'Creating new investment opportunities and managing existing ones' },
      { sector: 'Entrepreneurship', tag: 'Community · Workshops', title: 'KON Entrepreneurs Community', body: 'Founding and running the community in Madinah, and leading its workshops', metric: '3,000+', metricLabel: 'hours with entrepreneurs' },
    ],
    tail: 'Plus 12 more projects across 11 sectors, from hospitality to augmented reality',
    tour: { eyebrow: '360° virtual tour', title: 'Step inside one of our projects', body: 'Walk through one of the villas and move between rooms as if you were there', cta: 'Start the tour', open: 'Open in a new tab', close: 'Close the tour' },
  },


  ready: {
    eyebrow: 'Solutions',
    title: 'Every solution here started with a real problem',
    lede: 'Pick the problem that sounds like yours, and see how we solve it, **with live examples** from our work',
    pain: 'Sound familiar?',
    includes: 'What changes for you',
    demos: 'See it yourself',
    open: 'Open demo',
    proof: 'It happened with',
    cta: 'I want this solution',
    browseApps: 'Browse the apps library',
    noDemo: 'We show you examples of this in your diagnosis session, with details we keep private out of respect for our clients',
    tail: 'Your problem isn\'t here? **Tell us, and we\'ll build the solution**',
    apps: {
      eyebrow: 'Apps library',
      title: 'Over 100 ready business apps. We pick only what your business needs',
      lede: 'You don\'t need to know their names. Pick your sector and see what we set up for businesses like yours: **in Arabic, connected, with your team trained**',
      teaser: 'Ready systems for 21 sectors, from restaurants to factories',
      count: (n: number) => `${n} apps for this sector`,
      showAll: (n: number) => `Show all (${n})`,
      showLess: 'Show less',
      foot: 'Every app is open source and proven worldwide. We choose, set up, train and look after it',
    },
    items: [
      {
        id: 'tours' as ServiceId, icon: 'tour' as IconId, title: 'Virtual tours for real estate',
        pain: 'You book the viewing, drive across town, and the client knows in a minute it isn\'t what they want',
        line: 'Buyers walk through the property on their phone, so only serious ones come to view',
        includes: ['Your team\'s time goes to serious buyers, not viewings that lead nowhere', 'A buyer in another city or country sees the whole property before they travel', 'Your listing stays on the buyer\'s mind longer, because they walked in instead of scrolling photos'],
      },
      {
        id: 'web' as ServiceId, icon: 'web' as IconId, title: 'Website design',
        pain: 'Clients look you up before they call. What they find today doesn\'t show how big you really are',
        line: 'A site that earns trust before the first call, then turns it into a request',
        includes: ['Gulf clients read you in their language, and foreign partners understand you without a middleman', 'A premium first impression that justifies your price, so you don\'t compete on discounts', 'Opens fast on mobile, where your clients browse and decide'],
      },
      {
        id: 'brand' as ServiceId, icon: 'brand' as IconId, title: 'Brand identity engineering',
        pain: 'Your product is good, but customers don\'t remember your name, and compare you with the cheapest',
        line: 'An identity that makes customers choose you, even when you\'re not the cheapest',
        includes: ['A message customers get in seconds: why you, and why now', 'One presence everywhere, from the sign to the cup to the ad, building trust through repetition', 'A guide that protects your brand from every new designer\'s or employee\'s guesswork'],
        proof: { label: 'Rosella juice brand', href: '#work' },
      },
      {
        id: 'guest' as ServiceId, icon: 'guest' as IconId, title: 'Guest experience enhancement',
        pain: 'Guests come once and never return. And nobody tells you why',
        line: 'An experience guests come back for, and tell others about',
        includes: ['Know what really happens when you\'re not there, through mystery shopper visits', 'Every moment of the guest journey designed, from welcome to goodbye', 'Your team delivers the same standard every shift, with written service standards and SOPs'],
        proof: { label: 'Games Club (GC)', href: '#work' },
      },
      {
        id: 'sales' as ServiceId, icon: 'sales' as IconId, title: 'Sales team training',
        pain: 'Customers ask a lot and buy little. The deal is usually lost in a single moment of the conversation',
        line: 'A team that knows how to turn a question into a sale',
        includes: ['Practice on the situations your team faces every day, not textbook examples', 'Ready answers to "it\'s too expensive" and "let me think about it", so deals survive objections', 'We follow the team in the field after training, until the words become habits and the habits become numbers'],
        proof: { label: 'Games Club (GC)', href: '#work' },
      },
      {
        id: 'growth' as ServiceId, icon: 'growth' as IconId, title: 'Business development strategy',
        pain: 'You\'ve hit a ceiling: same clients, same numbers, and no idea where the next growth comes from',
        line: 'A growth plan with numbers, executed with you step by step',
        includes: ['We pick the next market or segment and cost the entry before you spend a riyal', 'Partnerships and sales channels that reach clients you couldn\'t reach before', 'Weekly indicators that show real progress, not just a feeling of movement'],
        proof: { label: 'Telkomsel\'s Saudi market entry', href: '#work' },
      },
      {
        id: 'systems' as ServiceId, icon: 'systems' as IconId, title: 'Business systems & apps',
        pain: 'Everything lives in your head, in WhatsApp and in spreadsheets. Take one day off and work stops',
        line: 'Systems that hold your work and your numbers, so the business runs even when you\'re away',
        includes: ['See your sales, stock and team performance today, not at month end', 'Proven systems with no per-user licence fees, set up in Arabic for your business', 'We train your team until the system is part of their day, not a burden on it'],
        proof: { label: 'Rwafed Real Estate Marketing', href: '#work' },
      },
    ],
  },

  support: {
    eyebrow: 'The KON initiative',
    title: 'Your business is struggling and there’s no budget? This is for you',
    body: 'We offer advanced advisory and full operational support **free of charge** to struggling businesses that can’t afford it. No fee, no hidden conditions',
    dedication: 'Given as sadaqah for my late father, may God have mercy on him, and for all Muslims',
    note: 'We take requests as our capacity allows, and we reply to every one',
    cta: 'Apply for support',
  },

  founder: {
    eyebrow: 'A note from the founder',
    paragraphs: [
      'I’m Khalid. Since 2007, I’ve been under the supervision of the General Directorate for Gifted Education in Madinah',
      'Psychologist, entrepreneur and business developer',
      'I’ve held different roles across different sectors and given more than **4,200 hours of advisory work** to entrepreneurs and businesses. Some of my own ventures failed, and they were the most honest teachers I’ve had',
      '**Innovation** drives me, and I believe I can add real value to any business and any founder',
    ],
    punch: 'We all have problems. But a problem is where the solution begins',
    cta: 'Start your diagnosis',
  },

  onboarding: {
    eyebrow: 'Start here',
    title: 'Two minutes. A clearer picture of where you stand',
    lede: 'A few questions, **built to understand you**. The more honest the answers, the more useful your session',
    start: 'Let’s begin',
    next: 'Next',
    back: 'Back',
    finish: 'The first step',
    skip: 'Skip',
    stepOf: (a: number, b: number) => `Step ${a} of ${b}`,
    otherPlaceholder: 'Something else? Type it here',
    required: 'Choose at least one answer to continue',
    personaQ: 'Who are you?',
    personas: {
      founder: { label: 'Entrepreneur', sub: 'I have an idea or a startup' },
      business: { label: 'Business', sub: 'I own or run a company' },
      investor: { label: 'Investor', sub: 'I’m looking for deals or managing investments' },
    },
    supportToggle: 'I’m applying for the free support initiative (no budget right now)',
    scaleLow: 'It can wait',
    scaleHigh: 'Very urgent',
    contact: {
      title: 'Where can we reach you?',
      lede: 'We never share your details. We use them only to get back to you about this request',
      name: 'Name',
      company: 'Project or company name',
      phone: 'Mobile (WhatsApp)',
      email: 'Email',
      city: 'City and country',
      prefer: 'How would you like us to reach you?',
      preferOpts: [{ id: 'whatsapp', label: 'WhatsApp' }, { id: 'call', label: 'Call' }, { id: 'email', label: 'Email' }],
      needOne: 'Add your name and at least one way to reach you',
    },
    summary: {
      title: 'Your first step',
      lede: 'We read your answers. Here’s what we see, and the first step we’d suggest',
      persona: 'Path',
      stage: 'Where you are',
      pains: 'What’s weighing on you',
      goals: 'What you want',
      urgency: 'Urgency',
      urgencyLevels: ['Can be planned calmly', 'Important, worth starting soon', 'Urgent: every week has a cost'],
      primary: 'We’d start with',
      also: 'You may also benefit from',
      next: 'Next step',
      nextBody: 'Your free diagnosis session. We arrive having read all of this, so we don’t start from zero',
      sendWhatsapp: 'Send it to us on WhatsApp',
      sendEmail: 'Send by email',
      copy: 'Copy summary',
      copied: 'Copied',
      download: 'Download summary',
      edit: 'Edit my answers',
      raw: 'Show the summary text',
      notConnected: 'Preview version: this form isn’t connected to an inbox yet, and nothing is sent automatically. Copy your summary and send it to us yourself',
      supportBadge: 'Request under the free support initiative',
    },
  },

  finale: {
    line: 'Every piece was here from the start',
    line2: 'It just needed someone to put it in order',
    cta: 'Start now',
  },

  footer: {
    rights: '© 2026 KON Unlimited. All rights reserved',
    slogan: 'Anywhere. Any challenge. Any way. We’ll be there',
    top: 'Back to top',
  },
}

export const content: Record<Lang, Content> = { ar, en }
