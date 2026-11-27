// All site copy, Arabic first. Sections marked LOCKED use khalid's approved wording verbatim.
// Anything marked CONFIRM is an assumption waiting for khalid's sign-off.

export type Lang = 'ar' | 'en'
export type Persona = 'founder' | 'business' | 'investor'
export type IconId =
  | 'flex' | 'aligned' | 'spark' | 'layers' | 'ai' | 'cycle' | 'mind' | 'field'
  | 'storm' | 'anchor' | 'rise' | 'seed' | 'compass'
  | 'eye' | 'people' | 'train' | 'bulb'
  | 'tour' | 'pin' | 'web' | 'brand' | 'guest' | 'sales' | 'growth' | 'systems'
  | 'talent' | 'company' | 'calc' | 'session' | 'care' | 'scan' | 'flow' | 'mask' | 'house' | 'cup' | 'factory' | 'bag' | 'family' | 'check'

/** Solutions. Demos for each one live in content/ready.ts. */
export type ServiceId = 'tours' | 'maps' | 'web' | 'brand' | 'guest' | 'sales' | 'growth' | 'systems'

export interface Option { id: string; label: string }
export interface Question {
  id: string
  label: string
  hint?: string
  kind: 'single' | 'multi' | 'text' | 'scale'
  options?: Option[]
  optional?: boolean
  placeholder?: string
  /** Multi-choice only: most options a person may pick. */
  max?: number
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
/** Embeddable ⁦360°⁩ tour (Kuula). The page loads it only when a visitor asks for it. */
/** Solutions section (الحلول). Hidden on the live site for now (khalid, 2026-10-31); flip to true to show it again. */
export const SHOW_SOLUTIONS = true
/** KON Talent section (المواهب). Flip to false to hide the section and its nav link. */
export const SHOW_TALENT = true

export const tourUrl = 'https://kuula.co/share/collection/7MZVN?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1'

/** Real booking. Paste the Calendly event link here (e.g. https://calendly.com/<name>/diagnosis)
 * and every booking CTA opens it; leave it empty and the CTAs fall back to the onboarding form. */
export const BOOKING_URL: string = 'https://calendly.com/k-fallatah8/30min'

export const contact = {
  email: 'info@kon-unlimited.com',
  whatsapp: '966562399592', // international format without +, e.g. 9665XXXXXXXX
}

const ar = {
  meta: {
    switchTo: 'EN', switchLabel: 'Switch to English', menu: 'القائمة', close: 'إغلاق', skip: 'تخط إلى المحتوى',
    title: 'KON Unlimited · قسم تطوير الأعمال لشركتك',
    home: 'الرئيسية',
  },
  nav: [
    { href: '#idea', label: 'الفكرة' },
    { href: '#gaps', label: 'الفجوات' },
    { href: '#how', label: 'طريقتنا' },
    { href: '#work', label: 'أعمالنا' },
    { href: '#plans', label: 'الباقات' },
    { href: '#big', label: 'الدراسات' },
    { href: '#founder', label: 'المؤسس' },
  ],

  headerCta: 'احجز جلستك',

  hero: {
    eyebrow: 'تشغيل · تطوير أعمال · ابتكار',
    kicker: 'في كل شركة شي أكبر منها',
    rotating: ['نرفع ربح مشروعك', 'نرتب تشغيلك اليومي', 'نشتغل معك على الأرض'],
    statement: ['اللي تدوره', 'موجود عندك'],
    // What KON does, for whom, and how, in one breath. Read before anything moves.
    lede: 'ناس، ووقت، وفرص ما أحد انتبه لها. نشوفها معك، ونشغلها لين تصير ربح',
    asks: [
      { who: 'لصاحب الشركة', q: 'مبيعاتك تزيد وربحك واقف مكانه؟' },
      { who: 'لرائد الأعمال', q: 'فكرتك حلوة، بس مين بيدفع فيها؟' },
      { who: 'للمستثمر', q: 'كل ريال حطيته، كم رجع لك فعلا؟' },
    ],
    promise: 'وعدنا بسيط: **أي عملية تشغيلية، نطورها ونحسنها**',
    micro: 'جلسة 30 دقيقة · مجانية · بدون أي التزام',
    primary: 'احجز جلستك المجانية',
    secondary: 'ابدأ الرحلة',
    slogan: 'Any challenge…Any way…Anywhere…We’ll be there',
    scroll: 'القصة تبدأ من هنا',
    scrollSub: 'خذ وقتك، وانزل بهدوء',
    proof: [
      { n: '+4,200', l: 'ساعة استشارية', s: 'خبرة ميدانية' },
      { n: '14M', l: 'ريال إيرادات', s: 'Telkomsel' },
      { n: '+161%', l: 'نمو في 30 يوم', s: 'Games Club' },
    ],
  },

  // The journey in three plain steps, so a first-time visitor knows what happens after they book.
  how: {
    eyebrow: 'الطريقة',
    title: 'ثلاث خطوات، وكل خطوة واضحة',
    steps: [
      { k: 'مجانية', title: 'جلسة نفهم فيها وضعك', body: '30 دقيقة نسمع منك ونسألك الأسئلة الصح، وتطلع بفكرة وحدة على الأقل تقدر تبدأ فيها' },
      { k: 'نقرأ', title: 'نقرأ شركتك من الداخل', body: 'أرقامك وفريقك وعملاءك، ونحدد لك وين يضيع الربح وايش أول شي يتصلح' },
      { k: 'ننفذ', title: 'نشتغل معك على الأرض', body: 'نطبق الخطة مع فريقك أسبوع بأسبوع ونتابع لين تشوف الفرق في أرقامك' },
    ],
    cta: 'ابدأ بالخطوة الأولى',
    note: 'بعد الجلسة القرار لك، وما فيه أي التزام',
  },


  // LOCKED (khalid, 2026-10-21)
  problem: {
    title: 'ما تعرف المشكلة فين بالضبط؟',
    lines: ['الموظفين؟ الخطة التشغيلية؟ التوسع؟'],
    qs: ['الموظفين؟', 'الخطة التشغيلية؟', 'التوسع؟'],
    whoK: 'أنت مين؟',
    closing: 'بإذن الله، سنجد الحل',
    paths: [
      { persona: 'founder' as Persona, label: 'أنا رائد أعمال', d: 'عندي فكرة أو مشروع في بدايته', q: ['الفكرة؟', 'نموذج العمل؟', 'أول العملاء؟', 'أول موظف؟'] },
      { persona: 'business' as Persona, label: 'أنا كيان تجاري', d: 'عندي شركة شغالة وأبيها تكبر', q: ['الموظفين؟', 'الخطة التشغيلية؟', 'التوسع؟', 'المبيعات؟', 'التكاليف؟'] },
      { persona: 'investor' as Persona, label: 'أنا مستثمر', d: 'عندي فلوس وأبيها في المكان الصح', q: ['فرص جديدة؟', 'قراءة الفرصة؟', 'أداء الاستثمار؟', 'التقارير؟'] },
    ],
    hint: 'اختر اللي يشبهك، ونكمل من عندك',
  },

  loops: {
    eyebrow: 'أسئلة لا تقولها بصوت عال',
    title: 'هل سألت نفسك يوما…',
    pick: 'اختر ما يشبهك:',
    groups: [
      { persona: 'business' as Persona, label: 'كيان تجاري', qs: ['مبيعاتك تزيد، فلماذا لا يزيد ربحك؟', 'لماذا يتوقف كل شيء حين تأخذ يوم إجازة؟'] },
      { persona: 'founder' as Persona, label: 'رائد أعمال', qs: ['مقتنع بفكرتك تماما، فلماذا لم تبدأ حتى الآن؟', 'ماذا لو كان أول عميل لك أقرب مما تظن؟'] },
      { persona: 'investor' as Persona, label: 'مستثمر', qs: ['استثماراتك: هل تعمل لك، أم تعمل أنت لها؟', 'كم فرصة تركتها لأن أحدا لم يقرأ أرقامها كما هي؟'] },
    ],
    tail: 'الإجابة نادرا ما تكون حيث تبحث، ++ونحن نعرف أين نبحث++',
    cta: 'اكتشف إجابتك',
  },

  who: {
    eyebrow: 'من نساعد',
    title: 'أينما كنت اليوم، نعرف الخطوة التالية',
    groups: [
      { icon: 'storm' as IconId, persona: 'business' as Persona, title: 'شركات تتعثر', line: 'نوقف النزيف أولا', body: 'حين تضغط التكاليف والسيولة والفريق في وقت واحد، **نثبت الوضع**، ثم نعيد البناء على أساس صحيح' },
      { icon: 'anchor' as IconId, persona: 'business' as Persona, title: 'شركات مستقرة', line: 'الاستقرار الطويل يخفي فرصا ضائعة', body: 'تعمل جيدا، وتشعر أنها قادرة على أكثر، نجد **الهدر الصامت**، ونحوله إلى **هامش ربح**' },
      { icon: 'rise' as IconId, persona: 'business' as Persona, title: 'شركات تنمو', line: 'النمو يكسر ما كان يعمل', body: 'فروع جديدة، وفريق أكبر، وأنظمة لم تصمم لهذا الحجم، نبني **تشغيلا يتحمل التوسع**' },
      { icon: 'seed' as IconId, persona: 'founder' as Persona, title: 'رواد أعمال', line: 'من الفكرة إلى أول ريال', body: 'عندك فكرة أو شركة ناشئة ولا تعرف من أين تبدأ؟ **نموذج العمل، ودخول السوق، وأول العملاء**، وأول موظف، ونمشيها معك من أول يوم' },
      { icon: 'compass' as IconId, persona: 'investor' as Persona, title: 'مستثمرون', line: 'فرص أوضح، واستثمارات تدار بعقل', body: 'نبحث معك عن **فرص جديدة** ونقرؤها بأرقامها، وندير استثماراتك القائمة **بنظام يحميها وينميها**' },
    ],
    cta: 'هذا أنا',
  },

  // CONFIRM: written as a commitment of effort, not as a fee term. See the note to khalid.
  commit: {
    eyebrow: 'التزامنا',
    work: { n: '80%', label: 'من العمل علينا' },
    you: { n: '20%', label: 'عليك: القرار والرؤية' },
    badge: 'أتعابنا على النتائج',
    title: 'نحمل 80% من العمل، وأجرنا على النتائج',
    body: 'لا نسلمك تقريرا ونختفي، **ننزل إلى الميدان، ونبني، وندرب، ونتابع حتى يعمل**، وأجرنا ++مرتبط بالنتائج التي نصنعها لك++: حين تتحرك أرقامك، نستحق أتعابنا',
    fine: 'طريقة ربط الأتعاب بالنتائج نتفق عليها معك بوضوح، ومكتوبة، قبل أن نبدأ',
  },

  approach: {
    eyebrow: 'طريقتنا',
    title: 'ليش الأرقام تتحرك معنا؟',
    pillars: [
      { icon: 'mind' as IconId, title: 'نبدأ من الإنسان', body: 'كل رقم في تقريرك وراه قرار إنسان: عميل تردد عند الدفع، موظف تعب من الضغط، مدير استعجل في قرار، وخلفيتنا في **علم النفس وسلوك المستهلك** تخلينا نوصل للسبب نفسه مو بس للعرض', idea: 'العميل يقرر بقلبه، وبعدها يقنع عقله' },
      { icon: 'field' as IconId, title: 'نشتغل معك على الأرض', body: 'ما نكتب خطة ونسلمها لك ونمشي، نطبقها مع فريقك أسبوع بأسبوع ونتابع لين يصير الجديد **عادة يومية** تكمل حتى بعد ما نطلع', idea: 'الخطة اللي ما تتحول لعادة، مصيرها الدرج' },
      { icon: 'aligned' as IconId, title: 'كل شي واضح من أول يوم', body: 'قبل ما نبدأ تعرف ايش بنسوي ومتى وكم بتدفع وكيف نقيس النتيجة، وإذا تبي **أجرنا يكون نسبة من الفرق اللي نحققه لك** فقط', idea: 'لما تكون مصلحتنا من مصلحتك، يختفي نص الكلام' },
    ],
    foot: 'خبرة في 11 قطاعا، من الاتصالات إلى الضيافة، والذكاء الاصطناعي يقوم عندنا بعمل فرق كاملة، والقرار يبقى بشريا',
  },

  more: {
    eyebrow: 'مواهب KON',
    title: 'نكتشف الموهبة، ونحطها في مكانها الصح',
    lede: 'الموهبة الحقيقية ما تبان في السيرة الذاتية، تبان في **طريقة التفكير**، واحنا نعرف نقراها',
    items: [
      { href: '#/talent', side: 'talent', k: 'للمواهب', title: 'تعرف أنك قادر على أكثر، لكن محد سألك؟', body: 'نكتشف موهبتك من طريقة تفكيرك، ونوصلك بالفرصة اللي تليق فيك', cta: 'اكتشف نمطك' },
      { href: '#/talent', side: 'company', k: 'للشركات', title: 'تدورون موهبة تفرق فعلا، مو سيرة أحلى؟', body: 'نرشح لكم **العقلية** اللي يحتاجها الدور، قبل الأوراق', cta: 'اطلبوا موهبة' },
    ],
  },

  why: {
    eyebrow: 'لماذا KON',
    title: 'لأنك لا تحتاج مستشارا آخر، تحتاج من يكمل معك الطريق',
    items: [
      { icon: 'flex' as IconId, title: 'مرنون مع أي وضع', body: 'ميزانية محدودة؟ وقت ضيق؟ وضع معقد؟ نفصل طريقة العمل **على مقاس واقعك**' },
      { icon: 'aligned' as IconId, title: 'نربح حين تربح', body: '**مصلحتنا مربوطة بنتيجتك**، إن لم تتحرك أرقامك، فلم ننجز عملنا بعد' },
      { icon: 'spark' as IconId, title: 'مبتكرون', body: 'حين لا يكفي الموجود، نبني **ما لم يكن موجودا**: أنظمة، وأدوات، وتجارب' },
      { icon: 'layers' as IconId, title: 'خبرة في 11 قطاعا', body: 'اتصالات، وعقار، وضيافة، وترفيه، وأغذية، وفعاليات، وسلاسل إمداد، **ننقل ما نجح هناك إلى عندك**' },
      { icon: 'ai' as IconId, title: 'آلاف الموظفين، بجزء من التكلفة', body: 'نوظف **الذكاء الاصطناعي** ليقوم **بعمل فرق كاملة**: تحليل، ومتابعة، وتقارير، وخدمة عملاء، والقرار يبقى بشريا' },
      { icon: 'cycle' as IconId, title: 'نتائج تعيش بعدنا', body: 'أنظمة، وإجراءات تشغيل (SOPs)، وفريق يعرف ماذا يفعل، فيستمر **الأثر بعد أن نغادر**' },
      { icon: 'mind' as IconId, title: 'نفهم الإنسان قبل الرقم', body: 'خلفيتنا في علم النفس تجعلنا نقرأ **سلوك العميل وعقلية الموظف**، وهما خلف كل رقم' },
      { icon: 'field' as IconId, title: 'ننزل الميدان معك', body: 'لا نسلمك تقريرا ونمشي، نقف مع فريقك حتى يصير الجديد **عادة يومية**' },
    ],
  },

  human: {
    eyebrow: 'ما يميزنا',
    title: 'خلف كل رقم إنسان، ونحن نبدأ منه',
    lede: 'الشركات لا تتعثر بسبب الجداول، تتعثر حين **لا يفهم العميل، ولا يفهم الموظف**، هنا تبدأ ميزتنا',
    pillars: [
      { icon: 'eye' as IconId, title: 'سلوك المستهلك', body: 'لماذا يشتري عميلك؟ ولماذا يتردد؟ ولماذا لا يعود؟ نقرأ القرار من داخله، و**نعيد تصميم التجربة** حوله' },
      { icon: 'people' as IconId, title: 'عقلية الموظف', body: 'الموظف لا يقاوم التغيير، **يقاوم الغموض**، نجعل التغيير واضحا، فيصبح الفريق جزءا منه' },
      { icon: 'train' as IconId, title: 'تدريب يغير السلوك', body: 'تدريب **يظهر أثره في الميدان** من الأسبوع الأول، والمقياس سلوك الفريق، لا عدد الحضور' },
      { icon: 'bulb' as IconId, title: 'ابتكار عملي', body: 'أنظمة تشغيل داخلية، وأدوات ميدانية، وتجارب رقمية، نبتكر **ما يفتحه فريقك كل صباح**' },
    ],
  },

  // From the locked v3 services list, with Mystery Shopper.
  services: {
    eyebrow: 'خدماتنا',
    title: 'وش نقدر نسوي لك؟',
    lede: 'ست خدمات هدفها واحد: **شغل يمشي وربح يزيد**',
    items: [
      { title: 'التشخيص', body: 'نقرأ شركتك من ثمان زوايا، وتعرف بالضبط وين يضيع ربحك' },
      { title: 'الاستراتيجية', body: 'وين رايح، وايش لازم توقفه عشان توصل أسرع' },
      { title: 'العمليات', body: 'نشيل الخطوات اللي تأخر فريقك، فيخلص شغل أكثر بتكلفة أقل' },
      { title: 'المتسوق الخفي', body: 'نزورك كعميل عادي، ونشوف اللي يشوفه عملاؤك فعلا' },
      { title: 'الحلول الرقمية', body: 'أداة أو نظام مفصل على شغلك، ويبقى ملكك أنت' },
      { title: 'الذكاء الاصطناعي', body: 'يختصر التحليل والمتابعة اليومية، والقرار يظل بيدك' },
    ],
  },

  freebies: {
    eyebrow: 'مجانا',
    title: 'القيمة أولا، قبل أي التزام',
    items: [
      { k: 'أدوات مجانية', title: 'احسب ما يضيع منك الآن', body: 'حاسبات لكل قطاع تقرأ أرقامك بعدسة كُن، وتعمل على جهازك فقط', cta: 'جرب الأدوات', href: '#solutions', points: ['حاسبات لستة قطاعات', 'نتيجة فورية مع شرح مبسط', 'أرقامك تبقى على جهازك'] },
      { k: 'تشخيص مجاني', title: 'التشخيص الأول علينا', body: 'جلسة 30 دقيقة مع خبير أول، وخريطة طريق مبدئية مكتوبة', cta: 'احجز تشخيصك', href: '#start', points: ['30 دقيقة مع خبير أول', 'قراءة من ثمانية أبعاد', 'خريطة طريق مبدئية مكتوبة'] },
      { k: 'دعم مجاني', title: 'للمشاريع المتعثرة', body: 'استشارة متقدمة ودعم تشغيلي كامل بلا مقابل، لمن لا يستطيع تحمل التكلفة', cta: 'قدم طلب الدعم', href: '#support', points: ['استشارة متقدمة', 'دعم تشغيلي كامل', 'بلا مقابل وبلا شروط خفية'] },
    ],
  },

  quick: {
    eyebrow: 'أدوات مجانية',
    title: 'احسبها بنفسك، في دقيقة',
    lede: 'ثلاثة أسئلة قليل من أصحاب الأعمال يسألونها لنفسهم، وأرقامك **ما تطلع من جهازك**',
    items: [
      { id: 'price', q: 'لو رفعت سعرك، كم عميل تقدر تخسر وتظل رابح؟', k: '3 أرقام بس' },
      { id: 'lever', q: 'وش أسرع طريق يرفع ربحك؟', k: 'لكل الأعمال' },
      { id: 'breakhour', q: 'من أي ساعة يبدأ ربحك اليوم؟', k: 'للمطاعم والمتاجر' },
    ],
    cta: 'احجز جلستك وناقش نتيجتك معنا',
    all: 'كل الأدوات حسب قطاعك',
  },

  // khalid 2026-11-10: 30 minutes (matches his Calendly event), limited number each month.
  // khalid 2026-11-10: 30 minutes (matches his Calendly event), limited number each month.
  offer: {
    eyebrow: 'جلستك الأولى',
    title: 'جلسة وحدة، وتطلع عارف من وين تبدأ',
    lede: 'تطلع وأنت عارف **ايش أول خطوة وليش**، حتى لو ما اشتغلنا مع بعض بعدها',
    includes: [
      '30 دقيقة في الوقت اللي يناسبك',
      'نراجع وضعك من ثمان زوايا',
      'أهم 3 فرص تقدر تبدأ فيها بكرة',
      'ملخص مكتوب يوصلك بعد الجلسة',
    ],
    value: 'مجانية، وبدون أي التزام',
    guarantee: 'إذا ما طلعت **بفكرة وحدة على الأقل تستاهل وقتك**، فاحنا اللي خسرنا الوقت، مو أنت',
    cta: 'احجز جلستك المجانية',
    note: 'نحضر لكل جلسة قبلها، عشان كذا عددها محدود كل شهر',
  },


  work: {
    eyebrow: 'الدليل',
    title: 'أرقام من الميدان، مو من العروض',
    lede: 'مشاريع اشتغلنا فيها بأنفسنا، وكل رقم هنا حقيقي',
    confirmMark: 'بانتظار التأكيد',
    featured: [
      { sector: 'الاتصالات', tag: 'تطوير أعمال · GTM', title: 'دخول Telkomsel إلى السوق السعودي', body: 'تطوير الأعمال لشركة الاتصالات الإندونيسية، وبناء خطة دخولها للسوق السعودي وتنفيذها على الأرض', metric: '14M', metricLabel: 'ريال إيرادات تحققت' },
      { sector: 'الترفيه والضيافة', tag: 'تطوير أعمال · تشغيل', title: 'Games Club (GC)', body: 'أعدنا بناء التشغيل كامل: القائمة والأسعار، تدريب الفريق، تجربة الضيف، إجراءات مكتوبة لكل وردية، وشراكات جديدة', metric: '+161.11%', metricLabel: 'نمو الإيرادات خلال 30 يوما', extra: '+511.11% متوسط الإيرادات الشهرية' },
      { sector: 'الأغذية والمشروبات', tag: 'من الفكرة إلى السوق', title: 'روسـيـلا: علامة عصائر من الصفر', body: 'من فكرة على ورق إلى علامة تبيع كل يوم: المنتج والتشغيل والبيع', metric: '4K', metricLabel: 'ريال إيراد يومي' },
      { sector: 'العقار والاستثمار', tag: 'استراتيجية · تنفيذ', title: 'صفقة عقارية مع مستثمر خاص', body: 'بنينا الاستراتيجية كاملة ونفذنا الصفقة مع مستثمر من القطاع الخاص', metric: '1.4M', metricLabel: 'ريال قيمة الصفقة' },
    ] as CaseItem[],
    more: [
      { sector: 'التسويق العقاري', tag: 'تطوير أعمال', title: 'وثاق للتسويق العقاري', body: 'تطوير الأعمال لشركة وثاق للتسويق العقاري، بدور مطور أعمال' },
      { sector: 'التسويق العقاري', tag: 'أدوات تشغيل', title: 'روافد للتسويق العقاري', body: 'بناء أدوات تشغيل داخلية تختصر وقت الفريق وتنظم عمله' },
      { sector: 'الفعاليات', tag: 'أنظمة من ابتكارنا', title: 'اللجنة المنظمة المحلية (LOC)', body: 'ابتكار أنظمة تشغيل داخلية وبناؤها للجنة المنظمة المحلية' },
      { sector: 'سلاسل الإمداد', tag: 'الولايات المتحدة', title: 'شركة أمريكية في أبيلين، تكساس', body: 'تحسين عمليات سلسلة الإمداد من الطلب إلى التسليم' },
      { sector: 'الاستثمار', tag: 'إدارة فرص', title: 'مستثمرون من القطاع الخاص', body: 'إنشاء فرص استثمارية جديدة، وإدارة الفرص القائمة' },
      { sector: 'ريادة الأعمال', tag: 'مجتمع · ورش عمل', title: 'مجتمع KON لرواد الأعمال', body: 'تأسيس المجتمع في المدينة المنورة، وتشغيله، وتقديم ورش العمل فيه', metric: '+3,000', metricLabel: 'ساعة مع رواد الأعمال' },
    ] as CaseItem[],
    tail: 'وفوقها أكثر من 12 مشروع ثاني في 11 قطاعا، من الضيافة إلى الواقع المعزز',
    all: 'كل أعمالنا، وجولة افتراضية داخل واحد منها',
    tour: { eyebrow: 'جولة افتراضية ⁦360°⁩', title: 'ادخل أحد مشاريعنا', body: 'تجول داخل وحدة من الفلل، وتنقل بين الغرف كأنك هناك', cta: 'ابدأ الجولة', open: 'افتح في نافذة جديدة', close: 'إغلاق الجولة' },
  },


  // Solutions. Each one opens with the client's pain, then what changes for them.
  // Add a solution: give it an id in ServiceId, an icon, and an entry here (both languages).
  // Live demos go in content/ready.ts, business apps in content/apps.ts.
  ready: {
    eyebrow: 'الحلول',
    title: 'كل حل هنا بدأ بمشكلة عشناها مع عميل',
    lede: 'اختر المشكلة التي تشبه مشكلتك، وشاهد كيف نحلها، **بنماذج حية** من أعمالنا',
    pain: 'هل تعرف هذا الشعور؟',
    includes: 'ما الذي يتغير عندك',
    demos: 'شاهد بنفسك',
    open: 'افتح النموذج',
    proof: 'حدث فعلا مع',
    cta: 'أريد هذا الحل',
    browseApps: 'تصفح مكتبة التطبيقات',
    noDemo: 'نشرح لك هذا الحل بالتفصيل في جلسة التشخيص المجانية، على واقع مشروعك أنت',
    tail: 'مشكلتك ليست هنا؟ **أخبرنا بها، ونبني حلها**',
    apps: {
      eyebrow: 'مكتبة التطبيقات',
      title: 'أكثر من 100 تطبيق أعمال جاهز، نختار لك منها ما يحتاجه نشاطك فقط',
      lede: 'لا تحتاج أن تعرف أسماءها، اختر قطاعك، وشاهد ما نجهزه لأمثالك: **على حسب احتياجك، ومربوطا ببعضه، مع تدريب فريقك**',
      teaser: 'أنظمة جاهزة لـ 21 قطاعا، من المطاعم إلى المصانع',
      count: (n: number) => `${n} تطبيقا لهذا القطاع`,
      showAll: (n: number) => `اعرض الكل (${n})`,
      showLess: 'اعرض أقل',
      foot: 'كل التطبيقات مفتوحة المصدر ومجربة عالميا، نحن نختار، ونجهز، وندرب، ونتابع',
    },
    items: [
      {
        id: 'tours' as ServiceId, icon: 'tour' as IconId, title: 'الجولات الافتراضية للعقارات',
        pain: 'تحجز موعد المعاينة، وتقطع الطريق، ثم يقول العميل من أول دقيقة: ليس هذا ما أبحث عنه',
        line: 'المشتري يتجول في العقار من جواله، فلا يصلك للمعاينة إلا الجاد',
        includes: ['وقت فريقك يذهب للمشترين الجادين، لا لمعاينات بلا نتيجة', 'المشتري من مدينة أو دولة أخرى يرى العقار كاملا قبل أن يسافر', 'إعلانك يبقى في ذهن العميل أطول، لأنه دخل العقار ولم يكتف بالصور'],
      },
      {
        id: 'maps' as ServiceId, icon: 'pin' as IconId, title: 'تصوير ⁦360°⁩ على خرائط Google',
        pain: 'قبل أن يختار مطعما أو مقهى، يقارن العميل بين عدة أماكن على الخريطة، ويخاف أن يصل فيجد المكان غير ما رآه في الصور',
        line: 'العميل يدخل مكانك من خرائط Google قبل أن يزورك، فيأتيك واثقا',
        includes: ['حين يقارن العميل بينك وبين من حولك، يرى مكانك كاملا، فيختارك عن ثقة', 'يرى الجلسات والأجواء كما هي، فيزول خوفه من أن يصل فيجد المكان مختلفا', 'من يبحث عن مكان قريب يكتشفك، فيتحول البحث إلى زيارة، والزيارة إلى عميل جديد', 'الضيف يصل وتوقعاته في مكانها، فتكون تجربته أجمل، ويعود'],
      },
      {
        id: 'web' as ServiceId, icon: 'web' as IconId, title: 'تصميم المواقع',
        pain: 'عميلك يبحث عنك قبل أن يتصل بك، وما يجده اليوم أصغر من حجمك بكثير',
        line: 'موقع يجعل الزائر يثق بك قبل أول مكالمة، ثم يطلب',
        includes: ['عميلك الخليجي يقرأ بلغته، والشريك الأجنبي يفهمك دون وسيط', 'انطباع فاخر من أول ثانية يبرر سعرك، فلا تضطر للمنافسة بالخصومات', 'يفتح بسرعة على الجوال، حيث يتصفح عملاؤك ويقررون'],
      },
      {
        id: 'brand' as ServiceId, icon: 'brand' as IconId, title: 'هندسة الهوية التجارية',
        pain: 'منتجك جيد، لكن العميل لا يتذكر اسمك، ويقارنك بالأرخص',
        line: 'هوية تجعل العميل يختارك، حتى حين لا تكون الأرخص',
        includes: ['رسالة يفهمها العميل في ثوان: لماذا أنت، ولماذا الآن', 'حضور واحد في كل مكان، من اللوحة إلى الكوب إلى الإعلان، يبني الثقة بالتكرار', 'دليل يحمي هويتك من اجتهادات كل مصمم أو موظف جديد'],
        proof: { label: 'روسـيـلا للعصائر', href: '#work' },
      },
      {
        id: 'guest' as ServiceId, icon: 'guest' as IconId, title: 'تحسين تجربة الضيف',
        pain: 'الضيف يأتي مرة، ولا يعود، ولا أحد يخبرك لماذا',
        line: 'تجربة يعود الضيف من أجلها، ويحكي عنها لغيره',
        includes: ['تعرف ما يحدث فعلا في غيابك، عبر زيارات المتسوق الخفي', 'كل لحظة في رحلة الضيف مصممة، من الاستقبال إلى الوداع', 'فريقك يقدم المستوى نفسه في كل وردية، بمعايير وإجراءات تشغيل (SOPs) مكتوبة'],
        proof: { label: 'Games Club (GC)', href: '#work' },
      },
      {
        id: 'sales' as ServiceId, icon: 'sales' as IconId, title: 'تدريب فرق المبيعات',
        pain: 'العملاء يسألون كثيرا، ويشترون قليلا، والصفقة تضيع غالبا في لحظة واحدة من المحادثة',
        line: 'فريق يعرف كيف يحول السؤال إلى صفقة',
        includes: ['تدريب على المواقف التي يواجهها فريقك كل يوم، لا على أمثلة من الكتب', 'ردود جاهزة على «السعر غالي» و«خلني أفكر»، فلا تضيع الصفقة عند الاعتراض', 'نتابع الفريق في الميدان بعد التدريب، حتى يتحول الكلام إلى عادة، والعادة إلى أرقام'],
        proof: { label: 'Games Club (GC)', href: '#work' },
      },
      {
        id: 'growth' as ServiceId, icon: 'growth' as IconId, title: 'استراتيجيات تطوير الأعمال',
        pain: 'وصلت إلى سقف: العملاء أنفسهم، والأرقام نفسها، ولا تعرف من أين يأتي النمو القادم',
        line: 'خطة نمو بالأرقام، ننفذها معك على الأرض',
        includes: ['نحدد السوق أو الشريحة التالية، ونحسب تكلفة دخولها قبل أن تدفع ريالا', 'شراكات وقنوات بيع توصلك إلى عملاء لم تكن تصل إليهم', 'مؤشرات أسبوعية تريك إن كنت تتقدم فعلا، لا مجرد شعور بالحركة'],
        proof: { label: 'دخول Telkomsel إلى السوق السعودي', href: '#work' },
      },
      {
        id: 'systems' as ServiceId, icon: 'systems' as IconId, title: 'أنظمة وتطبيقات الأعمال',
        pain: 'كل شيء في رأسك، وفي واتساب، وفي ملفات إكسل، وإن غبت يوما، تعطل العمل',
        line: 'أنظمة تحفظ عملك وأرقامك، فيستمر مشروعك حتى في غيابك',
        includes: ['تعرف مبيعاتك ومخزونك وأداء فريقك اليوم، قبل أن يفاجئك آخر الشهر', 'أنظمة مجربة عالميا، دون رسوم ترخيص على كل مستخدم، نجهزها على حسب احتياجك', 'ندرب فريقك حتى يصبح النظام جزءا من يومه، يرتاح به ولا يتعب منه'],
        proof: { label: 'روافد للتسويق العقاري', href: '#work' },
      },
    ],
  },

  // CONFIRM: how requests are selected.
  support: {
    eyebrow: 'مبادرة KON',
    title: 'مشروعك متعثر والميزانية ما تسمح؟ هذا لك',
    body: 'نقدم الاستشارة والدعم التشغيلي ++مجانا++ للمشاريع المتعثرة اللي ما تقدر على التكلفة، بدون مقابل وبدون شروط مخفية',
    dedication: 'صدقة عن والدي رحمه الله وعن جميع المسلمين',
    note: 'نستقبل الطلبات حسب طاقتنا، ونرد على كل طلب',
    cta: 'قدم طلب الدعم',
  },

  // Prove step confirmed by khalid (2026-11-02): the challenge runs only when an opportunity matches.
  // CONFIRM: "free for talent", "never shared without your permission", and the company next step.
  talent: {
    eyebrow: 'مواهب KON',
    title: 'تعرف أنك قادر على أكثر، لكن محد سألك؟',
    lede: 'احنا نسأل، نكتشف موهبتك من **طريقة تفكيرك**، فتشوف اللي عندك فعلا، وبعدها نوصلك بالناس والفرص اللي تطلق ++كامل إمكاناتك++',
    proof: 'خلف هذه القراءة خبرة في علم النفس، وتحليل السلوك، وأنماط الشخصية، وبناء بيئات العمل الصحية',
    teaserQ: 'أيها أنت؟',
    teaserCta: 'اكتشف نمطك في 3 دقائق',
    lanes: {
      title: 'لكل عقلية مسار تلمع فيه',
      lede: 'المشكلة نادرا تكون في قدراتك، غالبا أنت في **المسار الغلط**',
      shines: 'تلمع في',
      wasted: 'تنطفي في',
      company: 'وللشركات: نرشح لكم **العقلية** اللي يحتاجها الدور، قبل الأوراق',
      ctaTalent: 'اكتشف عقليتك ومسارك',
      ctaCompany: 'ندور عقلية محددة',
    },
    mirror: {
      title: 'تعرف هالشعور؟',
      talent: {
        k: 'إن كنت موهبة',
        lines: ['تسوي شغلك صح، وتحس إنك مستخدم نص قدراتك بس', 'تنرفض لأن الورق ما يشبهك', 'عندك أفكار كبيرة، وما تدري لمين تقولها'],
        cta: 'اكتشف موهبتك',
      },
      company: {
        k: 'إن كنتم شركة',
        lines: ['وظفتوا صاحب السيرة الأحلى، وجا الأداء أقل منها', 'تدورون شهور، والكرسي للحين فاضي', 'الكفاءات تمشي قبل لا تكتمل الصورة'],
        cta: 'اطلبوا موهبة',
      },
    },
    journey: {
      title: 'من الموهبة إلى الأثر، في ثلاث خطوات',
      steps: [
        { title: 'نكتشف', body: 'نقرأ طريقة تفكيرك، ووش يحركك، وكيف تاخذ قراراتك، فتشوف في نفسك أشياء ما كنت تشوفها' },
        { title: 'نختبر', body: 'لما تطلع فرصة على قد قيمتك، نختبرها معك بتحدي قصير من الواقع' },
        { title: 'نوصلك', body: 'بالناس والفرص المناسبة: مشروع مع KON، أو شركة تحتاجك، وبإذنك دايما' },
      ],
    },
    wins: {
      title: 'لا نرشح أحدا، إلا إذا ربح الجميع',
      lede: 'الترشيح اللي يربح فيه طرف واحد، يخسر فيه الكل بعدين',
      center: 'أثر',
      items: [
        { k: 'الموهبة', gain: 'مكان يليق بك', body: 'تنشاف على حقيقتك، وتنفهم طريقة تفكيرك، وتشتغل في مكان تلمع وتكبر فيه' },
        { k: 'الشركة', gain: 'الشخص الصحيح، من أول مرة', body: 'شخص فاهمين طريقة تفكيره، يناسب الدور والفريق، ومختار عشان يبقى' },
        { k: 'KON', gain: 'سمعة تبنى على النتائج', body: 'شبكة من ناس حقيقيين نبني فيها مشاريع أكبر، ونجاحكم هو ++سمعتنا++' },
      ],
      sum: 'وعي أعلى، وعلاقات حقيقية، وإمكانات تنطلق كاملة، هذا هو الأثر الذي يبقى',
    },
    doorsQ: 'من أي باب تدخل؟',
    doorsTime: 'نحو 3 دقائق',
    doors: {
      talent: { label: 'عندي موهبة', sub: 'أبي قدراتي تنشاف، وأحطها في مكان تفرق فيه' },
      company: { label: 'ندور موهبة', sub: 'الشخص المناسب للدور، من أول مرة' },
    },
    free: 'مجاني للمواهب، دايما',
    next: 'التالي',
    back: 'رجوع',
    finish: 'اعرض النتيجة',
    stepOf: (a: number, b: number) => `الخطوة ${a} من ${b}`,
    required: 'أكمل هذه الخطوة للمتابعة',
    contact: {
      title: 'أين نجدك؟',
      lede: 'نستخدم بياناتك عشان نتواصل معك بس، وملفك ما يوصل لأي شركة بدون إذنك',
      ledeCompany: 'نستخدم بياناتكم عشان نتواصل معكم بخصوص طلبكم بس',
      name: 'الاسم',
      company: 'اسم الشركة',
      job: 'منصبك',
      phone: 'رقم الجوال (واتساب)',
      email: 'البريد الإلكتروني',
      city: 'المدينة والدولة',
      needOne: 'أضف اسمك ووسيلة تواصل واحدة على الأقل',
    },
    read: {
      title: 'هذا اللي شفناه فيك',
      lede: 'قراءة أولى من إجاباتك، ونكملها لما نقرأ طريقة تفكيرك',
      you: 'نمطك الأقرب',
      lane: 'مسارك',
      also: 'ومعه لمسة من',
      roles: 'أدوار قد تلمع فيها',
      where: 'أين تضيف قيمة',
      story: 'كيف تفكر',
      next: 'ماذا بعد؟',
      steps: ['ترسل ملفك', 'نقراه بنفسنا، كلمة كلمة', 'نتواصل معك أول ما تطلع فرصة تناسبك'],
      promise: 'ما نوعدك بوظيفة، نوعدك نقراك بجدية',
    },
    brief: {
      title: 'هذا اللي تدورونه',
      lede: 'قرينا إجاباتكم، وهذا اللي فهمناه',
      areas: 'المجال',
      role: 'الدور',
      type: 'نوع الارتباط',
      pains: 'ما لم ينجح',
      traits: 'أهم الصفات',
      openYes: 'أنتم تنظرون إلى طريقة التفكير قبل الشهادة، وهنا تحديدا نستطيع أن ++نفاجئكم++',
      unclear: 'قبل أن توظفوا، قد تحتاجون أن نصمم الدور معكم، وهذا جزء من عملنا في محور الفريق',
      next: 'ماذا بعد؟',
      steps: ['ترسلون الطلب', 'نفهم الدور معكم بعمق', 'نرشح لكم ناس عرفنا طريقة تفكيرهم'],
    },
    sendWhatsapp: 'أرسل عبر واتساب',
    sendEmail: 'أرسل بالبريد',
    copy: 'انسخ الملخص',
    copied: 'نسخ',
    raw: 'اعرض نص الملخص',
    edit: 'عدل إجاباتي',
    restart: 'ابدأ من جديد',
  },

  // LOCKED (khalid, 2026-10-25)
  founder: {
    eyebrow: 'كلمة المؤسس',
    paragraphs: [
      'أنا خالد، منذ عام 2007 وأنا تحت إشراف ++الإدارة العامة لتربية الموهوبين++ بالمدينة المنورة',
      'أخصائي نفسي، ورائد أعمال، ومطور أعمال',
      'عملت في مناصب مختلفة وقطاعات مختلفة، وقدمت أكثر من ++4,200 ساعة استشارية++ لرواد أعمال ومشاريع متنوعة، وخضت مشاريع لم تنجح، فكانت أصدق مدرسة مررت بها',
      'شغفي ++الابتكار++، وأؤمن بقدرتي على إضافة قيمة حقيقية لأي كيان تجاري ولأي رائد أعمال',
    ],
    punch: 'كلنا لدينا مشاكل، لكن المشكلة بداية الحل',
    cta: 'احجز جلستك المجانية',
  },

  onboarding: {
    eyebrow: 'ابدأ هنا',
    title: 'دقيقتين، ونجي الجلسة واحنا فاهمين وضعك',
    lede: 'أسئلة قليلة **عشان نفهمك أنت**، وكل ما كانت إجاباتك أصدق كانت جلستك أنفع',
    start: 'يلا نبدأ',
    next: 'التالي',
    back: 'رجوع',
    finish: 'اختر موعدك',
    skip: 'تخط',
    stepOf: (a: number, b: number) => `الخطوة ${a} من ${b}`,
    otherPlaceholder: 'أخرى؟ اكتبها هنا',
    required: 'اختر إجابة وحدة على الأقل عشان تكمل',
    personaQ: 'مين أنت؟',
    personas: {
      founder: { label: 'رائد أعمال', sub: 'عندي فكرة أو شركة ناشئة' },
      business: { label: 'كيان تجاري', sub: 'عندي شركة أو أديرها' },
      investor: { label: 'مستثمر', sub: 'أدور فرص أو أدير استثمارات' },
    } as Record<Persona, { label: string; sub: string }>,
    supportToggle: 'أبي أتقدم لمبادرة الدعم المجاني (ما عندي ميزانية حاليا)',
    scaleLow: 'يقدر ينتظر',
    scaleHigh: 'مستعجل جدا',
    contact: {
      title: 'أين نجدك؟',
      lede: 'بياناتك ما نشاركها مع أحد، نستخدمها بس عشان نتواصل معك بخصوص طلبك',
      name: 'الاسم',
      company: 'اسم المشروع أو الشركة',
      phone: 'رقم الجوال (واتساب)',
      email: 'البريد الإلكتروني',
      city: 'المدينة والدولة',
      prefer: 'كيف تحب نتواصل معك؟',
      preferOpts: [{ id: 'whatsapp', label: 'واتساب' }, { id: 'call', label: 'اتصال' }, { id: 'email', label: 'بريد' }],
      needOne: 'أضف اسمك ووسيلة تواصل واحدة على الأقل',
    },
    summary: {
      title: 'هذي خطوتك الأولى',
      lede: 'قرينا إجاباتك، وهذا اللي نشوفه، وهذي أول خطوة نقترحها',
      persona: 'المسار',
      stage: 'الوضع الحالي',
      pains: 'وش اللي مثقلك',
      goals: 'وش تبي',
      urgency: 'درجة الإلحاح',
      urgencyLevels: ['نقدر نخطط له على راحتنا', 'مهم، ويستاهل نبدأ قريب', 'مستعجل، كل أسبوع له ثمن'],
      primary: 'نقترح نبدأ بـ',
      also: 'وممكن يفيدك بعد',
      next: 'الخطوة التالية',
      nextBody: 'جلسة التشخيص المجانية: نجيك واحنا قارين كل هذا، فما نبدأ من الصفر',
      sendWhatsapp: 'أرسلها لنا واتساب',
      sendEmail: 'أرسل بالبريد',
      copy: 'انسخ الملخص',
      copied: 'نسخ',
      download: 'نزل الملخص',
      edit: 'عدل إجاباتي',
      raw: 'اعرض نص الملخص',
      notConnected: 'نسخة تجريبية: النموذج غير مربوط بعد بأي جهة استقبال، ولا يرسل شيء تلقائيا، انسخ ملخصك وأرسله لنا بنفسك',
      supportBadge: 'طلب ضمن مبادرة الدعم المجاني',
    },
    stages: ['من أنت', 'وضعك', 'تواصلك', 'موعدك'],
    intro: 'أربع خطوات قصيرة، وآخرها تختار موعد جلستك',
    book: {
      title: 'آخر خطوة: اختر موعد جلستك',
      lede: 'جلسة 30 دقيقة، نجيها واحنا قارين كل إجاباتك',
      loading: 'نجهز التقويم…',
      open: 'افتح التقويم في صفحة مستقلة',
      alt: 'تحب نتواصل أول؟',
      details: 'ملخص قراءتنا لوضعك',
    },
  },

  finale: {
    line: 'اللي كنت تدوره، كان عندك من البداية',
    line2: 'كان يحتاج بس أحد يشوفه معك',
    again: 'ارجع للبداية، واقرأها من جديد',
    cta: 'احجز جلستك المجانية',
  },

  footer: {
    rights: '© 2026 KON Unlimited · جميع الحقوق محفوظة',
    slogan: 'Any challenge…Any way…Anywhere…We’ll be there',
    top: 'إلى الأعلى',
  },
}

export type Content = typeof ar

const en: Content = {
  meta: {
    switchTo: 'ع', switchLabel: 'التبديل إلى العربية', menu: 'Menu', close: 'Close', skip: 'Skip to content',
    title: 'KON Unlimited · Your business development department',
    home: 'Home',
  },
  nav: [
    { href: '#idea', label: 'The idea' },
    { href: '#gaps', label: 'The gaps' },
    { href: '#how', label: 'Our way' },
    { href: '#work', label: 'Work' },
    { href: '#plans', label: 'Packages' },
    { href: '#big', label: 'Studies' },
    { href: '#founder', label: 'Founder' },
  ],

  headerCta: 'Book a session',

  hero: {
    eyebrow: 'Operations · Business development · Innovation',
    kicker: 'Every company holds something bigger than itself',
    rotating: ['We raise your profit', 'We sort out your daily operations', 'We work on the ground with you'],
    statement: ['What you are looking for', 'is already with you'],
    lede: 'People, time and opportunities nobody noticed. We see them with you, and put them to work until they become profit',
    asks: [
      { who: 'For business owners', q: 'Sales are up. Why isn’t profit?' },
      { who: 'For founders', q: 'Great idea. Who’s going to pay for it?' },
      { who: 'For investors', q: 'Every riyal you put in. What did it really bring back?' },
    ],
    promise: 'Our promise is simple: **we optimise and develop any operation**',
    micro: '30 minutes · Free · No commitment',
    primary: 'Book your free session',
    secondary: 'Begin the journey',
    slogan: 'Any challenge…Any way…Anywhere…We’ll be there',
    scroll: 'The story starts here',
    scrollSub: 'Take your time, and scroll slowly',
    proof: [
      { n: '4,200+', l: 'advisory hours', s: 'in the field' },
      { n: '14M', l: 'SAR revenue', s: 'Telkomsel' },
      { n: '+161%', l: 'growth in 30 days', s: 'Games Club' },
    ],
  },

  how: {
    eyebrow: 'The way',
    title: 'Three steps. Each one clear',
    steps: [
      { k: 'Free', title: 'A session to understand where you are', body: '30 minutes where we listen, ask the right questions, and you leave with at least one idea you can act on' },
      { k: 'Read', title: 'We read your business from the inside', body: 'Your numbers, your team and your customers. We show you where profit is leaking and what to fix first' },
      { k: 'Do', title: 'We work on the ground with you', body: 'We put the plan to work with your team week by week, and stay until you see the difference in your numbers' },
    ],
    cta: 'Start with step one',
    note: 'After the session the choice is yours. No commitment',
  },


  problem: {
    title: 'Not sure exactly where the problem is?',
    lines: ['Your team? Your operating plan? Expansion?'],
    qs: ['Your team?', 'Your operating plan?', 'Expansion?'],
    whoK: 'Who are you?',
    closing: 'Insha’Allah, we’ll find the answer',
    paths: [
      { persona: 'founder', label: 'I’m an entrepreneur', d: 'I have an idea or an early project', q: ['The idea?', 'The business model?', 'First customers?', 'First hire?'] },
      { persona: 'business', label: 'I run a business', d: 'I run a company and want it to grow', q: ['The team?', 'The operating plan?', 'Expansion?', 'Sales?', 'Costs?'] },
      { persona: 'investor', label: 'I’m an investor', d: 'I have capital and want it in the right place', q: ['New deals?', 'Reading a deal?', 'Underperformance?', 'Reporting?'] },
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
      { persona: 'investor', label: 'Investor', qs: ['Are your investments working for you, or are you working for them?', 'How many deals did you pass on because no one read the numbers as they are?'] },
    ],
    tail: 'The answer is rarely where you’re looking. ++We know where to look++',
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
      { icon: 'compass', persona: 'investor', title: 'Investors', line: 'Clearer deals. Smarter portfolios', body: 'We source **new opportunities** with you, read them by the numbers, and run your existing investments with **a system that protects and grows them**' },
    ],
    cta: 'That’s me',
  },

