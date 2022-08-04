import type { BodyScanStatus } from 'body-scan'
import type { HmppsAuthClient, RestClientBuilder, BodyScanClient } from '../data'
import { associateBy } from '../utils/utils'

type HasPrisonNumber = { prisonNumber: string }

export type WithBodyScanInfo<T extends HasPrisonNumber> = T & { bodyScanStatus: BodyScanStatus }

export class BodyScanInfoDecorator {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly bodyScanClientFactory: RestClientBuilder<BodyScanClient>
  ) {}

  public async decorate<T extends HasPrisonNumber>(items: T[]): Promise<WithBodyScanInfo<T>[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const prisonNumbers = items.map(i => i.prisonNumber)
    const scanInfo = await this.bodyScanClientFactory(token).getBodyScanInfo(prisonNumbers)
    const prisonNumberToScan = associateBy(scanInfo, info => info.prisonNumber)
    return items.map(i => ({ ...i, bodyScanStatus: prisonNumberToScan.get(i.prisonNumber)?.bodyScanStatus }))
  }

  // Create a new method for retrieve a body scan info based on prison number
}
