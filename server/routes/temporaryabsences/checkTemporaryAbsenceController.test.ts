import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../__testutils/appSetup'
import { TemporaryAbsencesService, RaiseAnalyticsEvent } from '../../services'

import Role from '../../authentication/role'
import config from '../../config'

jest.mock('../../services/temporaryAbsencesService')
const temporaryAbsencesService = new TemporaryAbsencesService(null, null) as jest.Mocked<TemporaryAbsencesService>
let app: Express
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

const temporaryAbsence = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1971-01-01',
  prisonNumber: 'G0013AB',
  reasonForAbsence: 'Hospital appointment',
  movementDateTime: '2022-01-17T14:20:00',
}

beforeEach(() => {
  app = appWithAllRoutes({
    services: { temporaryAbsencesService, raiseAnalyticsEvent },
    roles: [Role.PRISON_RECEPTION],
  })
  config.confirmEnabled = true
  temporaryAbsencesService.getTemporaryAbsence.mockResolvedValue(temporaryAbsence)
  temporaryAbsencesService.confirmTemporaryAbsence.mockResolvedValue({
    prisonNumber: 'G0013AB',
    location: 'Reception',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET checkTemporaryAbsence', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/G0013AB/check-temporary-absence').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/G0013AB/check-temporary-absence')
      .expect('Content-Type', /text\/html/)
      .expect(() => {
        expect(temporaryAbsencesService.getTemporaryAbsence).toHaveBeenCalledWith('MDI', 'G0013AB')
      })
  })

  it('should render the correct data in /check-temporary-absence page', () => {
    return request(app)
      .get('/prisoners/G0013AB/check-temporary-absence')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person will be returned to prison')
        expect($('.data-qa-name').text()).toContain('John Doe')
        expect($('.data-qa-dob').text()).toContain('1 January 1971')
        expect($('.data-qa-prison-number').text()).toContain('G0013AB')
        expect($('.data-qa-reason-for-absence').text()).toContain('Hospital appointment')
        expect($('[data-qa = "add-to-roll"]').text()).toContain('Confirm prisoner has returned')
        expect(res.text).toContain('/prisoners/G0013AB/check-temporary-absence')
      })
  })
})

describe('POST addToRoll', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).post('/prisoners/G0013AB/check-temporary-absence').expect(302).expect('Location', '/autherror')
  })

  it('should call service to confirm the temporary absence', () => {
    return request(app)
      .post('/prisoners/G0013AB/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(temporaryAbsencesService.confirmTemporaryAbsence).toHaveBeenCalledWith('user1', 'G0013AB', 'MDI')
      })
  })

  it('should set flash with correct args', () => {
    return request(app)
      .post('/prisoners/G0013AB/check-temporary-absence')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('prisoner', {
          firstName: 'John',
          lastName: 'Doe',
          location: 'Reception',
        })
      })
  })

  it('should call google analytics', () => {
    return request(app)
      .post('/prisoners/G0013AB/check-temporary-absence')
      .expect(() => {
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Confirmed temporary absence returned',
          "AgencyId: MDI, Reason: Hospital appointment, Type: 'PRISON',",
          '127.0.0.1'
        )
      })
  })

  it('should redirect to added to roll confirmation page', () => {
    return request(app)
      .post('/prisoners/G0013AB/check-temporary-absence')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/prisoners/G0013AB/prisoner-returned')
  })
})
