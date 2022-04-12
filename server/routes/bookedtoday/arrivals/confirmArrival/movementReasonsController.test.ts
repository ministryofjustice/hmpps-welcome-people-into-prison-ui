import type { ImprisonmentStatus } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { appWithAllRoutes, stubCookie, flashProvider } from '../../../__testutils/appSetup'
import ImprisonmentStatusesService from '../../../../services/imprisonmentStatusesService'
import { expectSettingCookie } from '../../../__testutils/requestTestUtils'
import { State } from '../state'

jest.mock('../../../../services/imprisonmentStatusesService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

let app: Express

const imprisonmentStatus: ImprisonmentStatus = {
  code: 'determinate-sentence',
  description: 'Sentenced - fixed length of time',
  imprisonmentStatusCode: 'SENT',
  secondLevelTitle: 'What is the type of fixed sentence?',
  secondLevelValidationMessage: 'Select the type of fixed-length sentence',
  movementReasons: [
    { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
    { description: 'Extended sentence for public protection', movementReasonCode: '26' },
    { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
    { description: 'Partly suspended sentence', movementReasonCode: 'P' },
  ],
}

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
  imprisonmentStatusesService.getImprisonmentStatus.mockResolvedValue(imprisonmentStatus)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('/determinate-sentence', () => {
  describe('view()', () => {
    it('should call service methods correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(imprisonmentStatusesService.getImprisonmentStatus).toHaveBeenCalledWith('determinate-sentence')
        })
    })

    it('should render /determinate-sentence page', () => {
      return request(app)
        .get('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('What is the type of fixed sentence?')
          expect($('.data-qa-prisoner-name').text()).toContain('Jim Smith')
        })
    })
  })

  describe('assignReason()', () => {
    it('should call flash and redirect back to /determinate-sentence if errors present', () => {
      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .send({ movementReason: undefined })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .expect(() => {
          expect(flashProvider.mock.calls).toEqual([
            ['errors', [{ href: '#movement-reason-0', text: 'Select the type of fixed-length sentence' }]],
          ])
        })
    })

    it('should update cookie', () => {
      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .send({ movementReason: '26' })
        .expect(302)
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toStrictEqual({
            firstName: 'Jim',
            lastName: 'Smith',
            dateOfBirth: '1973-01-08',
            prisonNumber: 'A1234AB',
            pncNumber: '01/98644M',
            sex: 'M',
            code: 'determinate-sentence',
            imprisonmentStatus: 'SENT',
            movementReasonCode: '26',
            expected: 'true',
          })
        })
    })

    it('should redirect to /check-answers', () => {
      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .send({ movementReason: '26' })
        .expect(302)
        .expect('Location', '/prisoners/12345-67890/check-answers')
    })
  })
})
