import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../routes/__testutils/appSetup'
import BodyScanService from '../services/bodyScanService'
import { createPrisonerDetails } from '../../data/__testutils/testObjects'
import Role from '../../authentication/role'

jest.mock('../services/bodyScanService')

const bodyScanService = new BodyScanService(null) as jest.Mocked<BodyScanService>

let app: Express

const recentArrival = createPrisonerDetails({})

beforeEach(() => {
  app = appWithAllRoutes({ bodyScanServices: { bodyScanService }, roles: [Role.PRISON_RECEPTION] })
  bodyScanService.getPrisonerDetails.mockResolvedValue(recentArrival)
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
      .expect(() => {
        expect(bodyScanService.getPrisonerDetails).toHaveBeenCalledWith('A1234AB')
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
                href: '#userSelectedDate',
                text: 'Select a date for the body scan',
              },
              {
                href: '#reason',
                text: 'Select a reason for the body scan',
              },
              {
                href: '#result',
                text: 'Select a result for the body scan',
              },
            ],
          ],
          ['input', {}],
        ])
      })
  })

  it('should submit new body scan', () => {
    return request(app)
      .post('/prisoners/A1234AB/record-body-scan')
      .send({
        day: '1',
        month: '2',
        year: '2020',
        reason: 'INTELLIGENCE',
        result: 'POSITIVE',
        userSelectedDate: 'another-date',
      })
      .expect(302)
      .expect('Location', '/prisoners/A1234AB/scan-confirmation')
      .expect(() => {
        expect(bodyScanService.addBodyScan).toHaveBeenCalledWith('user1', 'A1234AB', {
          date: '2020-02-01',
          reason: 'INTELLIGENCE',
          result: 'POSITIVE',
        })
        expect(flashProvider.mock.calls).toEqual([
          [
            'body-scan',

            {
              date: '2020-02-01',
              reason: 'INTELLIGENCE',
              result: 'POSITIVE',
            },
          ],
        ])
      })
  })
})
