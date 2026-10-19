import type { IconName } from '../components/CaseVisuals'
// All copy lives here, outside the 3D layer. Nothing essential is rendered in WebGL.
// Arabic is the primary voice; English is a full parallel edition for international visitors.

export type Lang = 'ar' | 'en'

export type DimensionId =
  | 'strategy'
  | 'revenue'
  | 'marketing'
  | 'operations'
  | 'people'
  | 'finance'
  | 'cx'
  | 'technology'

export interface Dimension {
  id: DimensionId
  name: string
  latin: string
  question: string
  summary: string
  challenges: string[]
  kpis: string[]
  opportunities: string[]
}

const kpis: Record<DimensionId, string[]> = {
  strategy: ['Strategic Initiative Completion', 'Goal Alignment Score', 'Time to Decision', 'Portfolio ROI'],
  revenue: ['Win Rate', 'Sales Cycle Length', 'Average Deal Size', 'Revenue Concentration'],
  marketing: ['Customer Acquisition Cost', 'Marketing Qualified Leads', 'Channel ROI', 'Lead-to-Customer Rate'],
  operations: ['Cycle Time', 'Error Rate', 'Cost Per Operation', 'Resource Utilization', 'Automation Potential'],
  people: ['Employee Turnover', 'Revenue per Employee', 'Time to Productivity', 'Engagement Score'],
  finance: ['Gross Margin', 'Cash Conversion Cycle', 'Operating Expense Ratio', 'Forecast Accuracy'],
  cx: ['Net Promoter Score', 'Customer Retention Rate', 'First Response Time', 'Customer Lifetime Value'],
  technology: ['System Adoption Rate', 'Data Accuracy', 'Integration Coverage', 'Manual Data Entry Hours'],
}

const latin: Record<DimensionId, string> = {
  strategy: 'Strategy', revenue: 'Revenue', marketing: 'Marketing', operations: 'Operations',
  people: 'People', finance: 'Finance', cx: 'Customer Experience', technology: 'Technology',
}

type DimCopy = Omit<Dimension, 'id' | 'latin' | 'kpis'>

const dimAr: Record<DimensionId, DimCopy> = {
  strategy: {
    name: 'الاستراتيجية',
    question: 'هل يعرف كل فريق في شركتك إلى أين تتجهون، ولماذا؟',
    summary: 'وضوح الاتجاه، وحسم الأولويات، واتساق القرارات اليومية مع الأهداف الكبرى.',
    challenges: ['أولويات متزاحمة بلا معيار واضح للاختيار', 'أهداف طموحة لا تتحول إلى خطط تشغيلية', 'قرارات مصيرية تُتخذ دون بيانات كافية'],
    opportunities: ['إطار موحّد لترتيب الأولويات', 'ربط كل هدف بمؤشر قابل للقياس', 'مراجعات أداء دورية مبنية على البيانات'],
  },
  revenue: {
    name: 'الإيرادات والمبيعات',
    question: 'هل تعرف بدقة من أين تأتي إيراداتك، وأين تتسرّب؟',
    summary: 'مسار المبيعات، وسياسة التسعير، ومصادر النمو المتكرر.',
    challenges: ['مسار مبيعات يعتمد على الأفراد لا على النظام', 'تركّز الإيرادات في عدد محدود من العملاء', 'تسعير لا يعكس القيمة الحقيقية'],
    opportunities: ['توحيد مراحل مسار المبيعات وقياسها', 'تحليل الربحية حسب العميل والمنتج', 'إعادة بناء نموذج التسعير على أساس القيمة'],
  },
  marketing: {
    name: 'التسويق',
    question: 'هل تعرف أي قناة تصنع عملاءك فعلًا؟',
    summary: 'وضوح الرسالة، وكفاءة القنوات، وجودة الفرص التي تصل إلى المبيعات.',
    challenges: ['إنفاق موزّع دون قياس واضح للعائد', 'رسالة تختلف من قناة إلى أخرى', 'فجوة قائمة بين التسويق والمبيعات'],
    opportunities: ['نموذج إسناد يربط الإنفاق بالنتائج', 'هوية ورسالة موحّدتان في كل نقطة تواصل', 'تعريف مشترك للعميل المؤهل'],
  },
  operations: {
    name: 'العمليات',
    question: 'هل عملياتك تعمل بأفضل كفاءة ممكنة؟',
    summary: 'تدفق العمل، ونقاط الاختناق، والهدر الخفي، وفرص الأتمتة.',
    challenges: ['خطوات يدوية تتكرر كل يوم', 'اختناقات عند انتقال العمل بين الأقسام', 'غياب إجراءات موحّدة وموثّقة'],
    opportunities: ['رسم العمليات وحذف الخطوات غير الضرورية', 'أتمتة المهام المتكررة', 'مؤشرات تشغيلية يومية واضحة للجميع'],
  },
  people: {
    name: 'الفريق',
    question: 'هل يعمل كل فرد في فريقك حيث يُحدث الأثر الأكبر؟',
    summary: 'الهيكل التنظيمي، ووضوح الأدوار، والقدرات، وثقافة العمل.',
    challenges: ['أدوار متداخلة ومسؤوليات غير محددة', 'معرفة حرجة محصورة في أشخاص بعينهم', 'فجوات مهارية غير مرصودة'],
    opportunities: ['إعادة تصميم الهيكل والصلاحيات', 'مصفوفة مهارات وخطط تطوير', 'توثيق المعرفة الحرجة ونقلها'],
  },
  finance: {
    name: 'المالية',
    question: 'هل تصلك أرقامك في الوقت الذي تحتاجها فيه لاتخاذ القرار؟',
    summary: 'الربحية، والتدفق النقدي، وهيكل التكاليف، وجودة التقارير.',
    challenges: ['تقارير متأخرة أو موزعة على أكثر من مصدر', 'تكاليف غير مصنّفة بدقة', 'ضغط مستمر على التدفق النقدي'],
    opportunities: ['لوحة مالية موحّدة وفورية', 'تحليل التكاليف حسب النشاط', 'تخطيط نقدي استباقي'],
  },
  cx: {
    name: 'تجربة العملاء',
    question: 'هل تعرف لماذا يعود عملاؤك، ولماذا يغادرون؟',
    summary: 'رحلة العميل، ونقاط التواصل، والرضا، والولاء.',
    challenges: ['رحلة عميل غير مرسومة من البداية للنهاية', 'ملاحظات العملاء لا تصل إلى صنّاع القرار', 'تجربة متفاوتة بين القنوات'],
    opportunities: ['رسم رحلة العميل الكاملة', 'نظام لجمع الملاحظات والعمل بها', 'معايير خدمة موحّدة في كل قناة'],
  },
  technology: {
    name: 'التقنية',
    question: 'هل تخدم أنظمتك أعمالك، أم تتكيّف أعمالك مع أنظمتك؟',
    summary: 'الأنظمة، والتكامل بينها، وجودة البيانات، والأدوات الرقمية.',
    challenges: ['أنظمة منفصلة لا تتبادل البيانات', 'جداول يدوية في قلب العمليات', 'أدوات مدفوعة لا تُستخدم كما يجب'],
    opportunities: ['خريطة شاملة للأنظمة والتكاملات', 'مصدر واحد موثوق للبيانات', 'حلول رقمية مصممة حول العملية'],
  },
}

