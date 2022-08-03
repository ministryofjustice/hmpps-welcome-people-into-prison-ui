import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes } from '../../../__testutils/appSetup'
import ExpectedArrivalsService from '../../../../services/expectedArrivalsService'
import Role from '../../../../authentication/role'
import { createArrival } from '../../../../data/__testutils/testObjects'

jest.mock('../../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ExpectedArrivalsService>

let app: Express

const arrival = createArrival({
  potentialMatches: [],
})

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(arrival)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/no-record-found').expect(302).expect('Location', '/autherror')
  })

  it('should display correct page heading', () => {
    return request(app)
      .get('/prisoners/12345-67890/no-record-found')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('This person does not have an existing prisoner record')
      })
  })
})
