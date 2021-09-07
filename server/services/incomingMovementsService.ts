import type { Movement } from 'welcome'
import moment from 'moment'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeApi from '../api/welcomeApi'

export default class IncomingMovementsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeApiFactory: (token: string) => WelcomeApi
  ) {}

  public async getIncomingMovements(agencyId: string): Promise<Movement[]> {
    const today = moment.now().toString()
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeApiFactory(token).getIncomingMovements(agencyId, today)
  }
}
