// Live demos for the "Ready-made services" section.
//
// To add a demo: copy one entry below, set `service` to the service it belongs to,
// give it a title in both languages and a `url`. A thumbnail is optional: drop an image
// in src/assets/demos/ and import it here. Without one, the card shows a KON gem instead.
//
// url        where visitors go (opens in a new tab). Paths starting with `demos/` are
//            self-hosted copies in public/demos/ on the live site.
// previewUrl optional: used only in the single-file claude.ai preview, where the
//            self-hosted paths don't exist yet.
// embed      true for a ⁦360°⁩ tour that can load inside the page (live site only).

import type { ServiceId } from './site'
import { tourUrl } from './site'
import thumbClassic from '../assets/demos/classic.webp'
import thumbTeal from '../assets/demos/teal.webp'
import thumbAurora from '../assets/demos/aurora.webp'

export interface Demo {
  service: ServiceId
  title: { ar: string; en: string }
  note?: { ar: string; en: string }
  url: string
  previewUrl?: string
  thumb?: string
  embed?: boolean
}

export const demos: Demo[] = [
  {
    service: 'tours',
    title: { ar: 'جولة داخل فيلا سكنية', en: 'Walk through a villa' },
    note: { ar: 'جولة ⁦360°⁩ تفاعلية بين الغرف', en: 'Interactive ⁦360°⁩ tour, room to room' },
    url: tourUrl,
    embed: true,
  },
  {
    service: 'maps',
    title: { ar: 'جرّب تجربة ⁦360°⁩ بنفسك', en: 'Try a ⁦360°⁩ experience yourself' },
    note: { ar: 'مثال من مشاريعنا: تنقّل بين الغرف كما يتنقّل عميلك داخل مكانك', en: 'An example from our work: move between rooms the way your customer will move through your place' },
    url: tourUrl,
    embed: true,
  },
  {
    service: 'web',
    title: { ar: 'الكلاسيكي الداكن', en: 'Dark Classic' },
    note: { ar: 'تصميم سابق لموقع KON، بلمسة شمبانيا', en: 'An earlier KON site, champagne accents' },
    url: 'demos/classic/',
    previewUrl: 'https://claude.ai/artifact/1fawhzqNNYNdFNDFidkKtG',
    thumb: thumbClassic,
  },
  {
    service: 'web',
    title: { ar: 'الفيروزي الملكي', en: 'Royal Teal' },
    note: { ar: 'تصميم مقترح لموقع KON، فيروزي وعاجي ونحاسي', en: 'A KON site concept in teal, ivory and brass' },
    url: 'demos/teal/',
    previewUrl: 'https://claude.ai/artifact/BpcKrGVRkdFN95EQGwKtBe',
    thumb: thumbTeal,
  },
  {
    service: 'web',
    title: { ar: 'الشفق', en: 'Aurora' },
    note: { ar: 'تصميم مقترح لموقع KON، بمؤثرات ضوئية حيّة', en: 'A KON site concept with live light shaders' },
    url: 'demos/aurora/',
    previewUrl: 'https://claude.ai/artifact/GA1cTWVAG9b9z2KUFZEZ4D',
    thumb: thumbAurora,
  },
]
