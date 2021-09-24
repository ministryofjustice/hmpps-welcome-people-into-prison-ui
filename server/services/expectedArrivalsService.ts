import type { Movement } from 'welcome'
import moment, { Moment } from 'moment'
import type { Readable } from 'stream'
<<<<<<< HEAD:server/services/expectedArrivalsService.ts
import { groupBy, compareByFullName } from '../utils/utils'
=======

import { groupBy } from '../utils/utils'
>>>>>>> DCS-1187 diplays prisoner's actual image or a placeholder image:server/services/incomingMovementsService.ts
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

export enum MoveType {
  FROM_COURT = 'FROM_COURT',
  FROM_CUSTODY_SUITE = 'FROM_CUSTODY_SUITE',
  FROM_ANOTHER_ESTABLISHMENT = 'FROM_ANOTHER_ESTABLISHMENT',
  OTHER = 'OTHER',
}

export default class ExpectedArrivalsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  private getMoveType(item: Movement): MoveType {
    if (item.moveType === 'PRISON_REMAND') return MoveType.FROM_COURT
    if (item.moveType === 'PRISON_RECALL') return MoveType.FROM_CUSTODY_SUITE
    if (item.moveType === 'VIDEO_REMAND') return MoveType.FROM_CUSTODY_SUITE
    if (item.moveType === 'PRISON_TRANSFER') return MoveType.FROM_ANOTHER_ESTABLISHMENT
    return MoveType.OTHER
  }

  private async getExpectedArrivals(agencyId: string, now: Moment): Promise<Movement[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const expectedArrivals = await this.welcomeClientFactory(token).getExpectedArrivals(agencyId, now)
    return expectedArrivals.sort(compareByFullName)
  }

  public async getArrivalsForToday(agencyId: string, now = () => moment()): Promise<Map<string, Movement[]>> {
    const expectedArrivals = await this.getExpectedArrivals(agencyId, now())
    return groupBy(expectedArrivals, (arrival: Movement) => this.getMoveType(arrival))
  }

  public async getImage(prisonNumber: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const image = await this.welcomeClientFactory(token).getImage(prisonNumber)
    return image
  }

  public async getImage(prisonNumber: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const image = await this.welcomeClientFactory(token).getImage(prisonNumber)
    return image
  }
}