const dimEn: Record<DimensionId, DimCopy> = {
  strategy: {
    name: 'Strategy',
    question: 'Does every team know where the company is heading, and why?',
    summary: 'Clear direction, decisive priorities, and daily decisions that serve the bigger goals.',
    challenges: ['Competing priorities with no rule for choosing', 'Ambitious goals that never become operating plans', 'Critical decisions made without enough data'],
    opportunities: ['One framework for setting priorities', 'Every goal tied to a measurable indicator', 'Regular, data-led performance reviews'],
  },
  revenue: {
    name: 'Revenue',
    question: 'Do you know exactly where your revenue comes from, and where it leaks?',
    summary: 'Sales pipeline, pricing policy, and sources of recurring growth.',
    challenges: ['A pipeline that depends on individuals, not a system', 'Revenue concentrated in a few clients', 'Pricing that undersells the value delivered'],
    opportunities: ['A standardised, measurable pipeline', 'Profitability by client and by product', 'Value-based pricing'],
  },
  marketing: {
    name: 'Marketing',
    question: 'Do you know which channel actually creates your customers?',
    summary: 'Message clarity, channel efficiency, and the quality of leads handed to sales.',
    challenges: ['Spend spread thin with no clear return', 'A message that changes from channel to channel', 'A persistent gap between marketing and sales'],
    opportunities: ['Attribution that links spend to results', 'One identity and message at every touchpoint', 'A shared definition of a qualified lead'],
  },
  operations: {
    name: 'Operations',
    question: 'Are your operations running at their best possible efficiency?',
    summary: 'Workflow, bottlenecks, hidden waste, and automation potential.',
    challenges: ['Manual steps repeated every day', 'Bottlenecks wherever work changes hands', 'No standard, documented procedures'],
    opportunities: ['Map processes and remove unnecessary steps', 'Automate repetitive work', 'Clear daily operating indicators for everyone'],
  },
  people: {
    name: 'People',
    question: 'Is every person on your team working where they make the greatest impact?',
    summary: 'Structure, role clarity, capabilities, and culture.',
    challenges: ['Overlapping roles and unclear accountability', 'Critical knowledge held by a few people', 'Skill gaps no one has measured'],
    opportunities: ['Redesigned structure and authority', 'A skills matrix with development plans', 'Critical knowledge documented and shared'],
  },
  finance: {
    name: 'Finance',
    question: 'Do your numbers reach you when you need them to decide?',
    summary: 'Profitability, cash flow, cost structure, and reporting quality.',
    challenges: ['Late reports scattered across sources', 'Costs that are not classified precisely', 'Constant pressure on cash flow'],
    opportunities: ['One real-time financial dashboard', 'Activity-based cost analysis', 'Proactive cash planning'],
  },
  cx: {
    name: 'Customer Experience',
    question: 'Do you know why customers return, and why they leave?',
    summary: 'The customer journey, touchpoints, satisfaction, and loyalty.',
    challenges: ['A journey no one has mapped end to end', 'Feedback that never reaches decision makers', 'An experience that varies by channel'],
    opportunities: ['A complete customer journey map', 'A system to capture and act on feedback', 'One service standard across channels'],
  },
  technology: {
    name: 'Technology',
    question: 'Do your systems serve the business, or does the business work around them?',
    summary: 'Systems, integration, data quality, and digital tools.',
    challenges: ['Disconnected systems that do not share data', 'Spreadsheets at the heart of operations', 'Paid tools that are barely used'],
    opportunities: ['A full map of systems and integrations', 'One trusted source of data', 'Digital solutions designed around the process'],
  },
}

const ORDER: DimensionId[] = ['strategy', 'revenue', 'marketing', 'operations', 'people', 'finance', 'cx', 'technology']
export const DIMENSION_IDS = ORDER

