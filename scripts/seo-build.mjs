// KON SEO / AEO / GEO build step (runs after `vite build` and the SSR build).
// 1. Prerenders the homepage in Arabic (/) and English (/en/) so crawlers and AI engines that
//    do not run JavaScript read the full page.
// 2. Writes per-language <head>: title, description, canonical, hreflang, Open Graph, JSON-LD.
// 3. Writes robots.txt, sitemap.xml, llms.txt and llms-full.txt.
// Everything SEO lives in this file and src/seo/, so it stays separable from design work.
// Set SITE_URL (no trailing slash) when the custom domain is live, e.g. SITE_URL=https://kon-unlimited.com
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = (process.env.SITE_URL || 'https://konunlimited.vercel.app').replace(/\/$/, '')
const TODAY = new Date().toISOString().slice(0, 10)

// --- minimal browser globals so the app modules can be imported in Node (render only, no effects)
const mem = {}
globalThis.window = globalThis
globalThis.location = { hash: '', pathname: '/', search: '', href: SITE + '/' }
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v) }, removeItem: (k) => { delete mem[k] } }
globalThis.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} })

const ssr = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href)
const { render, content, contact, BOOKING_URL } = ssr

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const plain = (s) => String(s).replace(/\*\*|\+\+/g, '')

// ---------- page metadata (meta copy only; on-page copy is untouched) ----------
const META = {
  ar: {
    path: '/',
    locale: 'ar_SA',
    title: content.ar.meta.title,
    description: 'شركة استشارات أعمال سعودية تقرأ عملاءك وفريقك وقراراتك بعين أخصائي نفسي، ثم تنزل معك الميدان لين يتحرك الربح. احجز جلسة تشخيص مجانية 30 دقيقة',
    ogTitle: 'KON Unlimited · أرقامك تقول وش صار، واحنا نكشف ليش صار',
  },
  en: {
    path: '/en/',
    locale: 'en_US',
    title: content.en.meta.title,
    description: 'Saudi business consultancy that reads your customers, team and decisions with a psychologist’s eye, then works with you until profit moves. Free 30-min session',
    ogTitle: 'KON Unlimited · Your numbers tell you what happened. We find out why',
  },
}

