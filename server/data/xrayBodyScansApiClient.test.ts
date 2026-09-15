import nock from 'nock'
import XrayBodyScansApiClient, { ScanSummaryResponse } from './xrayBodyScansApiClient'
import config from '../config'

describe('xrayBodyScansApiClient', () => {
  let fakeXrayBodyScansApi: nock.Scope
  let xrayBodyScansApiClient: XrayBodyScansApiClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.xrayBodyScansApi.url = 'http://localhost:8080'
    fakeXrayBodyScansApi = nock(config.apis.xrayBodyScansApi.url)
    xrayBodyScansApiClient = new XrayBodyScansApiClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getScanSummary', () => {
    const scanSummary: ScanSummaryResponse = {
      prisonerNumber: 'A1234AA',
      nomisCount: 5,
      dpsCount: 2,
      totalCount: 7,
      positiveCount: 1,
      negativeCount: 5,
      inconclusiveCount: 1,
      annualLimit: 116,
      remainingScans: 109,
      nearingScanLimit: false,
      atScanLimit: false,
      fromScanDate: '2026-09-10',
      toScanDate: '2026-09-15',
    }

    it('should return data from api', async () => {
      fakeXrayBodyScansApi
        .get(`/prisoner/A1234AA/scan/summary`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, scanSummary)

      const result = await xrayBodyScansApiClient.getScanSummary('A1234AA')
      expect(result).toStrictEqual(scanSummary)
    })
  })

  describe('getBulkScanSummary', () => {
    const scanSummaries: ScanSummaryResponse[] = [
      {
        prisonerNumber: 'A1234AA',
        nomisCount: 5,
        dpsCount: 2,
        totalCount: 7,
        positiveCount: 1,
        negativeCount: 5,
        inconclusiveCount: 1,
        annualLimit: 116,
        remainingScans: 109,
        nearingScanLimit: false,
        atScanLimit: false,
        fromScanDate: '2026-09-10',
        toScanDate: '2026-09-15',
      },
      {
        prisonerNumber: 'B5678BB',
        nomisCount: 110,
        dpsCount: 6,
        totalCount: 116,
        positiveCount: 0,
        negativeCount: 116,
        inconclusiveCount: 0,
        annualLimit: 116,
        remainingScans: 0,
        nearingScanLimit: false,
        atScanLimit: true,
        fromScanDate: '2026-09-10',
        toScanDate: '2026-09-15',
      },
    ]

    it('should return data from api', async () => {
      fakeXrayBodyScansApi
        .post(`/bulk/summary`, { prisonerNumbers: ['A1234AA', 'B5678BB'] })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, scanSummaries)

      const result = await xrayBodyScansApiClient.getBulkScanSummary(['A1234AA', 'B5678BB'])
      expect(result).toStrictEqual(scanSummaries)
    })
  })
})
