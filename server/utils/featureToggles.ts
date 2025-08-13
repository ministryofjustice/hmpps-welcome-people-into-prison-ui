import { isAfter } from 'date-fns'
import config from '../config'

const editProfileEnabled = (activeCaseLoadId: string) =>
  isAfter(Date.now(), config.featureToggles.editProfileEnabledFrom) &&
  config.featureToggles.editProfileEnabledPrisons.includes(activeCaseLoadId)

export default editProfileEnabled
