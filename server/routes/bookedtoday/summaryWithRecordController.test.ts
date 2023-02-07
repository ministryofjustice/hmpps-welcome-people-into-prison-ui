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

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

const arrival = withMatchType(createArrival({ potentialMatches: [createPotentialMatch({ prisonNumber: 'A1234AB' })] }))
const prisonerDetails = withBodyScanInfo(createPrisonerDetails())

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner/:id/summary-with-record', () => {
  beforeEach(() => {
    expectedArrivalsService.getArrival.mockResolvedValue(arrival)
    expectedArrivalsService.getPrisonerSummaryDetails.mockResolvedValue(prisonerDetails)
  })

  it('should call service methods correctly', () => {
    expectedArrivalsService.getArrival.mockResolvedValue(arrival)
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('1111-1111-1111-1111')
        expect(expectedArrivalsService.getPrisonerSummaryDetails).toHaveBeenCalledWith('A1234AB')
      })
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

  it('should display breadcrumbs correctly', () => {
    return request(app)
      .get('/prisoners/1111-1111-1111-1111/summary-with-record')
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
})
