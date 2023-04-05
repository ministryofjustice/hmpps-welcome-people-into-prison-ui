import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import Role from '../../authentication/role'
import {
  createArrival,
  createPrisonerDetails,
  createPotentialMatch,
  withMatchType,
  withBodyScanInfo,
} from '../../data/__testutils/testObjects'
import { createLockManager } from '../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()
const expectedArrivalsService = createMockExpectedArrivalsService()

const arrivalAndSummaryDetails = {
  arrival: withMatchType(createArrival({ potentialMatches: [createPotentialMatch({ prisonNumber: 'A1234AB' })] })),
  summary: withBodyScanInfo(createPrisonerDetails()),
}

beforeEach(() => {
  lockManager.isLocked.mockResolvedValue(false)
  app = appWithAllRoutes({ services: { expectedArrivalsService, lockManager }, roles: [] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner/:id/summary-with-record', () => {
  beforeEach(() => {
    expectedArrivalsService.getArrivalAndSummaryDetails.mockResolvedValue(arrivalAndSummaryDetails)
  })

  it('should call service methods correctly', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(res => {
        expect(expectedArrivalsService.getArrivalAndSummaryDetails).toHaveBeenCalledWith('1111-1111-1111-1111')
      })
  })

  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.isLocked.mockResolvedValue(true)
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })
  it('should render summary-with-record page', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Smith, Jim')
        expect($('.summary-card').text()).toContain('8 January 1973')
      })
  })

  it('should display breadcrumb navigation correctly', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=back-link-navigation] li').length).toEqual(3)
        expect($('[data-qa=back-link-navigation] li a').first().text()).toEqual('Home')
        expect($('[data-qa=back-link-navigation] li a').first().attr('href')).toEqual('/')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').text()).toEqual('People booked to arrive today')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').attr('href')).toEqual(
          '/confirm-arrival/choose-prisoner'
        )
        expect($('[data-qa=back-link-navigation] li').last().text()).toEqual('Smith, Jim')
      })
  })

  describe('prisoner image', () => {
    it('should render prisoner image with single potential match Prison Number', () => {
      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-with-record')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-image]').attr('src')).toEqual('/prisoners/A1234AB/image')
        })
    })
  })

  describe('caption', () => {
    it('should render both PNC Number and Prison Number from single potential match', () => {
      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-with-record')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB | PNC: 01/98644M')
        })
    })
  })

  describe('DPS prisoner profile button', () => {
    it('should be displayed', () => {
      app = appWithAllRoutes({
        services: { expectedArrivalsService, lockManager },
        roles: [Role.PRISON_RECEPTION, Role.ROLE_INACTIVE_BOOKINGS],
      })

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-with-record')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-profile]').length).toBe(1)
        })
    })
    it('should not be displayed without Prison Reception role', () => {
      app = appWithAllRoutes({
        services: { expectedArrivalsService, lockManager },
        roles: [Role.ROLE_INACTIVE_BOOKINGS],
      })

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-with-record')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-profile]').length).toBe(0)
        })
    })

    it('should not be present without Released Prisoner role', () => {
      app = appWithAllRoutes({
        services: { expectedArrivalsService, lockManager },
        roles: [Role.PRISON_RECEPTION],
      })

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-with-record')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-profile]').length).toBe(0)
        })
    })

    it('should not display the scan compliance panel', () => {
      arrivalAndSummaryDetails.summary.bodyScanStatus = 'OK_TO_SCAN'

      app = appWithAllRoutes({
        services: { expectedArrivalsService, lockManager },
        roles: [Role.PRISON_RECEPTION],
      })

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-with-record')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.compliance-panel').length).toBe(0)
        })
    })
  })

  it("should not display the 'close to limit' scan compliance panel", () => {
    arrivalAndSummaryDetails.summary.bodyScanStatus = 'CLOSE_TO_LIMIT'

    app = appWithAllRoutes({
      services: { expectedArrivalsService, lockManager },
      roles: [Role.PRISON_RECEPTION],
    })

    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa="close-to-limit"]').length).toBe(1)
      })
  })

  it("should display the 'do not scan' compliance panel", () => {
    arrivalAndSummaryDetails.summary.bodyScanStatus = 'DO_NOT_SCAN'

    app = appWithAllRoutes({
      services: { expectedArrivalsService, lockManager },
      roles: [Role.PRISON_RECEPTION],
    })

    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa="do-not-scan"]').length).toBe(1)
      })
  })
})