  commit: {
    eyebrow: 'Our commitment',
    work: { n: '80%', label: 'of the work is ours' },
    you: { n: '20%', label: 'is yours: the vision and the call' },
    badge: 'Paid on results',
    title: 'We carry 80% of the work. We get paid on results',
    body: 'We don’t hand you a report and disappear. **We go into the field, build, train and follow through until it works.** Our fees are ++tied to the results we create for you++: when your numbers move, we earn our fee',
    fine: 'How fees link to results is agreed with you clearly, in writing, before we start',
  },

  approach: {
    eyebrow: 'How we work',
    title: 'Why the numbers move with us',
    pillars: [
      { icon: 'mind' as IconId, title: 'We start with people', body: 'Every number in your report started as a human decision: a customer who hesitated at checkout, an employee worn out by pressure, a manager who rushed a call. Our background in **psychology and consumer behaviour** gets us to the cause, not just the symptom', idea: 'People buy with their heart, then explain it to their head' },
      { icon: 'field' as IconId, title: 'We work on the ground with you', body: 'We don’t write a plan, hand it over and leave. We put it to work with your team week by week, until the new way is **a daily habit** that keeps going after we’re gone', idea: 'A plan that never becomes a habit ends up in a drawer' },
      { icon: 'aligned' as IconId, title: 'Clear from day one', body: 'Before we start you know what we’ll do, when, what you’ll pay and how we’ll measure it. If you prefer, **our fee can be a share of the gain we create** and nothing else', idea: 'When our interest is yours, half the talking stops' },
    ],
    foot: 'Experience across 11 sectors, from telecom to hospitality. AI does the work of whole teams for us, and the decisions stay human',
  },

