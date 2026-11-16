// New copy for the KON Ultimate homepage. Locked texts (problem, founder, sadaqa, slogan) and
// every case-study number are read from content/site.ts, never retyped here.
import type { Lang } from '../content/site'

const ar = {
  cta: 'احجز جلستك المجانية',
  ctaShort: 'احجز جلستك',
  hero: {
    lede: 'أرقامك تقول لك **وش صار** واحنا نكشف لك **ليش صار**',
    sub: 'نقرأ عميلك وفريقك وقراراتك بعين أخصائي نفسي، وبعدها ننزل معك الميدان لين يتحرك الربح',
    secondary: 'شوف النتائج',
    lens: 'حرّك العدسة وشوف وش تحت السطح',
  },
  beneath: {
    eyebrow: 'خلف الرقم',
    title: ['الرقم عَرَض', 'والسبب إنسان'],
    lede: 'كل رقم يتعبك وراه قرار إنسان: عميل تردّد، أو موظف تعب، أو مدير استعجل. انزل وشوف وش تحت كل رقم',
    surface: 'اللي تشوفه',
    below: 'اللي تحته',
    fix: 'وش نسوي',
    tap: 'اكشف',
    cards: [
      { who: 'لصاحب المشروع', surface: 'المبيعات تزيد والربح واقف', below: 'الخصم صار السبب الوحيد للشراء، والعميل ما شاف قيمة تستاهل السعر', fix: 'نعيد بناء التسعير وقيمة العرض' },
      { who: 'للمدير', surface: 'الفريق مشغول طول اليوم والإنجاز قليل', below: 'مهام بدون صاحب واضح، فكل واحد ينتظر الثاني', fix: 'نوضّح الأدوار ونبني إجراءات يومية تمشي بدونك' },
      { who: 'للمطاعم والمتاجر', surface: 'العميل يجي مرة وما يرجع', below: 'التجربة تنتهي عند الدفع، والعميل يحس بهذا قبل لا يطلع', fix: 'نصمّم تجربة ضيف ترجّعه بنفسه' },
      { who: 'لرائد الأعمال', surface: 'الفكرة ممتازة والمبيعات صفر', below: 'تبيع منتج، والعميل يدوّر نتيجة', fix: 'نعيد صياغة العرض ونوصلك لأول عميل' },
      { who: 'للمستثمر', surface: 'الفرص كثيرة والقرار صعب', below: 'الأرقام تنقرأ بالحماس، مو بالواقع', fix: 'نقرأ الفرصة بأرقامها زي ما هي' },
    ],
    note: 'أمثلة لأنماط نقابلها كثير في الميدان',
    close: 'احنا نعالج **السبب** مو العَرَض',
  },
  method: {
    eyebrow: 'طريقتنا',
    title: ['من أول جلسة', 'إلى رقم يتحرك'],
    steps: [
      { k: 'نقرأ', title: 'جلسة تشخيص مجانية', body: '30 دقيقة نقرأ فيها وضعك من ثمانية أبعاد، وتطلع بأهم 3 فرص تقدر تبدأ فيها على طول' },
      { k: 'نخطط', title: 'خطة مكتوبة وواضحة', body: 'وين يضيع ربحك، ووش اللي لازم يوقف عشان توصل أسرع، مكتوبة بلغة فريقك' },
      { k: 'ننفّذ', title: 'ننزل الميدان معك', body: 'نبني وندرّب فريقك ونتابع لين يصير الجديد **عادة يومية**، وأتعابنا **مربوطة بالنتائج** نتفق عليها كتابيًا' },
    ],
  },
  pressure: {
    l1: ['الألماس والفحم', 'من عنصر واحد'],
    l2: 'الفرق ضغطٌ هائل ووقتٌ طويل',
    l3: 'الضغط ما يكسرك… يكشفك',
    l4: 'عطينا الحجر قيمة عالية ونسينا نعطيها لأنفسنا',
    l5: 'التغيير يبدأ من الداخل',
  },
  work: { all: 'كل أعمالنا وجولة 360° داخل واحد منها', more: 'ومشاريع ثانية' },
  tools: { cta: 'جرّب الأدوات المجانية' },
  talent: { eyebrow: 'مواهب KON', title: 'نكتشف موهبتك من طريقة تفكيرك' },
  start: { guaranteeK: 'وعدنا', steps: 'أربع خطوات قصيرة، آخرها تختار موعدك' },
  menu: 'القائمة',
}

type Copy = typeof ar

const en: Copy = {
  cta: 'Book your free session',
  ctaShort: 'Book a session',
  hero: {
    lede: 'Your numbers tell you **what** happened. We find out **why**',
    sub: 'We read your customers, your team and your decisions with a psychologist’s eye, then work on the ground with you until profit moves',
    secondary: 'See the results',
    lens: 'Move the lens and see what’s under the surface',
  },
  beneath: {
    eyebrow: 'Beneath the number',
    title: ['The number is the symptom', 'the cause is human'],
    lede: 'Behind every number that worries you is a human decision: a customer who hesitated, an employee who got tired, a manager who rushed. Scroll and see what’s under each one',
    surface: 'What you see',
    below: 'What’s underneath',
    fix: 'What we do',
    tap: 'Reveal',
    cards: [
      { who: 'For business owners', surface: 'Sales grow, profit stands still', below: 'The discount became the only reason to buy. Customers never saw value worth the price', fix: 'We rebuild pricing and the value of the offer' },
      { who: 'For managers', surface: 'The team is busy all day, little gets done', below: 'Tasks without a clear owner, so everyone waits for someone else', fix: 'We clarify roles and build daily routines that run without you' },
      { who: 'For restaurants and retail', surface: 'Customers come once and never return', below: 'The experience ends at the till, and guests feel it before they leave', fix: 'We design a guest experience that brings them back' },
      { who: 'For founders', surface: 'A great idea, zero sales', below: 'You sell a product. The customer is looking for an outcome', fix: 'We reshape the offer and get you to your first customer' },
      { who: 'For investors', surface: 'Plenty of deals, hard decisions', below: 'The numbers get read with excitement, not reality', fix: 'We read each opportunity by its numbers, as they are' },
    ],
    note: 'Patterns we meet again and again in the field',
    close: 'We treat the **cause**, not the symptom',
  },
  method: {
    eyebrow: 'How we work',
    title: ['From the first session', 'to a number that moves'],
    steps: [
      { k: 'Read', title: 'A free diagnosis session', body: '30 minutes reading your situation across eight dimensions. You leave with your top 3 opportunities to start on right away' },
      { k: 'Plan', title: 'A clear written plan', body: 'Where profit leaks, and what to stop doing to get there faster, written in your team’s language' },
      { k: 'Build', title: 'On the ground with you', body: 'We build, train your team and stay until the new way becomes **a daily habit**. Our fees are **tied to results**, agreed in writing' },
    ],
  },
  pressure: {
    l1: ['Diamond and coal', 'are one element'],
    l2: 'The difference is immense pressure and time',
    l3: 'Pressure doesn’t break you… it reveals you',
    l4: 'We gave a stone priceless value and forgot to give it to ourselves',
    l5: 'Change begins within',
  },
  work: { all: 'All our work, and a 360° tour inside one project', more: 'And more projects' },
  tools: { cta: 'Try the free tools' },
  talent: { eyebrow: 'KON Talent', title: 'We discover your talent from the way you think' },
  start: { guaranteeK: 'Our promise', steps: 'Four short steps. The last one is picking your time' },
  menu: 'Menu',
}

export const ucopy: Record<Lang, Copy> = { ar, en }
