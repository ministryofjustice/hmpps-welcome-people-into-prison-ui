import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import ExpectedArrivalsService from '../../services/expectedArrivalsService'
import { createPrisonerDetails } from '../../data/__testutils/testObjects'

jest.mock('../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

const recentArrival = createPrisonerDetails({})

beforeEach(() => {
  app = appWithAllRoutes({ services: { expectedArrivalsService }, roles: [Role.PRISON_RECEPTION] })
  expectedArrivalsService.getPrisonerDetails.mockResolvedValue(recentArrival)
  flashProvider.mockReturnValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /record-body-scan', () => {
  it('should render /record-body-scan page with correct content', () => {
    return request(app)
      .get('/prisoners/A1234AB/record-body-scan')
      .expect('Content-Type', /html/)
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Record an X-ray body scan')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/A1234AB/record-body-scan')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getPrisonerDetails).toHaveBeenCalledWith('A1234AB')
      })
  })

  it('should call flash', () => {
    return request(app)
      .get('/prisoners/A1234AB/record-body-scan')
      .expect(() => {
        expect(flashProvider.mock.calls).toEqual([['errors'], ['input']])
      })
  })
})

describe('POST /record-body-scan', () => {
  it('should redirect if errors', () => {
    return request(app)
      .post('/prisoners/A1234AB/record-body-scan')
      .send({})
      .expect(302)
      .expect('Location', '/prisoners/A1234AB/record-body-scan')
      .expect(() => {
        expect(flashProvider.mock.calls).toEqual([
          [
            'errors',

            [
              {
                href: '#date',
                text: 'Select a date for the body scan',
              },
            ],
          ],
          ['input', {}],
        ])
      })
  })
})
