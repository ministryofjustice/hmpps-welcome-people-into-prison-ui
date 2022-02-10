import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import PrisonService from '../../../services/prisonService'
import Role from '../../../authentication/role'

jest.mock('../../../services/prisonService')
const prisonService = new PrisonService(null, null) as jest.Mocked<PrisonService>
let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { prisonService },
    roles: [Role.PRISON_RECEPTION],
  })

  prisonService.getPrison.mockResolvedValue({
    description: 'Moorland (HMP & YOI)',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /view', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/A1234AB/confirm-transfer').expect(302).expect('Location', '/autherror')
  })

  it('should call service methods correctly', () => {
    flashProvider.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith', location: 'Reception' }])
    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
      })
  })

  it('should retrieve prisoner details from flash', () => {
    flashProvider.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith', location: 'Reception' }])
    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('prisoner')
      })
  })

  it('should redirect to /choose-prisoner page if both firstname and lastname absent', () => {
    flashProvider.mockReturnValue([{}])
    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect(302)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/confirm-arrival/choose-prisoner')
      .expect(res => {
        expect(prisonService.getPrison).not.toHaveBeenCalled()
      })
  })

  it('should render /confirmTransferAddedToRoll page with correct data', () => {
    flashProvider.mockReturnValue([{ firstName: 'Jim', lastName: 'Smith', location: 'Reception' }])

    return request(app)
      .get('/prisoners/A1234AB/confirm-transfer')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Jim Smith has been added to the establishment roll')
        expect($('[data-qa=confirmation-banner]').text()).toContain('A1234AB')
        expect($('[data-qa=confirmation-paragraph]').text()).toContain('Moorland (HMP & YOI)')
        expect($('[data-qa=location-paragraph]').text()).toContain('Their location is Reception.')
      })
  })
})
