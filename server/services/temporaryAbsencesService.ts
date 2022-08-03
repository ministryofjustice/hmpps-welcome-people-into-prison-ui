import type { TemporaryAbsence, ArrivalResponse } from 'welcome'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'
import { compareByFullName } from '../utils/utils'
import type { BodyScanInfoDecorator, WithBodyScanInfo } from './bodyScanInfoDecorator'

export default class TemporaryAbsencesService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>,
    private readonly bodyScanInfoDecorator: BodyScanInfoDecorator
  ) {}

  public async getTemporaryAbsences(agencyId: string): Promise<WithBodyScanInfo<TemporaryAbsence>[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const temporaryAbsencesRaw = await this.welcomeClientFactory(token).getTemporaryAbsences(agencyId)
    const temporaryAbsences = await this.bodyScanInfoDecorator.decorate(temporaryAbsencesRaw)
    return temporaryAbsences.sort(compareByFullName)
  }

  public async getTemporaryAbsence(agencyId: string, prisonNumber: string): Promise<TemporaryAbsence> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getTemporaryAbsence(agencyId, prisonNumber)
  }

  public async confirmTemporaryAbsence(
    username: string,
    prisonNumber: string,
    agencyId: string
  ): Promise<ArrivalResponse | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmTemporaryAbsence(prisonNumber, agencyId)
  }
}
