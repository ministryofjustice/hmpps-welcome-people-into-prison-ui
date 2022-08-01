import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../__testutils/appSetup'
import { TemporaryAbsencesService, RaiseAnalyticsEvent } from '../../services'

import Role from '../../authentication/role'
import config from '../../config'
import { createTemporaryAbsence } from '../../data/__testutils/testObjects'

jest.mock('../../services/temporaryAbsencesService')
const temporaryAbsencesService = new TemporaryAbsencesService(null, null) as jest.Mocked<TemporaryAbsencesService>
let app: Express
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

beforeEach(() => {
  app = appWithAllRoutes({
    services: { temporaryAbsencesService, raiseAnalyticsEvent },
    roles: [Role.PRISON_RECEPTION],
  })
  config.confirmEnabled = true
  temporaryAbsencesService.getTemporaryAbsence.mockResolvedValue(createTemporaryAbsence())
  temporaryAbsencesService.confirmTemporaryAbsence.mockResolvedValue({
    prisonNumber: 'A1234AA',
    location: 'Reception',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET checkTemporaryAbsence', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AA/check-temporary-absence').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', /text\/html/)
      .expect(() => {
        expect(temporaryAbsencesService.getTemporaryAbsence).toHaveBeenCalledWith('MDI', 'A1234AA')
      })
  })

  it('should render the correct data in /check-temporary-absence page', () => {
    return request(app)
      .get('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person will be returned to prison')
        expect(res.text).toContain('/prisoners/A1234AA/check-temporary-absence')
      })
  })
})

describe('POST addToRoll', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).post('/prisoners/A1234AA/check-temporary-absence').expect(302).expect('Location', '/autherror')
  })

  it('should call service to confirm the temporary absence', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(temporaryAbsencesService.confirmTemporaryAbsence).toHaveBeenCalledWith('user1', 'A1234AA', 'MDI')
      })
  })

  it('should set flash with correct args', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('prisoner', {
          firstName: 'Sam',
          lastName: 'Smith',
          location: 'Reception',
        })
      })
  })

  it('should call google analytics', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect(() => {
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Confirmed temporary absence returned',
          "AgencyId: MDI, Reason: Hospital appointment, Type: 'PRISON',"
        )
      })
  })

  it('should redirect to added to roll confirmation page', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/prisoners/A1234AA/prisoner-returned')
  })

  it('should redirect to feature-not-available', () => {
    temporaryAbsencesService.confirmTemporaryAbsence.mockResolvedValue(null)

    return request(app)
      .post('/prisoners/A1234AA/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/feature-not-available')
  })
})
