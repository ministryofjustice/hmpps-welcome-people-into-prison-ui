import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should redirect to /confirm-arrival/choose-prisoner', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(res => {
        expect(res.text).toContain('Found. Redirecting to /confirm-arrival/choose-prisoner')
      })
      .expect('Location', '/confirm-arrival/choose-prisoner')
  })
})
