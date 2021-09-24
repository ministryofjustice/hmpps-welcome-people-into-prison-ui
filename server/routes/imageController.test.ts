import type { Express } from 'express'
import { Readable } from 'stream'
import request from 'supertest'
import { appWithAllRoutes } from './testutils/appSetup'
import IncomingMovementsService from '../services/incomingMovementsService'

jest.mock('../services/incomingMovementsService')

const incomingMovementsService = new IncomingMovementsService(null, null) as jest.Mocked<IncomingMovementsService>

let app: Express

const image = {}

beforeEach(() => {
  app = appWithAllRoutes({ services: { incomingMovementsService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner/prisonNumber/image', () => {
  incomingMovementsService.getImage.mockResolvedValue(image as Readable)
  it('should call getImage method correctly', () => {
    return request(app)
      .get('/prisoner/A12345/image')
      .expect('Content-Type', 'image/jpeg')
      .expect(res => {
        expect(incomingMovementsService.getImage).toHaveBeenCalledWith('A12345')
      })
  })

  it('should return placeholder image if error retrieving photo from api', () => {
    incomingMovementsService.getImage.mockRejectedValue(new Error())
    return request(app)
      .get('/prisoner/X54321/image')
      .expect('Content-Type', 'image/png')
      .expect(res => {
        expect(res.status).toEqual(200)
      })
  })
})