  more: {
    eyebrow: 'KON Talent',
    title: 'We find talent, and place it where it shines',
    lede: 'Real talent rarely shows on a CV. It shows in **the way you think**, and that is what we read',
    items: [
      { href: '#/talent', side: 'talent', k: 'For talent', title: 'You know you can do more. But has anyone asked?', body: 'We discover your talent from the way you think, and connect you with the opportunity that fits you', cta: 'Find your pattern' },
      { href: '#/talent', side: 'company', k: 'For companies', title: 'Looking for talent that makes a difference, not a nicer CV?', body: 'We put forward the **mindset** the role needs, before the paperwork', cta: 'Request talent' },
    ],
  },

  why: {
    eyebrow: 'Why KON',
    title: 'You don’t need another consultant. You need someone who stays for the whole road',
    items: [
      { icon: 'flex', title: 'Flexible with any situation', body: 'Tight budget? Short timeline? Messy situation? We cut the way we work **to fit your reality**' },
      { icon: 'aligned', title: 'We win when you win', body: '**Our interest is tied to your outcome.** If your numbers haven’t moved, our work isn’t done' },
      { icon: 'spark', title: 'Genuinely innovative', body: 'When what exists isn’t enough, we build **what doesn’t exist yet**: systems, tools, experiences' },
      { icon: 'layers', title: 'Experience across 11 sectors', body: 'Telecoms, real estate, hospitality, entertainment, food, events, supply chain. **What worked there, we bring to you**' },
      { icon: 'ai', title: 'Thousands of staff, at a fraction of the cost', body: 'We put **AI** to work doing **what whole teams do**: analysis, follow-up, reporting, customer service. People still make the decisions' },
      { icon: 'cycle', title: 'Results that outlive us', body: 'Systems, SOPs and a team that knows what to do. So **results last long after we leave**' },
      { icon: 'mind', title: 'People before numbers', body: 'Our background in psychology lets us read **customer behaviour and employee mindset**, the two things behind every figure' },
      { icon: 'field', title: 'We go to the floor with you', body: 'No report-and-run. We stay with your team until the new way becomes **the daily habit**' },
    ],
  },

