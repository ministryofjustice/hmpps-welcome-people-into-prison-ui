import moment from 'moment'
import type {
  Arrival,
  ArrivalResponse,
  ConfirmArrivalDetail,
  ImprisonmentStatus,
  PaginatedResponse,
  PotentialMatch,
  PotentialMatchCriteria,
  PrisonerDetails,
  RecentArrival,
  TemporaryAbsence,
  Transfer,
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

  async getExpectedArrivals(agencyId: string, date: moment.Moment): Promise<Arrival[]> {
    logger.info(`welcomeApi: getExpectedArrivals(${agencyId}, ${date})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/arrivals`,
      query: { date: date.format('YYYY-MM-DD') },
      timeout: 15000,
      retryCount: 0,
    }) as Promise<Arrival[]>
  }

  async getArrival(id: string): Promise<Arrival> {
    logger.info(`welcomeApi: getArrival(${id})`)
    return this.restClient.get({
      path: `/arrivals/${id}`,
    }) as Promise<Arrival>
  }

  async getRecentArrivals(
    prisonId: string,
    fromDate: moment.Moment,
    toDate: moment.Moment,
    searchQuery?: string
  ): Promise<PaginatedResponse<RecentArrival>> {
    logger.info(`welcomeApi: getRecentArrivals(${prisonId})`)
    return this.restClient.get({
      path: `/prisons/${prisonId}/recent-arrivals`,
      query: {
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: toDate.format('YYYY-MM-DD'),
        query: searchQuery,
      },
      timeout: 15000,
      retryCount: 0,
    }) as Promise<PaginatedResponse<RecentArrival>>
  }

  async confirmCourtReturn(id: string, prisonId: string, prisonNumber: string): Promise<ArrivalResponse | null> {
    logger.info(`welcomeApi: confirmCourtReturn ${id})`)
    try {
      return (await this.restClient.post({
        path: `/court-returns/${id}/confirm`,
        data: { prisonId, prisonNumber },
      })) as Promise<ArrivalResponse>
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  async getTransfers(agencyId: string): Promise<Arrival[]> {
    logger.info(`welcomeApi: getTransfers(${agencyId})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/transfers`,
    }) as Promise<Arrival[]>
  }

  async getTransfer(agencyId: string, prisonNumber: string): Promise<Transfer> {
    logger.info(`welcomeApi: getTransfer(${agencyId} ${prisonNumber})`)
    return this.restClient.get({
      path: `/prisons/${agencyId}/transfers/${prisonNumber}`,
    }) as Promise<Transfer>
  }

  async confirmTransfer(prisonNumber: string, prisonId: string, arrivalId?: string): Promise<ArrivalResponse | null> {
    logger.info(`welcomeApi: confirmTransfer ${prisonNumber})`)
    try {
      return (await this.restClient.post({
        path: `/transfers/${prisonNumber}/confirm`,
        data: { prisonId, arrivalId },
      })) as Promise<ArrivalResponse>
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  async getTemporaryAbsences(agencyId: string): Promise<TemporaryAbsence[]> {
    logger.info(`welcomeApi: getTemporaryAbsences(${agencyId})`)
    return this.restClient.get({
      path: `/prison/${agencyId}/temporary-absences`,
    }) as Promise<TemporaryAbsence[]>
  }

  async getTemporaryAbsence(prisonNumber: string): Promise<TemporaryAbsence> {
    logger.info(`welcomeApi: getTemporaryAbsence(${prisonNumber})`)
    return this.restClient.get({
      path: `/temporary-absences/${prisonNumber}`,
    }) as Promise<TemporaryAbsence>
  }

  async confirmTemporaryAbsence(
    prisonNumber: string,
    prisonId: string,
    arrivalId?: string
  ): Promise<ArrivalResponse | null> {
    logger.info(`welcomeApi: confirmTemporaryAbsence ${prisonNumber})`)
    try {
      return (await this.restClient.post({
        path: `/temporary-absences/${prisonNumber}/confirm`,
        data: { prisonId, arrivalId },
      })) as Promise<ArrivalResponse>
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  async getImage(prisonNumber: string): Promise<Readable> {
    logger.info(`welcomeApi: getImage(${prisonNumber})`)
    return this.restClient.stream({
      path: `/prisoners/${prisonNumber}/image`,
    }) as Promise<Readable>
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

  public getEventsCSV(stream: NodeJS.WritableStream, date: moment.Moment, days?: number): void {
    const daysQP = days ? `&days=${days}` : ''
    this.restClient.pipeIntoStream(stream, {
      path: `/events?start-date=${date.format('YYYY-MM-DD')}${daysQP}`,
      headers: { Accept: 'text/csv' },
    })
  }
}
