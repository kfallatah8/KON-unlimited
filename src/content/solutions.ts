// KON Solutions by sector: free tools that work right now, open-source systems KON sets up on
// request, and KON's own services. One sector at a time, so a visitor only sees what fits them.
//
// To add a system to a sector: add an entry to that sector's `picks` (the `app` id must exist in
// content/apps.ts, the verified catalog). To add a tool: build it in components/Tools.tsx, give it
// an id in ToolId, and list it under a sector's `tools`.
import type { ServiceId } from './site'

export type ToolId =
  | 'delivery' | 'recipe' | 'oee' | 'home' | 'channel' | 'breakhour' | 'stock'
  | 'ceiling' | 'lever' | 'price' | 'focus' | 'meeting' | 'turnover' | 'founder' | 'delay' | 'viewing'
export type SectorId = 'food' | 're' | 'fnb' | 'fac' | 'retail' | 'home' | 'all'
type T = { ar: string; en: string }

export interface Pick {
  id: string
  /** Catalog app the setup is built on (content/apps.ts). */
  app: string
  title: T
  pain: T
}
export interface Extra {
  id: string
  kind: 'service' | 'studio'
  /** For services: reuses the approved Solutions copy in site.ts (ready.items). */
  service?: ServiceId
  title?: T
  line?: T
}
export interface SolSector {
  id: SectorId
  name: T
  /** One line in the visitor's own words: the pain that brings them here. */
  hook: T
  tools: ToolId[]
  /** After a tool shows its result, the system that would make that result automatic. */
  next: Partial<Record<ToolId, string>>
  picks: Pick[]
  extras: Extra[]
}

const p = (id: string, app: string, title: T, pain: T): Pick => ({ id, app, title, pain })
const t = (ar: string, en: string): T => ({ ar, en })

// KON Studio (AI image and video production), shown as services, never as a self-serve tool.
const studio = {
  reels: { id: 'st-reels', kind: 'studio' as const, title: t('ريلز لمكانك', 'Reels for your place'), line: t('مقاطع قصيرة تُظهر الأجواء والأطباق كما يحبها جمهورك', 'Short videos that show the mood and the dishes the way your audience likes them') },
  product: { id: 'st-product', kind: 'studio' as const, title: t('تصوير منتجات احترافي', 'Professional product shots'), line: t('صور منتج بمستوى العلامات الكبيرة، دون استوديو ولا تكلفة تصوير', 'Big-brand product images, without a studio or a photo shoot bill') },
  film: { id: 'st-film', kind: 'studio' as const, title: t('فيلم قصير لعلامتك', 'A short brand film'), line: t('قصتك في أقل من دقيقة، تُشاهد وتُتذكَّر', 'Your story in under a minute, watched and remembered') },
  season: { id: 'st-season', kind: 'studio' as const, title: t('حملات المواسم', 'Seasonal campaigns'), line: t('رمضان، العيد، اليوم الوطني: محتوى جاهز قبل الموسم، لا بعده', 'Ramadan, Eid, National Day: content ready before the season, not after it') },
  founder: { id: 'st-founder', kind: 'studio' as const, title: t('صور شخصية احترافية', 'Founder portraits'), line: t('صورة تليق بحضورك في LinkedIn والعروض والصحافة', 'A portrait that fits your presence on LinkedIn, decks and press') },
  animate: { id: 'st-animate', kind: 'studio' as const, title: t('تحريك صورك', 'Bring your photos to life'), line: t('صورة ثابتة تتحول إلى مقطع يوقف التمرير', 'A still photo turned into a clip that stops the scroll') },
}
const svc = (service: ServiceId): Extra => ({ id: `svc-${service}`, kind: 'service', service })

