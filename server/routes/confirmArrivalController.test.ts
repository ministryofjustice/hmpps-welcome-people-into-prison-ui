import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './testutils/appSetup'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

jest.mock('../services/expectedArrivalsService')
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService } })
  expectedArrivalsService.getMove.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirmArrival', () => {
  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/confirm-arrival')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
      })
  })
})
