import type { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider } from '../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../services'
import Role from '../../../authentication/role'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'

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
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .get('/prisoners/12345-67890/review-per-details/new')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/review-per-details')
      .expect(res => expectSettingCookie(res, 'new-arrival').toBeUndefined())
  })
})

describe('GET /review-per-details', () => {
  it('should redirect to authentication error page for non reception users', () => {
    signedCookiesProvider.mockReturnValue({})
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/review-per-details').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    signedCookiesProvider.mockReturnValue({})
    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('should render page when no cookie state', () => {
    signedCookiesProvider.mockReturnValue({})
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
      })
  })

  it('cookie is set from retrieved data', () => {
    signedCookiesProvider.mockReturnValue({})
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
        expectSettingCookie(res, 'new-arrival').toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          sex: 'MALE',
          pncNumber: '99/98644M',
          prisonNumber: 'A1234AB',
        })
      })
  })

  it('should render page with cookie state', () => {
    signedCookiesProvider.mockReturnValue({
      'new-arrival': {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        sex: 'MALE',
        prisonNumber: 'A1234AB',
        pncNumber: '99/98644M',
      },
    })

    return request(app)
      .get('/prisoners/12345-67890/review-per-details')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Review personal details from Person Escort Record')
      })
  })
})