export const solSectors: SolSector[] = [
  {
    id: 'food',
    name: t('المطاعم والكافيهات', 'Restaurants & cafés'),
    hook: t('الصالة مليانة، والطلبات ما توقف… فليش الربح ما يبان؟', 'Full tables, nonstop orders… so where is the profit?'),
    tools: ['breakhour', 'delivery', 'recipe', 'ceiling'],
    next: { breakhour: 'food-dash', delivery: 'food-own', recipe: 'food-stock', ceiling: 'food-voice' },
    picks: [
      p('food-own', 'tasty', t('طلبات من موقعك، بلا عمولة', 'Orders on your own site, zero commission'), t('تدفع للتطبيق نسبة من كل طلب، حتى من عملائك الدائمين', 'You pay the app a cut of every order, even from your regulars')),
      p('food-pos', 'ury', t('كاشير وشاشة مطبخ بلا ضياع', 'POS and kitchen screen, nothing lost'), t('وقت الذروة تضيع الطلبات بين الكاشير والمطبخ', 'At peak time, orders get lost between the till and the kitchen')),
      p('food-stock', 'odoo', t('مخزون ووصفات وهدر بالأرقام', 'Stock, recipes and waste, in numbers'), t('تشتري كل أسبوع، ولا تعرف أين يذهب نصف المخزون', 'You buy every week and can’t tell where half the stock goes')),
      p('food-menu', 'xibo', t('قوائم رقمية تتغيّر بلمسة', 'Digital menu boards, changed in a tap'), t('كل ما تغيّر سعر أو عرض، تطبع المنيو من جديد', 'Every price or offer change means reprinting the menu')),
      p('food-voice', 'formbricks', t('رأي الضيف قبل أن يكتبه في قوقل', 'Hear the guest before Google does'), t('الضيف الزعلان ما يقول لك، يكتب تقييمًا ويختفي', 'An unhappy guest doesn’t tell you. They leave a review and vanish')),
      p('food-inbox', 'chatwoot', t('واتساب وإنستغرام في شاشة واحدة', 'WhatsApp and Instagram on one screen'), t('رسائل الحجز والطلبات تضيع بين جوالات الفريق', 'Booking and order messages get lost across staff phones')),
      p('food-zatca', 'zatca', t('فوترة إلكترونية متوافقة مع الزكاة', 'ZATCA-ready e-invoicing'), t('المرحلة الثانية من الفوترة تقترب، ونظامك الحالي غير جاهز', 'E-invoicing Phase 2 is coming and your current system isn’t ready')),
      p('food-dash', 'metabase', t('ربح اليوم على جوالك', 'Today’s profit on your phone'), t('تعرف مبيعات اليوم، لكن ربحه الحقيقي تعرفه آخر الشهر', 'You know today’s sales. You find out its real profit at month end')),
    ],
    extras: [svc('maps'), svc('guest'), studio.reels, studio.season, svc('sales')],
  },
  {
    id: 're',
    name: t('العقار', 'Real estate'),
    hook: t('اتصالات كثيرة، ومعاينات أكثر… والصفقات قليلة؟', 'Lots of calls, even more viewings… and so few deals?'),
    tools: ['viewing', 'ceiling', 'delay', 'lever'],
    next: { viewing: 're-tour', ceiling: 're-crm', delay: 're-sign', lever: 're-dash' },
    picks: [
      p('re-tour', 'pannellum', t('جولة ⁦360°⁩ داخل كل وحدة، على موقعك', 'A ⁦360°⁩ tour of every unit, on your own site'), t('تقطع الطريق لمعاينة، ويقرّر العميل من أول دقيقة أنها ليست ما يبحث عنه', 'You drive out for a viewing and the buyer decides in the first minute it isn’t for them')),
      p('re-site', 'pwb', t('موقع لوحداتك بالبحث والاستفسار', 'A listings site with search and enquiries'), t('وحداتك بين مئات الإعلانات في المنصات، والعميل لا يصل إليك مباشرة', 'Your units sit among hundreds of ads on the portals and buyers never reach you directly')),
      p('re-crm', 'krayin', t('كل مشترٍ مهتم ومرحلة صفقته في مكان واحد', 'Every interested buyer and deal stage in one place'), t('عميل مهتم اتصل قبل أسبوعين، ولم يتابعه أحد', 'An interested buyer called two weeks ago and nobody followed up')),
      p('re-inbox', 'chatwoot', t('استفسارات واتساب والمنصات في شاشة واحدة', 'WhatsApp and portal enquiries on one screen'), t('الاستفسارات موزّعة على جوالات المسوّقين، وتضيع بينهم', 'Enquiries are spread across your agents’ phones and slip between them')),
      p('re-book', 'cal', t('مواعيد معاينة يحجزها العميل بنفسه', 'Viewing slots buyers book themselves'), t('نصف يومك اتصالات لترتيب المواعيد، وكثير منها يُلغى', 'Half your day goes on calls to arrange viewings, and many get cancelled')),
      p('re-sign', 'docuseal', t('حجز الوحدة وتوقيعه إلكترونيًا', 'Unit reservations signed online'), t('العميل مقتنع اليوم، والعقد ينتظر حضوره، فيبرد قبل أن يوقّع', 'The buyer is convinced today, the contract waits for a visit, and they cool off before signing')),
      p('re-condo', 'condo', t('إدارة المجمّعات وطلبات السكان', 'Compound management and resident requests'), t('طلبات الصيانة والدفعات في واتساب، والساكن لا يعرف أين وصل طلبه', 'Maintenance requests and payments live in WhatsApp, and residents never know where theirs stands')),
      p('re-dash', 'metabase', t('أي مشروع وأي قناة تبيع فعلًا؟', 'Which project and which channel actually sells?'), t('تصرف على الإعلان في كل المنصات، ولا تعرف أيها جاء بالمشتري', 'You advertise on every portal and can’t tell which one brought the buyer')),
    ],
    extras: [svc('tours'), svc('web'), svc('brand'), svc('sales'), studio.film],
  },
  {
    id: 'fnb',
    name: t('الأغذية والمشروبات', 'Food & beverage brands'),
    hook: t('منتجك ممتاز، لكن بين التكلفة والرف يضيع هامشك', 'Your product is great, but your margin vanishes between the kitchen and the shelf'),
    tools: ['recipe', 'channel', 'lever', 'price'],
    next: { recipe: 'fnb-erp', channel: 'fnb-b2b', lever: 'fnb-dash', price: 'fnb-dash' },
    picks: [
      p('fnb-erp', 'erpnext', t('إنتاج بالدفعات وتكلفة كل دفعة', 'Batch production with true batch cost'), t('تنتج بالكميات، ولا تعرف تكلفة الدفعة الحقيقية', 'You produce in batches without knowing what each batch really costs')),
      p('fnb-lots', 'openboxes', t('تتبّع الدفعات وتواريخ الانتهاء', 'Lot and expiry tracking'), t('منتج ينتهي في المستودع، وتكتشفه بعد فوات الأوان', 'Product expires in the warehouse and you find out too late')),
      p('fnb-store', 'woo', t('متجرك الإلكتروني بالدفع السعودي', 'Your online store with Saudi payments'), t('كل مبيعاتك تمر عبر وسطاء يأخذون نصيبهم', 'Every sale goes through middlemen who take their cut')),
      p('fnb-b2b', 'twenty', t('متابعة المشترين والموزعين', 'Track buyers and distributors'), t('مشترو السوبرماركت والموزعون في رأسك وفي واتساب فقط', 'Supermarket buyers and distributors live only in your head and WhatsApp')),
      p('fnb-flow', 'activepieces', t('طلبات الجملة تدخل النظام وحدها', 'Wholesale orders flow in by themselves'), t('تنسخ الطلبات من واتساب إلى إكسل كل يوم', 'You copy orders from WhatsApp into Excel every day')),
      p('fnb-taste', 'formbricks', t('اختبار الطعم قبل الإطلاق', 'Taste-test before you launch'), t('تطلق منتجًا جديدًا على إحساسك، لا على رأي عملائك', 'You launch on gut feeling, not on what customers told you')),
      p('fnb-zatca', 'zatca', t('فوترة إلكترونية متوافقة مع الزكاة', 'ZATCA-ready e-invoicing'), t('فواتير الجملة يدوية، والمرحلة الثانية تقترب', 'Wholesale invoices are manual and Phase 2 is coming')),
      p('fnb-dash', 'metabase', t('أي منتج يربح فعلًا؟', 'Which product actually earns?'), t('أكثر منتج يبيع ليس بالضرورة أكثر منتج يربح', 'Your best seller isn’t necessarily your best earner')),
    ],
    extras: [studio.product, svc('brand'), studio.film, svc('growth'), svc('web')],
  },
  {
    id: 'fac',
    name: t('المصانع', 'Factories'),
    hook: t('الآلة توقفت ساعة… كم كلّفتك فعلًا؟', 'The line stopped for an hour… what did it really cost you?'),
    tools: ['oee', 'turnover', 'focus', 'delay'],
    next: { oee: 'fac-iot', turnover: 'fac-sop', focus: 'fac-sop', delay: 'fac-erp' },
    picks: [
      p('fac-erp', 'erpnext', t('قوائم المواد وتكلفة التصنيع', 'Bills of materials and production cost'), t('تسعّر منتجاتك بتكلفة تقديرية، لا بتكلفتها الحقيقية', 'You price products on an estimate, not their real cost')),
      p('fac-parts', 'inventree', t('قطع ومخزون بالباركود', 'Parts and stock with barcodes'), t('الإنتاج يتوقف لأن قطعة صغيرة خلصت ولا أحد يعرف', 'Production halts because a small part ran out and nobody knew')),
      p('fac-maint', 'cmms', t('صيانة وقائية بدل الأعطال المفاجئة', 'Preventive maintenance, not surprise breakdowns'), t('تصلح الآلة بعد ما تتعطل، لا قبل', 'You fix machines after they break, never before')),
      p('fac-iot', 'thingsboard', t('بيانات الآلات مباشرة على الشاشة', 'Live machine data on screen'), t('تعرف أداء الخط من تقرير الوردية، بعد فوات الأوان', 'You learn how the line did from the shift report, too late')),
      p('fac-wire', 'nodered', t('ربط الآلات والحساسات بسهولة', 'Connect machines and sensors, simply'), t('آلاتك تنتج بيانات كل ثانية، ولا أحد يقرأها', 'Your machines produce data every second and nobody reads it')),
      p('fac-energy', 'grafana', t('مراقبة الطاقة والأداء', 'Energy and performance monitoring'), t('فاتورة الكهرباء تكبر، ولا تعرف أي خط يستهلكها', 'The power bill grows and you can’t tell which line drives it')),
      p('fac-wh', 'openboxes', t('مستودعات ودفعات في أكثر من موقع', 'Warehouses and lots across sites'), t('المخزون مسجّل في مكان، وموجود فعليًا في مكان آخر', 'Stock is recorded in one place and physically in another')),
      p('fac-sop', 'bookstack', t('إجراءات تشغيل مكتوبة لا تغادر مع الموظف', 'Written SOPs that stay when people leave'), t('أفضل فنّي عندك يحمل المصنع في رأسه', 'Your best technician carries the factory in his head')),
    ],
    extras: [svc('systems'), svc('growth'), studio.film, svc('web')],
  },
  {
    id: 'retail',
    name: t('التجزئة والمتاجر', 'Retail & e-commerce'),
    hook: t('العروض تجيب زحمة… لكن هل تجيب ربح؟', 'Sales bring crowds… but do they bring profit?'),
    tools: ['stock', 'price', 'lever', 'ceiling'],
    next: { stock: 'ret-omni', price: 'ret-crm', lever: 'ret-stats', ceiling: 'ret-crm' },
    picks: [
      p('ret-pos', 'ospos', t('نقطة بيع ومخزون من المتصفح', 'Browser POS with live stock'), t('الكاشير يقول شيء، والرف يقول شيء ثاني', 'The till says one thing and the shelf says another')),
      p('ret-omni', 'odoo', t('المحل والمتجر الإلكتروني بمخزون واحد', 'Store and website on one stock'), t('تبيع أونلاين منتجًا خلص من المحل قبل ساعة', 'You sell online an item that sold out in-store an hour ago')),
      p('ret-woo', 'woo', t('متجرك الإلكتروني بالدفع السعودي', 'Your online store with Saudi payments'), t('عملاؤك يطلبون في الخاص، وتضيع الطلبات في الرسائل', 'Customers order in DMs and orders get lost in the chat')),
      p('ret-market', 'bagisto', t('سوق متعدد البائعين بالعربي', 'Arabic multi-vendor marketplace'), t('عندك فكرة سوق إلكتروني، والمنصات الجاهزة تأخذ نصيبًا كبيرًا', 'You have a marketplace idea and ready platforms take a big cut')),
      p('ret-inbox', 'chatwoot', t('كل محادثات العملاء في شاشة واحدة', 'Every customer chat on one screen'), t('العميل يسأل في إنستغرام، ويرد عليه أحد بعد يومين', 'A customer asks on Instagram and gets an answer two days later')),
      p('ret-crm', 'mautic', t('رجّع عملاءك بدون خصومات', 'Win customers back without discounts'), t('تشتري عميلًا جديدًا بإعلان، وتنسى القديم', 'You pay ads for new customers and forget the ones you have')),
      p('ret-stats', 'umami', t('اعرف من يزور متجرك ولماذا لا يشتري', 'See who visits and why they don’t buy'), t('زيارات كثيرة، ومبيعات قليلة، ولا تعرف السبب', 'Lots of visits, few sales, no idea why')),
      p('ret-zatca', 'zatca', t('فوترة إلكترونية متوافقة مع الزكاة', 'ZATCA-ready e-invoicing'), t('الفوترة الإلكترونية التزام، وغرامتها أغلى من تجهيزها', 'E-invoicing is mandatory, and the fine costs more than the setup')),
    ],
    extras: [studio.product, svc('web'), svc('sales'), svc('guest'), studio.season],
  },
  {
    id: 'home',
    name: t('الأسر المنتجة', 'Home businesses'),
    hook: t('تتعب وتبيع كل يوم… وآخر الشهر ما يتبقى شيء؟', 'You work hard and sell every day… and nothing is left at month end?'),
    tools: ['home', 'price', 'channel', 'ceiling'],
    next: { home: 'home-store', price: 'home-sheet', channel: 'home-invoice', ceiling: 'home-inbox' },
    picks: [
      p('home-store', 'woo', t('متجر صغير باسمك', 'A small store in your name'), t('كل الطلبات في الخاص، وتضيع عليك من طلب ماذا', 'All orders come by DM and you lose track of who ordered what')),
      p('home-form', 'heyform', t('نموذج طلب بسيط بدل الرسائل', 'A simple order form instead of messages'), t('كل عميل يسأل نفس الأسئلة: السعر؟ التوصيل؟ متى؟', 'Every customer asks the same questions: price? delivery? when?')),
      p('home-slots', 'cal', t('مواعيد استلام وتوصيل منظمة', 'Organised pickup and delivery slots'), t('الكل يبغى طلبه في نفس اليوم ونفس الساعة', 'Everyone wants their order on the same day at the same hour')),
      p('home-inbox', 'chatwoot', t('واتساب العمل منفصل عن واتسابك', 'Business WhatsApp apart from your personal one'), t('رسائل الزبائن تختلط برسائل العائلة', 'Customer messages mix with family messages')),
      p('home-invoice', 'invshelf', t('فواتير وعروض أسعار بضغطة', 'Invoices and quotes in a tap'), t('الشركات تطلب فاتورة، وأنت تكتبها يدويًا', 'Companies ask for an invoice and you write it by hand')),
      p('home-social', 'postiz', t('انشر في كل منصاتك من مكان واحد', 'Post to all your channels from one place'), t('النشر اليومي ياكل وقتك اللي المفروض للإنتاج', 'Daily posting eats the time you need for making')),
      p('home-design', 'penpot', t('ملصقات وقوائم بتصميم أنيق', 'Labels and menus with a polished look'), t('منتجك رائع، وتغليفه لا يعكس قيمته', 'Your product is great and its packaging doesn’t show it')),
      p('home-sheet', 'grist', t('دفتر طلبات ذكي بدل الورق', 'A smart order book instead of paper'), t('الطلبات والتكاليف في دفتر، وربحك الحقيقي غير واضح', 'Orders and costs live in a notebook and you can’t see your real profit')),
    ],
    extras: [studio.product, svc('brand'), studio.animate, studio.season],
  },
  {
    id: 'all',
    name: t('لكل الأعمال', 'Every business'),
    hook: t('أرقامك في إكسل، وعملاؤك في واتساب، وقراراتك على الإحساس', 'Numbers in Excel, customers in WhatsApp, decisions on gut feel'),
    tools: ['lever', 'ceiling', 'price', 'turnover', 'focus', 'meeting', 'founder', 'delay'],
    next: { lever: 'all-dash', ceiling: 'all-crm', price: 'all-dash', turnover: 'all-sop', focus: 'all-inbox', meeting: 'all-sop', founder: 'all-auto', delay: 'all-erp' },
    picks: [
      p('all-erp', 'erpnext', t('نظام واحد للمحاسبة والمبيعات والمخزون', 'One system for accounts, sales and stock'), t('كل قسم له ملف، ولا أحد يرى الصورة كاملة', 'Every department has its own file and nobody sees the whole picture')),
      p('all-crm', 'twenty', t('كل عميل وكل صفقة في مكان واحد', 'Every customer and deal in one place'), t('العميل المحتمل يبرد لأن أحدًا نسي يتابعه', 'Leads go cold because someone forgot to follow up')),
      p('all-inbox', 'chatwoot', t('صندوق وارد موحد لفريقك', 'One shared inbox for your team'), t('نفس العميل يكلم ثلاثة موظفين ويسمع ثلاث إجابات', 'The same customer talks to three people and hears three answers')),
      p('all-dash', 'metabase', t('لوحة أرقامك الحقيقية', 'Your real numbers on one dashboard'), t('تتخذ قرارات كبيرة بأرقام آخر الشهر', 'You make big decisions on month-old numbers')),
      p('all-auto', 'activepieces', t('أتمتة الأعمال المتكررة', 'Automate the repetitive work'), t('فريقك ينسخ ويلصق نفس البيانات كل يوم', 'Your team copies and pastes the same data every day')),
      p('all-ai', 'anything', t('مساعد ذكي يعرف ملفات شركتك', 'An AI assistant that knows your files'), t('الموظف الجديد يسأل نفس الأسئلة لأسابيع', 'New hires ask the same questions for weeks')),
      p('all-sign', 'docuseal', t('عقود وتوقيع إلكتروني', 'Contracts and e-signatures'), t('صفقة جاهزة تتأخر لأن العقد ينتظر توقيعًا', 'A ready deal waits days for a signature')),
      p('all-sop', 'bookstack', t('دليل الشركة: إجراءات لا تضيع', 'Company manual: procedures that stay'), t('إذا غاب شخص واحد، تعطّل العمل', 'When one person is away, work stops')),
    ],
    extras: [svc('systems'), svc('growth'), svc('web'), studio.film, studio.founder],
  },
]

