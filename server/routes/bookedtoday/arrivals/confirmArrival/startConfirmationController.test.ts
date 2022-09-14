import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, stubCookie } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'
import { createPrisonerDetails, createNewArrival } from '../../../../data/__testutils/testObjects'
import { State } from '../state'

let app: Express
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  stubCookie(State.newArrival, createNewArrival())
  app = appWithAllRoutes({
    services: { expectedArrivalsService },
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

    describe('redirect behaviour', () => {
      it('should redirect to confirm arrival flow when no prison number present', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(createPrisonerDetails({ prisonNumber: undefined }))
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/12345-67890/sex')
      })

      it('should redirect to sex pages when NEW_BOOKING', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'NEW_BOOKING' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/12345-67890/sex')
      })

      it('should redirect to court return flow when FROM_COURT', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'FROM_COURT' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/12345-67890/check-court-return')
      })

      it('should redirect to temporary absence flow when FROM_TEMPORARY_ABSENCE', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'FROM_TEMPORARY_ABSENCE' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/A1234AA/check-temporary-absence')
      })

      it('should redirect to transfer flow when TRANSFER', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(createPrisonerDetails({ arrivalType: 'TRANSFER' }))
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/A1234AA/check-transfer')
      })

      it('should redirect to feature not available when prisoner is currently in', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'CURRENTLY_IN' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/feature-not-available')
      })

      it('should redirect to feature not available when prisoner is of unknown arrival type', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(createPrisonerDetails({ arrivalType: 'UNKNOWN' }))
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/feature-not-available')
      })
    })
  })
})
