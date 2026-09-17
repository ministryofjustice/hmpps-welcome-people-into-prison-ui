import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export interface AlertResponse {
  id: string
  type: string
  typeDescription: string
  code: string
  codeDescription: string
}

export interface LatestScan {
  source: 'DPS' | 'NOMIS'
  scanDate: string | null
  outcomeDescription?: string
  scanDetails?: string | null
}

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
  relevantAlerts: AlertResponse[]
  latestScan: LatestScan | null
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
      query: { includeAlerts: 'true', includeLatestScan: 'true' },
    }) as Promise<ScanSummaryResponse>
  }

  async getBulkScanSummary(prisonerNumbers: string[]): Promise<ScanSummaryResponse[]> {
    logger.info(`xrayBodyScansApiClient: getBulkScanSummary(${prisonerNumbers})`)
    return this.restClient.post({
      path: `/bulk/summary`,
      data: { prisonerNumbers, includeAlerts: true },
    }) as Promise<ScanSummaryResponse[]>
  }
}
