import type { BodyScanInfo } from 'body-scan'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import BaseApiClient from './baseApiClient'
import { RedisClient } from './redisClient'

export default class BodyScanClient extends BaseApiClient {
  constructor(
    protected readonly redisClient: RedisClient,
    authenticationClient: AuthenticationClient,
  ) {
    super('bodyScanClient', redisClient, config.apis.bodyscan, authenticationClient)
  }

  getSingleBodyScanInfo: (token: string, params: { prisonNumber: string }) => Promise<BodyScanInfo> = this.apiCall<
    BodyScanInfo,
    { prisonNumber: string }
  >({
    path: '/body-scans/prisoners/:prisonNumber',
    requestType: 'post',
    loggerMessage: params => `welcomeApi: getSingleBodyScanInfo(${params.prisonNumber})`,
  })

  getBodyScanInfo: (token: string, data: { prisonNumbers: string[] }) => Promise<BodyScanInfo[]> = this.apiCall<
    BodyScanInfo[],
    undefined,
    { prisonNumbers: string[] }
  >({
    path: '/body-scans/prisoners',
    requestType: 'post',
    loggerMessage: data => `welcomeApi: getBodyScanInfo(${JSON.stringify(data)})`,
  })
}
