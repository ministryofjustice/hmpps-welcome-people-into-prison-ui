import type { Express } from 'express'
import request from 'supertest'
import cheerio from 'cheerio'
import { ImprisonmentStatus } from 'welcome'
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

const imprisonmentStatuses: ImprisonmentStatus[] = [
  {
    description: 'On remand',
    imprisonmentStatusCode: 'RX',
    movementReasons: [{ movementReasonCode: 'R' }],
  },
  {
    description: 'Convicted unsentenced',
    imprisonmentStatusCode: 'JR',
    movementReasons: [{ movementReasonCode: 'V' }],
  },
  {
    description: 'Determinate sentence',
    imprisonmentStatusCode: 'SENT',
    secondLevelTitle: 'What is the type of determinate sentence?',
    movementReasons: [
      { description: 'Extended sentence for public protection', movementReasonCode: '26' },
      { description: 'Imprisonment without option of a fine', movementReasonCode: 'I' },
      { description: 'Intermittent custodial sentence', movementReasonCode: 'INTER' },
      { description: 'Partly suspended sentence', movementReasonCode: 'P' },
    ],
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ services: { imprisonmentStatusesService, expectedArrivalsService } })
  expectedArrivalsService.getMove.mockResolvedValue(null)
  imprisonmentStatusesService.getAllImprisonmentStatuses.mockResolvedValue(imprisonmentStatuses)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /imprisonment-status', () => {
  it('should render /imprisonment-status page', () => {
    return request(app)
      .get('/prisoners/12345-67890/imprisonment-status')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('What is the reason for imprisonment?')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/prisoners/12345-67890/imprisonment-status')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(imprisonmentStatusesService.getAllImprisonmentStatuses).toHaveBeenCalled()
        expect(expectedArrivalsService.getMove).toHaveBeenCalledTimes(1)
        expect(expectedArrivalsService.getMove).toHaveBeenCalledWith('12345-67890')
      })
  })
})
