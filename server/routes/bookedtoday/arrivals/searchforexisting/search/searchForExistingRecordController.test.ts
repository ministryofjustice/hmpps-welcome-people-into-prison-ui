import { type Arrival, GenderKeys } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider } from '../../../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../../../services'
import Role from '../../../../../authentication/role'
import config from '../../../../../config'
import { expectSettingCookie } from '../../../../__testutils/requestTestUtils'

jest.mock('../../../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

const searchDetails = {
  firstName: 'James',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
  pncNumber: '99/98644M',
  prisonNumber: 'A1234AB',
}

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
  expectedArrivalsService.getMatchingRecords.mockResolvedValue(null)
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
      .expect(res => expectSettingCookie(res, 'search-details').toBeUndefined())
  })

  it('redirects when disabled', () => {
    config.confirmNoIdentifiersEnabled = false
    app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/new')
      .expect(302)
      .expect('Location', '/feature-not-available')
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
      .expect(() => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('redirects when disabled', () => {
    config.confirmNoIdentifiersEnabled = false
    app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
    signedCookiesProvider.mockReturnValue({})

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/feature-not-available')
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
        expectSettingCookie(res, 'search-details').toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          pncNumber: '99/98644M',
          prisonNumber: 'A1234AB',
        })
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

describe('POST /search-for-existing-record', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .send({})
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('redirects when no cookie present', () => {
    signedCookiesProvider.mockReturnValue({})
    return request(app).post('/prisoners/12345-67890/search-for-existing-record').expect(302).expect('Location', '/')
  })

  it('should call service method correctly', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith(searchDetails)
      })
  })

  it('should clear new-arrival state and redirect when multiple existing potential records found', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([
      {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        sex: GenderKeys.MALE,
        pncNumber: '88/98544M',
        prisonNumber: 'A1234AC',
      },
      {
        firstName: 'Jim',
        lastName: 'Simon',
        dateOfBirth: '2003-03-01',
        sex: GenderKeys.MALE,
        prisonNumber: 'A1234AB',
        pncNumber: '99/98644M',
      },
    ])

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/possible-records-found')
      .expect(res => {
        expectSettingCookie(res, 'new-arrival').toBeUndefined()
      })
  })

  it('should set new-arrival state and redirect when one existing potential record found', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([
      {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        sex: GenderKeys.MALE,
        pncNumber: '88/98544M',
        prisonNumber: 'A1234AC',
      },
    ])

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect(res => {
        expectSettingCookie(res, 'new-arrival').toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          sex: 'MALE',
          prisonNumber: 'A1234AC',
          pncNumber: '88/98544M',
        })
      })
  })

  it('should clear new-arrival state and redirect when no existing potential records found', () => {
    signedCookiesProvider.mockReturnValue({ 'search-details': searchDetails })
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([])

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/no-record-found')
      .expect(res => {
        expectSettingCookie(res, 'new-arrival').toBeUndefined()
      })
  })
})