  human: {
    eyebrow: 'What sets us apart',
    title: 'Behind every number is a person. That’s where we start',
    lede: 'Companies don’t stall because of spreadsheets. They stall when **customers aren’t understood, and staff aren’t either**. That’s our edge',
    pillars: [
      { icon: 'eye', title: 'Consumer behaviour', body: 'Why does your customer buy? Why do they hesitate? Why don’t they come back? We read the decision from the inside and **redesign the experience** around it' },
      { icon: 'people', title: 'Employee mindset', body: 'People don’t resist change. **They resist uncertainty.** We make change clear, so your team becomes part of it' },
      { icon: 'train', title: 'Training that changes behaviour', body: 'Training **you can see on the floor** in week one. We measure behaviour, not attendance' },
      { icon: 'bulb', title: 'Practical innovation', body: 'Internal operating systems, field tools, digital experiences. We invent **what your team opens every morning**' },
    ],
  },

  services: {
    eyebrow: 'Services',
    title: 'What can we do for you?',
    lede: 'Six services with one goal: **work that runs and profit that grows**',
    items: [
      { title: 'Diagnosis', body: 'We read your company from eight angles, so you know exactly where profit leaks' },
      { title: 'Strategy', body: 'Where you’re going, and what to stop doing to get there faster' },
      { title: 'Operations', body: 'We cut the steps that slow your team down, so more gets done for less' },
      { title: 'Mystery Shopper', body: 'We visit as an ordinary customer and see what your customers really see' },
      { title: 'Digital', body: 'A tool or system built around your work, and yours to keep' },
      { title: 'AI', body: 'Takes over the daily analysis and follow-up. The decisions stay yours' },
    ],
  },

