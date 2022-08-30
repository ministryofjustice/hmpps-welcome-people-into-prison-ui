import { type Arrival, SexKeys } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../../../__testutils/appSetup'
import Role from '../../../../../authentication/role'
import config from '../../../../../config'
import { expectSettingCookie } from '../../../../__testutils/requestTestUtils'
import { State } from '../../state'
import { createMockExpectedArrivalsService } from '../../../../../services/__testutils/mocks'
import { MatchType, WithMatchType } from '../../../../../services/matchTypeDecorator'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

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
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/new')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record')
      .expect(res => expectSettingCookie(res, State.searchDetails).toBeUndefined())
  })

  it('redirects when disabled', () => {
    config.confirmNoIdentifiersEnabled = false
    app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/new')
      .expect(302)
      .expect('Location', '/feature-not-available')
  })
})

describe('GET /search-for-existing-record', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
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

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/feature-not-available')
  })

  it('should render page when no cookie state', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
      matchType: MatchType.NO_MATCH,
    } as WithMatchType<Arrival>)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Search for an existing prisoner record')
      })
  })

  it('cookie is set from retrieved data', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
      matchType: MatchType.NO_MATCH,
    } as WithMatchType<Arrival>)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record')
      .expect(res => {
        expectSettingCookie(res, State.searchDetails).toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          pncNumber: '99/98644M',
          prisonNumber: 'A1234AB',
        })
      })
  })

  it('should render page with cookie state', () => {
    stubCookie(State.searchDetails, {
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
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
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/page-not-found')
  })

  it('should call service method correctly', () => {
    stubCookie(State.searchDetails, searchDetails)

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getMatchingRecords).toHaveBeenCalledWith(searchDetails)
      })
  })

  it('should clear new-arrival state and redirect when multiple existing potential records found', () => {
    stubCookie(State.searchDetails, searchDetails)
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([
      {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        sex: SexKeys.MALE,
        pncNumber: '88/98544M',
        prisonNumber: 'A1234AC',
      },
      {
        firstName: 'Jim',
        lastName: 'Simon',
        dateOfBirth: '2003-03-01',
        sex: SexKeys.MALE,
        prisonNumber: 'A1234AB',
        pncNumber: '99/98644M',
      },
    ])

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/possible-records-found')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toBeUndefined()
      })
  })

  it('should set new-arrival state and redirect when one existing potential record found', () => {
    stubCookie(State.searchDetails, searchDetails)
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([
      {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        sex: SexKeys.MALE,
        pncNumber: '88/98544M',
        prisonNumber: 'A1234AC',
      },
    ])

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toStrictEqual({
          firstName: 'James',
          lastName: 'Smyth',
          dateOfBirth: '1973-01-08',
          sex: 'MALE',
          prisonNumber: 'A1234AC',
          pncNumber: '88/98544M',
          expected: 'true',
        })
      })
  })

  it('should clear new-arrival state and redirect when no existing potential records found', () => {
    stubCookie(State.searchDetails, searchDetails)
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([])

    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record')
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/search-for-existing-record/no-record-found')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toBeUndefined()
      })
  })
})
