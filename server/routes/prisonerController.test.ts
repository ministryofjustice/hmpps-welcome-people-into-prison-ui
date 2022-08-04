import type { Express } from 'express'
import { Readable } from 'stream'
import request from 'supertest'
import { createMockExpectedArrivalsService } from '../services/__testutils/mocks'
import { appWithAllRoutes } from './__testutils/appSetup'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()
const image = {}

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService } })
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
        expect(expectedArrivalsService.getImage).toHaveBeenCalledWith('A12345')
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
