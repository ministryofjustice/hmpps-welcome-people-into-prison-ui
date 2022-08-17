import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import Role from '../../authentication/role'

let app: Express

describe('feedbackController', () => {
  beforeEach(() => {
    app = appWithAllRoutes({
      services: {},
      roles: [Role.PRISON_RECEPTION],
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /feedback-submitted', () => {
    it('should render /feedback-submitted page', () => {
      return request(app)
        .get('/feedback-submitted')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Thank you for your feedback')
        })
    })
  })
})
