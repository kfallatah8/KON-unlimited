// «شيفرة كُن» / The KON Code: khalid's philosophy as a book you can open and leaf through.
// DRAFT (2026-11-05): every line here waits for khalid's approval. Only «كُن فاشلًا» is written in full;
// the other chapters show their opening idea and are marked as being written. Workshop material still
// has to come from khalid. Pages are authored one by one (no auto-pagination), so each face fits its page.
import type { Lang } from './site'

export type Face =
  | { k: 'cover' }
  | { k: 'endpaper'; text: string }
  | { k: 'title' }
  | { k: 'epigraph'; text: string; by: string }
  | { k: 'toc' }
  | { k: 'text'; head?: string; paras: string[] }
  | { k: 'opener'; num: string; title: string; epi: string; body?: string; wip?: boolean }
  | { k: 'exercise'; title: string; steps: string[]; end: string }
  | { k: 'closing'; title: string; paras: string[] }
  | { k: 'back' }

interface Book {
  eyebrow: string
  title: string
  lede: string
  hint: string
  name: string
  sub: string
  author: string
  toc: string
  tocItems: { label: string; face: number }[]
  wip: string
  prev: string
  next: string
  close: string
  open: string
  page: (n: number, total: number) => string
  printCta: string
  printMsg: string
  draft: string
  faces: Face[]
}

