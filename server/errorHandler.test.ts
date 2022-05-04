import type { Express } from 'express'
import request from 'supertest'
import createError from 'http-errors'
import { appWithAllRoutes } from './routes/__testutils/appSetup'
import ExpectedArrivalsService from './services/expectedArrivalsService'

jest.mock('./services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('errorHandler', () => {
  it('should redirect to /sign-out with 401 error status', () => {
    expectedArrivalsService.getArrivalsForToday.mockRejectedValue(createError(401, 'Unauthorized (RFC 7235)'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(302)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/sign-out')
  })

  it('should redirect to /sign-out with 403 error status', () => {
    expectedArrivalsService.getArrivalsForToday.mockRejectedValue(createError(403, 'Forbidden'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(302)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/sign-out')
  })

  it('should render page not found page with 404 error status', () => {
    return request(app)
      .get('/unknown')
      .expect(302)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/page-not-found')
  })

  it('should render generic error page content with stack in dev mode', () => {
    expectedArrivalsService.getArrivalsForToday.mockRejectedValue(createError(500, 'Internal Server Error'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Internal Server Error')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render generic error page content without stack in production mode', () => {
    expectedArrivalsService.getArrivalsForToday.mockRejectedValue(createError(500, 'Internal Server Error'))
    return request(appWithAllRoutes({ production: true }))
      .get('/confirm-arrival/choose-prisoner')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('Internal Server Error')
      })
  })
})
