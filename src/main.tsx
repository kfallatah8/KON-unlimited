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

// Arabic-first; English via the header switch or a link ending in #en.
setLang(store.get().lang)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
