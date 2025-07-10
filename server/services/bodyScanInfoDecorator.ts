import type { BodyScanStatus } from 'body-scan'
import type { BodyScanClient } from '../data'
import { associateBy } from '../utils/utils'

type HasPrisonNumber = { prisonNumber: string }

export type WithBodyScanStatus<T extends HasPrisonNumber> = T & { bodyScanStatus: BodyScanStatus }

export type WithBodyScanInfo<T extends HasPrisonNumber> = T & {
  numberOfBodyScans: number
  numberOfBodyScansRemaining: number
  bodyScanStatus: BodyScanStatus
}

export class BodyScanInfoDecorator {
  constructor(private readonly bodyScanClient: BodyScanClient) {}

  public async decorate<T extends HasPrisonNumber>(token: string, items: T[]): Promise<WithBodyScanStatus<T>[]> {
    const prisonNumbers = items.map(i => i.prisonNumber).filter(Boolean)
    const scanInfo = await this.bodyScanClient.getBodyScanInfo(token, { prisonNumbers })
    const prisonNumberToScan = associateBy(scanInfo, info => info.prisonNumber)
    return items.map(i => ({ ...i, bodyScanStatus: prisonNumberToScan.get(i.prisonNumber)?.bodyScanStatus }))
  }

  public async decorateSingle<T extends HasPrisonNumber>(token: string, item: T): Promise<WithBodyScanInfo<T>> {
    const { prisonNumber } = item
    const { numberOfBodyScans, numberOfBodyScansRemaining, bodyScanStatus } =
      await this.bodyScanClient.getSingleBodyScanInfo(token, { prisonNumber })
    return { ...item, numberOfBodyScans, numberOfBodyScansRemaining, bodyScanStatus }
  }
}
