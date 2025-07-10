/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import { redisClient } from './redisClient'
import { InMemoryTokenStore, RedisTokenStore } from './tokenStore'
import ManageUsersApiClient from './manageUsersApiClient'
import WelcomeClient from './welcomeClient'
import PrisonRegisterClient from './prisonRegisterClient'
import BodyScanClient from './bodyScanClient'
import notifyClient from './notifyClient'
import LockManager from './lockManager'
import FeComponentsClient from './feComponentsClient'
import config from '../config'
import logger from '../../logger'
import applicationInfoSupplier from '../applicationInfo'

initialiseAppInsights()
buildAppInsightsClient()
const applicationInfo = applicationInfoSupplier()

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(redisClient) : new InMemoryTokenStore(),
  )
  return {
    applicationInfo,
    redisClient,
    notifyClient,
    hmppsAuthClient,
    manageUsersApiClient: new ManageUsersApiClient(redisClient, hmppsAuthClient),
    welcomeClientBuilder: new WelcomeClient(redisClient, hmppsAuthClient),
    feComponentsClient: new FeComponentsClient(hmppsAuthClient),
    prisonRegisterClientBuilder: new PrisonRegisterClient(redisClient, hmppsAuthClient),
    bodyScanClientBuilder: new BodyScanClient(redisClient, hmppsAuthClient),
    lockManager: new LockManager(redisClient),
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export { WelcomeClient, PrisonRegisterClient, BodyScanClient, LockManager }