const ar: Book = {
  eyebrow: 'الفكرة',
  title: 'الفكرة التي يقوم عليها كل ما نفعله',
  lede: 'خلاصة سنوات من الورش والجلسات والأسئلة الصعبة، في كتاب واحد، **افتحه، وتصفّحه على مهل**',
  hint: 'اضغط على الكتاب لتفتحه',
  name: 'شيفرة كُن',
  sub: 'في القيمة، والضغط، والإنسان',
  author: 'خالد · KON Unlimited',
  toc: 'الفهرس',
  tocItems: [
    { label: 'المدخل', face: 5 },
    { label: 'الشيفرة', face: 7 },
    { label: 'الفصل الأول: كُن فاشلًا', face: 8 },
    { label: 'الفصل الثاني: قيمتك تصنعها أنت', face: 14 },
    { label: 'الفصل الثالث: العاصفة', face: 15 },
    { label: 'الفصل الرابع: المواهب المدفونة', face: 16 },
    { label: 'الفصل الخامس: لا أحد يربح وحده', face: 17 },
    { label: 'الفصل السادس: اقلب ضعفك', face: 18 },
    { label: 'من قاعات الورش', face: 19 },
  ],
  wip: 'هذا الفصل يُكتب الآن',
  prev: 'الصفحة السابقة',
  next: 'الصفحة التالية',
  close: 'أغلق الكتاب',
  open: 'افتح الكتاب',
  page: (n, t) => `${n.toLocaleString('ar-SA')} من ${t.toLocaleString('ar-SA')}`,
  printCta: 'احجز نسختك المطبوعة',
  printMsg: 'السلام عليكم، أرغب في حجز نسخة مطبوعة من كتاب «شيفرة كُن» حين يصدر',
  draft: 'مسودة أولى',
  faces: [
    { k: 'cover' },
    { k: 'endpaper', text: 'هذه النسخة لمن قرّر أن يرى قيمته' },
    { k: 'title' },
    { k: 'epigraph', text: 'كلّنا لدينا مشاكل، لكن المشكلة بداية الحل', by: 'خالد' },
    { k: 'toc' },
    {
      k: 'text',
      head: 'المدخل',
      paras: [
        'منحنا الحجر قيمةً عالية، ونسينا أن نمنحها لأنفسنا',
        'هذا الكتاب محاولة لتصحيح ذلك، جمعت فيه ما تعلّمته من سنوات العمل مع روّاد الأعمال والشركات والفرق، ومن قاعات الورش، ومن الأسئلة التي لا يقولها الناس بصوت عالٍ',
        'لن تجد هنا وصفات جاهزة، ستجد طريقة في النظر إلى نفسك، وإلى عملك، وإلى الناس من حولك',
      ],
    },
    {
      k: 'text',
      paras: [
        'هذا الكتاب هو الشيفرة التي نعمل بها في كُن: الصدق، والثقة، والصحبة، والتحسّن الذي لا يتوقف',
        'بعض الأفكار هنا قد تزعجك، وهذا مقصود، فالتغيير يبدأ من الداخل، والداخل لا يتحرّك دون ضغط',
        'اقرأه ببطء، وتوقّف حيث تشعر أن الكلام عنك',
      ],
    },
    {
      k: 'exercise',
      title: 'الشيفرة',
      steps: [
        'الصدق، ولو كان ثقيلًا',
        'الثقة تُبنى بالفعل، وتُحفظ بالوفاء',
        'نحن أسرة: نحمي بعضنا، ونرفع بعضنا',
        'نتحسّن كل يوم، ولا نكتفي بما وصلنا إليه',
        'لا أحد منّا يربح وحده',
      ],
      end: 'بنود نعيش بها قبل أن نكتبها',
    },
    { k: 'opener', num: 'الفصل الأول', title: 'كُن فاشلًا', epi: 'عنوانٌ غريب من شخص يؤمن بك، اصبر عليه حتى آخر صفحة' },
    {
      k: 'text',
      paras: [
        'أعرف، العنوان يبدو متناقضًا، كيف يدعوك شخص يؤمن بالإيجابية، ويؤمن بك، إلى أن تكون فاشلًا؟',
        'لكن توقّف لحظة، واسأل نفسك بهدوء: من علّمك أن الفشل عيب؟',
      ],
    },
    {
      k: 'text',
      paras: [
        'علّمونا منذ الصغر أن الفاشل سيّئ، وأن الخطأ يستحق العقاب، الورقة المصحّحة بالأحمر، ونظرة الأهل، وضحكة الزملاء',
        'فتعلّمنا الدرس الخطأ: أن ننجو من العقاب بأي طريقة، وأسهل طريقة للنجاة ألّا نحاول أصلًا',
      ],
    },
    {
      k: 'text',
      paras: [
        'ومن هنا يبدأ القيد الخفي، نخاف أن نجرّب، ونخاف أن نفعل ما نحب، ونخاف أن نبدأ، وكل هذا يحدث في أعماقنا دون أن ننتبه',
        'يقول علم النفس إن ألم الخسارة عندنا يعادل تقريبًا ضعف لذّة المكسب، فنؤجّل، ونقنع أنفسنا أن الوقت غير مناسب',
      ],
    },
    {
      k: 'text',
      paras: [
        'والآن اقلب الصورة: لكي تفشل، لا بد أنك فعلت شيئًا، الفشل دليل على أنك تحرّكت',
        'كل محاولة لم تنجح تضيّق المسافة بينك وبين هدفك، والذي لم يفشل قط، ما زال واقفًا في مكانه',
        'فكُن فاشلًا، جرّب، ثم جرّب، ثم جرّب، حتى تصل',
      ],
    },
    {
      k: 'exercise',
      title: 'تمرين',
      steps: [
        'اكتب ثلاث مرات فشلت فيها',
        'بجانب كل واحدة: ماذا تعلّمت؟ وما الذي صرت تفعله بشكل مختلف؟',
        'ثم اسأل نفسك: ما المحاولة التي أؤجّلها الآن خوفًا من النتيجة؟',
        'ابدأها هذا الأسبوع، بنسخة صغيرة وناقصة',
      ],
      end: 'كُن فاشلًا اليوم، لتصل غدًا إلى ما لم يتوقّعه أحد',
    },
    { k: 'opener', num: 'الفصل الثاني', title: 'قيمتك تصنعها أنت', epi: 'لا الشهادة تمنحك قيمتك، ولا المسمّى، ولا رأي الناس', body: 'القيمة شيء تصنعه من الداخل، ثم يراه الآخرون', wip: true },
    { k: 'opener', num: 'الفصل الثالث', title: 'العاصفة', epi: 'بين العاطفة والمنطق معركة لا تنتهي', body: 'والقرار الجيد يولد حين تهدأ العاصفة، وتسمع الصوتين معًا', wip: true },
    { k: 'opener', num: 'الفصل الرابع', title: 'المواهب المدفونة', epi: 'في كل فريق شخص يملك أكثر مما يُطلب منه، ولم يسأله أحد', body: 'هذا الفصل عنه، وعن طريقة العثور عليه', wip: true },
    { k: 'opener', num: 'الفصل الخامس', title: 'لا أحد يربح وحده', epi: 'ترشيحٌ يربح فيه طرف واحد، يخسر فيه الجميع لاحقًا', body: 'الموهبة، والشركة، وكُن: إمّا أن نربح معًا، أو لا نبدأ', wip: true },
    { k: 'opener', num: 'الفصل السادس', title: 'اقلب ضعفك', epi: 'نقطة ضعفك قد تكون أقوى ما تملك', body: 'غيّر زاوية النظر إليها، وغيّر الكلمات التي تصفها بها', wip: true },
    { k: 'opener', num: 'دفاتر', title: 'من قاعات الورش', epi: 'الأسئلة، والتمارين، والقصص التي عشناها مع الناس', wip: true },
    {
      k: 'closing',
      title: 'يتبع',
      paras: ['هذه الصفحات بداية الكتاب لا نهايته، فصول جديدة تُضاف، ونسخة مطبوعة فاخرة في الطريق', 'أيًّا كان التحدي، وكيفما كان، وأينما كان… سنكون هناك'],
    },
    { k: 'back' },
  ],
}

