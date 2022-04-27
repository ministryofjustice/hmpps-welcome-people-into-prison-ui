import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import { TransfersService, RaiseAnalyticsEvent } from '../../../services'

import Role from '../../../authentication/role'
import config from '../../../config'

jest.mock('../../../services/transfersService')

const transfersService = new TransfersService(null, null) as jest.Mocked<TransfersService>
let app: Express
const raiseAnalyticsEvent = jest.fn() as RaiseAnalyticsEvent

const transfer = {
  firstName: 'Karl',
  lastName: 'Offender',
  dateOfBirth: '1985-01-01',
  prisonNumber: 'A1234AB',
  pncNumber: '01/5678A',
  date: '2021-09-01',
  fromLocation: 'Leeds',
}

beforeEach(() => {
  app = appWithAllRoutes({ services: { transfersService, raiseAnalyticsEvent }, roles: [Role.PRISON_RECEPTION] })
  config.confirmEnabled = true
  transfersService.getTransfer.mockResolvedValue(transfer)
  transfersService.confirmTransfer.mockResolvedValue({
    prisonNumber: 'A1234AB',
    location: 'Reception',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET checkTransfer', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AB/check-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(transfersService.getTransfer).toHaveBeenCalledWith('MDI', 'A1234AB')
      })
  })

  it('should render the correct data in /check-transfer page', () => {
    return request(app)
      .get('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person is being transferred from another establishment')
        expect($('.data-qa-name').text()).toContain('Karl Offender')
        expect($('.data-qa-dob').text()).toContain('1 January 1985')
        expect($('.data-qa-prison-number').text()).toContain('A1234AB')
        expect($('.data-qa-pnc-number').text()).toContain('01/5678A')
        expect($('[data-qa = "add-to-roll"]').text()).toContain('Add to the establishment roll')
        expect(res.text).toContain('/prisoners/A1234AB/check-transfer')
      })
  })
})

describe('POST addToRoll', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).post('/prisoners/A1234AB/check-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service to confirm the transfer', () => {
    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(() => {
        expect(transfersService.confirmTransfer).toHaveBeenCalledWith('user1', 'A1234AB')
      })
  })

  it('should set flash with correct args', () => {
    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('prisoner', {
          firstName: 'Karl',
          lastName: 'Offender',
          location: 'Reception',
        })
      })
  })

  it('should call google analytics', () => {
    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect(() => {
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Confirmed transfer',
          "AgencyId: MDI, From: Leeds, Type: 'PRISON',"
        )
      })
  })

  it('should redirect to added to roll confirmation page', () => {
    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/prisoners/A1234AB/confirm-transfer')
  })
  it('should redirect to feature-not-available', () => {
    transfersService.confirmTransfer.mockResolvedValue(null)

    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(302)
      .expect('Location', '/feature-not-available')
  })
})
