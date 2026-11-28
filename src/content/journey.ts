// KON Masterpiece round 2 (2026-11-28): the chapters khalid asked for after the packages.
// Acts (chapter breaks), quick wins, the results partnership (by application), ready-made services,
// operations, the KON network, and the questions page. Arabic first, white dialect, no diacritics.
// CONFIRM (khalid): ready-service prices, partnership criteria and terms, cities with field days.
import { useStore } from '../state/store'

const ar = {
  acts: {
    one: { n: 'الفصل الأول', t: 'الصورة', s: 'وش يصير داخل شركتك، ومن وين يضيع الربح' },
    two: { n: 'الفصل الثاني', t: 'الطريقة', s: 'كيف نشتغل، وكيف نقيس، ووش سوينا قبل' },
    three: { n: 'الفصل الثالث', t: 'كيف نشتغل معك', s: 'قسم كامل، أو شراكة، أو خدمة جاهزة. أنت تختار المدخل' },
    four: { n: 'الفصل الأخير', t: 'قبل ما تقرر', s: 'كل سؤال في بالك، وجوابه' },
  },

  quick: {
    eyebrow: 'المكاسب السريعة',
    title: 'أحيانا الفرق كله في تفصيلة',
    lede: 'مو كل تحسين يحتاج خطة سنة. فيه تعديلات صغيرة نشوفها من أول قراءة، وتفرق في أرقامك من أول أسابيع',
    items: [
      { t: 'إعلان يجيب ضغطات، مو عملاء', b: 'صورة توعد بسعر غير حقيقي، أو استهداف واسع زيادة، وكل ضغطة تنخصم من ميزانيتك' },
      { t: 'مكالمة تخسر العميل في أول دقيقة', b: 'نفس الاعتراض يتكرر كل يوم، والرد عليه ما تغير من سنين' },
      { t: 'عميل مهتم، ومحد تابعه', b: 'طلب وصل في الويكند، والرد راح بعد ثلاث أيام' },
    ],
    secret: 'كيف نلقاها؟ هذا شغلنا. أعطنا فرصة نقرأ، ونوريك الفرق بالأرقام',
    cta: 'خلنا نقرأ شركتك',
  },

  partner: {
    eyebrow: 'شراكة النتائج',
    title: 'نشتغل بنسبة، بس مع الشركة الصح',
    lede: 'في شراكة النتائج تدفع رسوم أقل، وناخذ نسبة من الربح الإضافي اللي يطلع في نظامك أنت. وعشان تنجح للطرفين، نختار الشركات بعناية',
    critK: 'متى تكون الشراكة مناسبة؟',
    criteria: [
      'شركة شغالة، ولها مبيعات ثابتة سنة على الأقل',
      'منتج أو خدمة عليها طلب، والسوق يقدر ياخذ أكثر',
      'تقدر تستوعب النمو: فريق، ومخزون، وتشغيل',
      'صاحب قرار يتابع معنا كل أسبوع',
      'أرقام مفتوحة لنا: المبيعات، والتكاليف، والعملاء',
    ],
    stepsK: 'كيف تمشي؟',
    steps: [
      { t: 'تقدم طلبك', b: 'دقيقتين، ونعرف فيها شركتك وهدفك' },
      { t: 'نقرأ شركتك', b: 'خلال 10 أيام عمل، ونحدد حجم الفرصة' },
      { t: 'نتفق على الأرقام', b: 'رقم البداية، والنسبة، والسقف، والمدة. كله مكتوب' },
      { t: 'نشتغل، وتشوف', b: 'النسبة تنحسب كل شهر من نظامك أنت' },
    ],
    honest: 'وإذا ما كانت الشراكة مناسبة لك الحين، نقولك بصراحة ونقترح الطريق الأنسب',
    cta: 'قدم طلب الشراكة',
  },

  ready: {
    eyebrow: 'خدمات جاهزة',
    title: 'تعرف وش تبي؟ اختر وابدأ',
    lede: 'خدمات واضحة بسعر واضح. نسلمها بسرعة لأن أساسها جاهز، ونفصلها على نشاطك',
    pick: 'اختر نشاطك',
    incK: 'وش تستلم',
    forK: 'يناسب',
    items: [
      {
        id: 'salon', tab: 'الصالونات والسبا والاستوديوهات', name: 'نظام الحجوزات والفريق',
        line: 'موقع حجوزات بدفع إلكتروني من برا، ولوحة ترتب فريقك ويومك من جوا',
        inc: ['موقع باسمك وهويتك، تحجز فيه العميلة وتدفع من جوالها', 'جدول ورديات الموظفات، وتوزيع المواعيد تلقائيا', 'كم موعد عند كل موظفة، ومين الأكثر طلبا ودخلا', 'متوسط وقت كل خدمة لكل موظفة', 'توقع أيام الضغط في المواسم والأعياد، عشان ترتبين جدولك قبلها', 'تذكير العميلة بموعدها على الواتساب'],
        for: 'صالونات نسائية، سبا، بيلاتس، يوغا، أندية نسائية، مراكز عناية',
        from: '9,500', monthly: 'و690 ريال شهريا للاستضافة والدعم',
      },
      {
        id: 'contractor', tab: 'المقاولات', name: 'موقع شركة مقاولات',
        line: 'موقع يعرض مشاريعك ويجيب لك طلبات عروض أسعار جاهزة',
        inc: ['معرض مشاريعك بالصور والمساحات والمدة', 'ملف الشركة والتصنيفات والشهادات', 'طلب عرض سعر يوصل لفريقك مباشرة', 'صفحة جاهزة للمناقصات والجهات الحكومية', 'نسخة عربي وإنجليزي'],
        for: 'شركات المقاولات، التشطيبات، الصيانة، المقاولين من الباطن',
        from: '7,900', monthly: 'و490 ريال شهريا للاستضافة والدعم',
      },
      {
        id: 'company', tab: 'الشركات والمؤسسات', name: 'موقع الشركة',
        line: 'موقع يشرح شغلك بوضوح، ويحول الزائر لطلب',
        inc: ['صفحات تشرح خدماتك بلغة عميلك', 'نموذج طلب يوصلك على الواتساب والإيميل', 'ربط مع خرائط قوقل وإحصائيات الزوار', 'تهيئة للظهور في البحث', 'نسخة عربي وإنجليزي'],
        for: 'أي شركة أو مؤسسة تبي حضور رقمي يبيع',
        from: '5,900', monthly: 'و390 ريال شهريا للاستضافة والدعم',
      },
    ],
    fromK: 'يبدأ من',
    sar: 'ريال',
    addK: 'إضافات حسب احتياجك',
    addons: ['بطاقات ولاء', 'بطاقات إهداء', 'باقات واشتراكات شهرية', 'تقييمات العملاء', 'نقاط ومكافآت', 'تقرير أسبوعي لصاحب المنشأة', 'ربط مع نظام الكاشير'],
    custom: 'تبي شي مو موجود هنا؟ قول لنا وش تحتاج، وغالبا عندنا له حل',
    cta: 'اطلب خدمتك',
  },

  ops: {
    eyebrow: 'التشغيل',
    title: 'مشروع، أو فعالية، أو موسم؟ نشغله',
    lede: 'نوفر الفريق، ونمسك التشغيل من التخطيط لين آخر يوم، بخبرة ميدانية في فعاليات ومشاريع كبيرة',
    items: [
      { t: 'الفعاليات والمعارض', b: 'خطة التشغيل، وتوزيع الفرق، وإدارة اليوم من الدخول لين الخروج' },
      { t: 'إدارة الحشود', b: 'مسارات الدخول والخروج، ونقاط التنظيم، وخطط الطوارئ' },
      { t: 'المواقف والحركة', b: 'تنظيم المواقف والنقل وحركة الزوار في الأماكن الزحمة' },
      { t: 'الكوادر التشغيلية', b: 'فريق مدرب للاستقبال والتنظيم والمبيعات، لفترة أو لموسم' },
      { t: 'تشغيل المبيعات', b: 'فريق مبيعات ميداني أو هاتفي يشتغل على أهدافك ويرفع تقرير كل يوم' },
      { t: 'المتابعة والجودة', b: 'نزول ميداني وتقارير يومية، تعرف فيها وش يصير وأنت بعيد' },
    ],
    cta: 'اطلب عرض تشغيل',
  },

  network: {
    eyebrow: 'شبكة كُن',
    title: 'يمكن اللي تدوره، شركة تدورك',
    lede: 'كل شركة نشتغل معها أو نتعرف عليها، نعرف وش تحتاج ووش تقدر تقدم. ومع الوقت نلقى شركتين تكمل وحدة الثانية، وما تدري عن بعض',
    pairs: [
      { a: 'مورد عنده إنتاج زيادة', b: 'موزع يدور منتج' },
      { a: 'شركة عندها مساحة فاضية', b: 'شركة تدور مكان' },
      { a: 'علامة تبي تتوسع', b: 'مستثمر يدور فرصة' },
    ],
    close: 'نجمعكم، ونرتب الاتفاق، ونشتغل على إن الطرفين يكسبون',
    cta: 'سجل شركتك في الشبكة',
  },

  faq: {
    eyebrow: 'أسئلتك',
    title: 'أسئلة تجي في بالك، وجوابها هنا',
    groups: [
      {
        k: 'لصاحب الشركة',
        qs: [
          { q: 'وش الفرق بينكم وبين وكالة تسويق؟', a: 'الوكالة تشتغل على الإعلان. احنا نشتغل على الشركة كلها: المبيعات، والتشغيل، والتسعير، والفريق، والتسويق جزء منها. وإذا احتجت وكالة، نساعدك تختار الصح وندير شغلها معك' },
          { q: 'ليش ما أوظف فريق بنفسي؟', a: 'تقدر، وأحيانا ننصحك فيه. بس التوظيف ياخذ شهور وفيه مخاطرة. معنا تبدأ من الأسبوع الأول، وإذا قررت تبني فريقك، نساعدك توظفه ونسلمه الشغل' },
          { q: 'متى أشوف نتيجة؟', a: 'المكاسب السريعة غالبا تبان في أول 30 إلى 60 يوم. النمو الأكبر ياخذ ربع أو ربعين، ونتابعه معك بالأرقام كل شهر' },
          { q: 'أنا مو في جدة أو المدينة، تقدرون تشتغلون معي؟', a: 'أكيد. أغلب الشغل يمشي عن بعد بنفس الجودة، والأيام الميدانية نجيك فيها. خارج جدة والمدينة تنضاف تكاليف السفر بالتكلفة الفعلية، وتعرفها قبل أي زيارة' },
          { q: 'تقدرون تسوون شي مو موجود في الخدمات؟', a: 'غالبا نعم. أي عملية تشغيلية، نطورها ونحسنها. قول لنا وش تحتاج ونرد عليك بخطة وسعر' },
        ],
      },
      {
        k: 'للمستثمر',
        qs: [
          { q: 'وش تقدمون لي كمستثمر؟', a: 'نقرأ الفرصة قبل ما تدفع، ونقارن بين الفرص بنفس المسطرة، ونتابع أداء استثمارك بعد ما تدخل' },
          { q: 'تشتغلون بالنسبة؟', a: 'نعم، في شراكة النتائج. بعد ما نقرأ الشركة ونتأكد إن الفرصة حقيقية للطرفين' },
        ],
      },
      {
        k: 'للمتردد',
        qs: [
          { q: 'كيف أعرف إنكم تستاهلون؟', a: 'ابدأ بالجلسة المجانية. تطلع منها بخطوة تقدر تطبقها حتى بدوننا، وبعدها احكم' },
          { q: 'وش يصير لو ما عجبني الشغل؟', a: 'بعد أول 3 أشهر توقف بإشعار 30 يوم. وكل شهر تستلم تقرير بالأرقام، فما فيه شي مخفي' },
          { q: 'بياناتي في أمان؟', a: 'نوقع اتفاقية سرية قبل ما نشوف أي رقم، وما نشارك بياناتك مع أي طرف' },
          { q: 'مين بيشتغل على شركتي فعليا؟', a: 'المؤسس يشرف على كل ملف بنفسه، ومعه فريق ومتخصصين حسب احتياج شركتك' },
        ],
      },
    ],
    more: 'سؤالك مو هنا؟',
    moreCta: 'اسألنا على الواتساب',
  },
}

