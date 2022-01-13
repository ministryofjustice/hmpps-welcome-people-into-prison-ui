import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { ImprisonmentStatus } from 'welcome'
import { appWithAllRoutes } from '../../__testutils/appSetup'
import ImprisonmentStatusesService from '../../../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../../../services/expectedArrivalsService'

jest.mock('../../../services/imprisonmentStatusesService')
jest.mock('../../../services/expectedArrivalsService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>
const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>
const flash = jest.fn()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ services: { imprisonmentStatusesService, expectedArrivalsService }, flash })
  expectedArrivalsService.getArrival.mockResolvedValue(null)
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
        })
    })

    it('should call service methods correctly', () => {
      return request(app)
        .get('/prisoners/12345-67890/imprisonment-status')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          expect(imprisonmentStatusesService.getAllImprisonmentStatuses).toHaveBeenCalled()
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
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
          expect(flash.mock.calls).toEqual([
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

    it('should set cookie when single movement reason', () => {
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
          expect(res.header['set-cookie'][0]).toContain(
            encodeURIComponent(
              JSON.stringify({ code: 'recapture', imprisonmentStatus: 'SENT03', movementReasonCode: 'RECA' })
            )
          )
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