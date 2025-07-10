import nock from 'nock'
import type { BodyScanInfo } from 'body-scan'
import BodyScanClient from './bodyScanClient'
import config from '../config'

describe('BodyScanClient', () => {
  let bodyScanClient: BodyScanClient
  const token = 'token-1'

  beforeEach(() => {
    config.apis.bodyscan.url = 'http://localhost:8080'
    bodyScanClient = new BodyScanClient(null, null)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('getSingleBodyScanInfo', () => {
    const prisonNumber = 'A1234AA'
    const bodyScanInfo: BodyScanInfo = {
      prisonNumber,
      bodyScanStatus: 'CLOSE_TO_LIMIT',
      numberOfBodyScans: 110,
      numberOfBodyScansRemaining: 6,
    }

    it('should make a GET request to /body-scans/prisoners/:id and return data', async () => {
      nock(config.apis.bodyscan.url)
        .post(`/body-scans/prisoners/A1234AA`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, bodyScanInfo)

      const info = await bodyScanClient.getSingleBodyScanInfo(token, { prisonNumber: 'A1234AA' })
      expect(info).toStrictEqual(bodyScanInfo)
    })
  })

  describe('getBodyScanInfo', () => {
    const bodyScanInfo: BodyScanInfo = {
      prisonNumber: 'A1234AA',
      bodyScanStatus: 'CLOSE_TO_LIMIT',
      numberOfBodyScans: 110,
      numberOfBodyScansRemaining: 6,
    }

    it('should make a POST request to /body-scans/prisoners and return array of data', async () => {
      nock(config.apis.bodyscan.url)
        .post(`/body-scans/prisoners`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, [bodyScanInfo])

      const info = await bodyScanClient.getBodyScanInfo(token, { prisonNumbers: ['A1234AA'] })
      expect(info).toStrictEqual([bodyScanInfo])
    })
  })
})
