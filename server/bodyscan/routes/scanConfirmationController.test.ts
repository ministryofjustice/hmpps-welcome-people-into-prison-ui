import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../routes/__testutils/appSetup'
import { BodyScanService } from '../services'
import Role from '../../authentication/role'
import config from '../../config'

jest.mock('../services/bodyScanService')
const bodyScanService = new BodyScanService(null) as jest.Mocked<BodyScanService>
let app: Express

describe('scanConfirmationController', () => {
  beforeEach(() => {
    app = appWithAllRoutes({
      bodyScanServices: { bodyScanService },
      roles: [Role.PRISON_RECEPTION],
    })

    config.confirmEnabled = true
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /view', () => {
    it('should call service methods correctly', () => {
      flashProvider.mockReturnValue([
        {
          date: '2020-02-01',
          reason: 'INTELLIGENCE',
          result: 'POSITIVE',
        },
      ])
      return request(app)
        .get('/prisoners/A1234AB/scan-confirmation')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(bodyScanService.getPrisonerDetails).toHaveBeenCalledWith('A1234AB')
        })
    })

    it('should retrieve body scan details from flash', () => {
      flashProvider.mockReturnValue([
        {
          date: '2020-02-01',
          reason: 'INTELLIGENCE',
          result: 'POSITIVE',
        },
      ])
      return request(app)
        .get('/prisoners/A1234AB/scan-confirmation')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('body-scan')
        })
    })

    it('should redirect to /page-not-found if body scan flash is absent', () => {
      flashProvider.mockReturnValue([])
      return request(app)
        .get('/prisoners/A1234AB/scan-confirmation')
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Location', '/page-not-found')
    })

    it('should render scan confirmed page', () => {
      flashProvider.mockReturnValue([
        {
          date: '2020-02-01',
          reason: 'INTELLIGENCE',
          result: 'POSITIVE',
        },
      ])

      return request(app)
        .get('/prisoners/A1234AB/scan-confirmation')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Body scan recorded')
        })
    })
  })
})
