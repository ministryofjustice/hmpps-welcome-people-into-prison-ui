import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { SearchDetails, State } from '../state'
import { createPotentialMatch } from '../../../../data/__testutils/testObjects'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'
import { createLockManager } from '../../../../data/__testutils/mocks'

const potentialMatch = createPotentialMatch({
  firstName: 'Jim',
  lastName: 'Smith',
  dateOfBirth: '1973-01-08',
  prisonNumber: 'A1234AB',
  pncNumber: '01/98644M',
})
const expectedArrivalsService = createMockExpectedArrivalsService()
const searchData = {
  firstName: 'James',
  lastName: 'Smyth',
  dateOfBirth: '1973-01-08',
  prisonNumber: undefined,
  pncNumber: '01/98644M',
} as SearchDetails

let app: Express
const lockManager = createLockManager()

beforeEach(() => {
  lockManager.isLocked.mockResolvedValue(false)
  config.confirmNoIdentifiersEnabled = true
  expectedArrivalsService.getMatchingRecords.mockResolvedValue([potentialMatch])
  app = appWithAllRoutes({ services: { expectedArrivalsService, lockManager }, roles: [Role.PRISON_RECEPTION] })
  stubCookie(State.searchDetails, searchData)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.isLocked.mockResolvedValue(true)
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })
  it('should throw error when multiple matches found', () => {
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([potentialMatch, potentialMatch])
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(500)
  })

  it('should throw error when no matches', () => {
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([])
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(500)
  })

  it('should display correct page content', () => {
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person has an existing prisoner record')
        expect($('.data-qa-per-record-prisoner-name').text()).toContain('James Smyth')
        expect($('.data-qa-per-record-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-per-record-prison-number').text()).toContain('')
        expect($('.data-qa-per-record-pnc-number').text()).toContain('01/98644M')
        expect($('.data-qa-existing-record-prisoner-name').text()).toContain('Jim Smith')
        expect($('.data-qa-existing-record-dob').text()).toContain('8 January 1973')
        expect($('.data-qa-existing-record-prison-number').text()).toContain('A1234AB')
        expect($('.data-qa-existing-record-pnc-number').text()).toContain('01/98644M')
        expect($('[data-qa = "continue"]').text()).toContain('Continue')
      })
  })
})

describe('POST /submit', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should throw error when multiple matches found', () => {
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([potentialMatch, potentialMatch])
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(500)
  })

  it('should throw error when no matches', () => {
    expectedArrivalsService.getMatchingRecords.mockResolvedValue([])
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(500)
  })

  it('should call upstream services', () => {
    return request(app).post('/prisoners/12345-67890/search-for-existing-record/record-found')
    expect(expectedArrivalsService).toHaveBeenCalledWith(searchData)
  })

  it('should redirect to start-confirmation journey on success', () => {
    return request(app)
      .post('/prisoners/12345-67890/search-for-existing-record/record-found')
      .expect(302)
      .expect('Location', `/prisoners/12345-67890/start-confirmation`)
    expect(expectedArrivalsService).toHaveBeenCalledWith(searchData)
  })
})
