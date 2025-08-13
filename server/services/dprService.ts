import type { ManagementReportDefinition } from 'management-reporting'
import type { HmppsAuthClient, RestClientBuilder, WelcomeClient } from '../data'

export default class DprService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>,
  ) {}

  public async getManagementReportDefinitions(token: string): Promise<ManagementReportDefinition[]> {
    const welcomeClient = this.welcomeClientFactory(token)
    return welcomeClient.getManagementReportDefinitions()
  }
}
