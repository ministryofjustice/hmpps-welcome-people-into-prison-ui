import type { Movement } from 'welcome'
import moment, { Moment } from 'moment'
import type { Readable } from 'stream'
import { groupBy, compareByFullName } from '../utils/utils'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

export enum LocationType {
  COURT = 'COURT',
  CUSTODY_SUITE = 'CUSTODY_SUITE',
  PRISON = 'PRISON',
  OTHER = 'OTHER',
}

export default class ExpectedArrivalsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  private static getFromLocationType(item: Movement): LocationType {
    if (!item.moveType && item.fromLocationType) return item.fromLocationType
    if (item.moveType === 'PRISON_REMAND') return LocationType.COURT
    if (item.moveType === 'PRISON_RECALL') return LocationType.CUSTODY_SUITE
    if (item.moveType === 'VIDEO_REMAND') return LocationType.CUSTODY_SUITE
    if (item.moveType === 'PRISON_TRANSFER') return LocationType.PRISON
    return LocationType.OTHER
  }

  private async getExpectedArrivals(agencyId: string, now: Moment): Promise<Movement[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const expectedArrivals = await this.welcomeClientFactory(token).getExpectedArrivals(agencyId, now)
    return expectedArrivals.sort(compareByFullName)
  }

  public async getArrivalsForToday(agencyId: string, now = () => moment()): Promise<Map<LocationType, Movement[]>> {
    const expectedArrivals = await this.getExpectedArrivals(agencyId, now())
    return groupBy(expectedArrivals, (arrival: Movement) => ExpectedArrivalsService.getFromLocationType(arrival))
  }

  public async getImage(prisonNumber: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getImage(prisonNumber)
  }
}
