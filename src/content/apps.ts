// Business apps KON sets up for clients, grouped by sector. Source: KON open-source catalog
// (verified 27 Oct 2026). All are open source; KON sells the setup, Arabic fitting, training and care.
//
// To add an app: add it to `apps` (name + one line in each language) and list its id under a sector.

export interface App { name: string; ar: string; en: string }
export interface Sector { id: string; ar: string; en: string; line: { ar: string; en: string }; apps: string[] }

export const apps: Record<string, App> = {
 "activepieces": {
  "name": "Activepieces",
  "ar": "أتمتة بدون برمجة بديلة لـ Zapier: اربط النماذج وواتساب والجداول والبريد دون مطور",
  "en": "No-code automation (Zapier alternative): connect forms, WhatsApp, sheets and email without developers"
 },
 "anything": {
  "name": "AnythingLLM",
  "ar": "اسأل ملفاتك مباشرة: السياسات والعقود والإجراءات وقوائم الأسعار، مع إجابات تذكر المصدر",
  "en": "Ask questions of your own files: policies, contracts, SOPs and price lists, with answers that cite the source"
 },
 "appsmith": {
  "name": "Appsmith",
  "ar": "بناء شاشات داخلية بسرعة (موافقات، مكتب طلبات، لوحات إدارة) فوق أي قاعدة بيانات أو API",
  "en": "Build internal screens fast (approvals, order desks, admin panels) on top of any database or API"
 },
 "bagisto": {
  "name": "Bagisto",
  "ar": "متجر إلكتروني على Laravel مع سوق متعدد البائعين ونقطة بيع وواجهة عربية كاملة",
  "en": "Laravel e-commerce with multi-vendor marketplace, POS and full Arabic right-to-left storefront"
 },
 "bigcap": {
  "name": "Bigcapital",
  "ar": "محاسبة ومخزون للأعمال الصغيرة: فواتير، مصروفات، تسوية بنكية وتقارير مالية",
  "en": "Accounting and inventory for small businesses: invoices, expenses, bank reconciliation and financial reports"
 },
 "bookcars": {
  "name": "BookCars",
  "ar": "موقع حجز سيارات ولوحة إدارة وتطبيق جوال، يدعم عدة موردين",
  "en": "Car rental booking website, admin panel and mobile app, with multiple suppliers"
 },
 "bookstack": {
  "name": "BookStack",
  "ar": "دليل الشركة للإجراءات والسياسات ومواد التدريب، منظم ككتب وفصول",
  "en": "Company manual for SOPs, policies and training notes, organised like books and chapters"
 },
 "budibase": {
  "name": "Budibase",
  "ar": "نماذج وتطبيقات موافقات وبوابات تُبنى في أيام مع قاعدة بيانات مدمجة",
  "en": "Forms, approval apps and portals built in days, with a built-in database"
 },
 "cal": {
  "name": "Cal.diy",
  "ar": "صفحات حجز مواعيد مثل Calendly: يختار العميل الوقت ويصله تذكير ويتحدث التقويم تلقائياً",
  "en": "Online booking pages like Calendly: clients pick a time, get reminders and the calendar updates itself"
 },
 "chatwoot": {
  "name": "Chatwoot",
  "ar": "صندوق وارد موحد لواتساب وإنستغرام ودردشة الموقع والبريد، ليرد الفريق على العملاء من شاشة واحدة",
  "en": "Shared inbox for WhatsApp, Instagram, website chat and email, so the whole team answers customers from one screen"
 },
 "civicrm": {
  "name": "CiviCRM",
  "ar": "إدارة المتبرعين والأعضاء للجمعيات: تبرعات، إيصالات، حملات، فعاليات ومتطوعون",
  "en": "Donor and member CRM for nonprofits: donations, receipts, campaigns, events and volunteers"
 },
 "cmms": {
  "name": "Atlas CMMS",
  "ar": "إدارة الصيانة: أوامر عمل، جداول صيانة وقائية وقطع غيار",
  "en": "Maintenance management: work orders, preventive maintenance schedules and spare parts"
 },
 "condo": {
  "name": "Condo",
  "ar": "إدارة المجمعات السكنية والمرافق: طلبات السكان، تذاكر الصيانة، المدفوعات وتطبيق للسكان",
  "en": "Property and facility management for compounds: resident requests, service tickets, payments and a residents app"
 },
 "coolify": {
  "name": "Coolify",
  "ar": "منصة نشر ذاتية: تشغيل ونسخ احتياطي لعشرات التطبيقات على خوادم تستأجرها",
  "en": "Self-hosted Heroku: deploy and back up dozens of apps on servers you rent"
 },
 "docassemble": {
  "name": "docassemble",
  "ar": "مقابلات موجّهة تولّد المستندات القانونية: يجيب العميل على الأسئلة فيُصاغ العقد أو المذكرة تلقائياً",
  "en": "Guided interviews that write legal documents: the client answers questions, the contract or memo drafts itself"
 },
 "docling": {
  "name": "Docling",
  "ar": "يقرأ ملفات PDF والمستندات الممسوحة (فواتير، عقود، نماذج) ويحولها إلى بيانات منظمة",
  "en": "Reads PDFs and scans (invoices, contracts, forms) and turns them into clean data a system can use"
 },
 "docmost": {
  "name": "Docmost",
  "ar": "ويكي ومستندات للفريق بديلة لـ Confluence وNotion مع تحرير جماعي مباشر",
  "en": "Team wiki and documents, a Confluence or Notion alternative with real-time editing"
 },
 "documenso": {
  "name": "Documenso",
  "ar": "بديل مفتوح لـ DocuSign لإرسال المستندات للتوقيع ومتابعة من وقّع",
  "en": "Open DocuSign alternative for sending documents to be signed and tracking who signed"
 },
 "docuseal": {
  "name": "DocuSeal",
  "ar": "توقيع إلكتروني ونماذج PDF قابلة للتعبئة للعقود والعروض والاتفاقيات",
  "en": "Electronic signatures and fillable PDF forms for contracts, offers and agreements"
 },
 "dolibarr": {
  "name": "Dolibarr",
  "ar": "نظام ERP وCRM بسيط للمنشآت الصغيرة: عروض أسعار، فواتير، مخزون، مشاريع وموارد بشرية",
  "en": "Simple ERP and CRM for small firms: quotes, invoices, stock, projects and HR in one place"
 },
 "easyappt": {
  "name": "Easy!Appointments",
  "ar": "حجز مواعيد للخدمات والموظفين: يحجز العميل أونلاين ويرى كل موظف جدوله",
  "en": "Appointment booking for services and staff: clients book online, staff see their own schedule"
 },
 "erpnext": {
  "name": "ERPNext",
  "ar": "نظام ERP كامل للمنشآت الصغيرة والمتوسطة: محاسبة، مشتريات ومبيعات، مخزون، مشاريع، تصنيع وأصول",
  "en": "Full ERP for SMEs: accounting, buying and selling, stock, projects, manufacturing and assets"
 },
 "erxes": {
  "name": "erxes",
  "ar": "منصة تجربة عملاء للوكالات: صندوق رسائل وCRM وأتمتة تسويق وإضافات ولاء",
  "en": "Customer experience suite for agencies: inbox, CRM, marketing automation and loyalty plugins"
 },
 "espo": {
  "name": "EspoCRM",
  "ar": "نظام CRM مرن يشمل القضايا والعملاء والتقويم وكيانات مخصصة، يتكيف مع أي قطاع",
  "en": "Flexible CRM with cases, contacts, calendar and custom entities. Easy to adapt to any sector"
 },
 "fcrm": {
  "name": "Frappe CRM",
  "ar": "نظام بسيط للعملاء والصفقات مع واتساب وسجل مكالمات، يتكامل مع ERPNext",
  "en": "Simple lead and deal CRM with WhatsApp and call logging that plugs into ERPNext"
 },
 "fedu": {
  "name": "Frappe Education",
  "ar": "القبول والحضور وجداول الرسوم على منصة Frappe",
  "en": "Admissions, attendance and fee schedules on the Frappe stack"
 },
 "fleetbase": {
  "name": "Fleetbase",
  "ar": "منصة لوجستية: طلبات، توزيع، تطبيق سائقين، تتبع مباشر وإثبات تسليم",
  "en": "Logistics platform: orders, dispatch, drivers app, live tracking and proof of delivery"
 },
 "flms": {
  "name": "Frappe LMS",
  "ar": "منصة دورات بسيطة لتهيئة الموظفين والدورات المدفوعة",
  "en": "Clean course platform for staff onboarding and paid courses"
 },
 "flpos": {
  "name": "POS System (Flutter)",
  "ar": "نقطة بيع للجوال والجهاز اللوحي للمقاهي والأكشاك الصغيرة، تعمل دون إنترنت",
  "en": "Phone and tablet POS for small cafes and kiosks; works offline"
 },
 "formbricks": {
  "name": "Formbricks",
  "ar": "استبيانات ونماذج رأي العملاء عبر رابط أو QR أو نافذة في الموقع، بالعربية",
  "en": "Customer surveys and feedback forms (link, QR or website pop-up), with Arabic right-to-left surveys"
 },
 "freecad": {
  "name": "FreeCAD",
  "ar": "تصميم ثلاثي الأبعاد بارامتري للقطع الميكانيكية والعمارة وBIM",
  "en": "Parametric 3D CAD for mechanical parts, architecture and BIM"
 },
 "gauzy": {
  "name": "Ever Gauzy",
  "ar": "منصة إدارة أعمال: موارد بشرية، توظيف، تتبع وقت، فواتير وعملاء",
  "en": "Business management platform: HR, recruitment (ATS), time tracking, invoicing and CRM"
 },
 "ghost": {
  "name": "Ghost",
  "ar": "مدونة ونشرة بريدية واشتراكات مدفوعة في منصة واحدة للعلامات التي تبيع بالمحتوى",
  "en": "Blog, newsletter and paid memberships in one, for brands that sell through content"
 },
 "gibbon": {
  "name": "Gibbon",
  "ar": "إدارة المدارس ورياض الأطفال: تسجيل، حضور، تواصل مع أولياء الأمور، تقارير ورسوم",
  "en": "School and nursery management: enrolment, attendance, parent messaging, reports and fees"
 },
 "grafana": {
  "name": "Grafana",
  "ar": "لوحات مراقبة مباشرة للآلات واستهلاك الطاقة والقراءات البيئية",
  "en": "Live monitoring dashboards for machines, energy use and environmental readings"
 },
 "grist": {
  "name": "Grist",
  "ar": "جدول بيانات يعمل كقاعدة بيانات، بديل لملفات إكسل الهشة التي تدير بها المنشأة عملها",
  "en": "Spreadsheet that works like a database: replaces the fragile Excel files a business runs on"
 },
 "helpdesk": {
  "name": "Frappe Helpdesk",
  "ar": "نظام تذاكر مع اتفاقيات مستوى الخدمة وبوابة للعملاء",
  "en": "Ticketing with SLAs and a customer portal, built on the Frappe stack"
 },
 "heyform": {
  "name": "HeyForm",
  "ar": "نماذج حوارية لجمع العملاء والحجوزات والاختبارات، سؤالاً بعد سؤال",
  "en": "Conversational forms for leads, bookings and quizzes, one question at a time"
 },
 "hievents": {
  "name": "Hi.Events",
  "ar": "بيع تذاكر وتسجيل في الفعاليات مع تسجيل الحضور، للرحلات وورش العمل وفعاليات التبرع",
  "en": "Event ticketing and registration with check-in, for tours, workshops and fundraising events"
 },
 "horilla": {
  "name": "Horilla HRMS",
  "ar": "نظام موارد بشرية أخف: مسار توظيف، تهيئة، حضور، إجازات، رواتب وتقييم أداء",
  "en": "Lighter HR system: recruitment pipeline, onboarding, attendance, leave, payroll and performance"
 },
 "hrms": {
  "name": "Frappe HR",
  "ar": "الموارد البشرية والرواتب: توظيف، تهيئة، حضور، إجازات، ورديات، مصروفات ورواتب",
  "en": "HR and payroll: recruitment, onboarding, attendance, leave, shifts, expenses and payroll"
 },
 "huly": {
  "name": "Huly",
  "ar": "مساحة عمل واحدة للمشاريع ومحادثات الفريق والمستندات والموارد البشرية والاجتماعات",
  "en": "One workspace for projects, team chat, documents, HR and meetings"
 },
 "ifc": {
  "name": "IfcOpenShell / Bonsai",
  "ar": "أدوات BIM مفتوحة لقراءة وفحص وتعديل نماذج المباني بصيغة IFC",
  "en": "Open BIM toolkit: read, check and edit IFC building models; Bonsai adds BIM authoring inside Blender"
 },
 "immich": {
  "name": "Immich",
  "ar": "ألبومات صور وفيديو خاصة على خادمك؛ شارك صور اليوم مع أولياء الأمور بدل مجموعات واتساب",
  "en": "Private photo and video albums on your own server; share each day's photos with parents without WhatsApp groups"
 },
 "inventree": {
  "name": "InvenTree",
  "ar": "إدارة القطع والمخزون مع قوائم المواد ومواقع التخزين والموردين والباركود",
  "en": "Parts and inventory control with bills of materials, stock locations, suppliers and barcodes"
 },
 "invshelf": {
  "name": "InvoiceShelf",
  "ar": "فواتير وعروض أسعار ومصروفات ومدفوعات بسيطة للمستقلين والمنشآت الصغيرة",
  "en": "Simple invoicing, estimates, expenses and payments for freelancers and small firms"
 },
 "jitsi": {
  "name": "Jitsi Meet",
  "ar": "اجتماعات فيديو على خادمك دون حاجة الضيوف لإنشاء حساب",
  "en": "Video meetings on your own server, with no account needed for guests"
 },
 "kimai": {
  "name": "Kimai",
  "ar": "سجل ساعات العمل القابلة للفوترة لكل عميل ومشروع مع تصدير الفواتير",
  "en": "Timesheets and billable hours per client and project, with invoice export"
 },
 "kobo": {
  "name": "KoboToolbox",
  "ar": "جمع بيانات ميدانية بالجوال دون إنترنت بنماذج عربية، تستخدمه الأمم المتحدة والمنظمات حول العالم",
  "en": "Field data collection on phones, offline, with Arabic forms. Used by the UN and NGOs worldwide"
 },
 "krayin": {
  "name": "Krayin CRM",
  "ar": "نظام مبيعات لإدارة العملاء مع مسار الصفقات، عروض الأسعار، البريد وتتبع الأنشطة",
  "en": "Sales CRM with lead pipeline, quotes, email and activity tracking. Made by the Bagisto team"
 },
 "kuma": {
  "name": "Uptime Kuma",
  "ar": "يراقب كل موقع ونظام وينبه عبر تيليجرام أو البريد ويعرض صفحة حالة عامة",
  "en": "Watches every website and system, alerts on Telegram, Slack or email, and shows a public status page"
 },
 "lago": {
  "name": "Lago",
  "ar": "محرك فوترة للاشتراكات والاستخدام لمن يبيع باقات شهرية",
  "en": "Subscription and usage-based billing engine for anyone selling monthly plans"
 },
 "leantime": {
  "name": "Leantime",
  "ar": "إدارة مشاريع لغير المتخصصين، مع أهداف وأفكار وسجل ساعات",
  "en": "Project management for people who are not project managers, with goals, ideas and timesheets"
 },
 "librechat": {
  "name": "LibreChat",
  "ar": "ChatGPT خاص بفريق الشركة بحسابات مستخدمين وعدة نماذج وتحكم في الاستخدام",
  "en": "A private ChatGPT for the whole team, with user accounts, several AI models and usage control"
 },
 "libretr": {
  "name": "LibreTranslate",
  "ar": "ترجمة آلية بين العربية والإنجليزية على خادمك للمستندات والمواقع والمحادثات",
  "en": "Self-hosted Arabic and English machine translation for documents, websites and chats"
 },
 "listmonk": {
  "name": "listmonk",
  "ar": "نشرات بريدية وقوائم مراسلة لجمهور كبير، سريعة وقليلة التكلفة",
  "en": "Newsletters and mailing lists for large audiences, very fast and cheap to run"
 },
 "lubelog": {
  "name": "LubeLogger",
  "ar": "سجل صيانة ووقود وتذكيرات خدمة لأسطول المركبات",
  "en": "Vehicle maintenance, fuel and service-reminder log for a fleet"
 },
 "matomo": {
  "name": "Matomo",
  "ar": "تحليلات مواقع كاملة بالأهداف والمسارات وتتبع المتجر، والبيانات تبقى لديك",
  "en": "Full website analytics with goals, funnels and e-commerce tracking; data stays with you"
 },
 "mautic": {
  "name": "Mautic",
  "ar": "أتمتة تسويق: حملات بريدية، صفحات هبوط، تقييم العملاء المحتملين وشرائح",
  "en": "Marketing automation: email campaigns, landing pages, lead scoring and segments"
 },
 "medusa": {
  "name": "Medusa",
  "ar": "محرك تجارة مرن للمتاجر المخصصة والبيع بين الشركات ولعدة دول",
  "en": "Headless commerce engine for custom stores, B2B and multi-region selling"
 },
 "metabase": {
  "name": "Metabase",
  "ar": "لوحات وتقارير يبنيها أي موظف من بيانات الشركة دون الحاجة إلى SQL",
  "en": "Dashboards and reports anyone can build from the company's data, no SQL needed"
 },
 "mixpost": {
  "name": "Mixpost Lite",
  "ar": "جدولة وتحليل منشورات التواصل الاجتماعي على خادمك",
  "en": "Self-hosted social media scheduler and analytics"
 },
 "moodle": {
  "name": "Moodle",
  "ar": "منصة تدريب إلكتروني بدورات واختبارات وشهادات",
  "en": "Online training platform with courses, quizzes and certificates"
 },
 "nextcloud": {
  "name": "Nextcloud",
  "ar": "سحابة خاصة بالشركة للملفات والمشاركة والتقويم والاجتماعات على خادمك",
  "en": "Private company cloud for files, sharing, calendar and video calls, hosted on your own server"
 },
 "nodered": {
  "name": "Node-RED",
  "ar": "ربط الآلات والحساسات والأنظمة بالسحب والإفلات، خطوة أولى لإنترنت الأشياء في المصانع",
  "en": "Drag-and-drop wiring for machines, sensors and APIs; common first step for factory IoT"
 },
 "odk": {
  "name": "ODK Central",
  "ar": "خادم ذاتي للاستبيانات والفحوصات الميدانية بالجوال مع الصور وGPS",
  "en": "Self-hosted server for mobile surveys and inspections with photos and GPS"
 },
 "odoo": {
  "name": "Odoo Community",
  "ar": "نظام متكامل للأعمال: مبيعات، نقاط بيع، مخزون، محاسبة، موارد بشرية، موقع، مواعيد، أسطول وتصنيع",
  "en": "All-in-one business suite: sales, POS, inventory, accounting, HR, website, appointments, fleet and manufacturing"
 },
 "olca": {
  "name": "openLCA",
  "ar": "تقييم دورة حياة المنتجات وحساب البصمة الكربونية",
  "en": "Life-cycle assessment and carbon footprint of products and processes"
 },
 "ollama": {
  "name": "Ollama",
  "ar": "تشغيل نماذج الذكاء الاصطناعي على خادم الشركة نفسها فلا تخرج بيانات العملاء منها",
  "en": "Runs AI models on the company's own server, so customer data never leaves the building"
 },
 "onlyoffice": {
  "name": "ONLYOFFICE Docs",
  "ar": "تحرير ملفات وورد وإكسل وباوربوينت جماعياً في المتصفح مع دعم كامل للعربية",
  "en": "Edit Word, Excel and PowerPoint files together in the browser, with full right-to-left support"
 },
 "openboxes": {
  "name": "OpenBoxes",
  "ar": "إدارة سلاسل الإمداد والمستودعات لعدة مواقع مع تتبع الدفعات وتواريخ الانتهاء",
  "en": "Supply-chain and warehouse management across several sites, with lot and expiry tracking"
 },
 "opencats": {
  "name": "OpenCATS",
  "ar": "نظام تتبع المتقدمين: طلبات توظيف، قاعدة مرشحين، قراءة السير الذاتية ومراحل التوظيف",
  "en": "Applicant tracking: job orders, candidate database, CV parsing and pipeline stages"
 },
 "openemr": {
  "name": "OpenEMR",
  "ar": "نظام عيادات: ملفات المرضى، المواعيد، الوصفات، الفوترة وبوابة المريض",
  "en": "Clinic system: patient records, appointments, prescriptions, billing and patient portal"
 },
 "openproject": {
  "name": "OpenProject",
  "ar": "إدارة مشاريع مع مخطط جانت وحزم عمل وتتبع وقت ووحدة BIM لمشاريع البناء",
  "en": "Classic project management with Gantt charts, work packages, time tracking and a BIM module for building projects"
 },
 "opensign": {
  "name": "OpenSign",
  "ar": "توقيع إلكتروني بقوالب وترتيب للموقّعين وسجل تدقيق",
  "en": "E-signature with templates, signing order and audit trail"
 },
 "orangehrm": {
  "name": "OrangeHRM",
  "ar": "سجلات الموظفين، الإجازات، التوظيف وتقييم الأداء للشركات الصغيرة والمتوسطة",
  "en": "HR records, leave, recruitment and performance for small and mid-size companies"
 },
 "ospos": {
  "name": "Open Source POS",
  "ar": "نقطة بيع عبر المتصفح مع مخزون ومبيعات وإيصالات وعملاء وتقارير للمحلات والمقاهي",
  "en": "Web point of sale with stock, sales, receipts, customers and reports for shops and cafes"
 },
 "pannellum": {
  "name": "Pannellum",
  "ar": "عارض صور ⁦360°⁩ وجولات افتراضية مجاني تستضيفه على موقعك، بديل لـ Kuula",
  "en": "Free ⁦360°⁩ panorama and virtual-tour viewer you can host on your own site (a Kuula alternative)"
 },
 "paperless": {
  "name": "Paperless-ngx",
  "ar": "امسح الأوراق مرة واحدة ثم ابحث في كل مستند بنصه، مع قراءة النص العربي ضوئياً",
  "en": "Scan paper files once, then search every document by its text. Reads Arabic with OCR"
 },
 "payload": {
  "name": "Payload",
  "ar": "نظام محتوى وإطار تطبيقات لبناء مواقع وبوابات مخصصة للعملاء",
  "en": "Developer-friendly CMS and app framework for custom client websites and portals"
 },
 "penpot": {
  "name": "Penpot",
  "ar": "أداة تصميم ونماذج أولية بديلة لـ Figma للفرق عبر المتصفح",
  "en": "Design and prototyping tool (Figma alternative) for teams, in the browser"
 },
 "plane": {
  "name": "Plane",
  "ar": "إدارة مشاريع ومهام بديلة لـ Jira وAsana مع لوحات ودورات عمل ومستندات",
  "en": "Project and task management (Jira and Asana alternative) with boards, cycles and docs"
 },
 "plausible": {
  "name": "Plausible",
  "ar": "تحليلات مواقع خفيفة بدون كوكيز وتقارير في صفحة واحدة",
  "en": "Lightweight, cookie-free website analytics with one-page reports"
 },
 "posthog": {
  "name": "PostHog",
  "ar": "تحليلات المنتجات وتسجيل الجلسات واختبارات A/B للتطبيقات والمتاجر",
  "en": "Product analytics, session replays, A/B tests and feature flags for apps and stores"
 },
 "postiz": {
  "name": "Postiz",
  "ar": "جدولة ونشر المحتوى على إنستغرام وإكس ولينكدإن وتيك توك من تقويم واحد",
  "en": "Schedule and publish social posts to Instagram, X, LinkedIn, TikTok and more from one calendar, with AI help"
 },
 "presta": {
  "name": "PrestaShop",
  "ar": "منصة متجر إلكتروني متكاملة مع قوالب وإضافات ودعم عربي كامل",
  "en": "Full online store platform with themes, modules and Arabic right-to-left support"
 },
 "pretix": {
  "name": "pretix",
  "ar": "متجر تذاكر متكامل مع مخططات مقاعد وفترات زمنية وقسائم",
  "en": "Mature ticket shop with seating plans, time slots and vouchers"
 },
 "pwb": {
  "name": "Property Web Builder",
  "ar": "موقع عقاري مع قوائم العقارات والبحث ونماذج الاستفسار",
  "en": "Real-estate website with property listings, search and enquiry forms"
 },
 "qgis": {
  "name": "QGIS",
  "ar": "نظم معلومات جغرافية احترافية: خرائط، مسح مواقع، قطع أراضٍ وطبقات بيئية",
  "en": "Professional GIS: maps, site surveys, land plots and environmental layers"
 },
 "qlo": {
  "name": "QloApps",
  "ar": "محرك حجز فنادق وإقامات مع موقع وإدارة غرف وإضافات لمدير القنوات",
  "en": "Hotel and stay booking engine with website, room inventory and channel manager add-ons"
 },
 "rocket": {
  "name": "Rocket.Chat",
  "ar": "محادثات داخلية للفريق على خوادم الشركة، بديل لـ Slack",
  "en": "Internal team chat kept on company servers, a Slack alternative"
 },
 "rustdesk": {
  "name": "RustDesk",
  "ar": "دعم فني عن بعد لأجهزة العملاء، بديل TeamViewer على خادمك",
  "en": "Remote desktop support for client computers, a TeamViewer alternative on your own server"
 },
 "saleor": {
  "name": "Saleor",
  "ar": "تجارة قائمة على API للعلامات ذات الطلبات الكبيرة والقنوات المتعددة",
  "en": "API-first commerce for high-volume, multi-channel brands"
 },
 "serpbear": {
  "name": "SerpBear",
  "ar": "يتابع ترتيب العميل في Google لكلماته المستهدفة مع تقارير بالبريد",
  "en": "Tracks where a client ranks on Google for its keywords, with email reports"
 },
 "snipeit": {
  "name": "Snipe-IT",
  "ar": "سجل أصول: من يحمل أي جهاز أو معدة أو مركبة، مع الاستلام والتسليم والجرد",
  "en": "Asset register: who holds which laptop, tool or vehicle, with check-in, check-out and audits"
 },
 "speckle": {
  "name": "Speckle",
  "ar": "مشاركة نماذج BIM ثلاثية الأبعاد بين Revit وAutoCAD وغيرها، مع عارض ويب للمالك والمقاول",
  "en": "Shares BIM and 3D models between Revit, AutoCAD, Rhino and others, with a web viewer for owners and contractors"
 },
 "stirling": {
  "name": "Stirling PDF",
  "ar": "كل أعمال PDF في أداة خاصة: دمج، تقسيم، ضغط، توقيع، تعرف ضوئي وتحويل",
  "en": "Every PDF job in one private tool: merge, split, compress, sign, OCR and convert"
 },
 "strapi": {
  "name": "Strapi",
  "ar": "نظام إدارة محتوى للمواقع والتطبيقات بنسخة عربية وإنجليزية لكل صفحة",
  "en": "Content back-end for websites and apps, with Arabic and English versions of every page"
 },
 "superset": {
  "name": "Apache Superset",
  "ar": "ذكاء أعمال ولوحات بيانات على مستوى المؤسسات لفرق البيانات الكبيرة",
  "en": "Enterprise-grade BI and dashboards for larger data teams"
 },
 "tasty": {
  "name": "TastyIgniter",
  "ar": "طلبات أونلاين وحجز طاولات من موقع المطعم نفسه دون عمولة تطبيقات التوصيل",
  "en": "Online ordering and table reservations on the restaurant's own website, with no marketplace commission"
 },
 "teable": {
  "name": "Teable",
  "ar": "بديل Airtable للمتابعات والتطبيقات الخفيفة ويتحمل ملايين السجلات",
  "en": "Airtable alternative for trackers and lightweight apps that scales to millions of rows"
 },
 "thingsboard": {
  "name": "ThingsBoard",
  "ar": "منصة إنترنت أشياء تجمع بيانات الحساسات وتعرض لوحات وتنبيهات مباشرة",
  "en": "IoT platform that collects sensor data and shows live dashboards and alarms"
 },
 "tooljet": {
  "name": "ToolJet",
  "ar": "منصة بناء أدوات داخلية ومسارات عمل بأقل برمجة، مع منشئ تطبيقات بالذكاء الاصطناعي",
  "en": "Low-code builder for internal tools and workflows, with an AI app builder"
 },
 "traccar": {
  "name": "Traccar",
  "ar": "تتبع GPS للمركبات والموظفين: خريطة مباشرة، رحلات، سياج جغرافي وتنبيهات",
  "en": "GPS tracking for vehicles and staff: live map, trips, geofences and alerts. Works with 200+ tracker brands"
 },
 "twenty": {
  "name": "Twenty CRM",
  "ar": "نظام حديث لإدارة العملاء يتتبع العملاء المحتملين والصفقات والمحادثات بواجهة بسيطة",
  "en": "Modern CRM for tracking leads, deals and customer conversations, with a clean Notion-like interface"
 },
 "umami": {
  "name": "Umami",
  "ar": "تحليلات مواقع تحترم الخصوصية، بديل بسيط لـ Google Analytics",
  "en": "Privacy-friendly website analytics, a simple Google Analytics alternative"
 },
 "ury": {
  "name": "URY",
  "ar": "نظام مطاعم على ERPNext: نقطة بيع للصالة والسفري والتوصيل، شاشة مطبخ، وطلبات الطاولات من جوال النادل",
  "en": "Restaurant system on ERPNext: POS for dine-in, takeaway and delivery, kitchen display, table orders from waiters' phones"
 },
 "vault": {
  "name": "Vaultwarden",
  "ar": "مدير كلمات مرور للشركة متوافق مع تطبيقات Bitwarden، بدلاً من تداولها في المحادثات",
  "en": "Company password manager compatible with Bitwarden apps; stops passwords living in WhatsApp chats"
 },
 "vikunja": {
  "name": "Vikunja",
  "ar": "قوائم مهام ولوحات كانبان بسيطة للفرق الصغيرة",
  "en": "Simple to-do lists and Kanban boards for small teams"
 },
 "whisper": {
  "name": "Whisper",
  "ar": "تحويل المكالمات والاجتماعات والرسائل الصوتية المسجلة إلى نص، بما فيها العربية",
  "en": "Turns recorded calls, meetings and voice notes into text, Arabic included"
 },
 "windmill": {
  "name": "Windmill",
  "ar": "يحوّل السكربتات إلى مهام مجدولة ومسارات موافقة وتطبيقات داخلية صغيرة",
  "en": "Turns scripts into scheduled jobs, approval flows and small internal apps"
 },
 "woo": {
  "name": "WooCommerce",
  "ar": "أشهر محرك متاجر إلكترونية كإضافة ووردبريس، يدعم العربية وبوابات الدفع السعودية",
  "en": "The most used online store engine, as a WordPress plugin, with Arabic and Saudi payment gateways"
 },
 "xeokit": {
  "name": "xeokit SDK",
  "ar": "مكتبة برمجية لعرض نماذج BIM الكبيرة في المتصفح أو بوابة العميل",
  "en": "Developer kit for showing large BIM models in a web browser or client portal"
 },
 "xibo": {
  "name": "Xibo CMS",
  "ar": "شاشات عرض رقمية: قوائم الطعام والعروض وشاشات الانتظار من لوحة واحدة",
  "en": "Digital signage: menu boards, offers and queue screens managed from one dashboard"
 },
 "zammad": {
  "name": "Zammad",
  "ar": "نظام تذاكر ودعم فني للشكاوى والطلبات عبر البريد والهاتف والدردشة ووسائل التواصل",
  "en": "Help desk and ticketing for complaints and support requests across email, phone, chat and social"
 },
 "zatca": {
  "name": "KSA Compliance (ZATCA)",
  "ar": "الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك (المرحلة 1 و2) لنظام ERPNext",
  "en": "ZATCA e-invoicing Phase 1 and Phase 2 for ERPNext: QR codes, XML, simplified and standard invoices"
 }
}

