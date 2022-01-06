import type { Express } from 'express'
import { Gender, NewOffenderBooking } from 'welcome'
import request from 'supertest'
import cheerio from 'cheerio'
import createError from 'http-errors'
import { appWithAllRoutes, user } from './testutils/appSetup'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'
import Role from '../authentication/role'
import config from '../config'
import { mockNext, mockRequest, mockResponse } from './testutils/requestTestUtils'
import CheckAnswersController from './checkAnswersController'
import * as state from './state'

jest.mock('../services/expectedArrivalsService')
jest.mock('../services/imprisonmentStatusesService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>
let app: Express
const flash = jest.fn()

jest.mock('../raiseAnalyticsEvent')

beforeEach(() => {
  app = appWithAllRoutes({
    services: { expectedArrivalsService, imprisonmentStatusesService },
    flash,
    roles: [Role.PRISON_RECEPTION],
    signedCookies: {
      sex: { data: 'M' },
      'status-and-reason': {
        code: 'determinate-sentence',
        imprisonmentStatus: 'SENT',
        movementReasonCode: '26',
      },
    },
  })
  config.session.secret = 'sdksdfkdfs'
  config.confirmEnabled = true
  expectedArrivalsService.getArrival.mockResolvedValue({
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
  imprisonmentStatusesService.getReasonForImprisonment.mockResolvedValue(
    'Determinate sentence - Extended sentence for public protection'
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/checkAnswers', () => {
  describe('view()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/check-answers').expect(302).expect('Location', '/autherror')
    })

    it('should get status and reason from cookie and call service methods correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-answers')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
          expect(imprisonmentStatusesService.getReasonForImprisonment).toHaveBeenCalledWith({
            code: 'determinate-sentence',
            imprisonmentStatus: 'SENT',
            movementReasonCode: '26',
          })
        })
    })

    it('should render /check-answers page', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-answers')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Check your answers before adding')
        })
    })
  })

  describe('addToRoll()', () => {
    const newOffender: NewOffenderBooking = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      gender: Gender.MALE,
      prisonId: 'MDI',
      imprisonmentStatus: 'SENT',
      movementReasonCode: '26',
    }

    it('should redirect to /feature-not-available ', () => {
      const error = createError(404, 'Not found')
      expectedArrivalsService.createOffenderRecordAndBooking.mockRejectedValue(error)

      return request(app)
        .post('/prisoners/12345-67890/check-answers')
        .send(newOffender)
        .expect(302)
        .expect('Location', '/feature-not-available')
    })

    it('should catch non-4xx errors', () => {
      const error = createError(500, 'Internal Server Error')
      expectedArrivalsService.createOffenderRecordAndBooking.mockRejectedValue(error)

      return request(app).post('/prisoners/12345-67890/check-answers').send(newOffender).expect(500)
    })

    it('should call next() for non-4xx errors', async () => {
      const req = mockRequest({})
      const res = mockResponse({})
      const next = mockNext()
      const error = createError(500, 'Internal Server Error')
      expectedArrivalsService.createOffenderRecordAndBooking.mockRejectedValue(error)

      const mockGetImprisonmentStatus = jest.spyOn(state, 'getImprisonmentStatus')
      mockGetImprisonmentStatus.mockReturnValue({
        code: 'determinate-sentence',
        imprisonmentStatus: 'SENT',
        movementReasonCode: '26',
      })

      const controller = new CheckAnswersController(expectedArrivalsService, imprisonmentStatusesService)
      await controller.addToRoll()(req, res, next)

      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      mockGetImprisonmentStatus.mockRestore()
    })

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
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
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
            'Confirmed arrival',
            'AgencyId: MDI, From: Some court, Type: COURT,',
            '127.0.0.1'
          )
        })
    })
  })
})
