import posthog from 'posthog-js'

const posthogKey = import.meta.env.VITE_POSTHOG_KEY
const posthogHost = import.meta.env.VITE_POSTHOG_HOST
const posthogConfigured = Boolean(posthogKey && posthogHost)

type LogAttributes = Record<string, string | number | boolean>

if (posthogConfigured) {
  posthog.init(posthogKey!, {
    api_host: posthogHost!,
    defaults: '2026-08-30',
    capture_exceptions: true,
    logs: {
      serviceName: 'kon-unlimited-web',
      environment: import.meta.env.MODE,
    },
  })
} else if (import.meta.env.DEV) {
  const missingVariable = !posthogKey ? 'VITE_POSTHOG_KEY' : 'VITE_POSTHOG_HOST'
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  )
}

export function capture(eventName: string, properties?: Record<string, unknown>) {
  if (posthogConfigured) posthog.capture(eventName, properties)
}

export const posthogLog = {
  info: (message: string, attributes: LogAttributes) => {
    if (posthogConfigured) posthog.logger.info(message, attributes)
  },
  error: (message: string, attributes: LogAttributes) => {
    if (posthogConfigured) posthog.logger.error(message, attributes)
  },
}

export default posthog
