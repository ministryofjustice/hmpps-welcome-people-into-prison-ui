import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'

import { appWithAllRoutes, user, stubCookie, flashProvider } from '../../../__testutils/appSetup'
import { ExpectedArrivalsService, ImprisonmentStatusesService } from '../../../../services'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { State } from '../state'
import { createArrivalResponse, createNewArrival } from '../../../../data/__testutils/testObjects'

jest.mock('../../../../services/expectedArrivalsService')
jest.mock('../../../../services/imprisonmentStatusesService')

const expectedArrivalsService = new ExpectedArrivalsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ExpectedArrivalsService>
const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>
let app: Express

const arrivalId = '1111-2222-3333-4444'
const newArrival = createNewArrival()
const arrivalResponse = createArrivalResponse()

beforeEach(() => {
  stubCookie(State.newArrival, newArrival)
  app = appWithAllRoutes({
    services: { expectedArrivalsService, imprisonmentStatusesService },
    roles: [Role.PRISON_RECEPTION],
  })
  config.confirmEnabled = true
  expectedArrivalsService.confirmArrival.mockResolvedValue(arrivalResponse)
  imprisonmentStatusesService.getReasonForImprisonment.mockResolvedValue(
    'Sentenced - fixed length of time - Extended sentence for public protection'
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/checkAnswers', () => {
  describe('view()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get(`/prisoners/${arrivalId}/check-answers`).expect(302).expect('Location', '/autherror')
    })

    it('should call service methods correctly', () => {
      return request(app)
        .get(`/prisoners/${arrivalId}/check-answers`)
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(imprisonmentStatusesService.getReasonForImprisonment).toHaveBeenCalledWith({
            code: newArrival.code,
            imprisonmentStatus: newArrival.imprisonmentStatus,
            movementReasonCode: newArrival.movementReasonCode,
          })
        })
    })

    it('should render correct page when there is a prison number', () => {
      return request(app)
        .get(`/prisoners/${arrivalId}/check-answers`)
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Check your answers before adding')
        })
    })
    it('should render correct page when no matching prison number', () => {
      stubCookie(State.newArrival, createNewArrival({ prisonNumber: null }))
      return request(app)
        .get(`/prisoners/${arrivalId}/check-answers`)
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain("You're about to add this person to the establishment roll")
        })
    })
  })

  describe('addToRoll()', () => {
    it('should redirect to /feature-not-available ', () => {
      expectedArrivalsService.confirmArrival.mockResolvedValue(null)

      return request(app)
        .post(`/prisoners/${arrivalId}/check-answers`)
        .expect(302)
        .expect('Location', '/feature-not-available')
    })

    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [] })
      return request(app).post(`/prisoners/${arrivalId}/check-answers`).expect(302).expect('Location', '/autherror')
    })

    it('should call service methods correctly', () => {
      return request(app)
        .post(`/prisoners/${arrivalId}/check-answers`)
        .expect(302)
        .expect(() => {
          expect(expectedArrivalsService.confirmArrival).toHaveBeenCalledWith(
            'MDI',
            user.username,
            arrivalId,
            newArrival
          )
        })
    })

    it('should redirect to /confirmation page, store arrival response data in flash', () => {
      return request(app)
        .post(`/prisoners/${arrivalId}/check-answers`)
        .expect(302)
        .expect('Location', `/prisoners/${arrivalId}/confirmation`)
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('arrivalResponse', {
            firstName: newArrival.firstName,
            lastName: newArrival.lastName,
            location: arrivalResponse.location,
            prisonNumber: arrivalResponse.prisonNumber,
          })
        })
    })
  })
})
