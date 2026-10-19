# KON Unlimited — immersive 3D website

Arabic-first (RTL) website with a full English edition (header switch, or a link ending in `#en`) built around one idea: **every business is an interconnected system**.
A single procedural 3D "business system" carries the whole narrative, from complexity to clarity.

## Stack
React 19 · TypeScript · Vite · Three.js · React Three Fiber · Drei · React Three Postprocessing · GSAP · Lenis

## Run
```bash
npm install
npm run dev            # local dev server
npm run build          # production build, code-split (3D loads as lazy chunks) → dist/
npm run build:single   # one self-contained HTML file for previews → dist-single/
```
QA override: append `?tier=high|mid|low|none` to force a rendering tier.

## Architecture
| Concern | Where |
|---|---|
| Content: Arabic + English copy, dimensions, cases, asset slots | `src/content/site.ts` |
| Interaction state (hover/select), shared DOM ↔ 3D | `src/state/store.ts` |
| Device capability → tier | `src/lib/capabilities.ts` |
| Animation logic: formations (poses), camera keyframes | `src/three/formations.ts` |
| Scroll → formation index (no scroll-jacking) | `src/three/TransformationSequence.tsx` |
| Rendering of the system | `src/three/BusinessSystemModel.tsx` |
| Camera controls (formation camera, parallax, diagnostic focus) | `src/three/CameraRig.tsx` |
| Lighting / materials (one shared art direction) | `src/three/SceneLighting.tsx`, `src/three/materials.ts` |
| WebGL stage (lazy, adaptive DPR, post FX on high tier) | `src/three/Hero3DScene.tsx` |
| Case-study 3D (phone, architectural model) | `src/three/ProjectDeviceShowcase.tsx` |
| Diagnostic framework (accessible HTML interface) | `src/components/DiagnosticVisualization.tsx` |
| Intro, smooth scroll, cursor, text reveals | `src/components/Intro.tsx`, `SmoothScroll.tsx`, `Cursor.tsx`, `SplitReveal.tsx` |
| Static fallback | `src/components/SceneFallback.tsx` |

## Real assets still needed
Set these in `src/content/site.ts → media`:
- `auraScreens`: Aura app screenshots (portrait PNG/JPG). Until then the phone shows marked placeholders.
- `tourUrl`: embeddable 360° virtual tour link. Until then the tour panel shows a marked placeholder.
- GamesCraft figures: the chart is marked "illustrative data" until real numbers are provided.
- Services and process sections, and 7 of 8 diagnostic dimension texts, are proposed copy for KON review.

See `docs/CONCEPT.md` for the creative concept and art direction.
