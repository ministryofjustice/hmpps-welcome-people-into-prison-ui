import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes } from '../__testutils/appSetup'
import PrisonService from '../../services/prisonService'
import Role from '../../authentication/role'
import config from '../../config'

jest.mock('../../services/prisonService')
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
let app: Express
const flash = jest.fn()

describe('confirmTemporaryAbsenceAddedToRollController', () => {
  beforeEach(() => {
    app = appWithAllRoutes({
      services: { prisonService },
      flash,
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
      flash.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith' }])
      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
        })
    })

    it('should retrieve prisoner details from flash', () => {
      flash.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith' }])
      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(flash).toHaveBeenCalledTimes(1)
          expect(flash).toHaveBeenCalledWith('prisoner')
        })
    })

    it('should redirect to /prisoners-returning page if any firstname lastname absent', () => {
      flash.mockReturnValue([{}])
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
      flash.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith' }])

      return request(app)
        .get('/prisoners/A1234AB/prisoner-returned')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Jim Smith has returned to Moorland (HMP & YOI)')
          expect($('[data-qa=confirmation-banner]').text()).toContain('A1234AB')
          expect($('[data-qa=confirmation-paragraph]').text()).toContain(
            'Jim Smith is on the establishment roll and is located in reception.'
          )
        })
    })
  })
})
