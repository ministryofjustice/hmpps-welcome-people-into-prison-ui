import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user, stubCookie } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import ExpectedArrivalsService from '../../services/expectedArrivalsService'
import { createRecentArrival } from '../../data/__testutils/testObjects'
import { expectSettingCookie } from '../__testutils/requestTestUtils'
import { State } from './state'

jest.mock('../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ExpectedArrivalsService>

let app: Express

const recentArrivals = [
  createRecentArrival({ firstName: 'John', lastName: 'Doe', prisonNumber: 'A1234BC' }),
  createRecentArrival({ firstName: 'Sam', lastName: 'Smith', prisonNumber: 'G0014GM' }),
  createRecentArrival({ firstName: 'Robert', lastName: 'Smyth', prisonNumber: 'A1234BD' }),
]

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getRecentArrivalsSearchResults.mockResolvedValue(recentArrivals)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /recent-arrivals/search', () => {
  it('should call service method correctly', () => {
    stubCookie(State.searchQuery, { searchQuery: 'Smith' })
    expectedArrivalsService.getRecentArrivalsSearchResults.mockResolvedValue([
      createRecentArrival({ firstName: 'Sam', lastName: 'Smith', prisonNumber: 'G0014GM' }),
    ])
    return request(app)
      .get('/recent-arrivals/search')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getRecentArrivalsSearchResults).toHaveBeenCalledWith(
          user.activeCaseLoadId,
          'Smith'
        )
      })
  })
  it('should retrieve search query from flash and render /recent-arrivals/search page with correct search results', () => {
    stubCookie(State.searchQuery, { searchQuery: 'Smith' })
    expectedArrivalsService.getRecentArrivalsSearchResults.mockResolvedValue([
      createRecentArrival({ firstName: 'Sam', lastName: 'Smith', prisonNumber: 'G0014GM' }),
    ])
    return request(app)
      .get('/recent-arrivals/search')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Prisoners who have arrived in the last 3 days')
        expect($('.title-1').text()).toContain('Smith, Sam')
        expect($('#no-results-found').text()).toBe('')
      })
  })

  it('should display alternative text if no search results to display', () => {
    stubCookie(State.searchQuery, { searchQuery: 'Mark' })
    expectedArrivalsService.getRecentArrivalsSearchResults.mockResolvedValue([])
    return request(app)
      .get('/recent-arrivals/search')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#no-results-found').text()).toContain("No results found for 'Mark'.")
      })
  })
})

describe('POST /recent-arrivals/search', () => {
  it('should store search query in cookie state and redirect to /recent-arrivals/search', () => {
    stubCookie(State.searchQuery, { searchQuery: 'Bob' })
    return request(app)
      .post('/recent-arrivals/search')
      .send({ searchQuery: 'Bob' })
      .expect(302)
      .expect('Location', '/recent-arrivals/search')
      .expect(res => {
        expectSettingCookie(res, State.searchQuery).toStrictEqual({ searchQuery: 'Bob' })
      })
  })
})
