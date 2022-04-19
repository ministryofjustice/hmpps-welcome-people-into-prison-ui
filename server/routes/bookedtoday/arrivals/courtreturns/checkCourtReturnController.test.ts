import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import moment from 'moment'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'
import { ExpectedArrivalsService, RaiseAnalyticsEvent } from '../../../../services'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { createArrival, createArrivalResponse, createPrisonerDetails } from '../../../../data/__testutils/testObjects'

jest.mock('../../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

const courtReturn = createPrisonerDetails()
const arrival = createArrival({ fromLocationType: 'COURT', isCurrentPrisoner: true })
const arrivalResponse = createArrivalResponse()

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService, raiseAnalyticsEvent }, roles: [Role.PRISON_RECEPTION] })
  config.confirmEnabled = true
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
          expect($('.data-qa-per-record-prisoner-name').text()).toContain(`${arrival.firstName} ${arrival.lastName}`)
          expect($('.data-qa-per-record-dob').text()).toContain(
            moment(arrival.dateOfBirth, 'YYYY-MM-DD').format('D MMMM YYYY')
          )
          expect($('.data-qa-per-record-prison-number').text()).toContain(arrival.prisonNumber)
          expect($('.data-qa-per-record-pnc-number').text()).toContain(arrival.pncNumber)
          expect($('.data-qa-existing-record-prisoner-name').text()).toContain(
            `${arrival.firstName} ${arrival.lastName}`
          )
          expect($('.data-qa-existing-record-dob').text()).toContain(
            moment(arrival.dateOfBirth, 'YYYY-MM-DD').format('D MMMM YYYY')
          )
          expect($('.data-qa-existing-record-prison-number').text()).toContain(arrival.prisonNumber)
          expect($('.data-qa-existing-record-pnc-number').text()).toContain(arrival.pncNumber)
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
  })
})
