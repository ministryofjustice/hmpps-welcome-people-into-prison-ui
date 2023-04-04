import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, stubCookie } from '../../../__testutils/appSetup'
import Role from '../../../../authentication/role'
import { createMockExpectedArrivalsService } from '../../../../services/__testutils/mocks'
import { createNewArrival, createPrisonerDetails } from '../../../../data/__testutils/testObjects'
import { State } from '../state'
import { createLockManager } from '../../../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()
const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  stubCookie(State.newArrival, createNewArrival())
  lockManager.getLockStatus.mockResolvedValue(false)

  app = appWithAllRoutes({
    services: { expectedArrivalsService, lockManager },
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

    it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
      lockManager.getLockStatus.mockResolvedValue(true)
      app = appWithAllRoutes({
        services: { lockManager },
        roles: [Role.PRISON_RECEPTION],
      })
      return request(app)
        .get(`/prisoners/12345-67890/start-confirmation`)
        .expect(302)
        .expect('Location', '/duplicate-booking-prevention')
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

      it('should redirect to feature not available flow when FROM_COURT', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'FROM_COURT' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/feature-not-available')
      })

      it('should redirect to temporary absence flow when FROM_TEMPORARY_ABSENCE and arrival is unexpected', () => {
        stubCookie(State.newArrival, createNewArrival({ expected: false }))
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'FROM_TEMPORARY_ABSENCE' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/A1234AA/check-temporary-absence')
      })

      it('should redirect to temporary absence with arrivalId flow when FROM_TEMPORARY_ABSENCE and arrival is expected', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(
          createPrisonerDetails({ arrivalType: 'FROM_TEMPORARY_ABSENCE' })
        )
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/A1234AA/check-temporary-absence?arrivalId=12345-67890')
      })

      it('should redirect to transfer flow when TRANSFER and arrival is unexpected', () => {
        stubCookie(State.newArrival, createNewArrival({ expected: false }))
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(createPrisonerDetails({ arrivalType: 'TRANSFER' }))
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/A1234AA/check-transfer')
      })

      it('should redirect to transfer with arrivalId flow when TRANSFER and arrival is expected', () => {
        expectedArrivalsService.getPrisonerDetails.mockResolvedValue(createPrisonerDetails({ arrivalType: 'TRANSFER' }))
        return request(app)
          .get('/prisoners/12345-67890/start-confirmation')
          .expect(302)
          .expect('Location', '/prisoners/A1234AA/check-transfer?arrivalId=12345-67890')
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