  freebies: {
    eyebrow: 'Free',
    title: 'Value first, before any commitment',
    items: [
      { k: 'Free tools', title: 'See what you’re losing right now', body: 'Calculators for every sector that read your numbers through the KON lens, and run on your device only', cta: 'Try the tools', href: '#solutions', points: ['Calculators for six sectors', 'Instant result with a plain reading', 'Your numbers stay on your device'] },
      { k: 'Free diagnosis', title: 'Your first diagnosis is on us', body: 'A 30-minute session with a senior advisor, plus a written first-draft roadmap', cta: 'Book your diagnosis', href: '#start', points: ['30 minutes with a senior advisor', 'A read across eight dimensions', 'A written first-draft roadmap'] },
      { k: 'Free support', title: 'For struggling businesses', body: 'Advanced advisory and full operational support at no cost, for those who can’t afford it', cta: 'Apply for support', href: '#support', points: ['Advanced advisory', 'Full operational support', 'No fee, no hidden conditions'] },
    ],
  },

  quick: {
    eyebrow: 'Free tools',
    title: 'Work it out yourself, in a minute',
    lede: 'Three questions many owners never ask, and your numbers **never leave your device**',
    items: [
      { id: 'price', q: 'If you raised your price, how many customers could you afford to lose?', k: 'Just 3 numbers' },
      { id: 'lever', q: 'What is the fastest way to lift your profit?', k: 'Any business' },
      { id: 'breakhour', q: 'What time does your profit start today?', k: 'Restaurants and shops' },
    ],
    cta: 'Talk your result through with us, free',
    all: 'All tools by sector',
  },

