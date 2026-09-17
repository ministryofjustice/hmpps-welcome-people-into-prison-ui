import { isAfter } from 'date-fns'
import config from '../config'

const newXRayBodyScansEnabled = (activeCaseLoadId: string) => {
  const prisons = config.featureToggles.newXRayBodyScansEnabledPrisons as string[]
  return (
    isAfter(Date.now(), config.featureToggles.newXRayBodyScansEnabledFrom) &&
    (prisons.includes('***') || prisons.includes(activeCaseLoadId))
  )
}

export default newXRayBodyScansEnabled
