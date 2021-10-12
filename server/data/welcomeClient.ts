import moment from 'moment'
import type { Movement, TemporaryAbsence } from 'welcome'
import type { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export default class WelcomeClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('welcomeClient', config.apis.welcome as ApiConfig, token)
  }

  async getExpectedArrivals(agencyId: string, date: moment.Moment): Promise<Movement[]> {
    logger.info(`welcomeApi: getExpectedArrivals(${agencyId}, ${date})`)
    return this.restClient.get({
      path: `/incoming-moves/${agencyId}`,
      query: { date: date.format('YYYY-MM-DD') },
    }) as Promise<Movement[]>
  }

  async getTemporaryAbsences(agencyId: string): Promise<TemporaryAbsence[]> {
    logger.info(`welcomeApi: getTemporaryAbsences(${agencyId})`)
    return this.restClient.get({
      path: `/temporary-absences/${agencyId}`,
    }) as Promise<TemporaryAbsence[]>
  }

  async getImage(prisonNumber: string): Promise<Readable> {
    logger.info(`welcomeApi: getImage(${prisonNumber})`)
    return this.restClient.stream({
      path: `/prison/prisoner/${prisonNumber}/image`,
    }) as Promise<Readable>
  }

  async getMove(moveId: string): Promise<Movement> {
    logger.info(`welcomeApi: getMove(${moveId})`)
    return this.restClient.get({
      path: `/arrivals/${moveId}`,
    }) as Promise<Movement>
  }
}
