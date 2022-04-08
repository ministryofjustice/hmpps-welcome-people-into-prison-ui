import type { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../services'
import Role from '../../../authentication/role'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'
import { State } from './state'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
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

  it('should render page when no cookie state', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      gender: 'MALE',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
    } as Arrival)

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Review personal details from Person Escort Record')
        expect($('a.govuk-button').attr('href')).toContain('/prisoners/12345-67890/sex')
      })
  })

  it('cookie is set from retrieved data', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      gender: 'MALE',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
    } as Arrival)

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

  it('should render page with cookie state', () => {
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
        expect($('h1').text()).toContain('Review personal details from Person Escort Record')
      })
  })
})
