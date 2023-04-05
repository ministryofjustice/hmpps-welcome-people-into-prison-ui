import type { Arrival } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../__testutils/appSetup'
import { createMockExpectedArrivalsService } from '../../services/__testutils/mocks'
import { MatchType, WithMatchType } from '../../services/matchTypeDecorator'
import { createLockManager } from '../../data/__testutils/mocks'

let app: Express
const lockManager = createLockManager()

const expectedArrivalsService = createMockExpectedArrivalsService()

beforeEach(() => {
  lockManager.isLocked.mockResolvedValue(false)
  app = appWithAllRoutes({ services: { expectedArrivalsService, lockManager } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirm-arrival/choose-prisoner/:moveId/summary', () => {
  const arrival = ({ matchType }: { matchType: MatchType }) =>
    ({
      id: '1111-2222-3333-4444',
      matchType,
    } as WithMatchType<Arrival>)

  describe('Summary controller', () => {
    it('should redirect to /duplicate-booking-prevention if arrival already confirmed', () => {
      lockManager.isLocked.mockResolvedValue(true)
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect(302)
        .expect('Location', '/duplicate-booking-prevention')
    })
    it('should redirect to /summary-with-record for COURT_RETURN', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.COURT_RETURN,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/summary-with-record')
    })

    it('should redirect to /summary-with-record for SINGLE_MATCH', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.SINGLE_MATCH,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/summary-with-record')
    })

    it('should redirect to /summary-move-only when MULTIPLE_POTENTIAL_MATCHES', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.MULTIPLE_POTENTIAL_MATCHES,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/summary-move-only')
    })

    it('should redirect to /summary-move-only when NO_MATCH', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.NO_MATCH,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/summary-move-only')
    })

    it('should redirect to /summary-move-only when INSUFFICIENT_INFO', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.INSUFFICIENT_INFO,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/summary-move-only')
    })

    it('should call service method correctly', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          matchType: MatchType.SINGLE_MATCH,
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect(res => {
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('aaa-111-222')
        })
    })

    it('should handle unexpected server error', () => {
      expectedArrivalsService.getArrival.mockRejectedValue(new Error('an error occurred'))
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222/summary')
        .expect(500)
        .expect('Content-Type', 'text/html; charset=utf-8')
    })
  })
})
