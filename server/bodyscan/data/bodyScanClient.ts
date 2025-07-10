import type { BodyScan, BodyScanInfo, PrisonerDetails } from 'body-scan'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../../config'
import logger from '../../../logger'
import BaseApiClient from '../../data/baseApiClient'
import { RedisClient } from '../../data/redisClient'

export default class BodyScanClient extends BaseApiClient {
  constructor(
    protected readonly redisClient: RedisClient,
    authenticationClient: AuthenticationClient,
  ) {
    super('bodyScanClient', redisClient, config.apis.bodyscan, authenticationClient)
  }

  getPrisonerDetails: (token: string, params: { prisonNumber: string }) => Promise<PrisonerDetails> = this.apiCall<
    PrisonerDetails,
    { prisonNumber: string }
  >({
    path: '/prisoners/:prisonNumber',
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getPrisonerDetails(prisonNumber=${params.prisonNumber})`,
  })

  addBodyScan: (token: string, params: { prisonNumber: string }, data: BodyScan) => Promise<void> = this.apiCall<
    void,
    { prisonNumber: string },
    BodyScan
  >({
    path: '/body-scans/prisoners/:prisonNumber',
    requestType: 'post',
  })

  getSingleBodyScanInfo: (token: string, params: { prisonNumber: string }) => Promise<BodyScanInfo> = this.apiCall<
    BodyScanInfo,
    { prisonNumber: string }
  >({
    path: '/body-scans/prisoners/:prisonNumber',
    requestType: 'post',
  })
}
