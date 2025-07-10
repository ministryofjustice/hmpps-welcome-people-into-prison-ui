import type { ImprisonmentStatus } from 'welcome'
import type { WelcomeClient } from '../data'

export type StatusAndReasons = {
  code: string
  imprisonmentStatus: string
  movementReasonCode: string
}

export default class ImprisonmentStatusesService {
  constructor(private readonly welcomeClient: WelcomeClient) {}

  public async getAllImprisonmentStatuses(token: string): Promise<ImprisonmentStatus[]> {
    return this.welcomeClient.getImprisonmentStatuses(token)
  }

  public async getImprisonmentStatus(token: string, code: string): Promise<ImprisonmentStatus> {
    const statuses = await this.welcomeClient.getImprisonmentStatuses(token)
    return statuses.find(s => s.code === code)
  }

  public async getReasonForImprisonment(token: string, statusAndReason: StatusAndReasons): Promise<string> {
    const imprisonmentStatus = await this.getImprisonmentStatus(token, statusAndReason.code)
    if (imprisonmentStatus.movementReasons.length === 1) {
      return `${imprisonmentStatus.description}`
    }
    const movementReason = imprisonmentStatus.movementReasons.find(
      r => r.movementReasonCode === statusAndReason.movementReasonCode,
    )
    return `${imprisonmentStatus.description} - ${movementReason.description}`
  }
}
