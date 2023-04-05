import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import config from '../../../../config'
import { createMockPrisonService } from '../../../../services/__testutils/mocks'
import { createLockManager } from '../../../../data/__testutils/mocks'

let app: Express
const prisonService = createMockPrisonService()
const lockManager = createLockManager()

describe('confirmCourtReturnAddedToRollController', () => {
  beforeEach(() => {
    lockManager.isLocked.mockResolvedValue(false)

    app = appWithAllRoutes({
      services: { prisonService, lockManager },
      roles: [Role.PRISON_RECEPTION],
    })

    prisonService.getPrison.mockResolvedValue({
      description: 'Moorland (HMP & YOI)',
    })

    config.confirmEnabled = true
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /view', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app)
        .get('/prisoners/12345-67890/prisoner-returned-from-court')
        .expect(302)
        .expect('Location', '/autherror')
    })

    it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
      lockManager.isLocked.mockResolvedValue(true)
      return request(app)
        .get('/prisoners/12345-67890/prisoner-returned-from-court')
        .expect(302)
        .expect('Location', '/duplicate-booking-prevention')
    })
    it('should call service methods correctly', () => {
      flashProvider.mockReturnValue([
        { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Reception' },
      ])
      return request(app)
        .get('/prisoners/12345-67890/prisoner-returned-from-court')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
        })
    })

    it('should retrieve prisoner details from flash', () => {
      flashProvider.mockReturnValue([
        { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Reception' },
      ])
      return request(app)
        .get('/prisoners/12345-67890/prisoner-returned-from-court')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('prisoner')
        })
    })

    it('should redirect to /page-not-found if prisoner flash absent', () => {
      flashProvider.mockReturnValue([{}])
      return request(app)
        .get('/prisoners/12345-67890/prisoner-returned-from-court')
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Location', '/page-not-found')
        .expect(res => {
          expect(prisonService.getPrison).not.toHaveBeenCalled()
        })
    })

    it('should render /confirmCourtReturnAddedToRoll page with correct data', () => {
      flashProvider.mockReturnValue([
        { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Reception' },
      ])

      return request(app)
        .get('/prisoners/12345-67890/prisoner-returned-from-court')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Jim Smith has returned to Moorland (HMP & YOI)')
          expect($('[data-qa=confirmation-banner]').text()).toContain('A1234AB')
          expect($('[data-qa=confirmation-paragraph]').text()).toContain('Jim Smith is on the establishment roll.')
          expect($('[data-qa=location-paragraph]').text()).toContain('Their location is Reception.')
        })
    })
  })
})
