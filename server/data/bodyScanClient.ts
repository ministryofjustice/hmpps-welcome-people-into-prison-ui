import type { BodyScanInfo } from 'body-scan'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export default class BodyScanClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bodyScanClient', config.apis.bodyscan as ApiConfig, token)
  }

  async getSingleBodyScanInfo(prisonNumber: string): Promise<BodyScanInfo> {
    logger.info(`bodyScanClient: getSingleBodyScan(${prisonNumber})`)
    return (await this.restClient.get({
      path: `/body-scans/prisoners/${prisonNumber}`,
    })) as Promise<BodyScanInfo>
  }

  async getBodyScanInfo(prisonNumbers: string[]): Promise<BodyScanInfo[]> {
    logger.info(`bodyScanClient: getBodyScanInfo(${prisonNumbers})`)
    return (await this.restClient.post({
      path: `/body-scans/prisoners`,
      data: prisonNumbers,
    })) as Promise<BodyScanInfo[]>
  }
}
