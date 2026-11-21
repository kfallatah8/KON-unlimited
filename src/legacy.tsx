// The inner pages (#/talent, #/solutions, #/work) still run on the live site's app and styles.
// This module is loaded only when one of them is opened, so the home page never pays for it.
import { StrictMode } from 'react'
import type { Root } from 'react-dom/client'
import App from './App'
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
import { initHighlights } from './lib/highlights'

export function mountLegacy(root: Root) {
  requestAnimationFrame(() => initHighlights())
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
