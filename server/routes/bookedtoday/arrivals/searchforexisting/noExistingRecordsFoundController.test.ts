import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import { createLockManager } from '../../../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()

beforeEach(() => {
  lockManager.isLocked.mockResolvedValue(false)
  config.confirmNoIdentifiersEnabled = true
  app = appWithAllRoutes({ services: { lockManager }, roles: [Role.PRISON_RECEPTION] })

  stubCookie(State.searchDetails, {
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    prisonNumber: undefined,
    pncNumber: '99/98644M',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('No records found', () => {
  describe('GET /view', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app)
        .get('/prisoners/12345-67890/search-for-existing-record/no-record-found')
        .expect(302)
        .expect('Location', '/autherror')
    })

    it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
      lockManager.isLocked.mockResolvedValue(true)
      return request(app)
        .get('/prisoners/12345-67890/search-for-existing-record/no-record-found')
        .expect(302)
        .expect('Location', '/duplicate-booking-prevention')
    })

    it('should display correct page heading', () => {
      return request(app)
        .get('/prisoners/12345-67890/search-for-existing-record/no-record-found')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('This person does not have an existing prisoner record')
          expect($('.data-qa-per-record-prisoner-name').text()).toContain('Jim Smith')
          expect($('.data-qa-per-record-dob').text()).toContain('8 January 1973')
          expect($('[data-qa = "continue"]').text()).toContain('Continue')
        })
    })
  })

  describe('POST /submit', () => {
    it('should update new arrival cookie and redirect to /review-per-details page', () => {
      return request(app)
        .post('/prisoners/12345-67890/search-for-existing-record/no-record-found')
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/review-per-details')
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toEqual({
            dateOfBirth: '1973-01-08',
            expected: 'true',
            firstName: 'Jim',
            lastName: 'Smith',
            pncNumber: '99/98644M',
          })
        })
    })
  })
})
