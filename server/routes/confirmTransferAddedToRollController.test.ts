import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes } from './testutils/appSetup'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import Role from '../authentication/role'

jest.mock('../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express
const flash = jest.fn()

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, flash, roles: [Role.PRISON_RECEPTION] })
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
  expectedArrivalsService.getPrison.mockResolvedValue({
    description: 'Moorland (HMP & YOI)',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AB/confirm-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service methods correctly', () => {
    flash.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith' }])
    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getPrison).toHaveBeenCalledWith('MDI')
      })
  })

  it('should retrieve prisoner details from flash', () => {
    flash.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith' }])
    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(flash).toHaveBeenCalledTimes(1)
        expect(flash).toHaveBeenCalledWith('prisoner')
      })
  })

  it('should redirect to /choose-prisoner page if both firstname and lastname absent', () => {
    flash.mockReturnValue([{}])
    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect(302)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/confirm-arrival/choose-prisoner')
      .expect(res => {
        expect(expectedArrivalsService.getPrison).not.toHaveBeenCalled()
      })
  })

  it('should render /confirmTransferAddedToRoll page with correct data', () => {
    flash.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith' }])

    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Jim Smith has been added to the establishment roll')
        expect($('[data-qa=confirmation-banner]').text()).toContain('A1234AB')
        expect($('[data-qa=confirmation-paragraph]').text()).toContain('Moorland (HMP & YOI)')
      })
  })
})
