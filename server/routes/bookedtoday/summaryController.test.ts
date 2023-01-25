import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import Role from '../../authentication/role'
import { createArrival, withMatchType } from '../../data/__testutils/testObjects'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

const arrival = withMatchType(createArrival())

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner/:id/summary', () => {
  beforeEach(() => {
    expectedArrivalsService.getArrival.mockResolvedValue(arrival)
  })

  it('should call service method correctly', () => {
    expectedArrivalsService.getArrival.mockResolvedValue(arrival)
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('1111-1111-1111-1111')
      })
  })

  it('should render summary page', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Smith, Jim')
        expect($('.summary-card').text()).toContain('8 January 1973')
      })
  })

  it('should display breadcrumbs correctly', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=breadcrumbs] li').length).toEqual(3)
        expect($('[data-qa=breadcrumbs] li a').first().text()).toEqual('Home')
        expect($('[data-qa=breadcrumbs] li a').first().attr('href')).toEqual('/')
        expect($('[data-qa=breadcrumbs] li:nth-child(2) a').text()).toEqual('People booked to arrive today')
        expect($('[data-qa=breadcrumbs] li:nth-child(2) a').attr('href')).toEqual('/confirm-arrival/choose-prisoner')
        expect($('[data-qa=breadcrumbs] li').last().text()).toEqual('Smith, Jim')
      })
  })

  describe('prisoner image', () => {
    it('should render prisoner image when Prison Number provided', () => {
      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-image]').attr('src')).toEqual('/prisoners/A1234AB/image')
        })
    })

    it('should render placeholder image when no Prison Number provided', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(withMatchType(createArrival({ prisonNumber: null })))

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-image]').attr('src')).toEqual('/assets/images/placeholder-image.png')
        })
    })
  })

  describe('caption', () => {
    it('should render both PNC Number and Prison Number when both are given', () => {
      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB | PNC: 01/98644M')
        })
    })

    it('should render only Prison Number when only Prison Number is given', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(withMatchType(createArrival({ pncNumber: null })))

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB')
        })
    })

    it('should render only PNC Number when only PNC Number is given', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(withMatchType(createArrival({ prisonNumber: null })))

      return request(app)
        .get('/prisoners/1111-1111-1111-1111/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('PNC: 01/98644M')
        })
    })
  })
})