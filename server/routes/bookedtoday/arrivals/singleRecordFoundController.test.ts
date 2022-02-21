import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, signedCookiesProvider } from '../../__testutils/appSetup'

import Role from '../../../authentication/role'

let app: Express

beforeEach(() => {
  signedCookiesProvider.mockReturnValue({
    'new-arrival': {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '01/98644M',
      potentialMatches: JSON.stringify([
        {
          firstName: 'Jim',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          prisonNumber: 'A1234AB',
          pncNumber: '01/98644M',
        },
      ]),
    },
  })
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/record-found').expect(302).expect('Location', '/autherror')
  })

  it('should display correct page heading', () => {
    return request(app)
      .get('/prisoners/12345-67890/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person has an existing prisoner record')
        expect($('.data-qa-per-record-prisoner-name').text()).toContain('Jim Smith')
        expect($('.data-qa-per-record-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-per-record-prison-number').text()).toContain('A1234AB')
        expect($('.data-qa-per-record-pnc-number').text()).toContain('01/98644M')
        expect($('.data-qa-existing-record-prisoner-name').text()).toContain('Jim Smith')
        expect($('.data-qa-existing-record-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-existing-record-prison-number').text()).toContain('A1234AB')
        expect($('.data-qa-existing-record-pnc-number').text()).toContain('01/98644M')
        expect($('[data-qa = "continue"]').text()).toContain('Continue')
      })
  })
})
