import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import { ExpectedArrivalsService, RaiseAnalyticsEvent } from '../../../services'
import Role from '../../../authentication/role'
import config from '../../../config'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

const courtReturn = {
  firstName: 'Jim',
  lastName: 'Smith',
  dateOfBirth: '1973-01-08',
  prisonNumber: 'A1234AB',
  pncNumber: '01/98644M',
  date: '2021-10-13',
  fromLocation: 'Some court',
  fromLocationType: 'COURT',
}

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService, raiseAnalyticsEvent }, roles: [Role.PRISON_RECEPTION] })
  config.confirmEnabled = true
  expectedArrivalsService.getArrival.mockResolvedValue(courtReturn)
  expectedArrivalsService.confirmCourtReturn.mockResolvedValue({
    prisonNumber: 'A1234AB',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('checkCourtReturnController', () => {
  describe('GET view', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/check-court-return').expect(302).expect('Location', '/autherror')
    })

    it('should call service method correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-court-return')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
        })
    })

    it('should render the correct data in /check-court-return page', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-court-return')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('This person is returning from court')
          expect($('.data-qa-name').text()).toContain('Jim Smith')
          expect($('.data-qa-dob').text()).toContain('8 January 1973')
          expect($('.data-qa-prison-number').text()).toContain('A1234AB')
          expect($('.data-qa-pnc-number').text()).toContain('01/98644M')
          expect($('[data-qa = "add-to-roll"]').text()).toContain('Confirm prisoner has returned')
          expect(res.text).toContain('/prisoners/12345-67890/check-court-return')
        })
    })
  })

  describe('POST addToRoll', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).post('/prisoners/12345-67890/check-court-return').expect(302).expect('Location', '/autherror')
    })

    it('should set flash with correct args', () => {
      return request(app)
        .post('/prisoners/12345-67890/check-court-return')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('prisoner', {
            firstName: 'Jim',
            lastName: 'Smith',
            prisonNumber: 'A1234AB',
          })
        })
    })

    it('should call google analytics', () => {
      return request(app)
        .post('/prisoners/12345-67890/check-court-return')
        .expect(() => {
          expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
            'Add to the establishment roll',
            'Confirmed court return returned',
            'AgencyId: MDI, From: Some court, Type: COURT,',
            '127.0.0.1'
          )
        })
    })

    it('should redirect to added to roll confirmation page', () => {
      return request(app)
        .post('/prisoners/12345-67890/check-court-return')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/prisoner-returned-from-court')
    })
  })
})
