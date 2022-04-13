import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import { State } from '../arrivals/state'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('no existing records', () => {
  describe('view', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/record-found')
        .expect(302)
        .expect('Location', '/autherror')
    })

    it('should display correct page data', () => {
      stubCookie(State.searchDetails, {
        firstName: 'James',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        prisonNumber: undefined,
        pncNumber: '01/98644M',
      })
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/no-record-found')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('This person does not have an existing prisoner record')
          expect($('.data-qa-arrival-prisoner-name').text()).toContain('James Smyth')
          expect($('.data-qa-arrival-dob').text()).toContain('8 January 1973')
          expect($('.data-qa-arrival-prison-number').text()).toContain('Not entered')
          expect($('.data-qa-arrival-pnc-number').text()).toContain('01/98644M')
          expect($('[data-qa = "continue"]').text()).toContain('Continue')
        })
    })

    it('should display partial prisoner name', () => {
      stubCookie(State.searchDetails, {
        firstName: undefined,
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        prisonNumber: undefined,
        pncNumber: undefined,
      })
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/no-record-found')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.data-qa-arrival-prisoner-name').text()).toContain('Smyth')
          expect($('.data-qa-arrival-prisoner-name').text()).not.toContain('undefined')
        })
    })

    it('should display alternative search text for name and date of birth', () => {
      stubCookie(State.searchDetails, {
        firstName: undefined,
        lastName: undefined,
        dateOfBirth: undefined,
        prisonNumber: 'A12345BC',
        pncNumber: '01/98644M',
      })
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/no-record-found')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.data-qa-arrival-prisoner-name').text()).toContain('Not entered')
          expect($('.data-qa-arrival-dob').text()).toContain('Not entered')
          expect($('.data-qa-arrival-prisoner-name').text()).not.toContain('undefined')
          expect($('.data-qa-arrival-dob').text()).not.toContain('undefined')
        })
    })
    it('should display alternative search text for prison and pnc', () => {
      stubCookie(State.searchDetails, {
        firstName: 'Jim',
        lastName: 'Smyth',
        dateOfBirth: '1973-01-08',
        prisonNumber: undefined,
        pncNumber: undefined,
      })
      return request(app)
        .get('/manually-confirm-arrival/search-for-existing-record/no-record-found')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('.data-qa-arrival-prison-number').text()).toContain('Not entered')
          expect($('.data-qa-arrival-pnc-number').text()).toContain('Not entered')
          expect($('.data-qa-arrival-prison-number').text()).not.toContain('undefined')
          expect($('.data-qa-arrival-pnc-number').text()).not.toContain('undefined')
        })
    })
  })

  describe('submit', () => {
    it('should redirect to authentication error page if user dones not have correct role', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record/no-record-found')
        .expect(302)
        .expect('Location', '/autherror')
    })
    it('should redirect to add-personal-details page', () => {
      return request(app)
        .post('/manually-confirm-arrival/search-for-existing-record/no-record-found')
        .expect(302)
        .expect('Location', '/manually-confirm-arrival/add-personal-details')
    })
  })
})
