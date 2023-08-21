import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import Role from '../../authentication/role'
import { createPrisonerDetails, withBodyScanInfo } from '../../data/__testutils/testObjects'
import config from '../../config'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

const arrival = withBodyScanInfo(createPrisonerDetails())

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /recent-arrivals/:id/summary', () => {
  beforeEach(() => {
    expectedArrivalsService.getPrisonerSummaryDetails.mockResolvedValue(arrival)
  })

  it('should call service method correctly', () => {
    expectedArrivalsService.getPrisonerSummaryDetails.mockResolvedValue(arrival)
    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(res => {
        expect(expectedArrivalsService.getPrisonerSummaryDetails).toHaveBeenCalledWith('A1234AB')
      })
  })

  it('should render summary page', () => {
    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Smith, Jim')
        expect($('.summary-card').text()).toContain('8 January 1973')
        expect($('#body-scan').length).toEqual(1)
      })
  })

  it('should not render body scan section for female prison', () => {
    config.femalePrisons = ['ABC', 'XYZ']

    app = appWithAllRoutes({
      services: { expectedArrivalsService },
      roles: [Role.PRISON_RECEPTION],
      userSupplier: () => ({
        token: 'token',
        username: 'user1',
        activeCaseLoadId: 'XYZ',
        authSource: 'NOMIS',
      }),
    })

    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#body-scan').length).toEqual(0)
      })
  })

  it('should display breadcrumbs correctly', () => {
    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=back-link-navigation] li').length).toEqual(3)
        expect($('[data-qa=back-link-navigation] li a').first().text()).toEqual('Digital Prison Services')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').text()).toEqual('Welcome people into prison')
        expect($('[data-qa=back-link-navigation] li').last().text()).toContain('Recent arrivals')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').attr('href')).toEqual('/')
        expect($('[data-qa=back-link-navigation] li:nth-child(3) a').attr('href')).toEqual('/recent-arrivals')
      })
  })

  it('should render prisoner image', () => {
    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=prisoner-image]').attr('src')).toEqual('/prisoners/A1234AB/image')
      })
  })

  describe('caption', () => {
    it('should render both PNC Number and Prison Number when both are given', () => {
      return request(app)
        .get('/recent-arrivals/A1234AB/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB | PNC: 01/98644M')
        })
    })

    it('should render only Prison Number when only Prison Number is given', () => {
      expectedArrivalsService.getPrisonerSummaryDetails.mockResolvedValue(
        withBodyScanInfo(createPrisonerDetails({ pncNumber: null }))
      )

      return request(app)
        .get('/recent-arrivals/A1234AB/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB')
        })
    })
  })

  it('should generate correct link to add case note on dps', () => {
    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=add-case-note-button]').attr('href')).toContain(
          '/save-backlink?service=welcome-people-into-prison&returnPath=/recent-arrivals/A1234AB/summary&redirectPath=/prisoner/A1234AB/add-case-note'
        )
      })
  })

  it('should generate correct link to prisoner profile on dps', () => {
    return request(app)
      .get('/recent-arrivals/A1234AB/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=dps-prisoner-profile-button]').attr('href')).toContain(
          '/save-backlink?service=welcome-people-into-prison&returnPath=/recent-arrivals/A1234AB/summary&redirectPath=/prisoner/A1234AB'
        )
      })
  })
})
