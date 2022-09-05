import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    roles: [Role.PRISON_RECEPTION],
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/start-confirmation', () => {
  describe('redirect()', () => {
    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [] })
      return request(app).get('/prisoners/12345-67890/start-confirmation').expect(302).expect('Location', '/autherror')
    })

    it('should redirect to authentication error page for non reception users', () => {
      app = appWithAllRoutes({ roles: [Role.PRISON_RECEPTION] })
      return request(app)
        .get('/prisoners/12345-67890/start-confirmation')
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/sex')
    })
  })
})
