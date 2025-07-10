import type { ArrivalResponse, TemporaryAbsence } from 'welcome'
import type { WelcomeClient } from '../data'
import { compareByFullName } from '../utils/utils'
import type { BodyScanInfoDecorator, WithBodyScanStatus } from './bodyScanInfoDecorator'
// import { ManagementReportDefinition } from '../@types/welcome/managementReportDefinition'

export default class TemporaryAbsencesService {
  constructor(
    private readonly welcomeClient: WelcomeClient,
    private readonly bodyScanInfoDecorator: BodyScanInfoDecorator,
  ) {}

  public async getTemporaryAbsences(token: string, agencyId: string): Promise<WithBodyScanStatus<TemporaryAbsence>[]> {
    const temporaryAbsencesRaw = await this.welcomeClient.getTemporaryAbsences(token, { agencyId })
    const temporaryAbsences = await this.bodyScanInfoDecorator.decorate(token, temporaryAbsencesRaw)
    return temporaryAbsences.sort(compareByFullName)
  }

  public async getTemporaryAbsence(token: string, prisonNumber: string): Promise<TemporaryAbsence> {
    return this.welcomeClient.getTemporaryAbsence(token, { prisonNumber })
  }

  public async confirmTemporaryAbsence(
    token: string,
    prisonNumber: string,
    prisonId: string,
    arrivalId?: string,
  ): Promise<ArrivalResponse | null> {
    return this.welcomeClient.confirmTemporaryAbsence(token, { prisonNumber }, { prisonId, arrivalId })
  }

  // public async getManagementReports(username: string, reportId: string, reportVariantId: string): Promise<[]> {
  //   return this.welcomeClient.getManagementReports(reportId, reportVariantId)
  // }

  // public async getManagementReportDefinitions(): Promise<ManagementReportDefinition[]> {
  //   return this.welcomeClient.getManagementReportDefinitions()
  // }
}
