import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { type TemporaryAbsence } from 'welcome'
import { appWithAllRoutes, user } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import config from '../../config'
import { withBodyScanInfo, createTemporaryAbsence } from '../../data/__testutils/testObjects'
import type { WithBodyScanInfo } from '../../services/bodyScanInfoDecorator'
import { createMockTemporaryAbsencesService } from '../../services/__testutils/mocks'

let app: Express
const temporaryAbsencesService = createMockTemporaryAbsencesService()

const temporaryAbsences: WithBodyScanInfo<TemporaryAbsence>[] = [
  withBodyScanInfo(createTemporaryAbsence()),
  withBodyScanInfo(createTemporaryAbsence()),
  withBodyScanInfo(createTemporaryAbsence()),
  withBodyScanInfo(createTemporaryAbsence()),
]

beforeEach(() => {
  app = appWithAllRoutes({ services: { temporaryAbsencesService }, roles: [Role.PRISON_RECEPTION] })
  temporaryAbsencesService.getTemporaryAbsences.mockResolvedValue(temporaryAbsences)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoners-returning', () => {
  it('should render /prisoners-returning page with correct title when supportingMultitransactionsEnabled is true', () => {
    config.supportingMultitransactionsEnabled = true
    app = appWithAllRoutes({ services: { temporaryAbsencesService }, roles: [Role.PRISON_RECEPTION] })

    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('People returning from temporary absence')
        expect($('#confirm-arrival-span').text()).toBe('')
        expect($('.app-card-wrapper')).toHaveLength(4)
        expect($('#no-prisoners').text()).toContain('')
      })
  })

  it('should render /prisoners-returning page with correct title when supportingMultitransactionsEnabled is false', () => {
    config.supportingMultitransactionsEnabled = false
    app = appWithAllRoutes({ services: { temporaryAbsencesService }, roles: [Role.PRISON_RECEPTION] })

    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Select a person returning from temporary absence')
        expect($('#confirm-arrival-span').text()).toContain(`Confirm a prisoner's arrival`)
        expect($('.app-card-wrapper')).toHaveLength(4)
        expect($('#no-prisoners').text()).toContain('')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(temporaryAbsencesService.getTemporaryAbsences).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })

  it('should display alternative text if no prisoners to display', () => {
    temporaryAbsencesService.getTemporaryAbsences.mockResolvedValue([])

    return request(app)
      .get('/prisoners-returning')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('.app-card-wrapper')).toHaveLength(0)
        expect($('#no-prisoners').text()).toContain('There are currently no prisoners out on temporary absence.')
      })
  })
})
