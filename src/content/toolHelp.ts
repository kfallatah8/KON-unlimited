// Plain-language guide shown above each calculator: what it answers, what to type, how to read the result.
import type { ToolId } from './solutions'

type H = { q: string; fill: string; read: string }
export const toolHelp: Record<ToolId, { ar: H; en: H }> = {
  breakhour: {
    ar: { q: 'كل يوم تفتح فيه، أول جزء من مبيعاتك يذهب لتغطية المصاريف الثابتة (إيجار، رواتب، كهرباء)، هذه الأداة تحسب الساعة التي ينتهي فيها هذا الجزء، ويبدأ بعدها ربحك الفعلي', fill: 'اكتب مصاريفك الثابتة الشهرية، وأيام وساعات العمل، ومتوسط الفاتورة، وكم يكلّفك كل طلب من مواد وعمولات، وعدد عملائك اليومي', read: 'الوقت الكبير هو الساعة التي تبدأ فيها الربح، الشريط تحته يوضّح يومك: الجزء الأحمر تعمل فيه للمصاريف، والأخضر هو ربحك' },
    en: { q: 'Every day you open, the first part of your sales goes to fixed costs (rent, salaries, utilities). This tool finds the hour that part is covered and your real profit starts', fill: 'Enter your monthly fixed costs, working days and hours, average bill, what each order costs you in materials and fees, and daily customers', read: 'The big time is when profit starts. The bar under it is your day: the red part pays costs, the green part is profit' },
  },
  delivery: {
    ar: { q: 'التطبيق يأخذ عمولة ورسومًا من كل طلب، هذه الأداة تحسب كم يبقى لك فعلًا بعد كل الخصومات', fill: 'اكتب سعر الطلب، ونسبة العمولة، وتكلفة المكوّنات والتغليف', read: 'الرقم الكبير هو ربحك الصافي من الطلب الواحد، إن كان قريبًا من الصفر، فكل طلب جديد يتعبك أكثر مما يفيدك' },
    en: { q: 'The app takes a commission and fees from every order. This tool shows what is really left for you', fill: 'Enter the order price, the commission rate, and your ingredient and packaging cost', read: 'The big number is your net profit per order. Close to zero means every extra order costs you effort for nothing' },
  },
  recipe: {
    ar: { q: 'تكلفة الطبق ليست مجموع المكوّنات فقط؛ هناك هدر وتقليم، هذه الأداة تحسب التكلفة الحقيقية للحصة، والسعر الذي يحمي هامشك', fill: 'أضف مكوّنات الطبق: الكمية، وسعر الشراء، ونسبة الهدر لكل مكوّن', read: 'ستعرف تكلفة الحصة، ونسبتها من سعر البيع، والسعر المقترح لتبقى في هامش صحي' },
    en: { q: 'A plate costs more than its ingredients: there is waste and trimming. This tool gives the true portion cost and a price that protects your margin', fill: 'Add each ingredient: quantity, purchase price and waste percentage', read: 'You get the portion cost, its share of the selling price, and a suggested price for a healthy margin' },
  },
  channel: {
    ar: { q: 'بين مصنعك والرف موزّع ومتجر وضريبة، هذه الأداة تحسب سعر الرف النهائي، وكم يصلك منه', fill: 'اكتب تكلفة الإنتاج، وهامشك، وهامش الموزّع والمتجر', read: 'الأشرطة توضّح كيف يتوزّع سعر الرف على كل حلقة في السلسلة' },
    en: { q: 'Between your kitchen and the shelf sit a distributor, a retailer and VAT. This tool shows the final shelf price and what reaches you', fill: 'Enter production cost, your margin, and the distributor and retailer margins', read: 'The bars show how the shelf price splits across each link in the chain' },
  },
  oee: {
    ar: { q: 'آلاتك لا تعمل بكامل طاقتها: توقفات، وبطء، وعيوب، هذه الأداة تقيس الكفاءة الشاملة (OEE) وكم إنتاجًا يضيع بصمت', fill: 'اكتب وقت التشغيل المخطط، والتوقفات، والسرعة الفعلية، ونسبة القطع السليمة', read: 'الرقم الكبير هو نسبة الطاقة التي تستفيد منها فعلًا، المصانع الممتازة عالميًا قرابة 85%' },
    en: { q: 'Your line never runs at full capacity: stops, slow cycles and defects. This tool measures OEE and how much output leaks quietly', fill: 'Enter planned run time, downtime, actual speed and the share of good parts', read: 'The big number is the share of capacity you really use. World class is around 85%' },
  },
  viewing: {
    ar: { q: 'كل معاينة مع مشترٍ غير جادّ تأخذ ساعات من فريقك: الطريق، والانتظار، والجولة، هذه الأداة تحسب كم تكلّفك هذه الساعات', fill: 'اكتب عدد معايناتك شهريًا، ونسبة غير الجادّة منها، وساعات المعاينة، وتكلفة ساعة المسوّق، وعدد صفقاتك', read: 'ستعرف الساعات والمال الذي يذهب مع غير الجادّين، وكم صفقة إضافية قد يجلبها هذا الوقت لو ذهب لمشترين جادّين' },
    en: { q: 'Every viewing with a buyer who was never serious takes hours from your team: the drive, the wait, the walk-through. This tool shows what those hours cost you', fill: 'Enter viewings per month, the share that were not serious, hours per viewing, the cost of an agent’s hour and your deals', read: 'You get the hours and money that go to non-serious buyers, and how many extra deals that time could bring if it went to serious ones' },
  },
  stock: {
    ar: { q: 'البضاعة الراكدة مال نائم: لا يربح، ويكلّفك تخزينًا، هذه الأداة تحسب كم من مالك محبوس على الرفوف', fill: 'اكتب قيمة مخزونك، وتكلفة البضاعة المباعة شهريًا، ونسبة الأصناف البطيئة', read: 'ستعرف المال المحبوس، وكم يومًا يكفيك المخزون، وكم يكلّفك الاحتفاظ به سنويًا' },
    en: { q: 'Slow stock is sleeping money: it earns nothing and costs you to keep. This tool shows how much of your cash is locked on the shelves', fill: 'Enter stock value, monthly cost of goods sold and the share of slow items', read: 'You get the locked cash, days of cover, and the yearly cost of carrying it' },
  },
  home: {
    ar: { q: 'كثير من المشاريع المنزلية تسعّر بالمكوّنات فقط، فتعمل مجانًا، هذه الأداة تضيف وقتك وتعبك إلى السعر', fill: 'اكتب تكلفة المكوّنات، والساعات التي تقضيها، والأجر الذي تستحقه لساعتك', read: 'السعر العادل يغطّي المكوّنات ووقتك، ويترك ربحًا تنمو به' },
    en: { q: 'Many home businesses price by ingredients only, so they work for free. This tool adds your time and effort to the price', fill: 'Enter ingredient cost, the hours you spend and what your hour is worth', read: 'The fair price covers ingredients and your time, and leaves profit to grow with' },
  },
  ceiling: {
    ar: { q: 'كل شهر تكسب عملاء جددًا وتخسر بعض القدامى، عند نقطة ما يتعادل الاثنان ويتوقف النمو، مهما صرفت على التسويق، هذه الأداة تحسب هذا السقف', fill: 'اكتب عدد العملاء الجدد شهريًا، ونسبة من يتركونك كل شهر، وعدد عملائك الحالي', read: 'السقف هو أقصى عدد عملاء ستصل إليه بوضعك الحالي، وتقارن الأداة: هل يرفعه تقليل خسارة العملاء أكثر، أم زيادة التسويق؟' },
    en: { q: 'Every month you win new customers and lose some old ones. At some point the two balance and growth stops, whatever you spend on marketing. This tool finds that ceiling', fill: 'Enter new customers per month, the share who leave each month, and your current customers', read: 'The ceiling is the most customers you will reach as things are. It also compares: does keeping customers or buying more of them raise it more?' },
  },
  lever: {
    ar: { q: 'لزيادة الربح أربع روافع: السعر، والتكلفة، وعدد العملاء، وتكرار الشراء، هذه الأداة تحرّك كل واحدة بنفس النسبة وتريك أيّها يرفع ربحك أكثر', fill: 'اكتب عدد عملائك، ومرات شرائهم، ومتوسط الفاتورة، وهامشك، ومصاريفك الثابتة، ونسبة التحسين التي تريد تجربتها', read: 'الأشرطة مرتّبة من الأقوى إلى الأضعف، الشريط الذهبي هو الرافعة التي تستحق أن تبدأ بها' },
    en: { q: 'Profit has four levers: price, cost, customers and how often they buy. This tool moves each by the same amount and shows which lifts profit most', fill: 'Enter customers, purchase frequency, average bill, margin, fixed costs and the improvement to test', read: 'The bars are ranked strongest first. The gold bar is the lever worth starting with' },
  },
  price: {
    ar: { q: 'حين ترفع السعر قد تخسر بعض العملاء، لكنك تربح أكثر من كل عميل باقٍ، هذه الأداة تحسب كم عميلًا تستطيع أن تخسر وتبقى أرباحك كما هي، وفي الخصم تحسب العكس: كم مبيعات إضافية تحتاج لتعوّض', fill: 'اكتب هامش ربحك الحالي، ونسبة الرفع أو الخصم التي تفكّر فيها', read: 'إن خسرت عملاء أقل من النسبة الظاهرة، فالرفع ربح لك، وفي الخصم، إن لم تزد مبيعاتك بالنسبة الظاهرة فأنت تخسر' },
    en: { q: 'Raise prices and you may lose some customers, but earn more from each one who stays. This tool finds how many you can lose and keep the same profit. For a discount it does the reverse: how many extra sales you need', fill: 'Enter your current margin and the rise or discount you are considering', read: 'Lose fewer customers than the share shown and the rise pays. For a discount, if sales don’t grow by the share shown, you lose money' },
  },
  focus: {
    ar: { q: 'كل مقاطعة (رسالة، مكالمة، سؤال جانبي) تكلّف دقائق للعودة إلى التركيز، هذه الأداة تحسب كم يضيع من يوم فريقك، وكم يكلّفك سنويًا', fill: 'اكتب عدد أفراد الفريق، وعدد المقاطعات اليومية للفرد، ومتوسط الراتب', read: 'الرقم الكبير هو نسبة اليوم الضائعة، وستعرف ما يعادلها من موظفين بدوام كامل، وتكلفتها في السنة' },
    en: { q: 'Every interruption (a message, a call, a side question) costs minutes to refocus. This tool shows how much of your team’s day is lost, and what it costs per year', fill: 'Enter team size, daily interruptions per person and average salary', read: 'The big number is the share of the day lost. You also see its full-time-staff equivalent and yearly cost' },
  },
  meeting: {
    ar: { q: 'الاجتماع الذي لا ينتهي بقرار يستهلك رواتب الحاضرين دون نتيجة، هذه الأداة تحسب ثمنه الحقيقي', fill: 'اكتب عدد الحاضرين، ومدة الاجتماع، ومتوسط الراتب، وعدد الاجتماعات في الأسبوع، ونسبة ما ينتهي منها بقرار واضح', read: 'ستعرف تكلفة الاجتماع الواحد، وتكلفة هذه الاجتماعات خلال سنة' },
    en: { q: 'A meeting that ends with no decision burns the salaries of everyone in the room. This tool shows what it really costs', fill: 'Enter attendees, length, average salary, meetings per week, and the share that end with a clear decision', read: 'You get the cost of one meeting and of these meetings over a year' },
  },
  turnover: {
    ar: { q: 'حين يستقيل موظف جيد لا تخسر راتبه فقط؛ تخسر إنتاجه أثناء البحث، والتوظيف، وأشهر تعلّم البديل، هذه الأداة تجمع هذه التكاليف الخفية', fill: 'اكتب الراتب، والقيمة التي يضيفها شهريًا، ومدة شغور المقعد، ومدة تعلّم البديل، وتكلفة التوظيف', read: 'الرقم الكبير هو الخسارة الكاملة، وتراها أيضًا بعدد رواتب الأشهر' },
    en: { q: 'When a good person resigns you lose more than a salary: output while the seat is empty, hiring, and months of the new hire learning. This tool adds up those hidden costs', fill: 'Enter salary, the value they add per month, vacancy time, ramp-up time and hiring cost', read: 'The big number is the full loss, also shown in months of salary' },
  },
  founder: {
    ar: { q: 'وقت المؤسس أغلى مورد في الشركة، وغالبًا يضيع في مهام يستطيع غيره أداءها، هذه الأداة تحسب قيمة ساعتك، وكم تخسر حين تصرفها في مهام صغيرة', fill: 'اكتب الدخل الذي تستهدفه، وساعات عملك الأسبوعية، والساعات التي تذهب في مهام يمكن تفويضها، وكم ستدفع لساعة من يؤديها عنك', read: 'ستعرف قيمة ساعتك، والمبلغ الذي يتسرّب سنويًا حين تؤدي مهام أقل من قيمتها' },
    en: { q: 'A founder’s time is the company’s most expensive resource, and it often goes on tasks someone else could do. This tool shows what your hour is worth and what you lose on small tasks', fill: 'Enter the income you aim for, your weekly hours, the hours spent on tasks you could delegate, and what you’d pay someone per hour to do them', read: 'You get your hourly value and the yearly leak from doing tasks below it' },
  },
  delay: {
    ar: { q: 'تأجيل قرار يبدو مجانيًا، لكن كل أسبوع انتظار يؤخّر الفائدة التي كان سيجلبها، هذه الأداة تحسب ثمن الانتظار', fill: 'اكتب المكسب الشهري المتوقع من القرار، ومدة التأجيل، ونسبة ثقتك في نجاحه', read: 'ستعرف كم يكلّفك كل أسبوع وكل يوم من التأجيل' },
    en: { q: 'Putting off a decision feels free, but every week of waiting delays the gain it would bring. This tool prices the wait', fill: 'Enter the expected monthly gain, how long you would wait, and how confident you are it works', read: 'You get the cost of every week and every day of delay' },
  },
}
