import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookies } from '../../__testutils/appSetup'
import ExpectedArrivalsService from '../../../services/expectedArrivalsService'
import Role from '../../../authentication/role'
import { State } from '../arrivals/state'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })

  stubCookies([
    [
      State.searchDetails,
      {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        prisonNumber: undefined,
        pncNumber: '01/98644M',
      },
    ],
    [
      State.newArrival,
      {
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        sex: 'MALE',
        prisonNumber: 'A1234AB',
        pncNumber: '01/98644M',
        expected: false,
      },
    ],
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/manually-confirm-arrival/search-for-existing-record/record-found')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should display correct page data', () => {
    return request(app)
      .get('/manually-confirm-arrival/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('An existing prisoner record has been found')
        expect($('.data-qa-arrival-prisoner-name').text()).toContain('James Smyth')
        expect($('.data-qa-arrival-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-arrival-prison-number').text()).toContain('')
        expect($('.data-qa-arrival-pnc-number').text()).toContain('01/98644M')
        expect($('.data-qa-existing-record-prisoner-name').text()).toContain('Jim Smith')
        expect($('.data-qa-existing-record-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-existing-record-prison-number').text()).toContain('A1234AB')
        expect($('.data-qa-existing-record-pnc-number').text()).toContain('01/98644M')
        expect($('[data-qa = "continue"]').text()).toContain('Continue')
      })
  })
})
