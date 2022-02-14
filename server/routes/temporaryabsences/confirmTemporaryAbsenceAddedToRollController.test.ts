import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../__testutils/appSetup'
import PrisonService from '../../services/prisonService'
import Role from '../../authentication/role'
import config from '../../config'

jest.mock('../../services/prisonService')
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
let app: Express

describe('confirmTemporaryAbsenceAddedToRollController', () => {
  beforeEach(() => {
    app = appWithAllRoutes({
      services: { prisonService },
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
      return request(app).get('/prisoners/A1234AB/prisoner-returned').expect(302).expect('Location', '/autherror')
    })

    it('should call service methods correctly', () => {
      flashProvider.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith', location: 'Reception' }])
      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
        })
    })

    it('should retrieve prisoner details from flash', () => {
      flashProvider.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith', location: 'Reception' }])
      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(flashProvider).toHaveBeenCalledWith('prisoner')
        })
    })

    it('should redirect to /prisoners-returning page if any firstname lastname absent', () => {
      flashProvider.mockReturnValue([{}])
      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
        .expect(302)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Location', '/prisoners-returning')
        .expect(res => {
          expect(prisonService.getPrison).toHaveBeenCalled()
        })
    })

    it('should render /confirmTransferAddedToRoll page with correct data', () => {
      flashProvider.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith', location: 'Reception' }])

      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
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
