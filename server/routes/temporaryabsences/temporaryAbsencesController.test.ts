import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { type TemporaryAbsence } from 'welcome'
import express from 'express'
import { appWithAllRoutes, user } from '../__testutils/appSetup'
import Role from '../../authentication/role'
import config from '../../config'
import { withBodyScanStatus, createTemporaryAbsence } from '../../data/__testutils/testObjects'
import type { WithBodyScanStatus } from '../../services/bodyScanInfoDecorator'
import { createMockTemporaryAbsencesService } from '../../services/__testutils/mocks'
import AuthService from '../../services/authService'

let app: Express
const temporaryAbsencesService = createMockTemporaryAbsencesService()

const authService: Partial<AuthService> = {
  getSystemClientToken: jest.fn().mockResolvedValue('some token'),
}

function mockSessionTokenMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session) req.session = {} as any
  req.session.systemToken = 'some token'
  next()
}

const temporaryAbsences: WithBodyScanStatus<TemporaryAbsence>[] = [
  withBodyScanStatus(createTemporaryAbsence({})),
  withBodyScanStatus(createTemporaryAbsence({})),
  withBodyScanStatus(createTemporaryAbsence({})),
  withBodyScanStatus(createTemporaryAbsence({})),
]

beforeEach(() => {
  const testApp = express()
  testApp.use(mockSessionTokenMiddleware)
  const mainApp = appWithAllRoutes({
    services: { temporaryAbsencesService, authService: authService as AuthService },
    roles: [Role.PRISON_RECEPTION],
  })

  testApp.use(mainApp)
  app = testApp

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
