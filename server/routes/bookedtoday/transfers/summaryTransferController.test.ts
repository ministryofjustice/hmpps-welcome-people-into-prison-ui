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
    roles: [],
  })

  transfersService.getTransfer.mockResolvedValue(createTransfer())

  transfersService.getTransferWithBodyScanDetails.mockResolvedValue(createTransferWithBodyScan())
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET summaryTransfer', () => {
  it('should render the summary transfer page', () => {
    app = appWithAllRoutes({
      services: { transfersService, expectedArrivalsService },
      roles: [],
    })
    return request(app).get('/prisoners/A1234AA/summary-transfer').expect(200)
  })

  it('should call service methods correctly', () => {
    return request(app)
      .get('/prisoners/A1234AA/summary-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(transfersService.getTransferWithBodyScanDetails).toHaveBeenCalledWith('MDI', 'A1234AA')
      })
  })

  describe('Confirm arrival button', () => {
    it('should be displayed', () => {
      app = appWithAllRoutes({
        services: { transfersService, expectedArrivalsService },
        roles: [Role.PRISON_RECEPTION, Role.ROLE_INACTIVE_BOOKINGS],
      })
      return request(app)
        .get('/prisoners/A1234AA/summary-transfer')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=confirm-arrival]').length).toBe(1)
          expect($('[data-qa=confirm-arrival]').attr('href')).toContain('/prisoners/A1234AA/check-transfer')
        })
    })

    it('should not be displayed without Prison Reception role', () => {
      app = appWithAllRoutes({
        services: { transfersService, expectedArrivalsService },
        roles: [Role.ROLE_INACTIVE_BOOKINGS, Role.GLOBAL_SEARCH],
      })

      return request(app)
        .get('/prisoners/A1234AA/summary-transfer')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('[data-qa=confirm-arrival]').length).toBe(0)
        })
    })
  })

  describe('DPS prisoner profile button', () => {
    it('should be displayed with Prison Reception & Released Prisoner viewing role', () => {
      app = appWithAllRoutes({
        services: { transfersService, expectedArrivalsService },
        roles: [Role.PRISON_RECEPTION, Role.ROLE_INACTIVE_BOOKINGS],
      })
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

    it('should be displayed with Prison Reception & Global search role', () => {
      app = appWithAllRoutes({
        services: { transfersService, expectedArrivalsService },
        roles: [Role.PRISON_RECEPTION, Role.GLOBAL_SEARCH],
      })
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

    it('should not be displayed without Prison Reception role', () => {
      app = appWithAllRoutes({
        services: { transfersService, expectedArrivalsService },
        roles: [Role.ROLE_INACTIVE_BOOKINGS, Role.GLOBAL_SEARCH],
      })

      return request(app)
        .get('/prisoners/A1234AA/summary-transfer')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
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
        expect($('[data-qa=back-link-navigation] li:nth-child(1) a').text()).toEqual('Digital Prison Services')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').text()).toEqual('Welcome people into prison')
        expect($('[data-qa=back-link-navigation] li:nth-child(3) a').text()).toContain('People booked to arrive today')
        expect($('[data-qa=back-link-navigation] li:nth-child(2) a').attr('href')).toEqual('/')
        expect($('[data-qa=back-link-navigation] li:nth-child(3) a').attr('href')).toContain('/choose-prisoner')
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
