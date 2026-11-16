import { StrictMode, Suspense, lazy, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Home from './ultimate/Home'
import { setLang, store } from './state/store'
import './ultimate/kit.css'
import './ultimate/ultimate.css'
import './styles/hl.css'
import { initHighlights } from './lib/highlights'

// The inner pages still run on the previous shell, loaded only when one is opened.
const Legacy = lazy(() => import('./App'))
const INNER = ['solutions', 'talent', 'work']
const readRoute = () => (location.hash.startsWith('#/') ? location.hash.slice(2) : '')

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// A link like /#start lands on its section (it used to be stripped and sent to the top).
function landOnHash() {
  const h = location.hash
  if (!h || h.length < 2 || h.startsWith('#/') || /^#(en|ar)$/.test(h)) { window.scrollTo(0, 0); return }
  const go = () => document.getElementById(decodeURIComponent(h.slice(1)))?.scrollIntoView({ block: 'start' })
  requestAnimationFrame(() => requestAnimationFrame(go))
  // fonts and the form can shift the layout a little after first paint
  document.fonts?.ready.then(() => setTimeout(go, 60))
}

function Root() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const on = () => {
      const r = readRoute()
      if (INNER.includes(route) && !INNER.includes(r)) { location.reload(); return }
      setRoute(r)
      if (INNER.includes(r)) window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [route])
  useEffect(() => { if (!INNER.includes(route)) landOnHash() }, [])
  if (INNER.includes(route)) return <Suspense fallback={<div className="u-loading" />}><Legacy /></Suspense>
  return <Home />
}

// Arabic first; English via the header switch or a link ending in #en.
setLang(store.get().lang)
requestAnimationFrame(() => initHighlights())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
