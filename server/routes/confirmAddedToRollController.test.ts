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
  app = appWithAllRoutes({ services: { expectedArrivalsService }, flash, roles: [Role.RECEPTION_USER] })
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
  expectedArrivalsService.getPrison.mockResolvedValue({
    longDescription: 'HMP MOORLAND',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirmation', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/confirmation').expect(302).expect('Location', '/autherror')
  })

  it('should call service methods correctly', () => {
    flash.mockReturnValue([{ offenderNo: 'A1234AB' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
        expect(expectedArrivalsService.getPrison).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getPrison).toHaveBeenCalledWith('MDI')
      })
  })

  it('should retrieve offenderNumber from flash', () => {
    flash.mockReturnValue([{ offenderNo: 'A1234AB' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(flash).toHaveBeenCalledWith('offenderNumber')
      })
      .expect(res => {
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getPrison).toHaveBeenCalledTimes(1)
      })
  })

  it('should redirect to /choose-prisoner page if no offenderNumber present', () => {
    flash.mockReturnValue([])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/confirm-arrival/choose-prisoner')
      .expect(res => {
        expect(expectedArrivalsService.getMove).not.toHaveBeenCalled()
        expect(expectedArrivalsService.getPrison).not.toHaveBeenCalled()
      })
  })

  it('should render /confirmAddedToRoll page', () => {
    flash.mockReturnValue([{ offenderNo: 'A1234AB' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Jim Smith has been added to the establishment roll')
      })
  })
})
