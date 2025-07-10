import type { BodyScan, PrisonerDetails } from 'body-scan'

import type { BodyScanClient } from '../data'

export default class BodyScanService {
  constructor(private readonly bodyScanClient: BodyScanClient) {}

  public async getPrisonerDetails(token: string, prisonNumber: string): Promise<PrisonerDetails> {
    return this.bodyScanClient.getPrisonerDetails(token, { prisonNumber })
  }

  public async addBodyScan(token: string, prisonNumber: string, bodyScan: BodyScan): Promise<void> {
    await this.bodyScanClient.addBodyScan(token, { prisonNumber }, bodyScan)
  }

  public async retrieveBodyScanInfo(token: string, prisonNumber: string) {
    return this.bodyScanClient.getSingleBodyScanInfo(token, { prisonNumber })
  }
}
