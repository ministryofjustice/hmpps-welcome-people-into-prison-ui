import type { Prison } from 'welcome'
import type { RestClientBuilder, PrisonRegisterClient, HmppsAuthClient } from '../data'

export default class PrisonService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly prisonRegisterClientFactory: RestClientBuilder<PrisonRegisterClient>
  ) {}

  public async getPrison(activeCaseLoadId: string): Promise<Prison> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.prisonRegisterClientFactory(token).getPrison(activeCaseLoadId)
  }
}
