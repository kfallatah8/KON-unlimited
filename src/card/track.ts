// Card analytics on the live site only (same PostHog project as the homepage): which card was
// opened, and which button was used. Nothing is sent from previews.
type Props = Record<string, string>
let ph: Promise<{ capture: (e: string, p: Props) => void } | null> | null = null

function client() {
  if (import.meta.env.MODE === 'card' || !/kon-unlimited\.com|vercel\.app/.test(location.host)) return Promise.resolve(null)
  ph ??= import('posthog-js').then(({ default: posthog }) => {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_mLXSGo6Cr8nB29UwLJMzAxwjAzEXioSGhHivMemqtPqu', {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      autocapture: false,
      capture_pageview: true,
      disable_session_recording: true,
    })
    return posthog
  }).catch(() => null)
  return ph
}

export function track(event: string, props: Props) {
  const src = new URLSearchParams(location.search).get('src') || 'direct'
  client().then((p) => p?.capture(event, { ...props, src }))
}
