# KON SEO / AEO / GEO layer (branch kon-seo)

Built on kon-ultimate. Design and on-page copy are unchanged; every change here is crawlability,
metadata or structure. Plan and backlog: see the "KON SEO, AEO and GEO plan" artifact.

## What ships
- Prerendered HTML for `/` (Arabic) and `/en/` (English): `src/seo/entry-server.tsx` renders the
  homepage with React on the build machine; `scripts/seo-build.mjs` writes it into `dist/`.
  Crawlers and AI engines that don't run JavaScript now read the whole page. The browser still
  mounts the app as before (same DOM, so no flash). Without JS, a `<noscript>` style shows everything.
- Per-language head: title, description, canonical, hreflang (ar, en, x-default), Open Graph,
  Twitter card, robots directives, link to llms.txt.
- JSON-LD @graph: Organization + ProfessionalService (services as OfferCatalog, free session as
  Offer at 0 SAR, Madinah, GCC area served), Person (founder), WebSite, WebPage.
- robots.txt (search + AI answer engines allowed, /demos/ excluded), sitemap.xml with hreflang,
  llms.txt (curated facts) and llms-full.txt (full page text, AR + EN).
- `/en/` is a real address. The language switch is now a link (looks the same) and keeps the URL
  in step with the language. `/#en` still works.
- Founder eyebrow is an `<h2>` (same look) so the founder section has a heading.
- Page titles (`meta.title` in site.ts) now carry the search terms.
- vercel.json: trailing slashes, one-year immutable cache on hashed /assets.

## Settings
- `SITE_URL` env var (default https://konunlimited.vercel.app). Set it in Vercel to the custom
  domain before go-live, e.g. `SITE_URL=https://kon-unlimited.com`.
- Add `sameAs` profile links in `scripts/seo-build.mjs` once confirmed.

## Re-run the audit
`node <claude-seo-ai>/scripts/audit.mjs https://<site>/ --pages 4 --render static --vertical local-business`
The remaining `M5.article.missing` finding is a false positive for a service homepage.