  offer: {
    eyebrow: 'Your first session',
    title: 'One session, and you’ll know where to start',
    lede: 'You leave knowing **your first move and why**, even if we never work together after',
    includes: [
      '30 minutes, at a time that suits you',
      'We look at your business from eight angles',
      'Your top 3 opportunities to start on tomorrow',
      'A written summary after the session',
    ],
    value: 'Free, with no commitment',
    guarantee: 'If you don’t leave with **at least one idea worth your time**, we’re the ones who lost the time, not you',
    cta: 'Book your free session',
    note: 'We prepare for every session, so there are only a few each month',
  },


  work: {
    eyebrow: 'The proof',
    title: 'Numbers from the field',
    lede: 'Projects we worked on ourselves. Every number here is real',
    confirmMark: 'Pending confirmation',
    featured: [
      { sector: 'Telecoms', tag: 'Business development · GTM', title: 'Telkomsel’s entry into Saudi Arabia', body: 'Business development for the Indonesian telecom operator, plus building its plan to enter the Saudi market and carrying it out on the ground', metric: '14M', metricLabel: 'SAR revenue generated' },
      { sector: 'Entertainment & hospitality', tag: 'Business development · Operations', title: 'Games Club (GC)', body: 'We rebuilt the whole operation: menu and pricing, staff training, guest experience, written procedures for every shift, and new partnerships', metric: '+161.11%', metricLabel: 'revenue growth in 30 days', extra: '+511.11% average monthly revenue' },
      { sector: 'Food & beverage', tag: 'Idea to market', title: 'Rosella: a juice brand, from zero', body: 'From an idea on paper to a brand that sells every day: product, operations and sales', metric: '4K', metricLabel: 'SAR revenue per day' },
      { sector: 'Real estate & investment', tag: 'Strategy · Execution', title: 'A private-investor property deal', body: 'We built the full strategy and closed the deal with a private investor', metric: '1.4M', metricLabel: 'SAR deal value' },
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
    all: 'All our work, and a virtual tour inside one project',
    tour: { eyebrow: '⁦360°⁩ virtual tour', title: 'Step inside one of our projects', body: 'Walk through one of the villas and move between rooms as if you were there', cta: 'Start the tour', open: 'Open in a new tab', close: 'Close the tour' },
  },


  ready: {
    eyebrow: 'Solutions',
    title: 'Every solution here started with a problem we lived through with a client',
    lede: 'Pick the problem that sounds like yours, and see how we solve it, **with live examples** from our work',
    pain: 'Sound familiar?',
    includes: 'What changes for you',
    demos: 'See it yourself',
    open: 'Open demo',
    proof: 'It happened with',
    cta: 'I want this solution',
    browseApps: 'Browse the apps library',
    noDemo: 'We walk you through this solution in your free diagnosis session, applied to your own business',
    tail: 'Your problem isn\'t here? **Tell us, and we\'ll build the solution**',
    apps: {
      eyebrow: 'Apps library',
      title: 'Over 100 ready business apps. We pick only what your business needs',
      lede: 'You don\'t need to know their names. Pick your sector and see what we set up for businesses like yours: **set up around your needs, connected, with your team trained**',
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
        id: 'maps' as ServiceId, icon: 'pin' as IconId, title: '⁦360°⁩ photos on Google Maps',
        pain: 'Before picking a restaurant or cafe, people compare places on the map. And they worry the place won\'t look like the photos when they arrive',
        line: 'Customers step inside your place from Google Maps before they visit, so they arrive confident',
        includes: ['When customers compare you with places nearby, they see all of yours, and choose you with confidence', 'They see the seating and the atmosphere as they really are, so the fear of a different place disappears', 'People searching for somewhere nearby discover you, so a search becomes a visit and a visit becomes a new customer', 'Guests arrive with the right expectations, so the experience feels better, and they come back'],
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
        line: 'A growth plan with numbers, executed with you on the ground',
        includes: ['We pick the next market or segment and cost the entry before you spend a riyal', 'Partnerships and sales channels that reach clients you couldn\'t reach before', 'Weekly indicators that show real progress, not just a feeling of movement'],
        proof: { label: 'Telkomsel\'s Saudi market entry', href: '#work' },
      },
      {
        id: 'systems' as ServiceId, icon: 'systems' as IconId, title: 'Business systems & apps',
        pain: 'Everything lives in your head, in WhatsApp and in spreadsheets. Take one day off and work stops',
        line: 'Systems that hold your work and your numbers, so the business runs even when you\'re away',
        includes: ['See your sales, stock and team performance today, before month end surprises you', 'Proven systems with no per-user licence fees, set up around your needs', 'We train your team until the system is part of their day, not a burden on it'],
        proof: { label: 'Rwafed Real Estate Marketing', href: '#work' },
      },
    ],
  },

