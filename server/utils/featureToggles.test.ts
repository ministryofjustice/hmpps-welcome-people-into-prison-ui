import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import newXRayBodyScansEnabled from './featureToggles'

describe('featureToggles', () => {
  describe('newXRayBodyScansEnabled', () => {
    afterEach(() => {
      config.featureToggles.newXRayBodyScansEnabledPrisons = []
      config.featureToggles.newXRayBodyScansEnabledFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(newXRayBodyScansEnabled('KMI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed', () => {
      config.featureToggles.newXRayBodyScansEnabledPrisons = ['MDI']
      config.featureToggles.newXRayBodyScansEnabledFrom = formatISO(subMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('KMI')).toBeFalsy()
    })

    it('is not enabled if now is before the feature start date', () => {
      config.featureToggles.newXRayBodyScansEnabledPrisons = ['KMI']
      config.featureToggles.newXRayBodyScansEnabledFrom = formatISO(addMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('KMI')).toBeFalsy()
    })

    it('is enabled if now is after the start date and prison is in the list', () => {
      config.featureToggles.newXRayBodyScansEnabledPrisons = ['KMI']
      config.featureToggles.newXRayBodyScansEnabledFrom = formatISO(subMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('KMI')).toBeTruthy()
    })

    it('is enabled for all prisons when wildcard is set', () => {
      config.featureToggles.newXRayBodyScansEnabledPrisons = ['***']
      config.featureToggles.newXRayBodyScansEnabledFrom = formatISO(subMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('KMI')).toBeTruthy()
      expect(newXRayBodyScansEnabled('MDI')).toBeTruthy()
    })
  })
})
