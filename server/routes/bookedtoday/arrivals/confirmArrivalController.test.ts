import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../services'
import Role from '../../../authentication/role'

jest.mock('../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirmArrival', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/confirm-arrival').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('should clear cookie', () => {
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect(res => {
        expect(res.header['set-cookie'][0]).not.toContain('code')
        expect(res.header['set-cookie'][0]).not.toContain('imprisonmentStatus')
        expect(res.header['set-cookie'][0]).not.toContain('movementReasonCode')
      })
  })
})
