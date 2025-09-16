import type { ArrivalResponse, Transfer } from 'welcome'
import type { HmppsAuthClient, RestClientBuilder, WelcomeClient } from '../data'
import type { BodyScanInfoDecorator, WithBodyScanInfo } from './bodyScanInfoDecorator'

export default class TransfersService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>,
    private readonly bodyScanInfoDecorator: BodyScanInfoDecorator,
  ) {}

  public async getTransfer(agencyId: string, prisonNumber: string): Promise<Transfer> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    return welcomeClient.getTransfer(agencyId, prisonNumber)
  }

  public async getTransferWithBodyScanDetails(
    agencyId: string,
    prisonNumber: string,
  ): Promise<WithBodyScanInfo<Transfer>> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    const transfer = await welcomeClient.getTransfer(agencyId, prisonNumber)
    return this.bodyScanInfoDecorator.decorateSingle(transfer)
  }

  public async confirmTransfer(
    username: string,
    prisonNumber: string,
    prisonId: string,
    arrivalId?: string,
  ): Promise<ArrivalResponse | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmTransfer(prisonNumber, prisonId, arrivalId)
  }
}
