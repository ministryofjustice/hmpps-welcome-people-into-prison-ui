import { type Arrival, LocationType } from 'welcome'
import { BodyScanStatus } from 'body-scan'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { user, appWithAllRoutes } from '../__testutils/appSetup'
import { expectSettingCookie } from '../__testutils/requestTestUtils'
import config from '../../config'
import { State } from './arrivals/state'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import { MatchType, WithMatchType } from '../../services/matchTypeDecorator'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirm-arrival/choose-prisoner', () => {
  beforeEach(() => {
    expectedArrivalsService.getArrivalsForToday.mockResolvedValue(new Map())
  })

  it('should render /confirm-arrival/choose-prisoner page with correct title when supportingMultitransactionsEnabled is true', () => {
    config.supportingMultitransactionsEnabled = true
    app = appWithAllRoutes({ services: { expectedArrivalsService } })

    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('People booked to arrive today')
      })
  })

  it('should render /confirm-arrival/choose-prisoner page with correct title when supportingMultitransactionsEnabled is false', () => {
    config.supportingMultitransactionsEnabled = false
    app = appWithAllRoutes({ services: { expectedArrivalsService } })

    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Select a person to add to the establishment roll')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrivalsForToday).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })

  it('should handle unexpected server error', () => {
    expectedArrivalsService.getArrivalsForToday.mockRejectedValue(new Error('an error occurred'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(500)
      .expect('Content-Type', 'text/html; charset=utf-8')
  })
})

describe('GET /confirm-arrival/choose-prisoner/:id', () => {
  const arrival = ({ matchType }: { matchType: MatchType }) =>
    ({
      id: '1111-2222-3333-4444',
      firstName: 'Harry',
      lastName: 'Stanton',
      dateOfBirth: '1961-01-01',
      prisonNumber: 'A1234AA',
      pncNumber: '01/12345A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_REMAND',
      isCurrentPrisoner: true,
      fromLocationType: LocationType.COURT,
      bodyScanStatus: BodyScanStatus.CLOSE_TO_LIMIT,
      matchType,
    } as WithMatchType<Arrival>)

  describe('from court', () => {
    it('should clear cookie', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.SINGLE_MATCH,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toBeUndefined()
        })
    })

    it('should redirect to court transfer when current', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.COURT_RETURN,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/check-court-return')
    })

    it('should redirect to search when not current and no identifiers', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.INSUFFICIENT_INFO,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/search-for-existing-record/new')
    })

    it('should redirect to single match', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.SINGLE_MATCH,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/record-found')
    })

    it('should redirect to multiple matches', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.MULTIPLE_POTENTIAL_MATCHES,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/possible-records-found')
    })

    it('should redirect to no match', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.NO_MATCH,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/no-record-found')
    })
  })

  it('should call service method correctly', () => {
    expectedArrivalsService.getArrival.mockResolvedValue(
      arrival({
        matchType: MatchType.SINGLE_MATCH,
      })
    )
    return request(app)
      .get('/confirm-arrival/choose-prisoner/aaa-111-222')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('aaa-111-222')
      })
  })

  it('should handle unexpected server error', () => {
    expectedArrivalsService.getArrival.mockRejectedValue(new Error('an error occurred'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner/aaa-111-222')
      .expect(500)
      .expect('Content-Type', 'text/html; charset=utf-8')
  })
})
