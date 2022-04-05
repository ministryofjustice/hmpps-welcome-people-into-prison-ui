import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { ImprisonmentStatus } from 'welcome'
import { appWithAllRoutes, flashProvider, stubCookie } from '../../../__testutils/appSetup'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import ImprisonmentStatusesService from '../../../../services/imprisonmentStatusesService'
import { State } from '../state'

jest.mock('../../../../services/imprisonmentStatusesService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

let app: Express

beforeEach(() => {
  stubCookie(State.newArrival, {
    firstName: 'Jim',
    lastName: 'Smith',
    dateOfBirth: '1973-01-08',
    prisonNumber: 'A1234AB',
    pncNumber: '01/98644M',
    sex: 'M',
    expected: true,
  })
  app = appWithAllRoutes({ services: { imprisonmentStatusesService } })
  imprisonmentStatusesService.getAllImprisonmentStatuses.mockResolvedValue([] as ImprisonmentStatus[])
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
          expect($('h1').text()).toContain('What is the reason for imprisonment?')
          expect($('.data-qa-prisoner-name').text()).toContain('Jim Smith')
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
            ['errors', [{ href: '#imprisonment-status-0', text: 'Select a reason for imprisonment' }]],
          ])
        })
    })

    it('should call service method correctly', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue({
        code: 'civil-offence',
        description: 'Civil offence',
        imprisonmentStatusCode: 'CIVIL',
        secondLevelTitle: 'What is the civil offence?',
        secondLevelValidationMessage: 'Select the civil offence',
        movementReasons: [
          {
            description: 'Civil committal',
            movementReasonCode: 'C',
          },
          {
            description: 'Non-payment of a fine',
            movementReasonCode: 'F',
          },
        ],
      })
      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: 'civil-offence' })
        .expect(res => {
          expect(imprisonmentStatusesService.getImprisonmentStatus).toHaveBeenCalledWith('civil-offence')
        })
    })

    it('should redirect to /check-answers and when single movement reason', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue({
        code: 'recapture',
        description: 'Recapture after escape',
        imprisonmentStatusCode: 'SENT03',
        movementReasons: [
          {
            movementReasonCode: 'RECA',
          },
        ],
      })

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: 'recapture' })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/check-answers')
    })

    it('should update cookie when single movement reason', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue({
        code: 'recapture',
        description: 'Recapture after escape',
        imprisonmentStatusCode: 'SENT03',
        movementReasons: [
          {
            movementReasonCode: 'RECA',
          },
        ],
      })

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: 'recapture' })
        .expect(302)
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toStrictEqual({
            firstName: 'Jim',
            lastName: 'Smith',
            dateOfBirth: '1973-01-08',
            pncNumber: '01/98644M',
            prisonNumber: 'A1234AB',
            sex: 'M',
            code: 'recapture',
            imprisonmentStatus: 'SENT03',
            movementReasonCode: 'RECA',
            expected: 'true',
          })
        })
    })

    it('should redirect to /imprisonment-status/:imprisonmentStatus when multiple movement reasons', () => {
      imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue({
        code: 'civil-offence',
        description: 'Civil offence',
        imprisonmentStatusCode: 'CIVIL',
        secondLevelTitle: 'What is the civil offence?',
        secondLevelValidationMessage: 'Select the civil offence',
        movementReasons: [
          {
            description: 'Civil committal',
            movementReasonCode: 'C',
          },
          {
            description: 'Non-payment of a fine',
            movementReasonCode: 'F',
          },
        ],
      })

      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status')
        .send({ imprisonmentStatus: 'civil-offence' })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/imprisonment-status/civil-offence')
    })
  })
})
