import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setLang, store } from './state/store'
import { Home } from './freedom/Home'
import './freedom/freedom.css'

// Arabic-first; English via the header switch or a link ending in #en.
setLang(store.get().lang)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const isRoute = () => location.hash.startsWith('#/')
const root = createRoot(document.getElementById('root')!)

if (isRoute()) {
  document.documentElement.classList.add('legacy')
  import('./legacy').then((m) => m.mountLegacy(root))
} else {
  window.scrollTo(0, 0)
  root.render(
    <StrictMode>
      <Home />
    </StrictMode>,
  )
}

// Moving between the home page and an inner page swaps the whole app.
let wasRoute = isRoute()
addEventListener('hashchange', () => {
  const now = isRoute()
  if (now !== wasRoute) location.reload()
  wasRoute = now
})
