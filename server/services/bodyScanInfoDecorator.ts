import type { BodyScanStatus } from 'body-scan'
import type { HmppsAuthClient, RestClientBuilder, XrayBodyScansApiClient } from '../data'
import { associateBy } from '../utils/utils'

type HasPrisonNumber = { prisonNumber: string }

export type WithBodyScanStatus<T extends HasPrisonNumber> = T & { bodyScanStatus: BodyScanStatus }

export type WithBodyScanInfo<T extends HasPrisonNumber> = T & {
  numberOfBodyScans: number
  numberOfBodyScansRemaining: number
  bodyScanStatus: BodyScanStatus
}

function toBodyScanStatus(atScanLimit: boolean, nearingScanLimit: boolean): BodyScanStatus {
  if (atScanLimit) return 'DO_NOT_SCAN'
  if (nearingScanLimit) return 'CLOSE_TO_LIMIT'
  return 'OK_TO_SCAN'
}

export class BodyScanInfoDecorator {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly xrayBodyScansApiClientFactory: RestClientBuilder<XrayBodyScansApiClient>,
  ) {}

  public async decorate<T extends HasPrisonNumber>(items: T[]): Promise<WithBodyScanStatus<T>[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const prisonNumbers = items.map(i => i.prisonNumber).filter(Boolean)
    const summaries = await this.xrayBodyScansApiClientFactory(token).getBulkScanSummary(prisonNumbers)
    const prisonNumberToSummary = associateBy(summaries, s => s.prisonerNumber)
    return items.map(i => {
      const summary = prisonNumberToSummary.get(i.prisonNumber)
      return { ...i, bodyScanStatus: (summary ? toBodyScanStatus(summary.atScanLimit, summary.nearingScanLimit) : undefined) as BodyScanStatus }
    })
  }

  public async decorateSingle<T extends HasPrisonNumber>(item: T): Promise<WithBodyScanInfo<T>> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const summary = await this.xrayBodyScansApiClientFactory(token).getScanSummary(item.prisonNumber)
    return {
      ...item,
      numberOfBodyScans: summary.totalCount,
      numberOfBodyScansRemaining: summary.remainingScans,
      bodyScanStatus: toBodyScanStatus(summary.atScanLimit, summary.nearingScanLimit),
    }
  }
}
