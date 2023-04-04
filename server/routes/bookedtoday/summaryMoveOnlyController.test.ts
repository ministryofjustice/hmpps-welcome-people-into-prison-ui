import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import Role from '../../authentication/role'
import { createArrival, withMatchType } from '../../data/__testutils/testObjects'
import { createLockManager } from '../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()
const expectedArrivalsService = createMockExpectedArrivalsService()

const arrival = withMatchType(createArrival({ prisonNumber: null, potentialMatches: [] }))

beforeEach(() => {
  lockManager.getLockStatus.mockResolvedValue(false)
  app = appWithAllRoutes({ services: { expectedArrivalsService, lockManager }, roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner/:id/summary-move-only', () => {
  beforeEach(() => {
    expectedArrivalsService.getArrival.mockResolvedValue(arrival)
  })

  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.getLockStatus.mockResolvedValue(true)
    app = appWithAllRoutes({
      services: { lockManager },
      roles: [Role.PRISON_RECEPTION],
    })

    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-move-only')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })

  it('should call service method correctly', () => {
    expectedArrivalsService.getArrival.mockResolvedValue(arrival)
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-move-only')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('1111-1111-1111-1111')
      })
  })

  it('should render summary-move-only page', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-move-only')
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
      .get('/prisoners/1111-1111-1111-1111/summary-move-only')
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
    it('should render placeholder image', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(withMatchType(createArrival(arrival)))

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-move-only')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-image]').attr('src')).toEqual('/assets/images/placeholder-image.png')
        })
    })
  })

  describe('caption', () => {
    it('should render PNC Number when provided', () => {
      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary-move-only')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('PNC: 01/98644M')
        })
    })
  })
})
