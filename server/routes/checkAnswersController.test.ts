import type { Express } from 'express'
import { Gender, NewOffenderBooking } from 'welcome'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, user } from './testutils/appSetup'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'
import Role from '../authentication/role'

jest.mock('../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express
const flash = jest.fn()

jest.mock('../raiseAnalyticsEvent')

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, flash, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getMove.mockResolvedValue({
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/98644M',
    date: '2021-10-13',
    fromLocation: 'Some court',
    fromLocationType: 'COURT',
  })
  expectedArrivalsService.createOffenderRecordAndBooking.mockResolvedValue({
    offenderNo: 'A1234AB',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /checkAnswers', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/check-answers').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/check-answers')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('should render /check-answers page', () => {
    return request(app)
      .get('/prisoners/12345-67890/check-answers')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Check your answers before adding')
      })
  })
})

describe('POST /checkAnswers', () => {
  const newOffender: NewOffenderBooking = {
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    gender: Gender.NOT_SPECIFIED,
    prisonId: 'MDI',
    imprisonmentStatus: 'RX',
    movementReasonCode: 'N',
  }

  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ services: { expectedArrivalsService }, flash, roles: [] })
    return request(app)
      .post('/prisoners/12345-67890/check-answers')
      .send(newOffender)
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should call service methods correctly', () => {
    return request(app)
      .post('/prisoners/12345-67890/check-answers')
      .send(newOffender)
      .expect(302)
      .expect(() => {
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
        expect(expectedArrivalsService.createOffenderRecordAndBooking).toHaveBeenCalledWith(
          user.username,
          '12345-67890',
          newOffender
        )
      })
  })

  it('should redirect to /confirmation page, store offenderNumber in flash and raise analytics event', () => {
    return request(app)
      .post('/prisoners/12345-67890/check-answers')
      .send(newOffender)
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/confirmation')
      .expect(() => {
        expect(flash).toHaveBeenCalledWith('offenderNumber', 'A1234AB')
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Offender record and booking created',
          'AgencyId: MDI, From: Some court, Type: COURT,',
          '127.0.0.1'
        )
      })
  })
})
