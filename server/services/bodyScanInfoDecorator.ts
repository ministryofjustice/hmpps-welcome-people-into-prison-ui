import type { BodyScanStatus } from 'body-scan'
import type { HmppsAuthClient, RestClientBuilder, BodyScanClient } from '../data'
import { associateBy } from '../utils/utils'

type HasPrisonNumber = { prisonNumber: string }

export type WithBodyScanStatus<T extends HasPrisonNumber> = T & { bodyScanStatus: BodyScanStatus }

export type WithBodyScanInfo<T extends HasPrisonNumber> = T & {
  numberOfBodyScans: number
  numberOfBodyScansRemaining: number
  bodyScanStatus: BodyScanStatus
}

export class BodyScanInfoDecorator {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly bodyScanClientFactory: RestClientBuilder<BodyScanClient>
  ) {}

  public async decorate<T extends HasPrisonNumber>(items: T[]): Promise<WithBodyScanStatus<T>[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const prisonNumbers = items.map(i => i.prisonNumber).filter(Boolean)
    const scanInfo = await this.bodyScanClientFactory(token).getBodyScanInfo(prisonNumbers)
    const prisonNumberToScan = associateBy(scanInfo, info => info.prisonNumber)
    return items.map(i => ({ ...i, bodyScanStatus: prisonNumberToScan.get(i.prisonNumber)?.bodyScanStatus }))
  }

  public async decorateSingle<T extends HasPrisonNumber>(item: T): Promise<WithBodyScanInfo<T>> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const { numberOfBodyScans, numberOfBodyScansRemaining, bodyScanStatus } = await this.bodyScanClientFactory(
      token
    ).getSingleBodyScanInfo(item.prisonNumber)
    return { ...item, numberOfBodyScans, numberOfBodyScansRemaining, bodyScanStatus }
  }
}
