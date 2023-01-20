import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import Role from '../../authentication/role'
import { createArrival } from '../../data/__testutils/testObjects'
import { MatchType } from '../../services/matchTypeDecorator'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

const arrival = {
  ...createArrival({
    potentialMatches: [],
  }),
  matchType: MatchType.NO_MATCH,
}

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

  it('should render /summary page with offender name as title', () => {
    return request(app)
      .get('/prisoners/123/summary')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Smith, Jim')
      })
  })

  describe('caption', () => {
    it('should render both PNC Number and Prison Number when both are given', () => {
      return request(app)
        .get('/prisoners/123/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB | PNC: 01/98644M')
        })
    })

    it('should render only Prison Number when only Prison Number is given', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival({ pncNumber: null }),
        matchType: MatchType.NO_MATCH,
      })

      return request(app)
        .get('/prisoners/123/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('Prison number: A1234AB')
        })
    })

    it('should render only PNC Number when only PNC Number is given', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival({ prisonNumber: null }),
        matchType: MatchType.NO_MATCH,
      })

      return request(app)
        .get('/prisoners/123/summary')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('span.govuk-caption-l').text().trim()).toStrictEqual('PNC: 01/98644M')
        })
    })
  })
})