const en: Book = {
  eyebrow: 'The idea',
  title: 'The idea behind everything we do',
  lede: 'Years of workshops, sessions and hard questions, in one book. **Open it and take your time**',
  hint: 'Tap the book to open it',
  name: 'The KON Code',
  sub: 'On worth, pressure and people',
  author: 'Khalid · KON Unlimited',
  toc: 'Contents',
  tocItems: [
    { label: 'Before you begin', face: 5 },
    { label: 'The code', face: 7 },
    { label: 'One: Dare to fail', face: 8 },
    { label: 'Two: You make your own worth', face: 14 },
    { label: 'Three: The storm', face: 15 },
    { label: 'Four: Buried talent', face: 16 },
    { label: 'Five: Nobody wins alone', face: 17 },
    { label: 'Six: Turn your weakness', face: 18 },
    { label: 'From the workshop floor', face: 19 },
  ],
  wip: 'This chapter is being written',
  prev: 'Previous page',
  next: 'Next page',
  close: 'Close the book',
  open: 'Open the book',
  page: (n, t) => `${n} of ${t}`,
  printCta: 'Reserve a printed copy',
  printMsg: 'Hello, I would like to reserve a printed copy of «The KON Code» when it comes out',
  draft: 'First draft',
  faces: [
    { k: 'cover' },
    { k: 'endpaper', text: 'For whoever decided to see their own worth' },
    { k: 'title' },
    { k: 'epigraph', text: 'We all have problems. But the problem is where the solution begins', by: 'Khalid' },
    { k: 'toc' },
    {
      k: 'text',
      head: 'Before you begin',
      paras: [
        'We gave stones a great price, and forgot to give one to ourselves',
        'This book is an attempt to fix that. It gathers what I have learned from years of working with founders, companies and teams, from workshop rooms, and from the questions people never ask out loud',
        'You won’t find recipes here. You will find a way of looking at yourself, at your work, and at the people around you',
      ],
    },
    {
      k: 'text',
      paras: [
        'This book is the code we live by at KON: honesty, trust, companionship, and growth that never stops',
        'Some ideas here may unsettle you, and that is the point. Change starts from within, and nothing within moves without pressure',
        'Read it slowly, and stop wherever it feels like it is about you',
      ],
    },
    {
      k: 'exercise',
      title: 'The code',
      steps: [
        'Honesty, even when it is heavy',
        'Trust is built by what we do, and kept by loyalty',
        'We are family: we protect each other and lift each other',
        'We improve every day, and never settle',
        'None of us wins alone',
      ],
      end: 'Lines we live by before we write them',
    },
    { k: 'opener', num: 'Chapter one', title: 'Dare to fail', epi: 'A strange title from someone who believes in you. Stay with it to the last page' },
    {
      k: 'text',
      paras: [
        'I know. The title sounds like a contradiction. How can someone who believes in positivity, and in you, ask you to be a failure?',
        'But stop for a moment and ask yourself, quietly: who taught you that failing is shameful?',
      ],
    },
    {
      k: 'text',
      paras: [
        'From childhood we were taught that a failure is a bad person, and that mistakes deserve punishment. The paper marked in red, the look from our parents, the laugh from classmates',
        'So we learned the wrong lesson: escape the punishment by any means. And the easiest escape is never to try at all',
      ],
    },
    {
      k: 'text',
      paras: [
        'That is where the hidden chain begins. We are afraid to try, afraid to do what we love, afraid to start. And all of it happens deep inside, without us noticing',
        'Psychology tells us a loss hurts roughly twice as much as an equal gain pleases. So we postpone, and tell ourselves the timing is wrong',
      ],
    },
    {
      k: 'text',
      paras: [
        'Now turn the picture over: to fail, you must have done something. Failure is proof that you moved',
        'Every attempt that didn’t work closes the gap between you and your goal. Whoever has never failed is still standing where they started',
        'So dare to fail. Try, and try, and try again, until you arrive',
      ],
    },
    {
      k: 'exercise',
      title: 'Exercise',
      steps: [
        'Write down three times you failed',
        'Next to each: what did you learn, and what do you now do differently?',
        'Then ask yourself: which attempt am I putting off right now for fear of the result?',
        'Start it this week, in a small, imperfect version',
      ],
      end: 'Fail today, and reach tomorrow what nobody expected',
    },
    { k: 'opener', num: 'Chapter two', title: 'You make your own worth', epi: 'No certificate gives you your worth, no title, no one’s opinion', body: 'Worth is something you build from within, and then others see it', wip: true },
    { k: 'opener', num: 'Chapter three', title: 'The storm', epi: 'Emotion and logic fight a battle that never ends', body: 'A good decision is born when the storm calms and you can hear both voices', wip: true },
    { k: 'opener', num: 'Chapter four', title: 'Buried talent', epi: 'Every team has someone capable of far more than is asked of them, and nobody has asked', body: 'This chapter is about them, and how to find them', wip: true },
    { k: 'opener', num: 'Chapter five', title: 'Nobody wins alone', epi: 'A placement where one side wins is one where everyone loses later', body: 'The talent, the company and KON: we win together, or we don’t begin', wip: true },
    { k: 'opener', num: 'Chapter six', title: 'Turn your weakness', epi: 'Your weak point may be the strongest thing you own', body: 'Change the angle you see it from, and the words you use for it', wip: true },
    { k: 'opener', num: 'Notebooks', title: 'From the workshop floor', epi: 'The questions, exercises and stories we lived with people', wip: true },
    {
      k: 'closing',
      title: 'To be continued',
      paras: ['These pages are the start of the book, not its end. New chapters are on their way, and so is a fine printed edition', 'Any challenge. Any way. Anywhere… We’ll be there'],
    },
    { k: 'back' },
  ],
}

export const codex: Record<Lang, Book> = { ar, en }
