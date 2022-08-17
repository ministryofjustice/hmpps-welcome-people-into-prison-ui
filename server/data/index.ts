/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import HmppsAuthClient from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import WelcomeClient from './welcomeClient'
import BodyScanClient from './bodyScanClient'
import notifyClient from './notifyClient'

initialiseAppInsights()
buildAppInsightsClient()

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => {
  const redisClient = createRedisClient({ legacyMode: false })
  return {
    redisClient,
    notifyClient,
    hmppsAuthClient: new HmppsAuthClient(new TokenStore(redisClient)),
    welcomeClientBuilder: ((token: string) => new WelcomeClient(token)) as RestClientBuilder<WelcomeClient>,
    bodyScanClientBuilder: ((token: string) => new BodyScanClient(token)) as RestClientBuilder<BodyScanClient>,
  }
}
export type DataAccess = ReturnType<typeof dataAccess>

export { WelcomeClient, BodyScanClient, HmppsAuthClient, RestClientBuilder }