// ---------- structured data (one @graph, shared ids across both languages) ----------
const ORG = `${SITE}/#org`, PERSON = `${SITE}/#founder`, WEBSITE = `${SITE}/#website`
function jsonld(lang) {
  const c = content[lang], m = META[lang], url = SITE + m.path
  const isAr = lang === 'ar'
  const services = c.services.items.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: s.title, description: plain(s.body), provider: { '@id': ORG }, areaServed: [{ '@type': 'Country', name: 'Saudi Arabia' }] },
  }))
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': ORG,
        name: 'KON Unlimited',
        alternateName: ['KON', 'كُن', 'كن أنلمتد'],
        url: SITE + '/',
        logo: { '@type': 'ImageObject', url: `${SITE}/logo.png`, width: 512, height: 512 },
        image: `${SITE}/og.jpg`,
        email: contact.email,
        slogan: 'Any challenge...Any way...Anywhere…We’ll be there',
        description: isAr
          ? 'استشارات أعمال وتشغيل وتطوير أعمال وابتكار، تبدأ من فهم الإنسان خلف الرقم: سلوك العميل وعقلية الموظف وقرارات الإدارة، ثم تنفيذ ميداني مع الفريق'
          : 'Business consulting, operations, business development and innovation that starts from the human behind the number: customer behaviour, employee mindset and management decisions, then hands-on work with the team',
        founder: { '@id': PERSON },
        address: { '@type': 'PostalAddress', addressLocality: isAr ? 'المدينة المنورة' : 'Madinah', addressCountry: 'SA' },
        areaServed: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'].map((code) => ({ '@type': 'Country', identifier: code, name: { SA: 'Saudi Arabia', AE: 'United Arab Emirates', KW: 'Kuwait', QA: 'Qatar', BH: 'Bahrain', OM: 'Oman' }[code] })),
        knowsLanguage: ['ar', 'en'],
        knowsAbout: isAr
          ? ['استشارات الأعمال', 'تطوير الأعمال', 'التشغيل وإجراءات العمل', 'استراتيجية دخول السوق', 'التسعير', 'تجربة العملاء', 'المتسوق الخفي', 'سلوك المستهلك', 'علم النفس التنظيمي', 'بيئات العمل الصحية', 'استشارات المطاعم والمقاهي', 'الذكاء الاصطناعي في الأعمال']
          : ['Business consulting', 'Business development', 'Operations and SOPs', 'Go-to-market strategy', 'Pricing', 'Customer experience', 'Mystery shopping', 'Consumer behaviour', 'Organisational psychology', 'Healthy work environments', 'Restaurant and café consulting', 'AI for business'],
        hasOfferCatalog: { '@type': 'OfferCatalog', name: isAr ? 'خدمات KON' : 'KON services', itemListElement: services },
        makesOffer: {
          '@type': 'Offer',
          name: isAr ? 'جلسة تشخيص مجانية 30 دقيقة' : 'Free 30-minute diagnosis session',
          description: c.offer.includes.join(isAr ? '، ' : ', '),
          price: '0',
          priceCurrency: 'SAR',
          url: BOOKING_URL || `${url}#start`,
          availability: 'https://schema.org/LimitedAvailability',
        },
        // sameAs: add the official LinkedIn, X, Instagram, Google Business Profile and Wikidata URLs here once confirmed
      },
      {
        '@type': 'Person',
        '@id': PERSON,
        name: isAr ? 'خالد' : 'Khalid',
        jobTitle: isAr ? 'المؤسس' : 'Founder',
        description: plain(c.founder.paragraphs[1]),
        worksFor: { '@id': ORG },
        knowsAbout: isAr
          ? ['علم النفس', 'سلوك المستهلك', 'أنماط الشخصية', 'التحليل السلوكي', 'تطوير الأعمال', 'تصميم الأنظمة', 'ريادة الأعمال', 'الابتكار']
          : ['Psychology', 'Consumer behaviour', 'Personality types', 'Behavioural analysis', 'Business development', 'Systems design', 'Entrepreneurship', 'Innovation'],
        url: `${url}#founder`,
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE,
        url: SITE + '/',
        name: 'KON Unlimited',
        inLanguage: ['ar', 'en'],
        publisher: { '@id': ORG },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: m.title,
        description: m.description,
        inLanguage: lang,
        isPartOf: { '@id': WEBSITE },
        about: { '@id': ORG },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/og.jpg`, width: 1200, height: 630 },
        dateModified: TODAY,
      },
    ],
  }
}

function head(lang) {
  const m = META[lang], url = SITE + m.path, other = lang === 'ar' ? 'en' : 'ar'
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="ar" href="${SITE}/" />`,
    `<link rel="alternate" hreflang="en" href="${SITE}/en/" />`,
    `<link rel="alternate" hreflang="x-default" href="${SITE}/" />`,
    `<link rel="alternate" type="text/markdown" title="llms.txt" href="${SITE}/llms.txt" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="KON Unlimited" />`,
    `<meta property="og:locale" content="${m.locale}" />`,
    `<meta property="og:locale:alternate" content="${META[other].locale}" />`,
    `<meta property="og:title" content="${esc(m.ogTitle)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/og.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="KON Unlimited" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.ogTitle)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${SITE}/og.jpg" />`,
    // without JavaScript nothing animates in, so show the prerendered page as it is
    `<noscript><style>.u-rise, [data-r] { opacity: 1 !important; transform: none !important; }</style></noscript>`,
    `<script type="application/ld+json">${JSON.stringify(jsonld(lang)).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

// ---------- write the two prerendered pages ----------
const template = readFileSync(join(dist, 'index.html'), 'utf8')
// remove the template's own SEO tags; this script owns them
const stripped = template
  .replace(/<title>[\s\S]*?<\/title>\s*/, '')
  .replace(/<meta (name|property)="(description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/g, '')

const pages = {}
for (const lang of ['ar', 'en']) {
  const body = render(lang)
  pages[lang] = body
  let html = stripped
    .replace(/<html[^>]*>/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace('<meta name="viewport"', `${head(lang)}\n    <meta name="viewport"`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (lang === 'en') {
    // /en/index.html lives one folder down: make asset links root-relative
    html = html.replace(/(href|src)="\.\//g, '$1="/')
    mkdirSync(join(dist, 'en'), { recursive: true })
    writeFileSync(join(dist, 'en', 'index.html'), html)
  } else {
    writeFileSync(join(dist, 'index.html'), html)
  }
}

// ---------- robots.txt ----------
writeFileSync(join(dist, 'robots.txt'), `# KON Unlimited
# Search engines and AI answer engines are welcome: we want to be found and cited.
User-agent: *
Allow: /
Disallow: /demos/

# AI search and answer engines (retrieval / citation)
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
Allow: /
Disallow: /demos/

# AI model training (allowed by default; change to "Disallow: /" to opt out)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
Allow: /
Disallow: /demos/

Sitemap: ${SITE}/sitemap.xml
`)

// ---------- sitemap.xml (with hreflang pairs) ----------
const alt = `<xhtml:link rel="alternate" hreflang="ar" href="${SITE}/"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod>${alt}</url>
  <url><loc>${SITE}/en/</loc><lastmod>${TODAY}</lastmod>${alt}</url>
</urlset>
`)

// ---------- llms.txt (short, curated) and llms-full.txt (whole page text) ----------
const en = content.en, ar = content.ar
const cases = (c) => c.work.featured.filter((w) => w.metric).map((w) => `- ${w.title}: ${w.metric} ${w.metricLabel}${w.extra ? ` (${w.extra})` : ''}`).join('\n')
writeFileSync(join(dist, 'llms.txt'), `# KON Unlimited (كُن)

> KON Unlimited is a Saudi business consultancy, Arabic first, serving owners, managers, restaurants and cafés, founders and investors across Saudi Arabia and the GCC. It reads the human behind the numbers (customer behaviour, employee mindset, management decisions) with a psychologist's eye, then works on the ground with the team until profit moves. Fees are tied to results, agreed in writing. The first step is a free 30-minute diagnosis session.

Slogan: "Any challenge...Any way...Anywhere…We’ll be there"

## Pages
- [Home, Arabic](${SITE}/): the main site (Arabic)
- [Home, English](${SITE}/en/): the same content in English
- [Full page text](${SITE}/llms-full.txt): the whole homepage as plain text, Arabic and English
- [Book a free session](${BOOKING_URL}): 30 minutes, free, no commitment

## Services
${en.services.items.map((s, i) => `- ${s.title} (${ar.services.items[i].title}): ${plain(s.body)}`).join('\n')}

## Free first session
${en.offer.includes.map((x) => `- ${x}`).join('\n')}
- ${plain(en.offer.value)}

## How KON works
1. Read: a free diagnosis session across eight dimensions, ending with the top 3 opportunities
2. Plan: a clear written plan of where profit leaks and what to stop
3. Build: hands-on work and team training until the new way is a daily habit, with fees tied to results

## Results (from the site, real numbers)
${cases(en)}

## Founder
- Khalid, founder: ${plain(en.founder.paragraphs[1])}
- ${plain(en.founder.paragraphs[0])}
- ${plain(en.founder.paragraphs[2])}

## Free support initiative
- ${plain(en.support.body)}

## Contact
- [Email](mailto:${contact.email}): ${contact.email}
- [Book a free session](${BOOKING_URL}): pick a time for the 30-minute diagnosis
- Based in Madinah, Saudi Arabia; works across Saudi Arabia, the GCC and remotely
- Languages: Arabic, English
`)

const toText = (html) => html
  .replace(/<(script|style|svg|canvas|form)[\s\S]*?<\/\1>/g, '')
  .replace(/<h1[^>]*>/g, '\n\n# ').replace(/<h2[^>]*>/g, '\n\n## ').replace(/<h3[^>]*>/g, '\n\n### ')
  .replace(/<\/(h[1-6]|p|li|div|section|header|footer|nav|summary|details|a|button)>/g, '\n')
  .replace(/<br\s*\/?>/g, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim()
writeFileSync(join(dist, 'llms-full.txt'), `# KON Unlimited: full homepage text

Source: ${SITE}/ (Arabic) and ${SITE}/en/ (English). Updated ${TODAY}.

---

# English

${toText(pages.en)}

---

# العربية

${toText(pages.ar)}
`)

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`SEO build done for ${SITE}: /, /en/, robots.txt, sitemap.xml, llms.txt, llms-full.txt`)
