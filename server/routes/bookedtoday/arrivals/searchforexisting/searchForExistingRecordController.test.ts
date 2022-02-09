import type { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider } from '../../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../../services'
import Role from '../../../../authentication/role'

jest.mock('../../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /search-for-existing-record/new', () => {
  it('should redirect and clear cookie', () => {
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/new')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record')
      .expect(res => expect(res.header['set-cookie'][0]).toContain('s%3A.'))
  })
})

describe('GET /search-for-existing-record', () => {
  it('should redirect to authentication error page for non reception users', () => {
    signedCookiesProvider.mockReturnValue({})
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    signedCookiesProvider.mockReturnValue({})
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
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
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
    } as Arrival)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Search for an existing prisoner record')
      })
  })

  it('cookie is set from retrieved data', () => {
    signedCookiesProvider.mockReturnValue({})
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
    } as Arrival)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(res => {
        expect(res.header['set-cookie'][0]).toContain(
          encodeURIComponent(
            JSON.stringify({
              firstName: 'James',
              lastName: 'Smyth',
              dateOfBirth: '1973-01-08',
              pncNumber: '99/98644M',
              prisonNumber: 'A1234AB',
            })
          )
        )
      })
  })

  it('should render page with cookie state', () => {
    signedCookiesProvider.mockReturnValue({
      'search-details': {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        prisonNumber: 'A1234AB',
        pncNumber: '99/98644M',
      },
    })

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Search for an existing prisoner record')
      })
  })
})
