import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export interface ScanSummaryResponse {
  prisonerNumber: string
  nomisCount: number
  dpsCount: number
  totalCount: number
  positiveCount: number
  negativeCount: number
  inconclusiveCount: number
  annualLimit: number
  remainingScans: number
  nearingScanLimit: boolean
  atScanLimit: boolean
  fromScanDate: string
  toScanDate: string
}

export default class XrayBodyScansApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('xrayBodyScansApiClient', config.apis.xrayBodyScansApi as ApiConfig, token)
  }

  async getScanSummary(prisonerNumber: string): Promise<ScanSummaryResponse> {
    logger.info(`xrayBodyScansApiClient: getScanSummary(${prisonerNumber})`)
    return this.restClient.get({
      path: `/prisoner/${encodeURIComponent(prisonerNumber)}/scan/summary`,
    }) as Promise<ScanSummaryResponse>
  }

  async getBulkScanSummary(prisonerNumbers: string[]): Promise<ScanSummaryResponse[]> {
    logger.info(`xrayBodyScansApiClient: getBulkScanSummary(${prisonerNumbers})`)
    return this.restClient.post({
      path: `/bulk/summary`,
      data: { prisonerNumbers },
    }) as Promise<ScanSummaryResponse[]>
  }
}
