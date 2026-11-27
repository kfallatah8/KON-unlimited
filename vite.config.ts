import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build` → normal code-split build (lazy 3D chunks) for real hosting.
// `vite build --mode single` → one self-contained HTML file for previews.
// `vite build --mode card` → the digital business card as one self-contained HTML file (previews).
// The normal build also emits card.html (served at /card/<name> by vercel.json).
// Starts downloading the 3D chunk alongside the main bundle instead of after it has run,
// so the gems are ready sooner after the page opens.
const preload3d: Plugin = {
  name: 'preload-3d',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(_html, ctx) {
      if (ctx.path.includes('card')) return []
      const chunk = Object.values(ctx.bundle ?? {}).find((c) => c.type === 'chunk' && c.name === 'GemField')
      return chunk ? [{ tag: 'link', attrs: { rel: 'modulepreload', href: './' + chunk.fileName, crossorigin: '' }, injectTo: 'head' }] : []
    },
  },
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' || mode === 'card' ? [viteSingleFile()] : [preload3d])],
  base: './',
  build: {
    outDir: mode === 'single' ? 'dist-single' : mode === 'card' ? 'dist-card' : 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      input: (mode === 'card' ? { card: 'card.html' } : mode === 'single' ? { main: 'index.html' } : { main: 'index.html', card: 'card.html' }) as Record<string, string>,
    },
  },
}))
