import nock from 'nock'
import { BodyScan, BodyScanInfo, PrisonerDetails } from 'body-scan'
import BodyScanClient from './bodyScanClient'
import config from '../../config'

describe('bodyScanClient', () => {
  let fakeBodyScanApi: nock.Scope
  let bodyScanClint: BodyScanClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.bodyscan.url = 'http://localhost:8080'
    fakeBodyScanApi = nock(config.apis.bodyscan.url)
    bodyScanClint = new BodyScanClient(null)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getPrisonerDetails', () => {
    const prisoner = {
      prisonNumber: 'A1234AA',
    } as PrisonerDetails

    it('should return data from api', async () => {
      fakeBodyScanApi
        .get(`/prisoners/${prisoner.prisonNumber}`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, prisoner)

      const output = await bodyScanClint.getPrisonerDetails(prisoner.prisonNumber)
      expect(output).toEqual(prisoner)
    })
  })

  describe('addBodyScan', () => {
    const bodyScan: BodyScan = {
      date: '2022-01-23',
      reason: 'INTELLIGENCE',
      result: 'NEGATIVE',
    }

    it('should return data from api', async () => {
      fakeBodyScanApi
        .post(`/body-scans/prisoners/A1234AA`, bodyScan)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, {})

      await bodyScanClint.addBodyScan('A1234AA', bodyScan)
    })
  })

  describe('getSingleBodyScanInfo', () => {
    const bodyScanInfo: BodyScanInfo = {
      prisonNumber: 'A1234AA',
      bodyScanStatus: 'CLOSE_TO_LIMIT',
      numberOfBodyScans: 110,
      numberOfBodyScansRemaining: 6,
    }

    it('should return data from api', async () => {
      fakeBodyScanApi
        .get(`/body-scans/prisoners/A1234AA`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, bodyScanInfo)

      const info = await bodyScanClint.getSingleBodyScanInfo('A1234AA')
      expect(info).toStrictEqual(bodyScanInfo)
    })
  })
})
