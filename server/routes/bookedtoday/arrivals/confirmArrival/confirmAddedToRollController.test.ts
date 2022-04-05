import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'
import PrisonService from '../../../../services/prisonService'
import Role from '../../../../authentication/role'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'

jest.mock('../../../../services/expectedArrivalsService')
jest.mock('../../../../services/prisonService')

const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { prisonService },
    roles: [Role.PRISON_RECEPTION],
  })
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

  it('should call service method correctly', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
      })
  })

  it('should retrieve arrival response from flash', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
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
        expect(prisonService.getPrison).not.toHaveBeenCalled()
      })
  })

  it('should clear cookie', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toBeUndefined()
      })
  })

  it('should render /confirmAddedToRoll page', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Jim Smith has been added to the establishment roll')
      })
  })
})