const buildDims = (src: Record<DimensionId, DimCopy>): Dimension[] =>
  ORDER.map((id) => ({ id, latin: latin[id], kpis: kpis[id], ...src[id] }))

export type CaseStatus = 'delivered' | 'experience' | 'progress' | 'mvp' | 'concept'

export interface CaseStudy {
  id: 'estate' | 'transport' | 'fieldops' | 'webar'
  index: string
  sector: string
  status: CaseStatus
  founder?: boolean
  title: string
  body: string
  deliverables: string[]
  screens?: string[]
}

export interface MiniCase {
  icon: IconName
  sector: string
  status: CaseStatus
  founder?: boolean
  title: string
  body: string
}

const ar = {
  dir: 'rtl' as 'rtl' | 'ltr',
  meta: { switchTo: 'English', switchLabel: 'Switch to English', skip: 'تخطَّ إلى المحتوى', menu: 'القائمة', close: 'إغلاق' },
  nav: [
    { href: '#story', label: 'المنهجية' },
    { href: '#services', label: 'خدماتنا' },
    { href: '#framework', label: 'إطار التشخيص' },
    { href: '#work', label: 'أعمالنا' },
  ],
  headerCta: 'احجز جلسة',
  intro: 'نُهيّئ النظام',
  hero: {
    eyebrow: 'استشارات الأعمال · التحول التشغيلي · الحلول الرقمية',
    title: ['عملك', 'قادر على أكثر.'],
    lede: 'نكتشف الفرص الكامنة، ونعالج التحديات من جذورها، ونصمم الحلول التي تدفع أعمالك نحو كامل إمكاناتها.',
    primary: 'احجز جلسة تشخيص',
    secondary: 'اكتشف منهجيتنا',
    meta: ['الخليج العربي · العالم', 'من التعقيد إلى الوضوح'],
    scroll: 'مرّر للاكتشاف',
  },
  stages: ['التعقيد', 'الاكتشاف', 'التشخيص', 'الفهم', 'التحسين', 'التحوّل', 'النمو'],
  stagesLabel: 'من التعقيد إلى الوضوح',
  chaptersLabel: 'فصول القصة',
  chapters: [
    {
      id: 'system', step: 'النظام',
      title: 'كل شركة نظامٌ حيّ.',
      body: 'الاستراتيجية، والتسويق، والمبيعات، والعمليات، والفريق، والمالية، والتقنية، وتجربة العملاء. أداء شركتك لا يتحدد بقوة كل جزء وحده، بل بجودة العلاقات بين هذه الأجزاء.',
      note: 'ومع النمو، تبدأ بعض الأجزاء بالعمل بمعزل عن غيرها. هذه نتيجة طبيعية لأي شركة تتوسع.',
    },
    {
      id: 'diagnosis', step: 'التشخيص',
      title: 'الوضوح يبدأ من النظرة الأقرب.',
      body: 'نفكك النظام إلى مكوناته، ونفهم دور كل جزء، ونتتبع أثره في بقية الأجزاء.',
      list: ['العمليات', 'التسويق', 'المالية', 'الفريق', 'تجربة العملاء', 'التقنية'],
    },
    {
      id: 'discovery', step: 'الاكتشاف',
      title: 'ما لا تكشفه الأرقام وحدها.',
      body: 'حين نرى النظام كاملًا، تظهر الحقائق التي تختبئ بين الأقسام.',
      findings: [
        { k: 'اختناقات', v: 'نقاط يتباطأ عندها تدفق العمل والقرار.' },
        { k: 'عمليات منفصلة', v: 'أقسام تؤدي عملها جيدًا، لكن دون تنسيق كافٍ.' },
        { k: 'موارد غير مستغلة', v: 'أدوات وقدرات تملكها الشركة ولا تستثمرها بالكامل.' },
        { k: 'فرص لم تُستكشف', v: 'مساحات نمو قريبة لم يلتفت إليها أحد بعد.' },
      ],
    },
    {
      id: 'transformation', step: 'التحوّل',
      title: 'نعيد الترتيب، لا البناء من الصفر.',
      body: 'نعيد تصميم العلاقات بين الأجزاء. تتضح المسارات، وتتوافق العمليات، ويبدأ النظام بالعمل كوحدة واحدة.',
    },
    {
      id: 'potential', step: 'الإمكانات',
      title: 'نساعد أعمالك على الوصول إلى كامل إمكاناتها.',
      body: 'نظام واضح ينمو بثقة، ويتخذ قراراته على أساس متين.',
      cta: 'استكشف إطار التشخيص',
    },
  ],
  services: {
    eyebrow: 'خدماتنا',
    title: 'خمس قدرات، تعمل كمنظومة واحدة.',
    items: [
      { k: 'تشخيص الأعمال', v: 'قراءة شاملة لأداء شركتك عبر ثمانية أبعاد مترابطة.' },
      { k: 'الاستراتيجية والنمو', v: 'أولويات واضحة، ومسارات نمو قابلة للقياس.' },
      { k: 'التميّز التشغيلي', v: 'عمليات أبسط وأسرع وأقل تكلفة.' },
      { k: 'الحلول الرقمية', v: 'مواقع ومنصات ولوحات تحكم مصممة حول طريقة عملك.' },
      { k: 'التحليلات المعززة بالذكاء الاصطناعي', v: 'تحليل أعمق لبياناتك، بإشراف خبراء يفهمون السياق.' },
    ],
  },
  process: {
    eyebrow: 'كيف نعمل',
    title: 'منهجية واضحة، من أول جلسة إلى أثر ملموس.',
    steps: [
      { k: 'نشخّص', v: 'نفهم النظام كما هو، عبر البيانات والمقابلات والملاحظة الميدانية.' },
      { k: 'نصمّم', v: 'نحدد الأولويات، ونصمم الحلول الأعلى أثرًا.' },
      { k: 'ننفّذ', v: 'نعمل جنبًا إلى جنب مع فريقك على التطبيق، خطوة بخطوة.' },
      { k: 'نقيس', v: 'نتابع المؤشرات التي تهم، ونحسّن باستمرار.' },
    ],
  },
  framework: {
    eyebrow: 'إطار KON للتشخيص',
    title: 'ثمانية أبعاد. نظام واحد.',
    lede: 'نقرأ شركتك من ثمانية أبعاد مترابطة. اختر بعدًا لترى الأسئلة التي نطرحها، والمؤشرات التي نقيسها، والفرص التي نبحث عنها.',
    groupLabel: 'أبعاد التشخيص',
    challenges: 'تحديات شائعة',
    kpis: 'مؤشرات نقيسها',
    opportunities: 'فرص التحسين',
    back: 'عرض كل الأبعاد',
    hint: 'اختر بعدًا من القائمة، أو من النموذج مباشرة.',
  },
  humanAI: {
    eyebrow: 'الخبرة البشرية × الذكاء الاصطناعي',
    title: 'الذكاء الاصطناعي يعزّز حكم الخبير، ولا يحلّ محله.',
    body: 'نجمع خبرة استشارية تفهم سياق عملك وثقافته، مع مسارات تحليل متخصصة مدعومة بالذكاء الاصطناعي تعالج البيانات بسرعة ودقة. ويبقى القرار دائمًا قائمًا على فهم عميق للأعمال.',
    legend: ['الخبرة البشرية', 'مسارات التحليل بالذكاء الاصطناعي'],
    joinedEyebrow: 'بنية دعم القرار',
    parts: [
      { k: 'الخبرة البشرية', v: 'فهم السياق، والأولويات، والأشخاص.' },
      { k: 'الذكاء الاصطناعي', v: 'تحليل متخصص لأنماط البيانات على نطاق واسع.' },
      { k: 'بيانات الأعمال', v: 'أرقامك الفعلية، لا افتراضات عامة.' },
      { k: 'التنفيذ الاستراتيجي', v: 'نتائج تتحول إلى خطوات حاسمة.' },
    ],
  },
  work: {
    eyebrow: 'أعمال مختارة',
    title: 'قطاعات مختلفة. منهج واحد.',
    intro: 'لكل عمل مشكلة مختلفة، لذلك يبدأ عملنا من المشكلة لا من قائمة خدمات جاهزة. هذه مجموعة من الأعمال المنجزة والمشاريع الجارية والمفاهيم التي نطوّرها.',
    sectorsLabel: 'القطاعات',
    sectors: ['العقار', 'الضيافة', 'المطاعم', 'الخدمات البلدية', 'الفعاليات الكبرى', 'SaaS', 'الواقع المعزز', 'الذكاء الاصطناعي', 'السيارات', 'التنقل', 'الموارد البشرية'],
    status: { delivered: 'عمل منجز', experience: 'خبرة مهنية', progress: 'قيد التنفيذ', mvp: 'نموذج أولي عامل', concept: 'مفهوم مشروع' },
    founder: 'بقيادة المؤسس',
    delivers: 'ما قُدِّم',
    screens: 'شاشات النظام',
    schematic: 'مخططات توضيحية لنطاق النظام، وليست لقطات من التطبيق',
    tourCta: 'ادخل الجولة الافتراضية 360°',
    tourBody: 'هنا تُعرض الجولة الافتراضية الحقيقية، وتبقى هي التجربة التفاعلية الأساسية.',
    tourMissing: 'بانتظار رابط تضمين الجولة (مثل Matterport أو Kuula)',
    tourBack: 'العودة إلى النموذج',
    tourOpen: 'افتح الجولة في نافذة جديدة',
    tourOutBody: 'جولة افتراضية حقيقية بزاوية 360 درجة داخل إحدى الفلل. تجوّل في المساحات وانتقل بين الغرف كما لو كنت هناك.',
    tourOutCta: 'ابدأ الجولة',
    tourRegion: 'الجولة الافتراضية',
    before: 'قبل: حجوزات منفصلة',
    after: 'بعد: تشغيل واحد تحت السيطرة',
    flowNodes: ['المطار', 'الفندق', 'الملعب', 'الإرسال', 'التقارير'],
    ops: {
      nodes: ['المطار', 'الفندق', 'الملعب', 'غرفة الإرسال', 'التقارير'],
      before: 'قبل: حجوزات منفصلة',
      after: 'بعد: تشغيل واحد',
      legendRoute: 'مسار رحلة الضيف',
      legendVehicle: 'مركبة في الطريق',
      legendControl: 'ارتباط بغرفة الإرسال',
      board: 'لوحة التحكم',
      boardRows: ['وصول عبر المطار', 'التجهيز في الفندق', 'الوصول إلى الملعب', 'تغيير طارئ'],
      statuses: ['جاهز', 'في الطريق', 'مؤكَّد', 'غير متابَع'],
    },
    arSteps: { editor: 'تُبنى التجربة في المحرر', scan: 'تُشارك عبر رمز QR', live: 'تظهر على متصفح الجوال' },
    phasesLabel: 'مراحل الإجراءات التشغيلية',
    phases: ['الجاهزية', 'رحلة الضيف', 'الإرسال والتحكم', 'الحوادث والطوارئ', 'المراجعة بعد التشغيل'],
    cases: [
      { id: 'estate', index: '01', sector: 'العقار والتقنية العقارية', status: 'delivered', founder: true,
        title: 'جولات افتراضية للفلل، وفرق مبيعات أكثر جاهزية',
        body: 'لشركات عقارية سعودية، اجتمع تدريب فرق المبيعات وتوصيات تطوير الموقع الإلكتروني مع جولات افتراضية تفاعلية للفلل، ليصل المشتري إلى المعاينة وهو يفهم المساحة وتوزيعها مسبقًا.',
        deliverables: ['تدريب فريق المبيعات وتمكينه', 'توصيات لتطوير الموقع ورحلة الشراء الرقمية', 'جولات افتراضية تفاعلية للفلل'] },
      { id: 'transport', index: '02', sector: 'الفعاليات الكبرى والتنقل', status: 'progress',
        title: 'نظام تشغيل لنقل كبار الشخصيات',
        body: 'لفعالية رياضية دولية كبرى في جدة، نصمم إطارًا تشغيليًا واحدًا يربط رحلة الضيف بين المطار والفندق والملعب، مع الأسطول والإرسال والبروتوكول والاتصالات وخطط الطوارئ. العمل في مرحلة التخطيط، ولا نقدّمه كنتيجة تشغيل فعلية.',
        deliverables: ['نموذج تشغيلي وهيكل أدوار واضح', 'مكتبة إجراءات تشغيل من الجاهزية حتى المراجعة', 'بنية لوحات المتابعة وسجل المخاطر'] },
      { id: 'fieldops', index: '03', sector: 'الخدمات البلدية والعمليات الميدانية', status: 'progress',
        title: 'نظام جوال للعمليات الميدانية البلدية',
        body: 'لجهة خدمات ميدانية بلدية، نبني نظامًا يربط البلاغات المصوّرة بالموظفين والمركبات والورديات، مع معالجة للصور بمساعدة الذكاء الاصطناعي، وتنبيهات للصيانة والتراخيص، وواجهات للمشرفين والمختصين. المشروع متعاقد عليه وقيد التنفيذ.',
        deliverables: ['نطاق المنتج ومتطلباته', 'إسناد السائقين والمركبات والورديات', 'تنبيهات الصيانة والتراخيص وتقارير الإدارة'],
        screens: ['البلاغ', 'الإسناد', 'المشرف'] },
      { id: 'webar', index: '04', sector: 'SaaS والواقع المعزز', status: 'mvp',
        title: 'استوديو حملات الواقع المعزز عبر المتصفح',
        body: 'منصة SaaS بلا برمجة تتيح للشركات بناء تجارب واقع معزز قائمة على الصور، بالفيديو والمجسمات ثلاثية الأبعاد والنصوص والأزرار، ثم مشاركتها عبر رمز QR على متصفح الجوال. اجتازت النسخة الأولية فحوصات الجودة والبناء المسجّلة، ولم تُطلق تجاريًا بعد.',
        deliverables: ['محرر مشاهد للصور والفيديو والمجسمات', 'مساحات عمل ومشاريع وإدارة أصول', '19 اختبارًا آليًا ناجحًا وبناء إنتاجي سليم'] },
    ] as CaseStudy[],
    moreTitle: 'خبرة عبر القطاعات',
    more: [
      { icon: 'chart', sector: 'الضيافة والاستثمار', status: 'delivered', founder: true, title: 'دعم قرار الاستثمار الفندقي', body: 'منهج منظم يرتّب المدخلات التجارية خلف قرار استثمار فندقي، لتسهل المقارنة والنقاش قبل الالتزام برأس المال.' },
      { icon: 'food', sector: 'المطاعم والتسويق', status: 'delivered', founder: true, title: 'الحضور الرقمي للمطاعم', body: 'تصوير فوتوغرافي وفيديو، وإدارة لوسائل التواصل، وحملات، وظهور على خرائط Google، في خدمة واحدة مبنية على الطريقة التي يكتشف بها الزبون المطعم ويختاره.' },
      { icon: 'megaphone', sector: 'التسويق العقاري', status: 'experience', founder: true, title: 'قيادة المبيعات والتسويق من الداخل', body: 'خبرة عملية داخل منظمة تسويق عقاري: مبيعات مباشرة، وإشراف على فريق التسويق، وتنفيذ حملات، تربط الاستراتيجية بواقع العمل اليومي.' },
      { icon: 'bell', sector: 'تشغيل الفنادق', status: 'experience', founder: true, title: 'الاستقبال وتجربة النزلاء', body: 'خبرة مباشرة في مكتب الاستقبال بفندق في السعودية، تمنح توصياتنا في الضيافة فهمًا عمليًا للتواصل مع النزلاء وتسليم المهام ومعالجة المشكلات.' },
    ] as MiniCase[],
    labTitle: 'مختبر المشاريع',
    labIntro: 'منتجات ومشاريع نطوّرها داخليًا. نعرضها بوصفها مفاهيم، لا منتجات مُطلقة.',
    lab: [
      { icon: 'voice', sector: 'الذكاء الاصطناعي والسيارات', status: 'concept', title: 'موظف استقبال صوتي عربي', body: 'بنية متعددة المستأجرين تربط المكالمات العربية بمخزون قطع الغيار والأسعار والتوافق والحجوزات الفعلية لمحلات السيارات. الخطوة التالية: إثبات مفهوم بمكالمات سعودية حقيقية.' },
      { icon: 'building', sector: 'التطوير العقاري', status: 'concept', title: 'وحدات استثمارية بخدمات ضيافة', body: 'نموذج تطوير يقدّم الوحدات الصغيرة كمنتج تشغيلي للمستثمرين، مع خدمات مشتركة اختيارية للتنظيف والصيانة وإدارة الإيرادات. إطار جدوى أولي، وليس مشروعًا منجزًا.' },
      { icon: 'bike', sector: 'التنقل والأسواق الرقمية', status: 'concept', title: 'Safe Bike', body: 'تطبيق سعودي لراكبي الدراجات النارية يجمع عروض الشركاء، والحجز مع التحقق عبر QR، وسوقًا متخصصًا للدراجات والمعدات. مخطط منتج للمرحلة الأولى.' },
      { icon: 'people', sector: 'الموارد البشرية والتوظيف', status: 'concept', title: 'تجربة', body: 'منصة سعودية تحوّل التدريب القصير والمشاريع المصغّرة إلى ملفات أعمال موثّقة، بتقييم من الشركات وتحقق من المهارات بمساعدة الذكاء الاصطناعي.' },
    ] as MiniCase[],
    note: 'نفصل بوضوح بين العمل المنجز والنماذج الأولية والمفاهيم. أسماء العملاء محجوبة إلى حين موافقتهم، ولا ننشر نتائج إلا بعد التحقق منها.',
  },
  marquee: ['تشخيص الأعمال', 'الاستراتيجية والنمو', 'التميّز التشغيلي', 'الحلول الرقمية', 'التحليلات بالذكاء الاصطناعي', 'تجربة العملاء'],
  contact: {
    eyebrow: 'الخطوة الأولى',
    title: 'لنبدأ بفهم أعمالك.',
    body: 'جلسة تشخيص أولى نتعرّف فيها على نظام أعمالك، ونحدد معًا أين تكمن أكبر الفرص.',
    name: 'الاسم الكامل', company: 'الشركة', email: 'البريد الإلكتروني', challenge: 'أين ترى التحدي الأكبر اليوم؟',
    choose: 'اختر بُعدًا', unsure: 'لست متأكدًا بعد', cta: 'احجز جلسة التشخيص',
    done: 'شكرًا لك. هذه نسخة معاينة، لذلك لم يُرسل الطلب. سيُربط النموذج بنظام الحجز عند الإطلاق.',
  },
  footer: { tagline: 'عملك قادر على أكثر.', note: 'نسخة معاينة · العناصر المعلَّمة بانتظار المواد الفعلية', top: 'العودة للأعلى' },
  dimensions: buildDims(dimAr),
}

