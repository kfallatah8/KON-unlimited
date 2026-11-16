# KON Ultimate: creative direction (elite-creative-director gates)

Branch `kon-ultimate`, built from `kon-glass` (6c2e59d). Main/live untouched.

## G0 Evidence (PASS WITH RISKS)
- Inspected: kon-glass source, its content (`src/content/site.ts`), the KON Glass audit (11/20) and project memory (locked wording, palette, slogan rules).
- Not available: the skill's 6 reference files (not found in `~/.agents/skills` or `~/Downloads` on khalid's Mac); worked from the skill's core contract and gates.
- Assumptions: illustrative "beneath the number" patterns are labelled as patterns, not client cases. All case numbers come from site.ts.

## G1 Strategy (PASS)
- Audience: GCC owners and managers, founders, investors. Arabic first, English second.
- Page job: make the visitor feel understood ("they see what's under my numbers"), prove it with real numbers, and book the free 30-minute session.
- One conversion path: any CTA -> `#start` -> 4-step onboarding -> Calendly. One label everywhere: «احجز جلستك المجانية» / "Book your free session".
- Success signals: booking reached at ~60% depth (was ~85%), CTA visible in the first phone screen in both languages, page ~10 phone screens (was ~19).

## G1 Thesis
"Beneath the number" (خلف الرقم). KON's real edge is a psychologist who reads the human decision behind every number, then works in the field. The page itself behaves like that diagnosis:
1. Hero: a dark royal-teal fluid with a lens that drifts (or follows the finger / tilt). Inside the lens the surface turns to crystal: what is under the surface.
2. X-ray cards: each card shows the symptom on the surface; as it reaches the reading line a wipe reveals the human cause beneath and how we fix it. Replays on scroll down, resets on scroll up (same rule as the highlights).
3. Pressure: coal turns into a teal diamond as you scroll (the brand's coal-to-diamond belief) in one short, quiet moment instead of a 3,400px interlude.

## G2 Direction (PASS)
Order: Hero -> Problem (locked, persona chips open the form pre-filled) -> Beneath the number -> Method (3 steps, fees tied to results) -> Work (real numbers) -> Pressure moment -> Services -> Tools teaser -> Founder (locked) -> Start (offer + onboarding + Calendly) -> Support (sadaqa) -> Talent -> Footer (glass KON, slogan, email).
Visual system: one stylesheet (`src/ultimate/ultimate.css`) on the home page; legacy sheets load only for inner pages. Royal deep teal, aqua accents only on meaning, no gold, no red, glow budget: lens + the gem moment only. Type: Readex Pro display, IBM Plex Sans Arabic / IBM Plex Sans body, body 17-18px, min 14px.
States: reduced motion (everything static, highlights shown), no WebGL (CSS gradient), RTL/LTR, phone dock CTA with reserved space, hidden at the form and the footer.

## Audit fixes covered
sticky bar reserved space; anchors (/#start) now scroll to the section; page length; one CTA name; EN hero CTA above the fold; 10 stylesheets -> 1 (+hl.css, +20KB extracted kit for onboarding and glass KON); contrast; glow budget; +161% everywhere.
