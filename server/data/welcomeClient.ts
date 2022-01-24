import moment from 'moment'
import type {
  Movement,
  Transfer,
  TemporaryAbsence,
  NewOffenderBooking,
  Prison,
  OffenderNumber,
  ImprisonmentStatus,
  UserCaseLoad,
} from 'welcome'
import type { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export default class WelcomeClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('welcomeClient', config.apis.welcome as ApiConfig, token)
  }

  async getExpectedArrivals(agencyId: string, date: moment.Moment): Promise<Movement[]> {
    logger.info(`welcomeApi: getExpectedArrivals(${agencyId}, ${date})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/arrivals`,
      query: { date: date.format('YYYY-MM-DD') },
    }) as Promise<Movement[]>
  }

  async getArrival(id: string): Promise<Movement> {
    logger.info(`welcomeApi: getArrival(${id})`)
    return this.restClient.get({
      path: `/arrivals/${id}`,
    }) as Promise<Movement>
  }

  async confirmCourtReturn(prisonNumber: string, agencyId: string): Promise<void> {
    logger.info(`welcomeApi: confirmCourtReturn ${prisonNumber})`)
    return this.restClient.post({
      path: `/court-returns/${prisonNumber}/confirm`,
      data: { agencyId },
    }) as Promise<void>
  }

  async getTransfers(agencyId: string): Promise<Movement[]> {
    logger.info(`welcomeApi: getTransfers(${agencyId})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/transfers/enroute`,
    }) as Promise<Movement[]>
  }

  async getTransfer(agencyId: string, prisonNumber: string): Promise<Transfer> {
    logger.info(`welcomeApi: getTransfer(${agencyId} ${prisonNumber})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/transfers/enroute/${prisonNumber}`,
    }) as Promise<Transfer>
  }

  async confirmTransfer(prisonNumber: string): Promise<void> {
    logger.info(`welcomeApi: confirmTransfer ${prisonNumber})`)
    return this.restClient.post({
      path: `/transfers/${prisonNumber}/confirm`,
    }) as Promise<void>
  }

  async getTemporaryAbsences(agencyId: string): Promise<TemporaryAbsence[]> {
    logger.info(`welcomeApi: getTemporaryAbsences(${agencyId})`)
    return this.restClient.get({
      path: `/temporary-absences/${agencyId}`,
    }) as Promise<TemporaryAbsence[]>
  }

  async getTemporaryAbsence(agencyId: string, prisonNumber: string): Promise<TemporaryAbsence> {
    logger.info(`welcomeApi: getTemporaryAbsence(${agencyId} ${prisonNumber})`)
    return this.restClient.get({
      path: `/temporary-absences/${agencyId}/${prisonNumber}`,
    }) as Promise<TemporaryAbsence>
  }

  async confirmTemporaryAbsence(prisonNumber: string, agencyId: string): Promise<void> {
    logger.info(`welcomeApi: confirmTemporaryAbsence ${prisonNumber})`)
    return this.restClient.post({
      path: `/temporary-absences/${prisonNumber}/confirm`,
      data: { agencyId },
    }) as Promise<void>
  }

  async getImage(prisonNumber: string): Promise<Readable> {
    logger.info(`welcomeApi: getImage(${prisonNumber})`)
    return this.restClient.stream({
      path: `/prison/prisoner/${prisonNumber}/image`,
    }) as Promise<Readable>
  }

  async getPrison(prisonId: string): Promise<Prison> {
    logger.info(`welcomeApi: getPrison(${prisonId})`)
    return this.restClient.get({
      path: `/prison/${prisonId}`,
    }) as Promise<Prison>
  }

  async createOffenderRecordAndBooking(id: string, body: NewOffenderBooking): Promise<OffenderNumber | null> {
    logger.info(`welcomeApi: createOffenderRecordAndBooking(${id})`)
    try {
      return (await this.restClient.post({
        path: `/arrivals/${id}/confirm`,
        data: body,
      })) as Promise<OffenderNumber>
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  async getImprisonmentStatuses(): Promise<ImprisonmentStatus[]> {
    logger.info(`welcomeApi: getImprisonmentStatuses()`)
    return this.restClient.get({
      path: `/imprisonment-statuses`,
    }) as Promise<ImprisonmentStatus[]>
  }

  async getUserCaseLoads(): Promise<UserCaseLoad[]> {
    logger.info(`welcomeApi: getUserCaseLoads()`)
    return this.restClient.get({
      path: '/prison/users/me/caseLoads',
    }) as Promise<UserCaseLoad[]>
  }
}