const en: typeof ar = {
  dir: 'ltr',
  meta: { switchTo: 'العربية', switchLabel: 'التبديل إلى العربية', skip: 'Skip to content', menu: 'Menu', close: 'Close' },
  nav: [
    { href: '#story', label: 'Approach' },
    { href: '#services', label: 'Services' },
    { href: '#framework', label: 'Framework' },
    { href: '#work', label: 'Work' },
  ],
  headerCta: 'Book a session',
  intro: 'Assembling the system',
  hero: {
    eyebrow: 'Business Advisory · Operational Transformation · Digital Solutions',
    title: ['Your business', 'is capable of more.'],
    lede: 'We uncover hidden opportunities, resolve challenges at their root, and design the solutions that move your business toward its full potential.',
    primary: 'Book a diagnostic session',
    secondary: 'Explore our approach',
    meta: ['GCC · Worldwide', 'From complexity to clarity'],
    scroll: 'Scroll to explore',
  },
  stages: ['Complexity', 'Discovery', 'Diagnosis', 'Understanding', 'Optimization', 'Transformation', 'Growth'],
  stagesLabel: 'From complexity to clarity',
  chaptersLabel: 'Story chapters',
  chapters: [
    {
      id: 'system', step: 'The system',
      title: 'Every company is a living system.',
      body: 'Strategy, marketing, sales, operations, people, finance, technology and customer experience. Performance is defined less by the strength of each part than by the quality of the connections between them.',
      note: 'As companies grow, some parts begin to work in isolation. It is a natural consequence of growth.',
    },
    {
      id: 'diagnosis', step: 'Diagnosis',
      title: 'Clarity begins up close.',
      body: 'We take the system apart, understand the role of each component, and trace how it affects the rest.',
      list: ['Operations', 'Marketing', 'Finance', 'People', 'Customer Experience', 'Technology'],
    },
    {
      id: 'discovery', step: 'Discovery',
      title: 'What numbers alone won’t reveal.',
      body: 'Seen as a whole, the system exposes what hides between departments.',
      findings: [
        { k: 'Bottlenecks', v: 'Points where work and decisions slow down.' },
        { k: 'Disconnected processes', v: 'Teams that perform well, but not in concert.' },
        { k: 'Underused resources', v: 'Tools and capabilities you own but don’t fully use.' },
        { k: 'Unexplored opportunities', v: 'Growth that sits close by, still unnoticed.' },
      ],
    },
    {
      id: 'transformation', step: 'Transformation',
      title: 'Realign. Don’t rebuild.',
      body: 'We redesign how the parts connect. Pathways become clear, processes align, and the system starts working as one.',
    },
    {
      id: 'potential', step: 'Potential',
      title: 'We help your business reach its full potential.',
      body: 'A clear system grows with confidence and decides on solid ground.',
      cta: 'Explore the framework',
    },
  ],
  services: {
    eyebrow: 'Services',
    title: 'Five capabilities, working as one system.',
    items: [
      { k: 'Business Diagnosis', v: 'A complete reading of your company across eight connected dimensions.' },
      { k: 'Strategy & Growth', v: 'Clear priorities and measurable paths to growth.' },
      { k: 'Operational Excellence', v: 'Simpler, faster, leaner operations.' },
      { k: 'Digital Solutions', v: 'Websites, platforms and dashboards designed around how you work.' },
      { k: 'AI-Assisted Analytics', v: 'Deeper analysis of your data, guided by experts who understand context.' },
    ],
  },
  process: {
    eyebrow: 'How we work',
    title: 'A clear method, from the first session to measurable impact.',
    steps: [
      { k: 'Diagnose', v: 'We map the system as it is, through data, interviews and observation.' },
      { k: 'Design', v: 'We set priorities and design the highest-impact solutions.' },
      { k: 'Deliver', v: 'We implement alongside your team, step by step.' },
      { k: 'Measure', v: 'We track the indicators that matter and keep improving.' },
    ],
  },
  framework: {
    eyebrow: 'The KON Diagnostic Framework',
    title: 'Eight dimensions. One system.',
    lede: 'We read your company through eight connected dimensions. Select one to see the questions we ask, the indicators we measure and the opportunities we look for.',
    groupLabel: 'Diagnostic dimensions',
    challenges: 'Common challenges',
    kpis: 'Indicators we measure',
    opportunities: 'Opportunities',
    back: 'Show all dimensions',
    hint: 'Select a dimension from the list, or directly in the model.',
  },
  humanAI: {
    eyebrow: 'Human expertise × Artificial intelligence',
    title: 'AI sharpens expert judgment. It never replaces it.',
    body: 'We pair advisors who understand your context and culture with specialized AI-assisted analysis that processes data quickly and precisely. Every decision stays grounded in a deep understanding of the business.',
    legend: ['Human expertise', 'AI-assisted analysis'],
    joinedEyebrow: 'Decision-support structure',
    parts: [
      { k: 'Human expertise', v: 'Context, priorities and people.' },
      { k: 'Artificial intelligence', v: 'Specialized analysis of patterns at scale.' },
      { k: 'Business data', v: 'Your actual numbers, not generic assumptions.' },
      { k: 'Strategic execution', v: 'Findings turned into decisive action.' },
    ],
  },
  work: {
    eyebrow: 'Selected work',
    title: 'Different sectors. One discipline.',
    intro: 'Different businesses need different solutions, so our work begins with the problem, not a predefined service. Here is a cross-section of delivered work, active builds and the ventures we develop.',
    sectorsLabel: 'Sectors',
    sectors: ['Real estate', 'Hospitality', 'Restaurants', 'Public services', 'Major events', 'SaaS', 'Augmented reality', 'AI', 'Automotive', 'Mobility', 'HR tech'],
    status: { delivered: 'Delivered', experience: 'Professional experience', progress: 'In progress', mvp: 'Working MVP', concept: 'Venture concept' },
    founder: 'Founder-led',
    delivers: 'What was delivered',
    screens: 'System views',
    schematic: 'Schematic views of the scope, not app screenshots',
    tourCta: 'Enter the 360° virtual tour',
    tourBody: 'The real 360° virtual tour appears here, and remains the primary interactive experience.',
    tourMissing: 'Awaiting the tour embed link (e.g. Matterport or Kuula)',
    tourBack: 'Back to the model',
    tourOpen: 'Open the tour in a new tab',
    tourOutBody: 'A real 360° walkthrough of one of the villas. Move through the spaces and between rooms as if you were there.',
    tourOutCta: 'Start the tour',
    tourRegion: 'Virtual tour',
    before: 'Before: separate bookings',
    after: 'After: one controlled operation',
    flowNodes: ['Airport', 'Hotel', 'Venue', 'Dispatch', 'Reporting'],
    ops: {
      nodes: ['Airport', 'Hotel', 'Venue', 'Dispatch', 'Reporting'],
      before: 'Before: separate bookings',
      after: 'After: one operation',
      legendRoute: 'Guest journey',
      legendVehicle: 'Vehicle en route',
      legendControl: 'Linked to dispatch',
      board: 'Control board',
      boardRows: ['Airport arrival', 'Hotel staging', 'Venue arrival', 'Live change'],
      statuses: ['Ready', 'En route', 'Confirmed', 'Untracked'],
    },
    arSteps: { editor: 'Built in the editor', scan: 'Shared with a QR code', live: 'Live in the mobile browser' },
    phasesLabel: 'SOP phases',
    phases: ['Readiness', 'Guest journeys', 'Dispatch & control', 'Incidents & contingencies', 'Post-operation review'],
    cases: [
      { id: 'estate', index: '01', sector: 'Real estate & PropTech', status: 'delivered', founder: true,
        title: 'Villa virtual tours and sharper sales teams',
        body: 'For Saudi real estate businesses, sales training and website recommendations were brought together with interactive villa tours, so buyers arrive at a viewing already understanding the space and its layout.',
        deliverables: ['Sales training and enablement', 'Website and digital buying-journey recommendations', 'Interactive villa virtual tours'] },
      { id: 'transport', index: '02', sector: 'Major events & mobility', status: 'progress',
        title: 'An operating system for VVIP and VIP transport',
        body: 'For a major international sporting event in Jeddah, we are designing one operating framework that connects the guest journey across airport, hotel and venue with fleet, dispatch, protocol, communications and contingencies. It is planning-stage work, not a live-event result.',
        deliverables: ['Operating model and role structure', 'SOP library from readiness to post-operation review', 'Dashboard architecture and risk register'] },
      { id: 'fieldops', index: '03', sector: 'Public services & field operations', status: 'progress',
        title: 'A mobile system for municipal field operations',
        body: 'For a municipal field-services client, we are building a system that connects photo-based requests to staff, vehicles and shifts, with AI-assisted image handling, maintenance and licence alerts, and views for supervisors and specialists. The build is contracted and in progress.',
        deliverables: ['Product scope and requirements', 'Driver, vehicle and shift assignment', 'Maintenance and licence alerts, management reporting'],
        screens: ['Request', 'Assign', 'Supervisor'] },
      { id: 'webar', index: '04', sector: 'SaaS & augmented reality', status: 'mvp',
        title: 'A browser-based AR campaign studio',
        body: 'A no-code SaaS platform that lets businesses compose image-target AR experiences with video, 3D objects, text and buttons, then share them through a QR code in the mobile browser. The MVP passed its recorded quality and build checks; it has not launched commercially.',
        deliverables: ['Scene editor for images, video and 3D', 'Workspaces, projects and asset management', '19 automated tests passing, clean production build'] },
    ] as CaseStudy[],
    moreTitle: 'Experience across sectors',
    more: [
      { icon: 'chart', sector: 'Hospitality investment', status: 'delivered', founder: true, title: 'Hotel investment decision support', body: 'A structured approach that organises the commercial inputs behind a hotel investment, making options easier to compare before capital is committed.' },
      { icon: 'food', sector: 'Restaurants & marketing', status: 'delivered', founder: true, title: 'Restaurant digital presence', body: 'Photography, video, social media, campaigns and Google Maps presence combined into one offer, built around how diners discover and choose a venue.' },
      { icon: 'megaphone', sector: 'Real estate marketing', status: 'experience', founder: true, title: 'Embedded sales and marketing leadership', body: 'Hands-on experience inside a real estate marketing organisation: frontline sales, marketing-team supervision and campaign execution, connecting strategy to daily delivery.' },
      { icon: 'bell', sector: 'Hotel operations', status: 'experience', founder: true, title: 'Front desk and guest operations', body: 'Direct front-desk experience in a Saudi hotel gives our hospitality advice a practical grasp of guest communication, handoffs and issue resolution.' },
    ] as MiniCase[],
    labTitle: 'Venture lab',
    labIntro: 'Products and ventures we develop in-house. They are shown as concepts, not launched products.',
    lab: [
      { icon: 'voice', sector: 'AI voice & automotive', status: 'concept', title: 'Arabic AI receptionist', body: 'A multi-tenant architecture that connects Arabic phone calls to a shop’s real parts inventory, pricing, compatibility and reservations. Next gate: a measured proof of concept on real Saudi calls.' },
      { icon: 'building', sector: 'Real estate development', status: 'concept', title: 'Hospitality-enabled investor residences', body: 'A development model that treats compact units as an operating product for investors, with optional shared cleaning, maintenance and revenue management. A feasibility concept, not a completed project.' },
      { icon: 'bike', sector: 'Mobility & marketplaces', status: 'concept', title: 'Safe Bike', body: 'A Saudi app concept for motorcycle riders: partner offers, bookings with QR validation, and a specialist marketplace for bikes and gear. A Phase 1 product blueprint.' },
      { icon: 'people', sector: 'HR tech & workforce', status: 'concept', title: 'Tajriba', body: 'A Saudi platform concept that turns micro-internships and short projects into verified portfolios, with company feedback and AI-assisted skill validation.' },
    ] as MiniCase[],
    note: 'We separate delivered work from prototypes and concepts. Client names are withheld until approved, and results are published only once verified.',
  },
  marquee: ['Business Diagnosis', 'Strategy & Growth', 'Operational Excellence', 'Digital Solutions', 'AI-Assisted Analytics', 'Customer Experience'],
  contact: {
    eyebrow: 'The first step',
    title: 'Let’s start by understanding your business.',
    body: 'A first diagnostic session to understand your business system and identify, together, where the greatest opportunities lie.',
    name: 'Full name', company: 'Company', email: 'Email', challenge: 'Where do you see the biggest challenge today?',
    choose: 'Choose a dimension', unsure: 'Not sure yet', cta: 'Book the diagnostic session',
    done: 'Thank you. This is a preview, so nothing was sent. The form will connect to the booking system at launch.',
  },
  footer: { tagline: 'Your business is capable of more.', note: 'Preview edition · marked items await final assets', top: 'Back to top' },
  dimensions: buildDims(dimEn),
}

export type Content = typeof ar
export const content: Record<Lang, Content> = { ar, en }

// Real assets go here. Empty values render clearly marked placeholders.
export const media = {
  /** Field-operations app screenshots (portrait, ~1170×2532), once approved for public use. */
  fieldScreens: [] as string[],
  /** Embeddable 360° virtual tour URL (e.g. Matterport / Kuula share link). */
  /** Villa 360° photos (equirectangular 2:1 JPG), shown in the built-in viewer; takes priority over tourUrl. */
  tourScenes: [] as { src: string; label: string }[],
  tourUrl: 'https://kuula.co/share/collection/7MZVN?logo=1&info=1&fs=1&vr=0&sd=1&thumbs=1',
}
