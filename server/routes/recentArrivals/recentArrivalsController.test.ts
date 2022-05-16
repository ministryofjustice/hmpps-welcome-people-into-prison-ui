import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import Role from '../../authentication/role'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /recent-arrivals', () => {
  it('should render /recent-arrivals page with correct content', () => {
    return request(app)
      .get('/recent-arrivals')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Prisoners who have arrived in the last 3 days')
      })
  })
})
