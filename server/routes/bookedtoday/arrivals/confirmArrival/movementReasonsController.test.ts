import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie, flashProvider } from '../../../__testutils/appSetup'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'
import { createNewArrival, statusWithManyReasons } from '../../../../data/__testutils/testObjects'
import Role from '../../../../authentication/role'
import { createMockImprisonmentStatusesService } from '../../../../services/__testutils/mocks'

let app: Express
const imprisonmentStatusesService = createMockImprisonmentStatusesService()

const imprisonmentStatus = statusWithManyReasons
const newArrival = createNewArrival()

beforeEach(() => {
  stubCookie(State.newArrival, newArrival)

  app = appWithAllRoutes({ services: { imprisonmentStatusesService }, roles: [Role.PRISON_RECEPTION] })
  imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue(imprisonmentStatus)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/determinate-sentence', () => {
  describe('view()', () => {
    it('should call service methods correctly', () => {
      return request(app)
        .get(`/prisoners/12345-67890/imprisonment-status/${imprisonmentStatus.code}`)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(() => {
          expect(imprisonmentStatusesService.getImprisonmentStatus).toHaveBeenCalledWith(imprisonmentStatus.code)
        })
    })

    it('should render /determinate-sentence page', () => {
      return request(app)
        .get(`/prisoners/12345-67890/imprisonment-status/${imprisonmentStatus.code}`)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain(imprisonmentStatus.secondLevelTitle)
        })
    })
  })

  describe('assignReason()', () => {
    it('should call flash and redirect back to /determinate-sentence if errors present', () => {
      return request(app)
        .post(`/prisoners/12345-67890/imprisonment-status/${imprisonmentStatus.code}`)
        .send({ movementReason: undefined })
        .expect(302)
        .expect('Location', `/prisoners/12345-67890/imprisonment-status/${imprisonmentStatus.code}`)
        .expect(() => {
          expect(flashProvider.mock.calls).toEqual([
            ['errors', [{ href: '#movement-reason-0', text: imprisonmentStatus.secondLevelValidationMessage }]],
          ])
        })
    })

    it('should update cookie', () => {
      return request(app)
        .post(`/prisoners/12345-67890/imprisonment-status/${imprisonmentStatus.code}`)
        .send({ movementReason: imprisonmentStatus.movementReasons[0].movementReasonCode })
        .expect(302)
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toStrictEqual({
            ...newArrival,
            expected: 'true',
            code: imprisonmentStatus.code,
            imprisonmentStatus: imprisonmentStatus.imprisonmentStatusCode,
            movementReasonCode: imprisonmentStatus.movementReasons[0].movementReasonCode,
          })
        })
    })

    it('should redirect to /check-answers', () => {
      return request(app)
        .post(`/prisoners/12345-67890/imprisonment-status/${imprisonmentStatus.code}`)
        .send({ movementReason: imprisonmentStatus.movementReasons[0].movementReasonCode })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/check-answers')
    })
  })
})