export const solCopy = {
  ar: {
    eyebrow: 'الحلول',
    title: 'اختر قطاعك، وخذ نتيجتك الآن',
    lede: 'أدوات مجانية تكشف أرقامك الحقيقية في دقيقة، وأنظمة **مجرّبة عالميًا** نجهّزها لك على حسب احتياجك',
    pickSector: 'قطاعك',
    tabs: { tools: 'أدوات مجانية', picks: 'أنظمة نجهّزها لك', extras: 'خدمات كُن' },
    toolsNote: 'تُحسب على جهازك فقط، لا نحفظ أرقامك',
    picksLede: 'نختار لك الأنسب، ونجهّزه ونربطه ونعرّبه، وندرّب فريقك عليه، بلا رسوم ترخيص على كل مستخدم',
    builtOn: 'مبني على',
    openSource: 'مفتوح المصدر',
    ready: 'جاهز للتجهيز',
    request: 'اطلب التجهيز',
    extrasLede: 'من فريق كُن واستوديو كُن، بنفس الدقة',
    studioTag: 'استوديو كُن',
    serviceTag: 'خدمة كُن',
    requestService: 'اطلب الخدمة',
    lens: 'عدسة كُن',
    konLabel: 'خلف هذا الرقم قصة: قرارات، وعادات، وطريقة تفكير، نقرؤها معك في جلسة واحدة، ونخرج بخطوة تحرّكه',
    konCta: 'اقرأ رقمي معي',
    konTitle: 'جلسة قراءة',
    nextLabel: 'تبغى هذا الرقم يتحسّن كل يوم، بدون حاسبة؟',
    nextCta: 'شاهد الحل',
    tail: 'قطاعك ليس هنا؟ **أخبرنا بمشكلتك، ونبني حلها**',
    tailCta: 'ابدأ التشخيص',
  },
  en: {
    eyebrow: 'Solutions',
    title: 'Pick your sector. Get your answer now',
    lede: 'Free tools that reveal your real numbers in a minute, and **proven** systems we set up around how you work',
    pickSector: 'Your sector',
    tabs: { tools: 'Free tools', picks: 'Systems we set up', extras: 'KON services' },
    toolsNote: 'Calculated on your device only. We never store your numbers',
    picksLede: 'We pick what fits, set it up, connect it, fit it to Arabic, and train your team. No per-user licence fees',
    builtOn: 'Built on',
    openSource: 'open source',
    ready: 'Ready to set up',
    request: 'Request setup',
    extrasLede: 'From the KON team and KON Studio, with the same precision',
    studioTag: 'KON Studio',
    serviceTag: 'KON service',
    requestService: 'Request this',
    lens: 'KON lens',
    konLabel: 'Behind this number there’s a story: decisions, habits, a way of thinking. We read it with you in one session and leave with a step that moves it',
    konCta: 'Read my number with me',
    konTitle: 'Reading session',
    nextLabel: 'Want this number improving every day, without a calculator?',
    nextCta: 'See the solution',
    tail: 'Your sector isn’t here? **Tell us the problem, and we’ll build its solution**',
    tailCta: 'Start the diagnosis',
  },
}

