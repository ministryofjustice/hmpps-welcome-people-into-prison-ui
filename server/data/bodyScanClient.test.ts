import nock from 'nock'
import { BodyScanInfo, BodyScanStatus } from 'body-scan'
import BodyScanClient from './bodyScanClient'
import config from '../config'

describe('bodyScanClient', () => {
  let fakeBodyScanApi: nock.Scope
  let bodyScanClint: BodyScanClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.bodyscan.url = 'http://localhost:8080'
    fakeBodyScanApi = nock(config.apis.bodyscan.url)
    bodyScanClint = new BodyScanClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getSingleBodyScanInfo', () => {
    const bodyScanInfo: BodyScanInfo = {
      prisonNumber: 'A1234AA',
      bodyScanStatus: BodyScanStatus.CLOSE_TO_LIMIT,
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

  describe('getBodyScanInfo', () => {
    const bodyScanInfo: BodyScanInfo = {
      prisonNumber: 'A1234AA',
      bodyScanStatus: BodyScanStatus.CLOSE_TO_LIMIT,
      numberOfBodyScans: 110,
      numberOfBodyScansRemaining: 6,
    }

    it('should return data from api', async () => {
      fakeBodyScanApi
        .post(`/body-scans/prisoners`, ['A1234AA'])
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, [bodyScanInfo])

      const info = await bodyScanClint.getBodyScanInfo(['A1234AA'])
      expect(info).toStrictEqual([bodyScanInfo])
    })
  })
})
