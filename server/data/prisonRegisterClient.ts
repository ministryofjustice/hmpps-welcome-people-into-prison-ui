import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import type { Prison } from 'welcome'
import config from '../config'
import BaseApiClient from './baseApiClient'
import { RedisClient } from './redisClient'

export default class PrisonRegisterClient extends BaseApiClient {
  constructor(
    protected readonly redisClient: RedisClient,
    authenticationClient: AuthenticationClient,
  ) {
    super('PrisonRegisterClient', redisClient, config.apis.prisonRegister, authenticationClient)
  }

  prisons = {
    getPrison: this.apiCall<Prison, { prisonId: string }>({
      path: '/prisons/id/:prisonId',
      requestType: 'get',
      loggerMessage: params => `prisonRegisterApi: getPrison(${params.prisonId})`,
    }),
  }
}
