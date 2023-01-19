import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import { MatchType } from '../../services/matchTypeDecorator'
import Role from '../../authentication/role'
import { createArrival } from '../../data/__testutils/testObjects'

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
})
