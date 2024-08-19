// Require app insights before anything else to allow for instrumentation of bunyan
import '../server/utils/azureAppInsights'
import { HmppsAuthClient, WelcomeClient, type RestClientBuilder } from '../server/data'
import { InMemoryTokenStore } from '../server/data/tokenStore'
import EventsRetriever from './eventsRetriever'
import EventsPusher from './eventsPusher'
import logger from '../logger'
import config from '../server/config'

const hmppsAuthClient = new HmppsAuthClient(new InMemoryTokenStore())
const welcomeClientBuilder: RestClientBuilder<WelcomeClient> = (token: string) => new WelcomeClient(token)

const retriever = new EventsRetriever(hmppsAuthClient, welcomeClientBuilder)

const pusher = new EventsPusher(config.eventPublishing.serviceAccountKey, config.eventPublishing.spreadsheetId)

const job = async () => {
  const events = await retriever.retrieveEventsForPastYear()
  await pusher.pushEvents(events)
}

job().catch(error => {
  process.exitCode = 1
  logger.error(error)
})
