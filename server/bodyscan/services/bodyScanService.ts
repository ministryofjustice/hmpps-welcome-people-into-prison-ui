import type { BodyScan, PrisonerDetails } from 'body-scan'
import { HmppsAuthClient, RestClientBuilder } from '../../data'
import type { BodyScanClient } from '../data'

export default class BodyScanService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly bodyScanClientFactory: RestClientBuilder<BodyScanClient>
  ) {}

  public async getPrisonerDetails(prisonNumber: string): Promise<PrisonerDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.bodyScanClientFactory(token).getPrisonerDetails(prisonNumber)
  }

  public async addBodyScan(prisonNumber: string, bodyScan: BodyScan): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    await this.bodyScanClientFactory(token).addBodyScan(prisonNumber, bodyScan)
  }

  public async retrieveBodyScanInfo(prisonNumber: string) {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.bodyScanClientFactory(token).getSingleBodyScanInfo(prisonNumber)
  }
}
