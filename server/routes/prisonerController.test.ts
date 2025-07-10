import type { Express } from 'express'
import { Readable } from 'stream'
import request from 'supertest'
import express from 'express'
import { createMockExpectedArrivalsService } from '../services/__testutils/mocks'
import { appWithAllRoutes } from './__testutils/appSetup'
import AuthService from '../services/authService'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()
const authService: Partial<AuthService> = {
  getSystemClientToken: jest.fn().mockResolvedValue('some token'),
}
const image = {}

function mockSessionTokenMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session) req.session = {} as any
  req.session.systemToken = 'some token'
  next()
}

beforeEach(() => {
  const testApp = express()
  testApp.use(mockSessionTokenMiddleware)

  const mainApp = appWithAllRoutes({ services: { expectedArrivalsService, authService: authService as AuthService } })
  testApp.use(mainApp)

  app = testApp
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoners/prisonNumber/image', () => {
  expectedArrivalsService.getImage.mockResolvedValue(image as Readable)
  it('should call getImage method correctly', () => {
    return request(app)
      .get('/prisoners/A12345/image')
      .expect('Content-Type', 'image/jpeg')
      .expect(res => {
        expect(expectedArrivalsService.getImage).toHaveBeenCalledWith('some token', 'A12345')
      })
  })

  it('should return placeholder image if error retrieving photo from api', () => {
    expectedArrivalsService.getImage.mockRejectedValue(new Error())
    return request(app)
      .get('/prisoners/X54321/image')
      .expect('Content-Type', 'image/png')
      .expect(res => {
        expect(res.status).toEqual(200)
      })
  })
})