  support: {
    eyebrow: 'The KON initiative',
    title: 'Your business is struggling and there’s no budget? This is for you',
    body: 'We give advice and hands-on operational support ++free of charge++ to struggling businesses that can’t afford it. No fee, no hidden conditions',
    dedication: 'Given as sadaqah for my late father, may God have mercy on him, and for all Muslims',
    note: 'We take requests as our capacity allows, and we reply to every one',
    cta: 'Apply for support',
  },

  talent: {
    eyebrow: 'KON Talent',
    title: 'You know you can do more. Nobody has asked you yet',
    lede: 'We’re asking. We discover your talent from **the way you think**, so you see what you truly have, then connect you with the people and opportunities that unlock ++your full potential++',
    proof: 'Behind this read: psychology, behavioral analysis, personality types, and building healthy workplaces',
    teaserQ: 'Which one are you?',
    teaserCta: 'Find yours in 3 minutes',
    lanes: {
      title: 'Every mind has a lane where it shines',
      lede: 'The problem is rarely your ability. Usually, you’re in **the wrong lane**',
      shines: 'Shines in',
      wasted: 'Fades',
      company: 'For companies: we put forward the **mind** the role needs, before the paperwork',
      ctaTalent: 'Find your mind and your lane',
      ctaCompany: 'We need a specific mind',
    },
    mirror: {
      title: 'Know the feeling?',
      talent: {
        k: 'If you’re the talent',
        lines: ['You do your job well, and know you’re wasting half of what you can do', 'You get turned down because the paper doesn’t look like you', 'You have big ideas, and no one to bring them to'],
        cta: 'Discover your talent',
      },
      company: {
        k: 'If you’re a company',
        lines: ['You hired the best CV, and got less than it promised', 'Months of searching, and the seat is still empty', 'The good ones leave before the picture is complete'],
        cta: 'Request talent',
      },
    },
    journey: {
      title: 'From talent to impact, in three steps',
      steps: [
        { title: 'Discover', body: 'We read how you think, what drives you and how you decide. So you see in yourself what you hadn’t seen before' },
        { title: 'Prove', body: 'When an opportunity matches your real value, we test the fit together with a short real-world challenge' },
        { title: 'Connect', body: 'With real people and real opportunities: a KON project, or a company that needs you. Always with your permission' },
      ],
    },
    wins: {
      title: 'We don’t make a match unless everyone wins',
      lede: 'A match where only one side wins is one everyone loses later',
      center: 'Impact',
      items: [
        { k: 'The talent', gain: 'A place worthy of you', body: 'Seen for who you are, understood for how you think, working where you shine and grow' },
        { k: 'The company', gain: 'The right person, the first time', body: 'Someone whose thinking we understand, who fits the role and the team, chosen to stay' },
        { k: 'KON', gain: 'A reputation built on results', body: 'A network of real people to build bigger projects with. Your success is ++our reputation++' },
      ],
      sum: 'Higher awareness, real connections, potential fully unlocked. That’s the impact that lasts',
    },
    doorsQ: 'Which door is yours?',
    doorsTime: 'About 3 minutes',
    doors: {
      talent: { label: 'I have talent', sub: 'I want my abilities seen, and put where they make a difference' },
      company: { label: 'We’re looking for talent', sub: 'The right person for the role, first time' },
    },
    free: 'Always free for talent',
    next: 'Next',
    back: 'Back',
    finish: 'See the result',
    stepOf: (a: number, b: number) => `Step ${a} of ${b}`,
    required: 'Complete this step to continue',
    contact: {
      title: 'Where can we find you?',
      lede: 'We use your details only to reach you. Your profile never reaches a company without your permission',
      ledeCompany: 'We use your details only to follow up on your request',
      name: 'Name',
      company: 'Company name',
      job: 'Your position',
      phone: 'Mobile (WhatsApp)',
      email: 'Email',
      city: 'City and country',
      needOne: 'Add your name and at least one way to reach you',
    },
    read: {
      title: 'Here’s what we see in you',
      lede: 'A first read from your answers. We complete it once we’ve read the way you think',
      you: 'Your closest pattern',
      lane: 'Your lane',
      also: 'With a touch of',
      roles: 'Roles where you could shine',
      where: 'Where you add value',
      story: 'How you think',
      next: 'What happens next?',
      steps: ['You send your profile', 'We read it ourselves, word by word', 'We reach out when an opportunity fits you'],
      promise: 'We don’t promise you a job. We promise to take you seriously',
    },
    brief: {
      title: 'Here’s who you’re looking for',
      lede: 'We’ve read your answers. Here’s what we understood',
      areas: 'Area',
      role: 'Role',
      type: 'Engagement',
      pains: 'What hasn’t worked',
      traits: 'Top traits',
      openYes: 'You look at how people think before their certificates. That’s exactly where we can ++surprise you++',
      unclear: 'Before you hire, you may need us to design the role with you. That’s part of our work on people and teams',
      next: 'What happens next?',
      steps: ['You send the request', 'We get to know the role with you, in depth', 'We put forward people whose thinking we know'],
    },
    sendWhatsapp: 'Send on WhatsApp',
    sendEmail: 'Send by email',
    copy: 'Copy the summary',
    copied: 'Copied',
    raw: 'Show the summary text',
    edit: 'Edit my answers',
    restart: 'Start over',
  },

