import type { ArrivalResponse, Transfer } from 'welcome'
import type { HmppsAuthClient, RestClientBuilder, WelcomeClient } from '../data'

export default class TransfersService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  public async getTransfer(agencyId: string, prisonNumber: string): Promise<Transfer> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    return welcomeClient.getTransfer(agencyId, prisonNumber)
  }

  public async confirmTransfer(
    username: string,
    prisonNumber: string,
    prisonId: string,
    arrivalId?: string
  ): Promise<ArrivalResponse | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmTransfer(prisonNumber, prisonId, arrivalId)
  }
}
