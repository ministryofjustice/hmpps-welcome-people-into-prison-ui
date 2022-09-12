import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'
import { RaiseAnalyticsEvent } from '../../../../services'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { createArrival, createArrivalResponse, createPrisonerDetails } from '../../../../data/__testutils/testObjects'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'
import { MatchType } from '../../../../services/matchTypeDecorator'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

const courtReturn = createPrisonerDetails()

const arrival = {
  ...createArrival({
    fromLocationType: 'COURT',
    isCurrentPrisoner: true,
  }),
  matchType: MatchType.SINGLE_MATCH,
}
const arrivalResponse = createArrivalResponse()

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService, raiseAnalyticsEvent }, roles: [Role.PRISON_RECEPTION] })
  config.confirmEnabled = true
  config.confirmCourtReturnEnabled = true
  expectedArrivalsService.getPrisonerDetailsForArrival.mockResolvedValue(courtReturn)
  expectedArrivalsService.getArrival.mockResolvedValue(arrival)
  expectedArrivalsService.confirmCourtReturn.mockResolvedValue(arrivalResponse)
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
          expect(expectedArrivalsService.getPrisonerDetailsForArrival).toHaveBeenCalledWith('12345-67890')
        })
    })

    it('should render the correct data in /check-court-return page', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-court-return')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('This person is returning from court')
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
            firstName: courtReturn.firstName,
            lastName: courtReturn.lastName,
            prisonNumber: arrivalResponse.prisonNumber,
            location: arrivalResponse.location,
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
            `AgencyId: MDI, From: ${arrival.fromLocation}, Type: ${arrival.fromLocationType},`
          )
        })
    })

    it('should make call to confirm', () => {
      return request(app)
        .post('/prisoners/12345-67890/check-court-return')
        .expect(() => {
          expect(expectedArrivalsService.confirmCourtReturn).toHaveBeenCalledWith(
            'user1',
            '12345-67890',
            'MDI',
            'A1234AB'
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

    it('should redirect to feature-not-available', () => {
      expectedArrivalsService.confirmCourtReturn.mockResolvedValue(null)

      return request(app)
        .post('/prisoners/12345-67890/check-court-return')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(302)
        .expect('Location', '/feature-not-available')
    })
  })
})
