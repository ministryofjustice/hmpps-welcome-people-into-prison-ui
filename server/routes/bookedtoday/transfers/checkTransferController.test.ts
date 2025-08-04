import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import { RaiseAnalyticsEvent } from '../../../services'
import Role from '../../../authentication/role'
import config from '../../../config'
import { createTransfer } from '../../../data/__testutils/testObjects'
import { createMockTransfersService } from '../../../services/__testutils/mocks'

let app: Express
const transfersService = createMockTransfersService()
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

beforeEach(() => {
  app = appWithAllRoutes({ services: { transfersService, raiseAnalyticsEvent }, roles: [Role.PRISON_RECEPTION] })
  config.confirmEnabled = true
  transfersService.getTransfer.mockResolvedValue(createTransfer())
  transfersService.confirmTransfer.mockResolvedValue({
    prisonNumber: 'A1234AA',
    location: 'Reception',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET checkTransfer', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AA/check-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/A1234AA/check-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(transfersService.getTransfer).toHaveBeenCalledWith('MDI', 'A1234AA')
      })
  })

  it('should render the correct data in /check-transfer page', () => {
    return request(app)
      .get('/prisoners/A1234AA/check-transfer?arrivalId=abc-123')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person is being transferred from another establishment')
        expect($('[data-qa = "add-to-roll"]').text()).toContain('Add to the establishment roll')
        expect($('input[name = "arrivalId"]').attr('value')).toContain('abc-123')
        expect(res.text).toContain('/prisoners/A1234AA/check-transfer')
      })
  })
})

describe('POST addToRoll', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).post('/prisoners/A1234AA/check-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service to confirm the transfer', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-transfer')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(transfersService.confirmTransfer).toHaveBeenCalledWith('user1', 'A1234AA', 'MDI', undefined)
      })
  })

  it('should call service to confirm the transfer with arrivalId when present', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-transfer')
      .send({ arrivalId: 'abc-123' })
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(transfersService.confirmTransfer).toHaveBeenCalledWith('user1', 'A1234AA', 'MDI', 'abc-123')
      })
  })

  it('should set flash with correct args', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-transfer')
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
      .post('/prisoners/A1234AA/check-transfer')
      .expect(() => {
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Confirmed transfer',
          "AgencyId: MDI, From: Kingston-upon-Hull Crown Court, Type: 'PRISON',",
        )
      })
  })

  it('should redirect to added to roll confirmation page', () => {
    return request(app)
      .post('/prisoners/A1234AA/check-transfer')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/prisoners/A1234AA/confirm-transfer')
  })

  it('should redirect to feature-not-available', () => {
    transfersService.confirmTransfer.mockResolvedValue(null)

    return request(app)
      .post('/prisoners/A1234AA/check-transfer')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/feature-not-available')
  })
})
