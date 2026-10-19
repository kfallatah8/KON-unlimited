import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { setLang, store } from './state/store'
import './styles/global.css'

// Arabic-first; English via the header switch or a link ending in #en.
setLang(store.get().lang)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
