// Require app insights before anything else to allow for instrumentation of bunyan
import '../server/utils/azureAppInsights'

import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { WelcomeClient } from '../server/data'

import EventsRetriever from './eventsRetriever'
import EventsPusher from './eventsPusher'

import logger from '../logger'
import config from '../server/config'
import { InMemoryTokenStore, RedisTokenStore } from '../server/data/tokenStore'
import { redisClient } from '../server/data/redisClient'

const hmppsAuthClient = new AuthenticationClient(
  config.apis.hmppsAuth,
  logger,
  config.redis.enabled ? new RedisTokenStore(redisClient) : new InMemoryTokenStore(),
)

const welcomeClient = new WelcomeClient(redisClient, hmppsAuthClient)

const retriever = new EventsRetriever(welcomeClient)

const pusher = new EventsPusher(config.eventPublishing.serviceAccountKey, config.eventPublishing.spreadsheetId)

const job = async () => {
  const events = await retriever.retrieveEventsForPastSixMonths()
  await pusher.pushEvents(events)
}

job().catch(error => {
  process.exitCode = 1
  logger.error(error)
})
