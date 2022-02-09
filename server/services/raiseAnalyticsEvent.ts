import ua from 'universal-analytics'
import config from '../config'

export const raiseAnalyticsEvent = (
  category: string,
  action: string,
  label: string,
  hostname: string
): void | Promise<void> => {
  if (!config.analytics.googleAnalyticsId) return Promise.resolve()
  const ga = ua(config.analytics.googleAnalyticsId)
  const data = {
    ec: category,
    ea: action,
    el: label,
    dh: hostname,
  }

  return ga.event(data).send()
}

export type RaiseAnalyticsEvent = typeof raiseAnalyticsEvent
