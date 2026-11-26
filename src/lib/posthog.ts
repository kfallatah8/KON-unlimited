import posthog from 'posthog-js'

// The project token is public by design (it only allows sending events), so the live site
// works without extra Vercel settings. Env vars still override it for other projects.
const posthogKey = import.meta.env.VITE_POSTHOG_KEY || 'phc_mLXSGo6Cr8nB29UwLJMzAxwjAzEXioSGhHivMemqtPqu'
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com'

export const isPostHogConfigured = Boolean(posthogKey && posthogHost)

type PostHogLogAttributes = Record<string, string | number | boolean>

export const posthogLogger = {
  info(message: string, attributes: PostHogLogAttributes) {
    if (isPostHogConfigured) posthog.logger.info(message, attributes)
  },
  warn(message: string, attributes: PostHogLogAttributes) {
    if (isPostHogConfigured) posthog.logger.warn(message, attributes)
  },
}

// Noise from in-app browsers (Instagram / Snapchat / Facebook WebViews), not from our code.
const IGNORED_ERRORS = [/Java object is gone/i, /^Script error\.?$/i, /ResizeObserver loop/i]

if (isPostHogConfigured) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-05-24',
    // Every visitor gets a profile, so behaviour can be read per person and personalised later.
    person_profiles: 'always',
    autocapture: true,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    capture_dead_clicks: true,
    rageclick: true,
    enable_heatmaps: true,
    capture_performance: { web_vitals: true, network_timing: true },
    enable_recording_console_log: true,
    session_recording: {
      // Typed values (names, phones, emails) never leave the browser; page text stays readable.
      maskAllInputs: true,
      recordCrossOriginIframes: false,
    },
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    before_send: (e) => {
      if (e?.event === '$exception') {
        const vals = (e.properties?.$exception_values as string[] | undefined) ?? []
        if (vals.length && vals.every((v) => IGNORED_ERRORS.some((r) => r.test(v)))) return null
      }
      return e
    },
    logs: {
      serviceName: 'kon-unlimited-web',
      environment: import.meta.env.MODE,
    },
  })
  posthogLogger.info('application_initialized', {
    event: 'application_initialized',
    runtime: 'browser',
  })
}

export { posthog }
