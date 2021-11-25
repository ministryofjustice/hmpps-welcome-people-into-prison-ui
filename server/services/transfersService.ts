import type { Transfer } from 'welcome'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

export default class TransfersService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  public async getTransfer(agencyId: string, prisonNumber: string): Promise<Transfer> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    const transfer = await welcomeClient.getTransfer(agencyId, prisonNumber)
    return transfer
  }

  public async confirmTransfer(username: string, prisonNumber: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    const welcomeClient = this.welcomeClientFactory(token)
    await welcomeClient.confirmTransfer(prisonNumber)
  }
}
