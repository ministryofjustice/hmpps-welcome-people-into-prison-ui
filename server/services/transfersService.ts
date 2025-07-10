import type { ArrivalResponse, Transfer } from 'welcome'
import type { WelcomeClient } from '../data'
import type { BodyScanInfoDecorator, WithBodyScanInfo } from './bodyScanInfoDecorator'

export default class TransfersService {
  constructor(
    private readonly welcomeClient: WelcomeClient,
    private readonly bodyScanInfoDecorator: BodyScanInfoDecorator,
  ) {}

  public async getTransfer(token: string, agencyId: string, prisonNumber: string): Promise<Transfer> {
    return this.welcomeClient.getTransfer(token, { agencyId, prisonNumber })
  }

  public async getTransferWithBodyScanDetails(
    token: string,
    agencyId: string,
    prisonNumber: string,
  ): Promise<WithBodyScanInfo<Transfer>> {
    const transfer = await this.welcomeClient.getTransfer(token, { agencyId, prisonNumber })
    return this.bodyScanInfoDecorator.decorateSingle(token, transfer)
  }

  public async confirmTransfer(
    token: string,
    prisonNumber: string,
    prisonId: string,
    arrivalId?: string,
  ): Promise<ArrivalResponse | null> {
    return this.welcomeClient.confirmTransfer(token, { prisonNumber }, { prisonId, arrivalId })
  }
}
