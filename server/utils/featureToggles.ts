import { isAfter } from 'date-fns'
import config from '../config'

type FeatureFlagMethod = (activeCaseLoadId?: string) => boolean

interface ScheduledFeatureFlag {
  enabledPrisons: string[]
  enabledPrisonsByDate: string[]
  enabledPrisonsFrom: string
}

const scheduledFeatureFlag =
  (scheduledFeatureFlagConfig: ScheduledFeatureFlag): FeatureFlagMethod =>
  (activeCaseLoadId: string) => {
    const { enabledPrisons, enabledPrisonsByDate, enabledPrisonsFrom } = scheduledFeatureFlagConfig

    return (
      enabledPrisons.includes(activeCaseLoadId) ||
      enabledPrisons.includes('***') ||
      (isAfter(Date.now(), enabledPrisonsFrom) &&
        (enabledPrisonsByDate.includes(activeCaseLoadId) || enabledPrisonsByDate.includes('***')))
    )
  }

const newXRayBodyScansEnabled: FeatureFlagMethod = scheduledFeatureFlag(config.featureToggles.newXRayBodyScans)

export default newXRayBodyScansEnabled
