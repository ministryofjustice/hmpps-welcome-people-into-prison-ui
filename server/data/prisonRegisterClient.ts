import type { Prison } from 'welcome'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export default class PrisonRegisterClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('prisonRegisterClient', config.apis.prisonRegister as ApiConfig, token)
  }

  async getPrison(prisonId: string): Promise<Prison> {
    logger.info(`prisonRegisterApi: getPrison(${prisonId})`)
    return this.restClient.get({
      path: `/prisons/id/${prisonId}`,
    }) as Promise<Prison>
  }
}
