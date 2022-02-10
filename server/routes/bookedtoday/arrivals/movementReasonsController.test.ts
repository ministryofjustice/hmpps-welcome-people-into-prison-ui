import type { Arrival, ImprisonmentStatus } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { appWithAllRoutes, flashProvider } from '../../__testutils/appSetup'
import ImprisonmentStatusesService from '../../../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../../../services/expectedArrivalsService'

jest.mock('../../../services/imprisonmentStatusesService')
jest.mock('../../../services/expectedArrivalsService')

const imprisonmentStatusesService = new ImprisonmentStatusesService(
  null,
  null
) as jest.Mocked<ImprisonmentStatusesService>

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

const imprisonmentStatus: ImprisonmentStatus = {
  code: 'determinate-sentence',
  description: 'Determinate sentence',
  imprisonmentStatusCode: 'SENT',
  secondLevelTitle: 'What is the type of determinate sentence?',
  secondLevelValidationMessage: 'Select the type of determinate sentence',
  movementReasons: [
    { description: 'Extended sentence for public protection', movementReasonCode: '26' },
    { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
    { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
    { description: 'Partly suspended sentence', movementReasonCode: 'P' },
  ],
}

beforeEach(() => {
  app = appWithAllRoutes({ services: { imprisonmentStatusesService, expectedArrivalsService } })
  expectedArrivalsService.getArrival.mockResolvedValue({} as Arrival)
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
          expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('12345-67890')
        })
    })

    it('should render /determinate-sentence page', () => {
      return request(app)
        .get('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(res => {
          const $ = cheerio.load(res.text)
          expect($('h1').text()).toContain('What is the type of determinate sentence?')
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
            ['errors', [{ href: '#movement-reason-0', text: 'Select the type of determinate sentence' }]],
          ])
        })
    })

    it('should set cookie', () => {
      return request(app)
        .post('/prisoners/12345-67890/imprisonment-status/determinate-sentence')
        .send({ movementReason: '26' })
        .expect(302)
        .expect(res => {
          expect(res.header['set-cookie'][0]).toContain(
            encodeURIComponent(
              JSON.stringify({ code: 'determinate-sentence', imprisonmentStatus: 'SENT', movementReasonCode: '26' })
            )
          )
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
