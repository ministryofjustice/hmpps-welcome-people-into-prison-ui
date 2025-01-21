import moment from 'moment'
import { parse } from 'csv-parse'
import logger from '../logger'

import type { HmppsAuthClient, WelcomeClient, RestClientBuilder } from '../server/data'

export default class EventsRetriever {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientBuilder: RestClientBuilder<WelcomeClient>
  ) {}

  async retrieveEventsForPastSixMonths(): Promise<string[][]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientBuilder(token)
    const parser = parse({
      delimiter: ',',
      // line 1 contains the column headers. Ignore this line and start at line 2
      from: 2,
    })
    const records: string[][] = []
    const dateSixMonthsAgo = moment().subtract(6, 'months').startOf('day')
    welcomeClient.getEventsCSV(parser, dateSixMonthsAgo, 183)

    // eslint-disable-next-line no-restricted-syntax
    for await (const record of parser) {
      records.push(record)
    }
    logger.info(`Retrieved ${records.length} events since ${dateSixMonthsAgo}`)
    return records
  }
}
