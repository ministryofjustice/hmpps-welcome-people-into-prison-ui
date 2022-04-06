import moment from 'moment'
import type {
  Arrival,
  Transfer,
  TemporaryAbsence,
  ConfirmArrivalDetail,
  Prison,
  ImprisonmentStatus,
  UserCaseLoad,
  PotentialMatch,
  PotentialMatchCriteria,
  PrisonerDetails,
} from 'welcome'
import type { Readable } from 'stream'
import { ArrivalResponse } from 'welcome'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import logger from '../../logger'

export default class WelcomeClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('welcomeClient', config.apis.welcome as ApiConfig, token)
  }

  async getExpectedArrivals(agencyId: string, date: moment.Moment): Promise<Arrival[]> {
    logger.info(`welcomeApi: getExpectedArrivals(${agencyId}, ${date})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/arrivals`,
      query: { date: date.format('YYYY-MM-DD') },
    }) as Promise<Arrival[]>
  }

  async getArrival(id: string): Promise<Arrival> {
    logger.info(`welcomeApi: getArrival(${id})`)
    return this.restClient.get({
      path: `/arrivals/${id}`,
    }) as Promise<Arrival>
  }

  async confirmCourtReturn(id: string, prisonId: string, prisonNumber: string): Promise<ArrivalResponse> {
    logger.info(`welcomeApi: confirmCourtReturn ${id})`)
    return this.restClient.post({
      path: `/court-returns/${id}/confirm`,
      data: { prisonId, prisonNumber },
    }) as Promise<ArrivalResponse>
  }

  async getTransfers(agencyId: string): Promise<Arrival[]> {
    logger.info(`welcomeApi: getTransfers(${agencyId})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/transfers/enroute`,
    }) as Promise<Arrival[]>
  }

  async getTransfer(agencyId: string, prisonNumber: string): Promise<Transfer> {
    logger.info(`welcomeApi: getTransfer(${agencyId} ${prisonNumber})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/transfers/enroute/${prisonNumber}`,
    }) as Promise<Transfer>
  }

  async confirmTransfer(prisonNumber: string): Promise<ArrivalResponse> {
    logger.info(`welcomeApi: confirmTransfer ${prisonNumber})`)
    return this.restClient.post({
      path: `/transfers/${prisonNumber}/confirm`,
    }) as Promise<ArrivalResponse>
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

  async confirmTemporaryAbsence(prisonNumber: string, agencyId: string): Promise<ArrivalResponse> {
    logger.info(`welcomeApi: confirmTemporaryAbsence ${prisonNumber})`)
    return this.restClient.post({
      path: `/temporary-absences/${prisonNumber}/confirm`,
      data: { agencyId },
    }) as Promise<ArrivalResponse>
  }

  async getImage(prisonNumber: string): Promise<Readable> {
    logger.info(`welcomeApi: getImage(${prisonNumber})`)
    return this.restClient.stream({
      path: `/prisoners/${prisonNumber}/image`,
    }) as Promise<Readable>
  }

  async getPrison(prisonId: string): Promise<Prison> {
    logger.info(`welcomeApi: getPrison(${prisonId})`)
    return this.restClient.get({
      path: `/prison/${prisonId}`,
    }) as Promise<Prison>
  }

  async confirmExpectedArrival(id: string, detail: ConfirmArrivalDetail): Promise<ArrivalResponse | null> {
    logger.info(`welcomeApi: confirmExpectedArrival(${id})`)
    try {
      return (await this.restClient.post({
        path: `/arrivals/${id}/confirm`,
        data: detail,
      })) as Promise<ArrivalResponse>
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  async confirmUnexpectedArrival(detail: ConfirmArrivalDetail): Promise<ArrivalResponse | null> {
    logger.info(`welcomeApi: confirmUnexpectedArrival`)
    try {
      return (await this.restClient.post({
        path: `/unexpected-arrivals/confirm`,
        data: detail,
      })) as Promise<ArrivalResponse>
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

  async getMatchingRecords(matchCriteria: PotentialMatchCriteria): Promise<PotentialMatch[]> {
    logger.info(`welcomeApi: match-prisoners`)

    return (await this.restClient.post({
      path: '/match-prisoners',
      data: matchCriteria,
    })) as Promise<PotentialMatch[]>
  }

  async getPrisonerDetails(prisonNumber: string): Promise<PrisonerDetails> {
    logger.info(`welcomeApi: getPrison(${prisonNumber})`)
    return this.restClient.get({
      path: `/prisoners/${prisonNumber}`,
    }) as Promise<PrisonerDetails>
  }
}
