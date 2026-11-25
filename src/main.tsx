import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setLang, store } from './state/store'
import './styles/global.css'
import './styles/elevate.css'
import './styles/prism.css'
import './styles/storm.css'
import './styles/solutions.css'
import './styles/codex.css'
import './styles/director.css'
import './styles/clean.css'
import './styles/clear.css'
import './styles/hl.css'
import './styles/consent.css'
import { initHighlights } from './lib/highlights'
import { initAnalytics } from './lib/analytics'
import { Consent } from './components/Consent'

// Every visit and every refresh opens at the very top: no restored scroll position and no jump
// to a #section left over in the address bar (#en / #ar and #/pages are kept).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (location.hash && !/^#(en|ar|\/)/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search)
const toTop = () => window.scrollTo(0, 0)
toTop()
window.addEventListener('load', toTop, { once: true })
window.addEventListener('pageshow', (e) => { if ((e as PageTransitionEvent).persisted) toTop() })

// Arabic-first; English via the header switch or a link ending in #en.
setLang(store.get().lang)

requestAnimationFrame(() => initHighlights())
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Consent />
  </StrictMode>,
)
