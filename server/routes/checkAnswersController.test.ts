import type { Express } from 'express'
import type { NewOffenderBooking } from 'welcome'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, user } from './testutils/appSetup'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

jest.mock('../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService } })
  expectedArrivalsService.getMove.mockResolvedValue({
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A12345AB',
    pncNumber: '01/98644M',
    date: '2021-10-13',
    fromLocation: 'Some court',
    fromLocationType: 'COURT',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /checkAnswers', () => {
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
    gender: 'M',
    prisonId: 'MDI',
    imprisonmentStatus: 'RX',
    movementReasonCode: 'N',
  }
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

  it('should redirect /confirmation page', () => {
    return request(app)
      .post('/prisoners/12345-67890/check-answers')
      .send(newOffender)
      .expect(302)
      .expect('Location', '/prisoners/12345-67890/confirmation')
  })
})
