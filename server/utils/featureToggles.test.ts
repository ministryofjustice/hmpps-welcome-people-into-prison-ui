import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import editProfileEnabled from './featureToggles'

describe('featureToggles', () => {
  describe('editProfileEnabled', () => {
    afterEach(() => {
      config.featureToggles.editProfileEnabledPrisons = []
      config.featureToggles.editProfileEnabledFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(editProfileEnabled('ABC')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed', () => {
      config.featureToggles.editProfileEnabledPrisons = ['DEF']
      config.featureToggles.editProfileEnabledFrom = formatISO(subMinutes(Date.now(), 1))

      expect(editProfileEnabled('ABC')).toBeFalsy()
    })

    it('is not enabled if now is before the feature start date', () => {
      config.featureToggles.editProfileEnabledPrisons = ['ABC']
      config.featureToggles.editProfileEnabledFrom = formatISO(addMinutes(Date.now(), 1))

      expect(editProfileEnabled('ABC')).toBeFalsy()
    })

    it('is enabled if now is after the start date and prison is in the list', () => {
      config.featureToggles.editProfileEnabledPrisons = ['ABC']
      config.featureToggles.editProfileEnabledFrom = formatISO(subMinutes(Date.now(), 1))

      expect(editProfileEnabled('ABC')).toBeTruthy()
    })
  })
})
