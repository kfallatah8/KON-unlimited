import posthog from 'posthog-js'

const posthogKey = import.meta.env.VITE_POSTHOG_KEY
const posthogHost = import.meta.env.VITE_POSTHOG_HOST

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

if (!posthogKey) {
  if (import.meta.env.DEV) {
    throw new Error('VITE_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_KEY is configured')
  }
} else if (!posthogHost) {
  if (import.meta.env.DEV) {
    throw new Error('VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured')
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
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
