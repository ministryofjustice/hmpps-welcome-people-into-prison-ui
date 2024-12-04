/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import { RedisTokenStore } from './tokenStore'
import WelcomeClient from './welcomeClient'
import PrisonRegisterClient from './prisonRegisterClient'
import BodyScanClient from './bodyScanClient'
import FeComponentsClient from './feComponentsClient'
import notifyClient from './notifyClient'
import LockManager from './lockManager'

initialiseAppInsights()
buildAppInsightsClient()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const redisClient = createRedisClient()
  return {
    redisClient,
    notifyClient,
    hmppsAuthClient: new HmppsAuthClient(new RedisTokenStore(redisClient)),
    welcomeClientBuilder: ((token: string) => new WelcomeClient(token)) as RestClientBuilder<WelcomeClient>,

    prisonRegisterClientBuilder: ((token: string) =>
      new PrisonRegisterClient(token)) as RestClientBuilder<PrisonRegisterClient>,

    bodyScanClientBuilder: ((token: string) => new BodyScanClient(token)) as RestClientBuilder<BodyScanClient>,
    feComponentsClientBuilder: ((token: string) =>
      new FeComponentsClient(token)) as RestClientBuilder<FeComponentsClient>,
    lockManager: new LockManager(redisClient),
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export {
  WelcomeClient,
  PrisonRegisterClient,
  BodyScanClient,
  HmppsAuthClient,
  RestClientBuilder,
  LockManager,
  FeComponentsClient,
}
