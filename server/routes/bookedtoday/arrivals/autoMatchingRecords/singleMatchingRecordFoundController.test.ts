import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import { createArrival, createPotentialMatch } from '../../../../data/__testutils/testObjects'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'
import { MatchType } from '../../../../services/matchTypeDecorator'
import { createLockManager } from '../../../../data/__testutils/mocks'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()
const lockManager = createLockManager()

const arrival = {
  ...createArrival({
    prisonNumber: null,
    potentialMatches: [createPotentialMatch({ prisonNumber: 'A1234AB' })],
  }),
  matchType: MatchType.SINGLE_MATCH,
}

beforeEach(() => {
  lockManager.isLocked.mockResolvedValue(false)
  app = appWithAllRoutes({ services: { expectedArrivalsService, lockManager }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(arrival)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/record-found').expect(302).expect('Location', '/autherror')
  })
  it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
    lockManager.isLocked.mockResolvedValue(true)
    return request(app)
      .get('/prisoners/12345-67890/record-found')
      .expect(302)
      .expect('Location', '/duplicate-booking-prevention')
  })
  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('user1', '12345-67890')
      })
  })

  it('should set state', () => {
    return request(app)
      .get('/prisoners/12345-67890/record-found')
      .expect(res => {
        const { croNumber, arrivalType, arrivalTypeDescription, ...fields } = arrival.potentialMatches[0]
        expectSettingCookie(res, State.newArrival).toStrictEqual({ expected: 'true', ...fields })
      })
  })

  it('should display correct page heading', () => {
    return request(app)
      .get('/prisoners/12345-67890/record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person has an existing prisoner record')
      })
  })
})
