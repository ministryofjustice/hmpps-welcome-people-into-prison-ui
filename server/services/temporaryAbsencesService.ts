import type { TemporaryAbsence } from 'welcome'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

export default class TemporaryAbsencesService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  private sortAlphabetically(temporaryAbsences: TemporaryAbsence[]): TemporaryAbsence[] {
    return temporaryAbsences.sort((a, b) => {
      const result = a.lastName.localeCompare(b.lastName)
      return result !== 0 ? result : a.firstName.localeCompare(b.firstName)
    })
  }

  public async getTemporaryAbsences(agencyId: string): Promise<TemporaryAbsence[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const temporaryAbsences = await this.welcomeClientFactory(token).getTemporaryAbsences(agencyId)
    return this.sortAlphabetically(temporaryAbsences)
  }
}
