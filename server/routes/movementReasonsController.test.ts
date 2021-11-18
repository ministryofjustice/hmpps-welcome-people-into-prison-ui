import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { Movement, ImprisonmentStatus } from 'welcome'
import { appWithAllRoutes } from './testutils/appSetup'
import ImprisonmentStatusesService from '../services/imprisonmentStatusesService'
import ExpectedArrivalsService from '../services/expectedArrivalsService'

jest.mock('../services/imprisonmentStatusesService')
jest.mock('../services/expectedArrivalsService')

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

const flash = jest.fn()

beforeEach(() => {
  app = appWithAllRoutes({ services: { imprisonmentStatusesService, expectedArrivalsService }, flash })
  expectedArrivalsService.getMove.mockResolvedValue({} as Movement)
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
          expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
          expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
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
          expect(flash).toHaveBeenCalledTimes(1)
          expect(flash.mock.calls).toEqual([
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
