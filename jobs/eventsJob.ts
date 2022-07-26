/* eslint-disable import/first */
/* eslint-disable import/order */
import 'dotenv/config'

import moment from 'moment'
import { dataAccess } from '../server/data'
import EventsRetriever from './eventsRetriever'
import EventsPusher from './eventsPusher'
import logger from '../logger'
import config from '../server/config'

const { hmppsAuthClient, welcomeClientBuilder, redisClient } = dataAccess()

const retriever = new EventsRetriever(hmppsAuthClient, welcomeClientBuilder)

const pusher = new EventsPusher(config.eventPublishing.serviceAccountKey, config.eventPublishing.spreadsheetId)

const job = async () => {
  const events = await retriever.retrieveEventsForDay(moment())
  await pusher.pushEvents(events)
}

job()
  .catch(error => {
    process.exitCode = 1
    logger.error(error)
  })
  .finally(async () => {
    await redisClient.disconnect()
  })