export const sectors: Sector[] = [
 {
  "id": "core",
  "ar": "لكل الأعمال",
  "en": "Every business",
  "line": {
   "ar": "أرقامك موزّعة بين إكسل وواتساب والدفاتر؟ هنا الأساس: المحاسبة، والمبيعات، والموظفون، وخدمة العملاء في مكان واحد",
   "en": "Numbers scattered across Excel, WhatsApp and notebooks? This is the base: accounting, sales, staff and customer service in one place"
  },
  "apps": [
   "odoo",
   "erpnext",
   "dolibarr",
   "zatca",
   "bigcap",
   "invshelf",
   "krayin",
   "twenty",
   "espo",
   "fcrm",
   "hrms",
   "horilla",
   "chatwoot",
   "zammad",
   "helpdesk",
   "cal",
   "docuseal",
   "documenso",
   "opensign",
   "paperless",
   "stirling",
   "nextcloud",
   "onlyoffice",
   "plane",
   "openproject",
   "leantime",
   "huly",
   "vikunja",
   "metabase",
   "superset",
   "formbricks",
   "heyform",
   "snipeit",
   "kimai"
  ]
 },
 {
  "id": "ai",
  "ar": "الذكاء الاصطناعي والأتمتة",
  "en": "AI & automation",
  "line": {
   "ar": "تجيب عن الأسئلة نفسها كل يوم، وتنقل البيانات بين الأنظمة يدويًا؟ ذكاء اصطناعي خاص يعمل من ملفات شركتك، وأتمتة تُنهي العمل المكرّر",
   "en": "Answering the same questions daily and copying data by hand? Private AI that works from your own files, and automation that ends repetitive work"
  },
  "apps": [
   "anything",
   "librechat",
   "ollama",
   "whisper",
   "docling",
   "libretr",
   "activepieces",
   "windmill",
   "chatwoot",
   "paperless"
  ]
 },
 {
  "id": "apps",
  "ar": "التطبيقات الداخلية والمعرفة",
  "en": "Internal apps & knowledge",
  "line": {
   "ar": "إجراءات تعيش في رأس موظف واحد، وتضيع حين يغادر؟ دليل مكتوب للشركة، وتطبيقات داخلية صغيرة بدل ملفات إكسل الهشّة",
   "en": "Procedures that live in one person's head and leave with them? A written company manual, and small internal apps instead of fragile spreadsheets"
  },
  "apps": [
   "appsmith",
   "tooljet",
   "budibase",
   "grist",
   "teable",
   "bookstack",
   "docmost",
   "jitsi",
   "rocket",
   "strapi",
   "payload",
   "nextcloud",
   "onlyoffice"
  ]
 },
 {
  "id": "food",
  "ar": "المطاعم والمقاهي",
  "en": "Restaurants & cafes",
  "line": {
   "ar": "المكان مزدحم، والربح لا يعكس الزحمة؟ نقطة بيع تتابع الوصفات والهدر والمخزون، وطلبات من موقعك دون عمولة تطبيقات التوصيل",
   "en": "Busy every night, yet profit doesn't show it? A POS that tracks recipes, waste and stock, and orders from your own site with no delivery-app commission"
  },
  "apps": [
   "ury",
   "ospos",
   "tasty",
   "flpos",
   "xibo",
   "odoo",
   "formbricks",
   "chatwoot",
   "zatca"
  ]
 },
 {
  "id": "mkt",
  "ar": "وكالات التسويق",
  "en": "Marketing agencies",
  "line": {
   "ar": "ساعات عمل لا تُفوتَر، وتقرير العميل يأخذ يومًا كاملًا؟ جدولة المحتوى، وتقارير العملاء، وتتبّع الساعات في مكان واحد",
   "en": "Unbilled hours, and client reports that eat a whole day? Content scheduling, client reporting and time tracking in one place"
  },
  "apps": [
   "postiz",
   "mixpost",
   "mautic",
   "listmonk",
   "matomo",
   "umami",
   "plausible",
   "posthog",
   "serpbear",
   "ghost",
   "erxes",
   "penpot",
   "kimai",
   "plane",
   "twenty",
   "metabase",
   "heyform"
  ]
 },
 {
  "id": "build",
  "ar": "المقاولات والبناء",
  "en": "Construction",
  "line": {
   "ar": "تأخير في الموقع لا يصلك خبره إلا متأخرًا؟ جداول المشروع، ومستندات الموقع، والمعدات، ونماذج BIM مشتركة بين المكتب والموقع",
   "en": "Site delays you only hear about too late? Schedules, site documents, equipment and BIM models shared between office and site"
  },
  "apps": [
   "openproject",
   "speckle",
   "ifc",
   "freecad",
   "erpnext",
   "snipeit",
   "cmms",
   "paperless",
   "odk"
  ]
 },
 {
  "id": "law",
  "ar": "مكاتب المحاماة",
  "en": "Law firms",
  "line": {
   "ar": "وقت المحامي يضيع في صياغة المستندات والبحث عن الملفات؟ عقود تُنشأ آليًا، وملفات قضايا منظّمة، وتوقيع إلكتروني، وساعات فوترة",
   "en": "Lawyers' hours lost to drafting and hunting for files? Automated contracts, organised case files, e-signatures and billable hours"
  },
  "apps": [
   "docassemble",
   "espo",
   "paperless",
   "nextcloud",
   "onlyoffice",
   "docuseal",
   "kimai",
   "cal",
   "anything"
  ]
 },
 {
  "id": "beauty",
  "ar": "صالونات التجميل",
  "en": "Beauty salons",
  "line": {
   "ar": "مواعيد تُحجز ثم لا تحضر صاحبتها؟ حجز أونلاين بتقويم لكل موظفة، وتذكيرات تلقائية، ونقطة بيع للمنتجات",
   "en": "Bookings that never show up? Online booking with a calendar per stylist, automatic reminders, and a POS for retail products"
  },
  "apps": [
   "easyappt",
   "cal",
   "ospos",
   "chatwoot",
   "formbricks",
   "odoo"
  ]
 },
 {
  "id": "re",
  "ar": "التطوير والتسويق العقاري",
  "en": "Real estate",
  "line": {
   "ar": "عميل مهتم يضيع بين الاتصالات والمعاينات؟ موقع للوحدات، وجولات ⁦360°⁩، وإدارة للمشترين، وحجوزات موقّعة إلكترونيًا",
   "en": "Interested buyers lost between calls and viewings? A listings site, ⁦360°⁩ tours, buyer management and e-signed reservations"
  },
  "apps": [
   "pwb",
   "pannellum",
   "condo",
   "krayin",
   "twenty",
   "docuseal",
   "erpnext",
   "speckle",
   "strapi"
  ]
 },
 {
  "id": "ops",
  "ar": "شركات التشغيل",
  "en": "Operations companies",
  "line": {
   "ar": "لا تعرف أين فرقك ومركباتك الآن؟ الفرق الميدانية والمركبات والأصول والصيانة في شاشة واحدة",
   "en": "Not sure where your teams and vehicles are right now? Field teams, vehicles, assets and maintenance on one screen"
  },
  "apps": [
   "fleetbase",
   "traccar",
   "cmms",
   "openboxes",
   "snipeit",
   "plane",
   "activepieces",
   "metabase",
   "odk",
   "kuma"
  ]
 },
 {
  "id": "fac",
  "ar": "المصانع",
  "en": "Factories",
  "line": {
   "ar": "آلة تتوقف، ولا تعرف كم كلّفك توقفها؟ قوائم المواد، والمخزون، والصيانة الوقائية، وبيانات الآلات لحظة بلحظة",
   "en": "A machine stops and nobody knows what it cost? Bills of materials, stock, preventive maintenance and live machine data"
  },
  "apps": [
   "inventree",
   "cmms",
   "nodered",
   "thingsboard",
   "grafana",
   "erpnext",
   "odoo",
   "openboxes"
  ]
 },
 {
  "id": "eng",
  "ar": "مكاتب الإشراف الهندسي",
  "en": "Engineering supervision",
  "line": {
   "ar": "ملاحظات الإشراف ضائعة بين الرسائل والأوراق؟ مراجعة المخططات ونماذج BIM، وتوثيق زيارات الموقع، وأرشيف منظّم",
   "en": "Inspection notes lost between messages and paper? Drawing and BIM review, documented site visits and a clean archive"
  },
  "apps": [
   "speckle",
   "xeokit",
   "ifc",
   "qgis",
   "openproject",
   "odk",
   "nextcloud",
   "onlyoffice",
   "paperless",
   "kimai",
   "stirling"
  ]
 },
 {
  "id": "env",
  "ar": "الشركات البيئية",
  "en": "Environmental companies",
  "line": {
   "ar": "عينات ميدانية على الورق، وتقارير استدامة يطلبها المستثمر؟ جمع البيانات من الميدان، والخرائط، والحساسات، وحساب الكربون",
   "en": "Field samples on paper, and investors asking for ESG reports? Field data collection, maps, sensors and carbon accounting"
  },
  "apps": [
   "kobo",
   "odk",
   "qgis",
   "olca",
   "thingsboard",
   "grafana",
   "nodered",
   "metabase"
  ]
 },
 {
  "id": "np",
  "ar": "الجمعيات الخيرية",
  "en": "Charities",
  "line": {
   "ar": "المتبرّع يريد أن يرى الأثر، والفريق غارق في الجداول؟ إدارة المتبرّعين والمستفيدين، والمسوحات الميدانية، وتقارير شفافة",
   "en": "Donors want to see impact while the team drowns in spreadsheets? Donor and beneficiary management, field surveys and transparent reports"
  },
  "apps": [
   "civicrm",
   "kobo",
   "hievents",
   "erpnext",
   "listmonk",
   "formbricks",
   "metabase",
   "nextcloud"
  ]
 },
 {
  "id": "car",
  "ar": "تأجير السيارات",
  "en": "Car rentals",
  "line": {
   "ar": "خلاف على ضرر في السيارة، ولا دليل معك؟ حجز أونلاين، وتتبّع المركبات، والصيانة، وعقود تأجير موثّقة",
   "en": "A damage dispute and no proof? Online booking, vehicle tracking, maintenance and documented rental contracts"
  },
  "apps": [
   "bookcars",
   "lubelog",
   "traccar",
   "fleetbase",
   "docuseal",
   "odoo",
   "chatwoot"
  ]
 },
 {
  "id": "tour",
  "ar": "وكالات السياحة",
  "en": "Travel agencies",
  "line": {
   "ar": "العميل يسأل كثيرًا قبل أن يحجز؟ إدارة الرحلات والتذاكر والإقامات، ومعاينة الوجهة افتراضيًا قبل السفر",
   "en": "Clients ask a lot before they book? Trips, tickets and stays managed in one place, with virtual previews of the destination"
  },
  "apps": [
   "qlo",
   "hievents",
   "pretix",
   "pannellum",
   "chatwoot",
   "cal",
   "krayin",
   "libretr"
  ]
 },
 {
  "id": "rec",
  "ar": "مكاتب الاستقدام",
  "en": "Recruitment offices",
  "line": {
   "ar": "«وين وصل العامل؟» عشرات المرات يوميًا؟ ملفات المرشحين، ووثائق التأشيرات والجوازات، وتحديث الحالة لصاحب العمل",
   "en": "\"Where is my worker?\" dozens of times a day? Candidate files, visa and passport documents, and status updates for employers"
  },
  "apps": [
   "opencats",
   "orangehrm",
   "gauzy",
   "hrms",
   "horilla",
   "paperless",
   "docuseal",
   "chatwoot"
  ]
 },
 {
  "id": "kids",
  "ar": "الحضانات ورياض الأطفال",
  "en": "Nurseries & daycare",
  "line": {
   "ar": "الأهالي يريدون الاطمئنان طوال اليوم؟ التسجيل، والحضور، والتواصل مع أولياء الأمور، وألبوم صور خاص",
   "en": "Parents want reassurance all day? Enrolment, attendance, parent messaging and a private photo album"
  },
  "apps": [
   "gibbon",
   "fedu",
   "immich",
   "easyappt",
   "formbricks",
   "listmonk"
  ]
 },
 {
  "id": "shop",
  "ar": "المتاجر الإلكترونية",
  "en": "E-commerce",
  "line": {
   "ar": "زوّار كثيرون، وسلات تُترك قبل الدفع؟ متجر متكامل، ثم التحليلات، والبريد، وصندوق رسائل العملاء",
   "en": "Plenty of visitors, carts abandoned before checkout? A complete store, then analytics, email and a customer inbox"
  },
  "apps": [
   "woo",
   "bagisto",
   "presta",
   "medusa",
   "saleor",
   "umami",
   "matomo",
   "posthog",
   "listmonk",
   "chatwoot",
   "zatca",
   "strapi"
  ]
 },
 {
  "id": "clinic",
  "ar": "العيادات",
  "en": "Clinics",
  "line": {
   "ar": "ملفات ورقية، ومواعيد ينساها المرضى؟ ملفات المرضى، والحجوزات، والتذكير، والمتابعة دون ورق",
   "en": "Paper files and forgotten appointments? Patient records, bookings, reminders and follow-up without paper"
  },
  "apps": [
   "openemr",
   "cal",
   "formbricks",
   "chatwoot",
   "paperless"
  ]
 },
 {
  "id": "train",
  "ar": "مراكز التدريب والأكاديميات",
  "en": "Training & academies",
  "line": {
   "ar": "تدرّب كل موظف جديد من الصفر؟ دورات، واختبارات، وشهادات لعملائك أو لفريقك",
   "en": "Training every new hire from scratch? Courses, quizzes and certificates for your clients or your own team"
  },
  "apps": [
   "moodle",
   "flms",
   "hievents",
   "jitsi",
   "bookstack"
  ]
 },
 {
  "id": "care",
  "ar": "الاستضافة والدعم",
  "en": "Hosting & support",
  "line": {
   "ar": "من يتابع أنظمتك بعد أن تعمل؟ نستضيفها، ونراقبها، ونحفظ كلمات المرور، وندعم فريقك عن بُعد",
   "en": "Who looks after your systems once they're live? We host them, monitor them, keep passwords safe and support your team remotely"
  },
  "apps": [
   "coolify",
   "kuma",
   "vault",
   "rustdesk",
   "lago"
  ]
 }
]
