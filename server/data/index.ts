/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import HmppsAuthClient from './hmppsAuthClient'
import logger from '../../logger'
import config from '../config'
import { createRedisClient } from './redisClient'
import { RedisTokenStore } from './tokenStore'
import WelcomeClient from './welcomeClient'
import PrisonRegisterClient from './prisonRegisterClient'
import BodyScanClient from './bodyScanClient'
import XrayBodyScansApiClient from './xrayBodyScansApiClient'
import notifyClient from './notifyClient'
import LockManager from './lockManager'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const redisClient = createRedisClient()
  return {
    applicationInfo,
    redisClient,
    notifyClient,
    hmppsAuthClient: new HmppsAuthClient(new RedisTokenStore(redisClient)),
    welcomeClientBuilder: ((token: string) => new WelcomeClient(token)) as RestClientBuilder<WelcomeClient>,

    prisonRegisterClientBuilder: ((token: string) =>
      new PrisonRegisterClient(token)) as RestClientBuilder<PrisonRegisterClient>,

    bodyScanClientBuilder: ((token: string) => new BodyScanClient(token)) as RestClientBuilder<BodyScanClient>,
    xrayBodyScansApiClientBuilder: ((token: string) =>
      new XrayBodyScansApiClient(token)) as RestClientBuilder<XrayBodyScansApiClient>,
    lockManager: new LockManager(redisClient),
    authenticationClient: new AuthenticationClient(config.apis.hmppsAuth, logger, new RedisTokenStore(redisClient)),
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export {
  WelcomeClient,
  PrisonRegisterClient,
  BodyScanClient,
  XrayBodyScansApiClient,
  HmppsAuthClient,
  RestClientBuilder,
  LockManager,
}
