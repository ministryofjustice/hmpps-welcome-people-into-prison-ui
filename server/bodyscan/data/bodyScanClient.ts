import type { PrisonerDetails } from 'body-scan'
import config, { ApiConfig } from '../../config'
import RestClient from '../../data/restClient'
import logger from '../../../logger'

export default class BodyScanClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bodyScanClient', config.apis.bodyscan as ApiConfig, token)
  }

  async getPrisonerDetails(prisonNumber: string): Promise<PrisonerDetails> {
    logger.info(`bodyScanClient: getPrison(${prisonNumber})`)
    return this.restClient.get({
      path: `/prisoners/${prisonNumber}`,
    }) as Promise<PrisonerDetails>
  }
}
