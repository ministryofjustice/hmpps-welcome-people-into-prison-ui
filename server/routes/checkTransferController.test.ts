import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes } from './testutils/appSetup'
import TransfersService from '../services/transfersService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'

import Role from '../authentication/role'

jest.mock('../services/transfersService')
const transfersService = new TransfersService(null, null) as jest.Mocked<TransfersService>
let app: Express
const flash = jest.fn()

jest.mock('../raiseAnalyticsEvent')

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
  app = appWithAllRoutes({ services: { transfersService }, flash, roles: [Role.PRISON_RECEPTION] })
  transfersService.getTransfer.mockResolvedValue(transfer)
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
        expect(transfersService.getTransfer).toHaveBeenCalledTimes(1)
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
        expect(transfersService.confirmTransfer).toHaveBeenCalledTimes(1)
        expect(transfersService.confirmTransfer).toHaveBeenCalledWith('user1', 'A1234AB')
      })
  })

  it('should set flash with correct args', () => {
    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect(() => {
        expect(flash).toHaveBeenCalledWith('prisoner', { firstName: 'Karl', lastName: 'Offender' })
      })
  })

  it('should call google analytics', () => {
    return request(app)
      .post('/prisoners/A1234AB/check-transfer')
      .expect(() => {
        expect(raiseAnalyticsEvent).toHaveBeenCalledWith(
          'Add to the establishment roll',
          'Confirmed transfer',
          "AgencyId: MDI, From: Leeds, Type: 'PRISON',",
          '127.0.0.1'
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
})
