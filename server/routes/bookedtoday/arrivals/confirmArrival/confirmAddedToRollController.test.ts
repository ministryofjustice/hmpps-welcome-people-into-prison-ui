import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import { createPrison } from '../../../../data/__testutils/testObjects'
import { createMockPrisonService } from '../../../../services/__testutils/mocks'

let app: Express
const prisonService = createMockPrisonService()

beforeEach(() => {
  app = appWithAllRoutes({
    services: { prisonService },
    roles: [Role.PRISON_RECEPTION],
  })
  prisonService.getPrison.mockResolvedValue(createPrison())
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirmation', () => {
  it('should redirect to authentication error page for non reception users', () => {
    app = appWithAllRoutes({ roles: [] })
    return request(app).get('/prisoners/12345-67890/confirmation').expect(302).expect('Location', '/autherror')
  })

  it('should call service method correctly', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(prisonService.getPrison).toHaveBeenCalledWith('MDI')
      })
  })

  it('should retrieve arrival response from flash', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(() => {
        expect(flashProvider).toHaveBeenCalledWith('arrivalResponse')
      })
  })

  it('should redirect to /page-not-found if arrival response absent', () => {
    flashProvider.mockReturnValue([{}])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Location', '/page-not-found')
      .expect(res => {
        expect(prisonService.getPrison).not.toHaveBeenCalled()
      })
  })

  it('should clear cookie', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect(res => {
        expectSettingCookie(res, State.newArrival).toBeUndefined()
      })
  })

  it('should render /confirmAddedToRoll page', () => {
    flashProvider.mockReturnValue([
      { firstName: 'Jim', lastName: 'Smith', prisonNumber: 'A1234AB', location: 'Recpetion' },
    ])
    return request(app)
      .get('/prisoners/12345-67890/confirmation')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Jim Smith has been added to the establishment roll')
      })
  })
})
