import moment from 'moment'
import { parse } from 'csv-parse'
import logger from '../logger'
import { WelcomeClient } from '../server/data'

export default class EventsRetriever {
  constructor(private readonly welcomeClient: WelcomeClient) {}

  async retrieveEventsForPastSixMonths(): Promise<string[][]> {
    const parser = parse({
      delimiter: ',',
      // line 1 contains the column headers. Ignore this line and start at line 2
      from: 2,
    })
    const records: string[][] = []
    const dateSixMonthsAgo = moment().subtract(6, 'months').startOf('day')
    this.welcomeClient.getEventsCSV(parser, dateSixMonthsAgo, 183)

    for await (const record of parser) {
      records.push(record)
    }
    logger.info(`Retrieved ${records.length} events since ${dateSixMonthsAgo}`)
    return records
  }
}
