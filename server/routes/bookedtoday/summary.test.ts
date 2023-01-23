import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import Role from '../../authentication/role'
import { State } from './arrivals/state'
import { createArrival, withMatchType } from '../../data/__testutils/testObjects'
import { MatchType } from '../../services/matchTypeDecorator'
import { expectSettingCookie } from '../__testutils/requestTestUtils'

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
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival({ pncNumber: null }),
        matchType: MatchType.NO_MATCH,
      })

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
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival({ prisonNumber: null }),
        matchType: MatchType.NO_MATCH,
      })

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

describe('GET /confirm-arrival/choose-prisoner/:id', () => {
  stubCookie(State.searchDetails, {
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    pncNumber: '99/98644M',
    prisonNumber: 'A1234AB',
  })

  describe('from court', () => {
    it('should clear both new arrival and search details cookies', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival(),
        matchType: MatchType.SINGLE_MATCH,
      })
      return request(app)
        .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toBeUndefined()
          expectSettingCookie(res, State.searchDetails).toBeUndefined()
        })
    })

    it('should redirect to court transfer when current', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival(),
        matchType: MatchType.COURT_RETURN,
      })
      return request(app)
        .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-1111-1111-1111/check-court-return')
    })

    it('should redirect to search when not current and no identifiers', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival(),
        matchType: MatchType.INSUFFICIENT_INFO,
      })
      return request(app)
        .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-1111-1111-1111/search-for-existing-record/new')
    })

    it('should redirect to single match', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival(),
        matchType: MatchType.SINGLE_MATCH,
      })
      return request(app)
        .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-1111-1111-1111/record-found')
    })

    it('should redirect to multiple matches', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival(),
        matchType: MatchType.MULTIPLE_POTENTIAL_MATCHES,
      })
      return request(app)
        .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-1111-1111-1111/possible-records-found')
    })

    it('should redirect to no match', () => {
      expectedArrivalsService.getArrival.mockResolvedValue({
        ...createArrival(),
        matchType: MatchType.NO_MATCH,
      })
      return request(app)
        .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-1111-1111-1111/no-record-found')
    })
  })

  it('should call service method correctly', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      ...createArrival(),
      matchType: MatchType.SINGLE_MATCH,
    })
    return request(app)
      .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('1111-1111-1111-1111')
      })
  })

  it('should handle unexpected server error', () => {
    expectedArrivalsService.getArrival.mockRejectedValue(new Error('an error occurred'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner/1111-1111-1111-1111')
      .expect(500)
      .expect('Content-Type', 'text/html; charset=utf-8')
  })
})
