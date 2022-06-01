import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user, flashProvider } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import ExpectedArrivalsService from '../../services/expectedArrivalsService'
import { createRecentArrival } from '../../data/__testutils/testObjects'

jest.mock('../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

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
    flashProvider.mockReturnValue(['Smith'])
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
    flashProvider.mockReturnValue(['Smith'])
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
      })
  })

  it('should display alternative text if no search results to display', () => {
    flashProvider.mockReturnValue(['Mark'])
    expectedArrivalsService.getRecentArrivalsSearchResults.mockResolvedValue([])
    return request(app)
      .get('/recent-arrivals/search')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#no-results-found').text()).toContain("No results found for 'Mark'.")
      })
  })

  it('should redirect to /recent-arrivals if search query flash absent', () => {
    flashProvider.mockReturnValue([])
    return request(app)
      .get('/recent-arrivals/search')
      .expect(302)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/recent-arrivals')
      .expect(res => {
        expect(expectedArrivalsService.getRecentArrivalsSearchResults).not.toHaveBeenCalled()
      })
  })
})

describe('POST /recent-arrivals/search', () => {
  const flash = flashProvider.mockReturnValue([])
  it('should store search query in flash and redirect to /recent-arrivals/search', () => {
    return request(app)
      .post('/recent-arrivals/search')
      .send({ movementReason: undefined })
      .expect(302)
      .expect('Location', '/recent-arrivals/search')
      .expect(res => {
        expect(flash).toBeCalledTimes(1)
      })
  })
})
