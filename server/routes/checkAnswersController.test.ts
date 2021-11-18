import type { Express } from 'express'
import moment from 'moment'
import { Gender, NewOffenderBooking } from 'welcome'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, user } from './testutils/appSetup'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'
import Role from '../authentication/role'
import config from '../config'

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
  })
  config.session.secret = 'sdksdfkdfs'
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
  imprisonmentStatusesService.getReasonForImprisonment.mockResolvedValue(
    'Determinate sentence - Extended sentence for public protection'
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

const hourFromNow = moment().add(1, 'hour').format('ddd, D MMM yyyy HH:mm:ss [GMT]').toString()

describe('/checkAnswers', () => {
  describe('view()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/check-answers').expect(302).expect('Location', '/autherror')
    })

    it('should get status and reason from cookie and call service methods correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/check-answers')
        .set(
          'cookie',
          `status-and-reason=s%3Aj%3A%7B%22code%22%3A%22determinate-sentence%22%2C%22imprisonmentStatus%22%3A%22SENT%22%2C%22movementReasonCode%22%3A%2226%22%7D.QEx%2B2EcyCfMkSknBJwkaVswIBLsUTbGFLkXur2qN%2Fro; Max-Age=7200; Domain=localhost; Path=/; Expires=${hourFromNow}; HttpOnly; SameSite=Lax`
        )
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
          expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
          expect(imprisonmentStatusesService.getReasonForImprisonment).toHaveBeenCalledTimes(1)
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
        .set(
          'cookie',
          `status-and-reason=s%3Aj%3A%7B%22code%22%3A%22determinate-sentence%22%2C%22imprisonmentStatus%22%3A%22SENT%22%2C%22movementReasonCode%22%3A%2226%22%7D.QEx%2B2EcyCfMkSknBJwkaVswIBLsUTbGFLkXur2qN%2Fro; Max-Age=7200; Domain=localhost; Path=/; Expires=${hourFromNow}; HttpOnly; SameSite=Lax`
        )
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
      gender: Gender.NOT_SPECIFIED,
      prisonId: 'MDI',
      imprisonmentStatus: 'SENT',
      movementReasonCode: '26',
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
        .set(
          'cookie',
          `status-and-reason=s%3Aj%3A%7B%22code%22%3A%22determinate-sentence%22%2C%22imprisonmentStatus%22%3A%22SENT%22%2C%22movementReasonCode%22%3A%2226%22%7D.QEx%2B2EcyCfMkSknBJwkaVswIBLsUTbGFLkXur2qN%2Fro; Max-Age=7200; Domain=localhost; Path=/; Expires=${hourFromNow}; HttpOnly; SameSite=Lax`
        )
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
        .set(
          'cookie',
          `status-and-reason=s%3Aj%3A%7B%22code%22%3A%22determinate-sentence%22%2C%22imprisonmentStatus%22%3A%22SENT%22%2C%22movementReasonCode%22%3A%2226%22%7D.QEx%2B2EcyCfMkSknBJwkaVswIBLsUTbGFLkXur2qN%2Fro; Max-Age=7200; Domain=localhost; Path=/; Expires=${hourFromNow}; HttpOnly; SameSite=Lax`
        )
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
