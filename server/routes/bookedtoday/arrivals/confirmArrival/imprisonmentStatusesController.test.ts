import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../../__testutils/appSetup'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import {
  createImprisonmentStatuses,
  createNewArrival,
  statusWithManyReasons,
  statusWithSingleReason,
} from '../../../../data/__testutils/testObjects'
import Role from '../../../../authentication/role'
import { createMockImprisonmentStatusesService } from '../../../../services/__testutils/mocks'

const imprisonmentStatusesService = createMockImprisonmentStatusesService()

let app: Express
const newArrival = createNewArrival()
const imprisonmentStatuses = createImprisonmentStatuses()

beforeEach(() => {
  stubCookie(State.newArrival, newArrival)
  app = appWithAllRoutes({ services: { imprisonmentStatusesService }, roles: [Role.PRISON_RECEPTION] })
  imprisonmentStatusesService.getAllImprisonmentStatuses.mockResolvedValue(imprisonmentStatuses)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/imprisonment-status', () => {
  describe('view()', () => {
    it('should render imprisonment-status page', () => {
      return request(app)
        .get('/prisoners/12345-67890/imprisonment-status')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('Why is this person in prison?')
        })
    })

    it('should call service methods correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/imprisonment-status')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(imprisonmentStatusesService.getAllImprisonmentStatuses).toHaveBeenCalled()
        })
    })
  })

  describe('assignStatus()', () => {
    it('should call flash and redirect back to /imprisonment-status when errors present', () => {
      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: undefined })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/imprisonment-status')
        .expect(() => {
          expect(flashProvider.mock.calls).toEqual([
            ['errors', [{ href: '#imprisonment-status-0', text: 'Select why this person is in prison' }]],
          ])
        })
    })

    it('should call service method correctly', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue(statusWithSingleReason)

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: statusWithManyReasons.code })
        .expect(res => {
          expect(imprisonmentStatusesService.getImprisonmentStatus).toHaveBeenCalledWith(statusWithManyReasons.code)
        })
    })

    it('should redirect to /check-answers and when single movement reason', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue(statusWithSingleReason)

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: statusWithSingleReason.code })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/check-answers')
    })

    it('should update cookie when single movement reason', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue(statusWithSingleReason)

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: statusWithSingleReason.code })
        .expect(302)
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toStrictEqual({
            ...newArrival,
            expected: 'true',
            code: statusWithSingleReason.code,
            imprisonmentStatus: statusWithSingleReason.imprisonmentStatusCode,
            movementReasonCode: statusWithSingleReason.movementReasons[0].movementReasonCode,
          })
        })
    })

    it('should redirect to /imprisonment-status/:imprisonmentStatus when multiple movement reasons', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue(statusWithManyReasons)

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: statusWithManyReasons.code })
        .expect(302)
        .expect('Location', `/prisoners/12345-67890/imprisonment-status/${statusWithManyReasons.code}`)
    })
  })
})
