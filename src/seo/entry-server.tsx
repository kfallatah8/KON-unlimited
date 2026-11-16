// Build-time only: renders the homepage to static HTML so search engines and AI crawlers
// that do not run JavaScript can read the full page. Never shipped to the browser.
import { renderToString } from 'react-dom/server'
import Home from '../ultimate/Home'
import { store } from '../state/store'
import type { Lang } from '../content/site'

export function render(lang: Lang): string {
  store.set({ lang })
  return renderToString(<Home />)
}

export { content, contact, BOOKING_URL } from '../content/site'
