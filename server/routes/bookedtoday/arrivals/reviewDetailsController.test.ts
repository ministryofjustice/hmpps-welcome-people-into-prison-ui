import { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'
import { State } from './state'
import { createMockExpectedArrivalsService } from '../../../services/__testutils/mocks'
import { MatchType, WithMatchType } from '../../../services/matchTypeDecorator'
import { createLockManager } from '../../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService, lockManager }, roles: [Role.PRISON_RECEPTION] })

  expectedArrivalsService.getArrival.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /review-per-details/new', () => {
  it('should redirect and clear cookie', () => {
    return request(app)
      .get('/prisoners/12345-67890/review-per-details/new')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/review-per-details')
      .expect(res => expectSettingCookie(res, State.newArrival).toBeUndefined())
  })
})

describe('GET /review-per-details', () => {
  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.getLockStatus.mockResolvedValue(true)
    app = appWithAllRoutes({
      services: { lockManager },
      roles: [Role.PRISON_RECEPTION],
    })

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/review-per-details').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('new arrival cookie is set from retrieved data', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      gender: 'MALE',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
      matchType: MatchType.SINGLE_MATCH,
    } as WithMatchType<Arrival>)

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          sex: 'MALE',
          pncNumber: '99/98644M',
          expected: 'true',
        })
      })
  })

  it('should update new arrival cookie from search details cookie when search details present and new arrival undefined', () => {
    stubCookie(State.searchDetails, {
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
    })

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          expected: 'true',
        })
      })
  })

  it('should render page when no initial search details cookie or new arrival cookie state', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      gender: 'MALE',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
      matchType: MatchType.SINGLE_MATCH,
    } as WithMatchType<Arrival>)

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Review personal details')
        expect($('a.govuk-button').attr('href')).toContain('/prisoners/12345-67890/start-confirmation')
      })
  })

  it('should render page with initial new arrival cookie state if present and search details cookie absent', () => {
    stubCookie(State.newArrival, {
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      sex: 'MALE',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      expected: true,
    })

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Review personal details')
        expect($('.data-qa-name').text()).toContain('James Smyth')
      })
  })

  it('should render page with search details cookie state if present', () => {
    stubCookie(State.newArrival, {
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      sex: 'MALE',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      expected: true,
    })

    stubCookie(State.searchDetails, {
      firstName: 'Jim',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      pncNumber: '99/98644M',
      prisonNumber: 'A1234AB',
    })

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Review personal details')
        expect($('.data-qa-name').text()).toContain('Jim Smyth')
      })
  })
})
