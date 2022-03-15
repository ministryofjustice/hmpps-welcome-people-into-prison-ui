import type { Express } from 'express'
import { type Arrival, Gender, type NewOffenderBooking } from 'welcome'
import request from 'supertest'
import * as cheerio from 'cheerio'

import { appWithAllRoutes, user, signedCookiesProvider, flashProvider } from '../../../__testutils/appSetup'
import { ExpectedArrivalsService, ImprisonmentStatusesService, RaiseAnalyticsEvent } from '../../../../services'
import Role from '../../../../authentication/role'
import config from '../../../../config'

jest.mock('../../../../services/expectedArrivalsService')
jest.mock('../../../../services/imprisonmentStatusesService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>
let app: Express
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

beforeEach(() => {
  signedCookiesProvider.mockReturnValue({
    'new-arrival': {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '01/98644M',
      sex: 'M',
      code: 'determinate-sentence',
      imprisonmentStatus: 'SENT',
      movementReasonCode: '26',
    },
  })
  app = appWithAllRoutes({
    services: { expectedArrivalsService, imprisonmentStatusesService, raiseAnalyticsEvent },
    roles: [Role.PRISON_RECEPTION],
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
  } as Arrival)
  expectedArrivalsService.createOffenderRecordAndBooking.mockResolvedValue({
    prisonNumber: 'A1234AB',
    location: 'Reception',
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

    it('should call service methods correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-answers')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(imprisonmentStatusesService.getReasonForImprisonment).toHaveBeenCalledWith({
            code: 'determinate-sentence',
            imprisonmentStatus: 'SENT',
            movementReasonCode: '26',
          })
        })
    })

    it('should render correct page when there is a prison number', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-answers')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Check your answers before adding')
        })
    })
    it('should render correct page when no matching prison number', () => {
      signedCookiesProvider.mockReturnValue({
        'new-arrival': {
          firstName: 'Jim',
          lastName: 'Smith',
          dateOfBirth: '1973-01-08',
          pncNumber: '01/98644M',
          sex: 'M',
          code: 'determinate-sentence',
          imprisonmentStatus: 'SENT',
          movementReasonCode: '26',
        },
      })
      return request(app)
        .get('/prisoners/12345-67890/check-answers')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain("You're about to add this person to the establishment roll")
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
      prisonNumber: 'A1234AB',
    }

    it('should redirect to /feature-not-available ', () => {
      expectedArrivalsService.createOffenderRecordAndBooking.mockResolvedValue(null)

      return request(app)
        .post('/prisoners/12345-67890/check-answers')
        .expect(302)
        .expect('Location', '/feature-not-available')
    })

    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [] })
      return request(app).post('/prisoners/12345-67890/check-answers').expect(302).expect('Location', '/autherror')
    })

    it('should call service methods correctly', () => {
      return request(app)
        .post('/prisoners/12345-67890/check-answers')
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

    it('should redirect to /confirmation page, store arrival response data in flash and raise analytics event', () => {
      return request(app)
        .post('/prisoners/12345-67890/check-answers')
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/confirmation')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('arrivalResponse', {
            firstName: 'Jim',
            lastName: 'Smith',
            location: 'Reception',
            prisonNumber: 'A1234AB',
          })
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
