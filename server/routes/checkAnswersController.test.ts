import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
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

describe('GET /checkAnswers', () => {
  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/check-answers')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('should render /check-answers page', () => {
    return request(app)
      .get('/prisoners/12345-67890/check-answers')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Check your answers before adding')
      })
  })
})

describe('POST /checkAnswers', () => {
  it('should redirect /confirmation page', () => {
    return request(app)
      .post('/prisoners/12345-67890/check-answers')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(res => {
        expect(res.text).toContain('Found. Redirecting to /prisoners/12345-67890/confirmation')
      })
  })
})
