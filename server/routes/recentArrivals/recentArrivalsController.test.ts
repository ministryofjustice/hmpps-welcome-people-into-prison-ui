import type { Express } from 'express'
import request from 'supertest'
import moment from 'moment'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, user } from '../__testutils/appSetup'
import Role from '../../authentication/role'

import { createRecentArrival, withBodyScanStatus } from '../../data/__testutils/testObjects'
import { expectSettingCookie } from '../__testutils/requestTestUtils'
import config from '../../config'
import { State } from './state'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

const today = moment().startOf('day')
const oneDayAgo = moment().subtract(1, 'days').startOf('day')
const twoDaysAgo = moment().subtract(2, 'days').startOf('day')

const recentArrivals = new Map([
  [today, [withBodyScanStatus(createRecentArrival({ movementDateTime: moment().format() }))]],
  [oneDayAgo, [withBodyScanStatus(createRecentArrival({ movementDateTime: moment().subtract(1, 'days').format() }))]],
  [twoDaysAgo, []],
])

beforeEach(() => {
  config.showRecentArrivals = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getRecentArrivalsGroupedByDate.mockResolvedValue(recentArrivals)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /recent-arrivals', () => {
  it('should only display back navigation of the breadcrumb type', () => {
    config.showBreadCrumb = true
    app = appWithAllRoutes({ services: { expectedArrivalsService } })

    return request(app)
      .get('/recent-arrivals')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($("[data-qa='back-link-navigation'] li")).toHaveLength(2)
        expect($('[data-qa=back-link-navigation] li:nth-child(1) a').text()).toEqual('Digital Prison Services')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').text()).toEqual('Welcome people into prison')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').attr('href')).toEqual('/')
      })
  })

  it('should only display back navigation of the back link type', () => {
    config.showBreadCrumb = false
    app = appWithAllRoutes({ services: { expectedArrivalsService } })

    return request(app)
      .get('/recent-arrivals')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($("[data-qa='back-link-navigation']").text()).toContain('Back')
        expect($("[data-qa='back-link-navigation']")).toHaveLength(1)
      })
  })

  it('should render /recent-arrivals page with correct content', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('People who have arrived in the last 3 days')
        expect($('#date-1').text()).toBe(today.format('dddd D MMMM'))
        expect($('#date-2').text()).toBe(oneDayAgo.format('dddd D MMMM'))
        expect($('#date-3').text()).toBe(twoDaysAgo.format('dddd D MMMM'))
      })
  })

  it('should redirect to /page-not-found when showRecentArrivals is set to false', () => {
    config.showRecentArrivals = false
    return request(app).get('/recent-arrivals').expect(302).expect('Location', '/page-not-found')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getRecentArrivalsGroupedByDate).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })

  it('should clear cookie state', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expectSettingCookie(res, State.searchQuery).toBeUndefined()
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
  it('should set search query in state and redirect to /recent-arrivals/search', () => {
    return request(app)
      .post('/recent-arrivals')
      .send({ searchQuery: 'Bob' })
      .expect(302)
      .expect('Location', '/recent-arrivals/search')
      .expect(res => {
        expectSettingCookie(res, State.searchQuery).toStrictEqual({ searchQuery: 'Bob' })
      })
  })
})
