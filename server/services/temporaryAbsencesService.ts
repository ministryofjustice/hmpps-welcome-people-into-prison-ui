import type { ArrivalResponse, TemporaryAbsence } from 'welcome'
import type { HmppsAuthClient, RestClientBuilder, WelcomeClient } from '../data'
import { compareByFullName } from '../utils/utils'
import type { BodyScanInfoDecorator, WithBodyScanStatus } from './bodyScanInfoDecorator'

export default class TemporaryAbsencesService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>,
    private readonly bodyScanInfoDecorator: BodyScanInfoDecorator,
  ) {}

  public async getTemporaryAbsences(agencyId: string): Promise<WithBodyScanStatus<TemporaryAbsence>[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const temporaryAbsencesRaw = await this.welcomeClientFactory(token).getTemporaryAbsences(agencyId)
    const temporaryAbsences = await this.bodyScanInfoDecorator.decorate(temporaryAbsencesRaw)
    return temporaryAbsences.sort(compareByFullName)
  }

  public async getTemporaryAbsence(prisonNumber: string): Promise<TemporaryAbsence> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getTemporaryAbsence(prisonNumber)
  }

  public async confirmTemporaryAbsence(
    username: string,
    prisonNumber: string,
    agencyId: string,
    arrivalId?: string,
  ): Promise<ArrivalResponse | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmTemporaryAbsence(prisonNumber, agencyId, arrivalId)
  }
}
