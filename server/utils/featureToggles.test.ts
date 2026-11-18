import { addMinutes, formatISO, subMinutes } from 'date-fns'
import config from '../config'
import newXRayBodyScansEnabled from './featureToggles'

describe('featureToggles', () => {
  describe('newXRayBodyScansEnabled', () => {
    afterEach(() => {
      // reset to defaults:
      config.featureToggles.newXRayBodyScans.enabledPrisons = []
      config.featureToggles.newXRayBodyScans.enabledPrisonsByDate = []
      config.featureToggles.newXRayBodyScans.enabledPrisonsFrom = '2099-01-01T00:00:00'
    })

    it('is not enabled by default', () => {
      expect(newXRayBodyScansEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not listed as permanently enabled', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisons = ['LEI']

      expect(newXRayBodyScansEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if active case load is not enabled by date', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisonsByDate = ['LEI']
      config.featureToggles.newXRayBodyScans.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 0))

      expect(newXRayBodyScansEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisonsByDate = ['MDI']
      config.featureToggles.newXRayBodyScans.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('MDI')).toBeFalsy()
    })

    it('is not enabled if now is before the from datetime, even when wildcard used', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisonsByDate = ['***']
      config.featureToggles.newXRayBodyScans.enabledPrisonsFrom = formatISO(addMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('MDI')).toBeFalsy()
    })

    it('enabled if active case load is listed as permanently enabled', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisons = ['MDI']

      expect(newXRayBodyScansEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard used in list of permanently enabled', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisons = ['***']

      expect(newXRayBodyScansEnabled('MDI')).toBeTruthy()
    })

    it('enabled if active case load is listed as enabled after date', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisonsByDate = ['MDI']
      config.featureToggles.newXRayBodyScans.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('MDI')).toBeTruthy()
    })

    it('enabled if wildcard is listed as enabled after date', () => {
      config.featureToggles.newXRayBodyScans.enabledPrisonsByDate = ['***']
      config.featureToggles.newXRayBodyScans.enabledPrisonsFrom = formatISO(subMinutes(Date.now(), 1))

      expect(newXRayBodyScansEnabled('MDI')).toBeTruthy()
    })
  })
})
