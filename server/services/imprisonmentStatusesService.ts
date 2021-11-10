import type { ImprisonmentStatus } from 'welcome'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

export default class ImprisonmentStatusesService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  public async getAllImprisonmentStatuses(): Promise<ImprisonmentStatus[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getImprisonmentStatuses()
  }

  public async getImprisonmentStatus(code: string): Promise<ImprisonmentStatus> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const statuses = await this.welcomeClientFactory(token).getImprisonmentStatuses()
    return statuses.find(s => s.code === code)
  }
}
