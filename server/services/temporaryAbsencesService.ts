import type { TemporaryAbsence } from 'welcome'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'
import { compareByFullName } from '../utils/utils'

export default class TemporaryAbsencesService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  public async getTemporaryAbsences(agencyId: string): Promise<TemporaryAbsence[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const temporaryAbsences = await this.welcomeClientFactory(token).getTemporaryAbsences(agencyId)
    return temporaryAbsences.sort(compareByFullName)
  }

  public async getTemporaryAbsence(agencyId: string, prisonNumber: string): Promise<TemporaryAbsence> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const temporaryAbsence = await this.welcomeClientFactory(token).getTemporaryAbsence(agencyId, prisonNumber)
    return temporaryAbsence
  }

  public async confirmTemporaryAbsence(username: string, prisonNumber: string, agencyId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmTemporaryAbsence(prisonNumber, agencyId)
  }
}
