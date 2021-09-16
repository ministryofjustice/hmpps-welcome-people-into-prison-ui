/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import HmppsAuthClient from './hmppsAuthClient'
import TokenStore from './tokenStore'
import WelcomeClient from './welcomeClient'

initialiseAppInsights()
buildAppInsightsClient()

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = {
  hmppsAuthClient,
  welcomeClientBuilder: ((token: string) => new WelcomeClient(token)) as RestClientBuilder<WelcomeClient>,
}

export type DataAccess = typeof dataAccess

export { WelcomeClient, HmppsAuthClient, RestClientBuilder }
