import type { Express } from 'express'
import request from 'supertest'
import { Movement } from 'welcome'
import cheerio from 'cheerio'
import { appWithAllRoutes } from '../../../__testutils/appSetup'
import { ExpectedArrivalsService } from '../../../../services'
import Role from '../../../../authentication/role'

jest.mock('../../../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /search-for-existing-record/change-prison-number', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(302)
      .expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
      })
  })

  it('should render page', () => {
    expectedArrivalsService.getArrival.mockResolvedValue({
      firstName: 'James',
      lastName: 'Smyth',
      dateOfBirth: '1973-01-08',
      prisonNumber: 'A1234AB',
      pncNumber: '99/98644M',
      potentialMatches: [],
    } as Movement)

    return request(app)
      .get('/prisoners/12345-67890/search-for-existing-record/change-prison-number')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain("Add or change this person's prison number")
      })
  })
})
