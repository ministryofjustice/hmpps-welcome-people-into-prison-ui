import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { State } from '../state'

let app: Express

beforeEach(() => {
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
  stubCookie(State.searchDetails, {
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    prisonNumber: undefined,
    pncNumber: undefined,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/no-record-found')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should display correct page heading', () => {
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/no-record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person does not have an existing prisoner record')
        expect($('.data-qa-per-record-prisoner-name').text()).toContain('James Smyth')
        expect($('.data-qa-per-record-dob').text()).toContain('8 January 1973')
        expect($('[data-qa = "continue"]').text()).toContain('Continue')
      })
  })
})