export type Journey = typeof ar

const en: Journey = {
  acts: {
    one: { n: 'Chapter one', t: 'The picture', s: 'What happens inside your company, and where profit leaks' },
    two: { n: 'Chapter two', t: 'The method', s: 'How we work, how we measure, and what we have done' },
    three: { n: 'Chapter three', t: 'How we work with you', s: 'A full department, a partnership, or a ready service. You choose the door' },
    four: { n: 'The last chapter', t: 'Before you decide', s: 'Every question on your mind, answered' },
  },
  quick: {
    eyebrow: 'Quick wins',
    title: 'Sometimes the whole difference is one detail',
    lede: 'Not every improvement needs a one-year plan. Some small fixes show up in the first reading, and move your numbers within weeks',
    items: [
      { t: 'Ads that bring clicks, not customers', b: 'An image promising a price that is not real, or targeting far too wide, and every click comes out of your budget' },
      { t: 'A call that loses the customer in a minute', b: 'The same objection every day, and the answer has not changed in years' },
      { t: 'An interested buyer nobody followed', b: 'A request on the weekend, and the reply three days later' },
    ],
    secret: 'How do we find them? That is our job. Give us a chance to read, and we will show you the difference in numbers',
    cta: 'Let us read your company',
  },
  partner: {
    eyebrow: 'Results partnership',
    title: 'We work for a share, with the right company',
    lede: 'In a results partnership you pay lower fees, and we take a share of the extra profit that shows in your own system. To make it work for both sides, we choose carefully',
    critK: 'When is a partnership right?',
    criteria: [
      'A running company with steady sales for at least a year',
      'A product or service in demand, with room in the market to sell more',
      'The capacity to absorb growth: team, stock and operations',
      'A decision maker who meets us every week',
      'Open numbers: sales, costs and customers',
    ],
    stepsK: 'How it works',
    steps: [
      { t: 'Apply', b: 'Two minutes to tell us your company and your goal' },
      { t: 'We read your company', b: 'Within 10 working days, and size the opportunity' },
      { t: 'We agree the numbers', b: 'Baseline, share, cap and term. All in writing' },
      { t: 'We work, you see it', b: 'The share is calculated monthly from your own system' },
    ],
    honest: 'And if a partnership is not right for you yet, we will say so and suggest the better path',
    cta: 'Apply for a partnership',
  },
  ready: {
    eyebrow: 'Ready services',
    title: 'Know what you need? Pick it and start',
    lede: 'Clear services at clear prices. We deliver fast because the foundation is built, and we fit it to your business',
    pick: 'Pick your business',
    incK: 'What you get',
    forK: 'Fits',
    items: [
      {
        id: 'salon', tab: 'Salons, spas and studios', name: 'Bookings and team system',
        line: 'A booking site with online payment on the outside, and a board that runs your team and your day on the inside',
        inc: ['A site in your name and identity where clients book and pay from their phone', 'Staff shift schedules and automatic appointment allocation', 'Appointments per staff member, and who is most requested and earns most', 'Average time per service for each staff member', 'A forecast of busy days in seasons and Eid, so you plan ahead', 'WhatsApp reminders for every appointment'],
        for: 'Ladies’ salons, spas, Pilates, yoga, women’s clubs, care centres',
        from: '9,500', monthly: 'and SAR 690 a month for hosting and support',
      },
      {
        id: 'contractor', tab: 'Contractors', name: 'Contractor website',
        line: 'A site that shows your projects and brings in ready quote requests',
        inc: ['A project gallery with photos, areas and timelines', 'Company profile, classifications and certificates', 'Quote requests straight to your team', 'A page ready for tenders and government clients', 'Arabic and English'],
        for: 'Contractors, fit-out, maintenance, subcontractors',
        from: '7,900', monthly: 'and SAR 490 a month for hosting and support',
      },
      {
        id: 'company', tab: 'Companies', name: 'Company website',
        line: 'A site that explains your work clearly and turns visitors into requests',
        inc: ['Pages that explain your services in your customer’s words', 'A request form to your WhatsApp and email', 'Google Maps and visitor analytics', 'Search-ready setup', 'Arabic and English'],
        for: 'Any company that wants a digital presence that sells',
        from: '5,900', monthly: 'and SAR 390 a month for hosting and support',
      },
    ],
    fromK: 'From',
    sar: 'SAR',
    addK: 'Add-ons as you need them',
    addons: ['Loyalty cards', 'Gift cards', 'Packages and memberships', 'Customer reviews', 'Points and rewards', 'A weekly owner report', 'POS integration'],
    custom: 'Need something not listed? Tell us, we most likely have a way',
    cta: 'Request your service',
  },
  ops: {
    eyebrow: 'Operations',
    title: 'A project, an event or a season? We run it',
    lede: 'We provide the team and run operations from planning to the last day, with field experience in large events and projects',
    items: [
      { t: 'Events and exhibitions', b: 'The operating plan, team deployment, and the day managed from entry to exit' },
      { t: 'Crowd management', b: 'Entry and exit routes, control points, and emergency plans' },
      { t: 'Parking and traffic', b: 'Parking, transport and visitor flow in busy places' },
      { t: 'Operating staff', b: 'Trained teams for reception, organisation and sales, for a period or a season' },
      { t: 'Sales operations', b: 'A field or phone sales team working your targets and reporting daily' },
      { t: 'Follow-up and quality', b: 'Field visits and daily reports, so you know what is happening while away' },
    ],
    cta: 'Request an operations quote',
  },
  network: {
    eyebrow: 'The KON network',
    title: 'What you are looking for may be looking for you',
    lede: 'Every company we work with or meet, we learn what it needs and what it can offer. Over time we find two companies that complete each other and do not know it',
    pairs: [
      { a: 'A supplier with spare output', b: 'A distributor looking for product' },
      { a: 'A company with empty space', b: 'A company looking for a place' },
      { a: 'A brand ready to expand', b: 'An investor looking for a deal' },
    ],
    close: 'We bring you together, shape the agreement, and work so both sides win',
    cta: 'Add your company to the network',
  },
  faq: {
    eyebrow: 'Your questions',
    title: 'The questions on your mind, answered',
    groups: [
      {
        k: 'For business owners',
        qs: [
          { q: 'How are you different from a marketing agency?', a: 'An agency works on ads. We work on the whole company: sales, operations, pricing, people, with marketing as one part. If you need an agency, we help you choose the right one and run it with you' },
          { q: 'Why not hire a team myself?', a: 'You can, and sometimes we recommend it. But hiring takes months and carries risk. With us you start in week one, and if you decide to build your own team, we help you hire it and hand the work over' },
          { q: 'When will I see results?', a: 'Quick wins usually show in the first 30 to 60 days. Bigger growth takes a quarter or two, tracked with you in numbers every month' },
          { q: 'I am not in Jeddah or Madinah. Can you work with me?', a: 'Of course. Most work runs remotely at the same quality, and on field days we come to you. Outside Jeddah and Madinah, travel is added at actual cost, agreed before any visit' },
          { q: 'Can you do something not listed?', a: 'Most likely, yes. Any operation, we develop and improve it. Tell us what you need and we will reply with a plan and a price' },
        ],
      },
      {
        k: 'For investors',
        qs: [
          { q: 'What do you offer an investor?', a: 'We read the opportunity before you pay, compare options on the same scale, and track your investment after you are in' },
          { q: 'Do you work for a share?', a: 'Yes, in a results partnership, once we have read the company and are sure the opportunity is real for both sides' },
        ],
      },
      {
        k: 'For the sceptic',
        qs: [
          { q: 'How do I know you are worth it?', a: 'Start with the free session. You leave with a step you can apply even without us, then judge' },
          { q: 'What if I am not happy with the work?', a: 'After the first 3 months you can stop with 30 days’ notice. And every month you get a report in numbers, so nothing is hidden' },
          { q: 'Is my data safe?', a: 'We sign an NDA before we see a single number, and never share your data with anyone' },
          { q: 'Who will actually work on my company?', a: 'The founder oversees every file personally, with a team and specialists matched to your needs' },
        ],
      },
    ],
    more: 'Your question is not here?',
    moreCta: 'Ask us on WhatsApp',
  },
}

export function useJourney(): Journey {
  const lang = useStore((s) => s.lang)
  return lang === 'ar' ? ar : en
}
