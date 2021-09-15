import type { Movement } from 'welcome'
import moment, { Moment } from 'moment'
import { groupBy } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeApi from '../api/welcomeApi'

export enum MoveType {
  FROM_COURT = 'FROM_COURT',
  FROM_CUSTODY_SUITE = 'FROM_CUSTODY_SUITE',
  OTHER = 'OTHER',
}

export default class IncomingMovementsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeApiFactory: (token: string) => WelcomeApi
  ) {}

  private getMoveType(item: Movement): MoveType {
    if (item.moveType === 'PRISON_REMAND') return MoveType.FROM_COURT
    if (item.moveType === 'PRISON_RECALL') return MoveType.FROM_CUSTODY_SUITE
    if (item.moveType === 'VIDEO_REMAND') return MoveType.FROM_CUSTODY_SUITE
    return MoveType.OTHER
  }

  private sortAlphabetically(movements: Movement[]): Movement[] {
    return movements.sort((a, b) => {
      const result = a.lastName.localeCompare(b.lastName)
      return result !== 0 ? result : a.firstName.localeCompare(b.firstName)
    })
  }

  private async getIncomingMovements(agencyId: string, now: Moment): Promise<Movement[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const movements = await this.welcomeApiFactory(token).getIncomingMovements(agencyId, now)
    return this.sortAlphabetically(movements)
  }

  public async getMovesForToday(agencyId: string, now = () => moment()): Promise<Map<string, Movement[]>> {
    const movements = await this.getIncomingMovements(agencyId, now())
    return groupBy(movements, (movement: Movement) => this.getMoveType(movement))
  }
}
