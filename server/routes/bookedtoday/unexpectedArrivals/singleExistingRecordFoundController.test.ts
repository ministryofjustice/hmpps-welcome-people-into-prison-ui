import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookies, stubCookie } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import { State } from '../arrivals/state'
import { createMockExpectedArrivalsService } from '../../../services/__testutils/mocks'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
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
  it('should display partial prisoner name', () => {
    stubCookie(State.searchDetails, {
      firstName: undefined,
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234BC',
      pncNumber: '11/5678',
    })

    return request(app)
      .get('/manually-confirm-arrival/search-for-existing-record/possible-records-found')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.data-qa-arrival-details-prisoner-name').text()).toContain('Smith')
        expect($('.data-qa-arrival-details-prisoner-name').text()).not.toContain('undefined')
      })
  })

  it('should display alternative text for name and dob', () => {
    stubCookies([
      [
        State.searchDetails,
        {
          firstName: undefined,
          lastName: undefined,
          dateOfBirth: undefined,
          prisonNumber: 'A1234BC',
          pncNumber: '11/5678',
        },
      ],
    ])
    return request(app)
      .get('/manually-confirm-arrival/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.data-qa-arrival-prisoner-name').text()).toContain('Not entered')
        expect($('.data-qa-arrival-dob').text()).toContain('Not entered')
      })
  })
  it('should display alternative text for prison and pnc', () => {
    stubCookies([
      [
        State.searchDetails,
        {
          firstName: 'Jim',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          prisonNumber: undefined,
          pncNumber: undefined,
        },
      ],
    ])
    return request(app)
      .get('/manually-confirm-arrival/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.data-qa-arrival-prison-number').text()).toContain('Not entered')
        expect($('.data-qa-arrival-pnc-number').text()).toContain('Not entered')
      })
  })
})
