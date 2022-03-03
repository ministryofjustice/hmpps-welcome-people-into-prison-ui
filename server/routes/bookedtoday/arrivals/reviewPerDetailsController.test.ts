import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { type Arrival, GenderKeys } from 'welcome'
import { appWithAllRoutes } from '../../__testutils/appSetup'
import ExpectedArrivalsService, { LocationType } from '../../../services/expectedArrivalsService'
import Role from '../../../authentication/role'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue({
    id: '1111-2222-3333-4444',
    firstName: 'James',
    lastName: 'Smyth',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/98644M',
    date: '2021-09-01',
    fromLocation: 'Reading',
    moveType: 'PRISON_REMAND',
    fromLocationType: LocationType.COURT,
    gender: GenderKeys.MALE,
    isCurrentPrisoner: false,
    potentialMatches: [],
  } as Arrival)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/info-from-per', () => {
  describe('GET /view', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/info-from-per').expect(302).expect('Location', '/autherror')
    })

    it('should display correct page heading', () => {
      return request(app)
        .get('/prisoners/12345-67890/info-from-per')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Review personal details from Person Escort Record')
          expect($('.data-qa-name').text()).toContain('James Smyth')
          expect($('.data-qa-dob').text()).toContain('8 January 1973')
          expect($('[data-qa = "continue"]').text()).toContain('Continue')
        })
    })
  })

  describe('submit()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [] })
      return request(app).post('/prisoners/12345-67890/check-answers').expect(302).expect('Location', '/autherror')
    })

    it('should call service methods correctly', () => {
      return request(app)
        .post('/prisoners/12345-67890/info-from-per')
        .expect(302)
        .expect(() => {
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
        })
    })

    it('should set state', () => {
      return request(app)
        .post('/prisoners/12345-67890/info-from-per')
        .expect(res => {
          expectSettingCookie(res, 'new-arrival').toStrictEqual({
            firstName: 'James',
            lastName: 'Smyth',
            dateOfBirth: '1973-01-08',
            sex: 'MALE',
            prisonNumber: 'A1234AB',
            pncNumber: '01/98644M',
          })
        })
    })

    it('should redirect to /sex page', () => {
      return request(app)
        .post('/prisoners/12345-67890/info-from-per')
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/sex')
    })
  })
})
