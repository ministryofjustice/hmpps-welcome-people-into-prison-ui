import type { Express } from 'express'
import { Sex } from 'welcome'
import request from 'supertest'
import * as cheerio from 'cheerio'

import { appWithAllRoutes, user, stubCookie, flashProvider } from '../../../__testutils/appSetup'
import { ExpectedArrivalsService, ImprisonmentStatusesService } from '../../../../services'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { NewArrival, State } from '../state'

jest.mock('../../../../services/expectedArrivalsService')
jest.mock('../../../../services/imprisonmentStatusesService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>
const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>
let app: Express

beforeEach(() => {
  stubCookie(State.newArrival, {
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/98644M',
    sex: 'M',
    code: 'determinate-sentence',
    imprisonmentStatus: 'SENT',
    movementReasonCode: '26',
    expected: true,
  })
  app = appWithAllRoutes({
    services: { expectedArrivalsService, imprisonmentStatusesService },
    roles: [Role.PRISON_RECEPTION],
  })
  config.session.secret = 'sdksdfkdfs'
  config.confirmEnabled = true
  expectedArrivalsService.confirmArrival.mockResolvedValue({
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
      stubCookie(State.newArrival, {
        firstName: 'Jim',
        lastName: 'Smith',
        dateOfBirth: '1973-01-08',
        pncNumber: '01/98644M',
        sex: 'M',
        code: 'determinate-sentence',
        imprisonmentStatus: 'SENT',
        movementReasonCode: '26',
        expected: true,
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
    const detail: NewArrival = {
      firstName: 'Jim',
      lastName: 'Smith',
      dateOfBirth: '1973-01-08',
      sex: Sex.MALE,
      imprisonmentStatus: 'SENT',
      code: 'determinate-sentence',
      movementReasonCode: '26',
      pncNumber: '01/98644M',
      prisonNumber: 'A1234AB',
      expected: true,
    }

    it('should redirect to /feature-not-available ', () => {
      expectedArrivalsService.confirmArrival.mockResolvedValue(null)

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
          expect(expectedArrivalsService.confirmArrival).toHaveBeenCalledWith(
            'MDI',
            user.username,
            '12345-67890',
            detail
          )
        })
    })

    it('should redirect to /confirmation page, store arrival response data in flash', () => {
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
        })
    })
  })
})