export const reqCopy = {
  ar: {
    titleSetup: 'نجهّزه لك',
    titleService: 'نبدأ معك',
    lede: 'اترك بياناتك، ونتواصل معك لنفهم احتياجك ونقترح الأنسب لك، بلا أي التزام',
    stepsSetup: ['نفهم احتياجك', 'نجهّز ونربط ونعرّب', 'ندرّب فريقك ونسلّمك'],
    stepsService: ['نفهم هدفك', 'ننفّذ معك', 'نسلّمك النتيجة'],
    name: 'الاسم', phone: 'رقم الجوال (واتساب)', business: 'اسم المنشأة', city: 'المدينة', note: 'شيء تحب نعرفه؟',
    optional: 'اختياري',
    need: 'نحتاج اسمك ورقم جوالك لنتواصل معك',
    sendWa: 'أرسل الطلب عبر واتساب', sendMail: 'أرسل بالبريد', copy: 'انسخ الطلب', copied: 'تم النسخ',
    privacy: 'نستخدم بياناتك للتواصل بخصوص طلبك فقط',
    close: 'إغلاق',
    head: 'طلب من موقع KON',
    lSolution: 'الطلب', lSector: 'القطاع', lResult: 'نتيجة الحاسبة',
  },
  en: {
    titleSetup: 'We’ll set it up for you',
    titleService: 'Let’s start',
    lede: 'Leave your details and we’ll reach out to understand what you need and suggest the best fit. No commitment',
    stepsSetup: ['We understand your needs', 'We set up, connect and fit it to Arabic', 'We train your team and hand over'],
    stepsService: ['We understand your goal', 'We deliver with you', 'We hand you the result'],
    name: 'Name', phone: 'Mobile (WhatsApp)', business: 'Business name', city: 'City', note: 'Anything we should know?',
    optional: 'optional',
    need: 'We need your name and mobile number to reach you',
    sendWa: 'Send via WhatsApp', sendMail: 'Send by email', copy: 'Copy request', copied: 'Copied',
    privacy: 'We use your details only to contact you about this request',
    close: 'Close',
    head: 'Request from the KON website',
    lSolution: 'Request', lSector: 'Sector', lResult: 'Calculator result',
  },
}
