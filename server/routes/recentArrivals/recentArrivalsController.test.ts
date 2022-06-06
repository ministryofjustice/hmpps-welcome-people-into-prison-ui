import type { Express } from 'express'
import request from 'supertest'
import moment from 'moment'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user, flashProvider } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import ExpectedArrivalsService from '../../services/expectedArrivalsService'
import { createRecentArrival } from '../../data/__testutils/testObjects'

jest.mock('../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

const today = moment().startOf('day')
const oneDayAgo = moment().subtract(1, 'days').startOf('day')
const twoDaysAgo = moment().subtract(2, 'days').startOf('day')

const recentArrivals = new Map([
  [today, [createRecentArrival({ movementDateTime: moment().format() })]],
  [oneDayAgo, [createRecentArrival({ movementDateTime: moment().subtract(1, 'days').format() })]],
  [twoDaysAgo, []],
])

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getRecentArrivalsGroupedByDate.mockResolvedValue(recentArrivals)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /recent-arrivals', () => {
  it('should render /recent-arrivals page with correct content', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Prisoners who have arrived in the last 3 days')
        expect($('#date-1').text()).toBe(today.format('dddd D MMMM'))
        expect($('#date-2').text()).toBe(oneDayAgo.format('dddd D MMMM'))
        expect($('#date-3').text()).toBe(twoDaysAgo.format('dddd D MMMM'))
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getRecentArrivalsGroupedByDate).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })

  it('should display alternative text if no prisoners to display', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#no-prisoners-date-1').text()).toContain('')
        expect($('#no-prisoners-date-2').text()).toContain('')
        expect($('#no-prisoners-date-3').text()).toContain('No prisoners arrived on this day.')
      })
  })
})

describe('POST /recent-arrivals', () => {
  const flash = flashProvider.mockReturnValue([])
  it('should store search query in flash and redirect to /recent-arrivals/search', () => {
    return request(app)
      .post('/recent-arrivals')
      .send({ searchQuery: 'Bob' })
      .expect(302)
      .expect('Location', '/recent-arrivals/search')
      .expect(res => {
        expect(flash).toBeCalledWith('searchQuery', 'Bob')
      })
  })
})