  founder: {
    eyebrow: 'A note from the founder',
    paragraphs: [
      'I’m Khalid. Since 2007, I’ve been under the supervision of the ++General Directorate for Gifted Education++ in Madinah',
      'Psychologist, entrepreneur and business developer',
      'I’ve held different roles across different sectors and given more than ++4,200 hours of advisory work++ to entrepreneurs and businesses. Some of my own ventures failed, and they were the most honest teachers I’ve had',
      '++Innovation++ drives me, and I believe I can add real value to any business and any founder',
    ],
    punch: 'We all have problems. But a problem is where the solution begins',
    cta: 'Book your free diagnosis',
  },

  onboarding: {
    eyebrow: 'Start here',
    title: 'Two minutes, and we arrive already understanding your situation',
    lede: 'A few questions, **built to understand you**. The more honest the answers, the more useful your session',
    start: 'Let’s begin',
    next: 'Next',
    back: 'Back',
    finish: 'Pick your time',
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
    stages: ['You', 'Your situation', 'Contact', 'Your time'],
    intro: 'Four short steps. The last one is picking your session time',
    book: {
      title: 'Last step: pick your session time',
      lede: 'A 30-minute session. We arrive having read every answer',
      loading: 'Preparing the calendar…',
      open: 'Open the calendar in its own page',
      alt: 'Prefer to talk first?',
      details: 'Our read of your situation',
    },
  },

  finale: {
    line: 'What you were looking for was with you from the start',
    line2: 'It just needed someone to see it with you',
    again: 'Go back to the start, and read it again',
    cta: 'Book your free diagnosis',
  },

  footer: {
    rights: '© 2026 KON Unlimited. All rights reserved',
    slogan: 'Any challenge…Any way…Anywhere…We’ll be there',
    top: 'Back to top',
  },
}

export const content: Record<Lang, Content> = { ar, en }
