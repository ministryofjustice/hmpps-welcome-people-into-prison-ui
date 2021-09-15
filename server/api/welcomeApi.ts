import moment from 'moment'
import type { Movement } from 'welcome'
import config, { ApiConfig } from '../config'
import RestClient from '../data/restClient'
import logger from '../../logger'

export default class WelcomeApi {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Welcome API', config.apis.welcomeApi as ApiConfig, token)
  }

  async getIncomingMovements(agencyId: string, date: moment.Moment): Promise<Movement[]> {
    logger.info(`welcomeApi: getIncomingMovements(${agencyId}, ${date})`)
    return this.restClient.get({
      path: `/incoming-moves/${agencyId}`,
      query: { date: date.format('YYYY-MM-DD') },
    }) as Promise<Movement[]>
  }
}
