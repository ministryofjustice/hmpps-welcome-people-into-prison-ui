import type { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import ExpectedArrivalsService from '../../../services/expectedArrivalsService'
import PrisonService from '../../../services/prisonService'
import Role from '../../../authentication/role'
import { expectSettingCookie } from '../../__testutils/requestTestUtils'

jest.mock('../../../services/expectedArrivalsService')
jest.mock('../../../services/prisonService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { expectedArrivalsService, prisonService },
    roles: [Role.PRISON_RECEPTION],
  })
  expectedArrivalsService.getArrival.mockResolvedValue({
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/98644M',
    date: '2021-10-13',
    fromLocation: 'Some court',
    fromLocationType: 'COURT',
  } as Arrival)
  prisonService.getPrison.mockResolvedValue({
    description: 'Moorland (HMP & YOI)',
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
    flashProvider.mockReturnValue([{ prisonNumber: 'A1234AB', location: 'Recpetion' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
        expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
      })
  })

  it('should retrieve arrival response from flash', () => {
    flashProvider.mockReturnValue([{ prisonNumber: 'A1234AB', location: 'Recpetion' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('arrivalResponse')
      })
  })

  it('should redirect to /choose-prisoner page if no arrival response present', () => {
    flashProvider.mockReturnValue([{}])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/confirm-arrival/choose-prisoner')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).not.toHaveBeenCalled()
        expect(prisonService.getPrison).not.toHaveBeenCalled()
      })
  })

  it('should clear cookie', () => {
    flashProvider.mockReturnValue([{ prisonNumber: 'A1234AB', location: 'Recpetion' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect(res => {
        expectSettingCookie(res, 'status-and-reason').toBeUndefined()
      })
  })

  it('should render /confirmAddedToRoll page', () => {
    flashProvider.mockReturnValue([{ prisonNumber: 'A1234AB', location: 'Recpetion' }])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Jim Smith has been added to the establishment roll')
      })
  })
})
