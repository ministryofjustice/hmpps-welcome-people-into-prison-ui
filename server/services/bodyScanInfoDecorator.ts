import type { BodyScanStatus } from 'body-scan'
import type { HmppsAuthClient, RestClientBuilder, BodyScanClient, XrayBodyScansApiClient } from '../data'
import type { AlertResponse, LatestScan } from '../data/xrayBodyScansApiClient'
import { associateBy } from '../utils/utils'
import newXRayBodyScansEnabled from '../utils/featureToggles'

type HasPrisonNumber = { prisonNumber: string }

export type WithBodyScanStatus<T extends HasPrisonNumber> = T & { bodyScanStatus: BodyScanStatus }

export type WithBodyScanInfo<T extends HasPrisonNumber> = T & {
  numberOfBodyScans?: number
  numberOfBodyScansRemaining?: number
  bodyScanStatus: BodyScanStatus
  nomisCount?: number
  relevantAlerts?: AlertResponse[]
  latestScan?: LatestScan | null
}

function toBodyScanStatus(atScanLimit: boolean, nearingScanLimit: boolean): BodyScanStatus {
  if (atScanLimit) return 'DO_NOT_SCAN'
  if (nearingScanLimit) return 'CLOSE_TO_LIMIT'
  return 'OK_TO_SCAN'
}

export class BodyScanInfoDecorator {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly bodyScanClientFactory: RestClientBuilder<BodyScanClient>,
    private readonly xrayBodyScansApiClientFactory: RestClientBuilder<XrayBodyScansApiClient>,
  ) {}

  public async decorate<T extends HasPrisonNumber>(
    items: T[],
    activeCaseLoadId: string,
  ): Promise<WithBodyScanInfo<T>[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const prisonNumbers = items.map(i => i.prisonNumber).filter(Boolean)

    if (newXRayBodyScansEnabled(activeCaseLoadId)) {
      const summaries =
        prisonNumbers.length === 1
          ? [await this.xrayBodyScansApiClientFactory(token).getScanSummary(prisonNumbers[0])]
          : await this.xrayBodyScansApiClientFactory(token).getBulkScanSummary(prisonNumbers)
      const prisonNumberToSummary = associateBy(summaries, s => s.prisonerNumber)
      return items.map(i => {
        const summary = prisonNumberToSummary.get(i.prisonNumber)
        return {
          ...i,
          numberOfBodyScans: summary?.totalCount ?? 0,
          numberOfBodyScansRemaining: summary?.remainingScans ?? 0,
          nomisCount: summary?.nomisCount ?? 0,
          bodyScanStatus: (summary
            ? toBodyScanStatus(summary.atScanLimit, summary.nearingScanLimit)
            : undefined) as BodyScanStatus,
          relevantAlerts: summary?.relevantAlerts ?? [],
          latestScan: summary?.latestScan ?? null,
        }
      })
    }

    const scanInfo = await this.bodyScanClientFactory(token).getBodyScanInfo(prisonNumbers)
    const prisonNumberToScan = associateBy(scanInfo, info => info.prisonNumber)
    return items.map(i => ({
      ...i,
      bodyScanStatus: prisonNumberToScan.get(i.prisonNumber)?.bodyScanStatus as BodyScanStatus,
    }))
  }

  public async decorateSingle<T extends HasPrisonNumber>(
    item: T,
    activeCaseLoadId: string,
  ): Promise<WithBodyScanInfo<T>> {
    const token = await this.hmppsAuthClient.getSystemClientToken()

    if (newXRayBodyScansEnabled(activeCaseLoadId)) {
      const summary = await this.xrayBodyScansApiClientFactory(token).getScanSummary(item.prisonNumber)
      return {
        ...item,
        numberOfBodyScans: summary?.totalCount ?? 0,
        numberOfBodyScansRemaining: summary?.remainingScans ?? 0,
        nomisCount: summary?.nomisCount ?? 0,
        bodyScanStatus: toBodyScanStatus(summary.atScanLimit, summary.nearingScanLimit),
        relevantAlerts: summary?.relevantAlerts ?? [],
        latestScan: summary?.latestScan ?? null,
      }
    }

    const { numberOfBodyScans, numberOfBodyScansRemaining, bodyScanStatus } = await this.bodyScanClientFactory(
      token,
    ).getSingleBodyScanInfo(item.prisonNumber)
    return { ...item, numberOfBodyScans, numberOfBodyScansRemaining, bodyScanStatus }
  }
}
