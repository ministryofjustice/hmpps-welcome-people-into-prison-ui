import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import type { Transfer } from 'welcome'
import { appWithAllRoutes } from '../../__testutils/appSetup'
import Role from '../../../authentication/role'
import config from '../../../config'
import { createTransfer, createTransferWithBodyScan } from '../../../data/__testutils/testObjects'
import { createMockTransfersService, createMockExpectedArrivalsService } from '../../../services/__testutils/mocks'
import { WithBodyScanInfo } from '../../../services/bodyScanInfoDecorator'

let app: Express
const transfersService = createMockTransfersService()
transfersService.getTransfer = jest.fn()
const expectedArrivalsService = createMockExpectedArrivalsService()
expectedArrivalsService.getPrisonerSummaryDetails = jest.fn()

beforeEach(() => {
  config.confirmEnabled = true

  app = appWithAllRoutes({
    services: { transfersService, expectedArrivalsService },
    roles: [Role.PRISON_RECEPTION],
  })

  transfersService.getTransfer.mockResolvedValue(createTransfer())

  transfersService.getTransferWithBodyScanDetails.mockResolvedValue(createTransferWithBodyScan())
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET summaryTransfer', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AA/summary-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service methods correctly', () => {
    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(transfersService.getTransferWithBodyScanDetails).toHaveBeenCalledWith('MDI', 'A1234AA')
      })
  })

  describe('DPS prisoner profile button', () => {
    it('should be displayed', () => {
      return request(app)
        .get('/prisoners/A1234AA/summary-transfer')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-profile]').length).toBe(1)
          expect($('[data-qa=prisoner-profile]').attr('href')).toContain(
            '/save-backlink?service=welcome-people-into-prison&returnPath=/prisoners/A1234AA/summary-transfer&redirectPath=/prisoner/A1234AA'
          )
        })
    })

    it('should not be displayed without reception role', () => {
      app = appWithAllRoutes({
        services: { transfersService, expectedArrivalsService },
        roles: [],
      })

      return request(app)
        .get('/prisoners/A1234AA/summary-transfer')
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=prisoner-profile]').length).toBe(0)
        })
    })
  })

  it('should display breadcrumbs correctly', () => {
    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=back-link-navigation] li').length).toEqual(3)
        expect($('[data-qa=back-link-navigation] li a').first().text()).toEqual('Home')
        expect($('[data-qa=back-link-navigation] li a').first().attr('href')).toEqual('/')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').text()).toEqual('People booked to arrive today')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').attr('href')).toEqual(
          '/confirm-arrival/choose-prisoner'
        )
        expect($('[data-qa=back-link-navigation] li').last().text()).toEqual('Smith, Sam')
      })
  })

  it('should render prisoner image', () => {
    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa=prisoner-image]').attr('src')).toEqual('/prisoners/A1234AA/image')
      })
  })

  it('should show main offence when known', () => {
    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa = "main-offence"]').text()).toContain('theft')
      })
  })

  it('should show default text when main offence not available', () => {
    transfersService.getTransferWithBodyScanDetails.mockResolvedValue({} as WithBodyScanInfo<Transfer>)

    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('[data-qa = "main-offence"]').text()).toContain('Not available')
      })
  })

  it('should show x-ray body scan section for male estate', () => {
    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#body-scan').length).toBe(1)
      })
  })

  it('should not show x-ray body scan section for female estate', () => {
    config.femalePrisons = ['MDI']

    app = appWithAllRoutes({
      services: { transfersService, expectedArrivalsService },
      roles: [Role.PRISON_RECEPTION],
    })

    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('#body-scan').length).toBe(0)
      })
  })
})
