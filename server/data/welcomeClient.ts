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
} from 'welcome'
import type { Readable } from 'stream'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import superagent from 'superagent'
import config from '../config'
import logger from '../../logger'
import { ManagementReportDefinition } from '../@types/welcome/managementReportDefinition'
import type { UnsanitisedError } from '../sanitisedError'
import { RedisClient } from './redisClient'
import BaseApiClient from './baseApiClient'

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

function pipeIntoStream(stream: NodeJS.WritableStream, { path = null, headers = {} }: StreamRequest = {}) {
  superagent
    .get(`${this.apiUrl()}${path}`)
    .agent(this.agent)
    .auth(this.token, { type: 'bearer' })
    .retry(2, (err, res) => {
      if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
      return undefined // retry handler only for logging retries, not to influence retry logic
    })
    .timeout(this.timeoutConfig())
    .set(headers)
    .pipe(stream)
}

export default class WelcomeClient extends BaseApiClient {
  constructor(
    protected readonly redisClient: RedisClient,
    authenticationClient: AuthenticationClient,
  ) {
    super('welcomeClient', redisClient, config.apis.welcome, authenticationClient)
  }

  getExpectedArrivals: (token: string, params: { agencyId: string; date: string }) => Promise<Arrival[]> = this.apiCall<
    Arrival[],
    { agencyId: string; date: string }
  >({
    path: '/prisons/:agencyId/arrivals',
    queryParams: ['date'],
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getExpectedArrivals(agencyId=${params.agencyId}, date=${params.date}`,
  })

  getArrival: (token: string, params: { id: string }) => Promise<Arrival> = this.apiCall<Arrival, { id: string }>({
    path: '/arrivals/:agencyId',
    queryParams: ['date'],
    requestType: 'get',
    loggerMessage: params => `welcomeApi: id=${params.id}`,
  })

  getRecentArrivals: (
    token: string,
    parameters?: { prisonId: string; fromDate: string; toDate: string; query?: string },
  ) => Promise<PaginatedResponse<RecentArrival>> = this.apiCall<
    PaginatedResponse<RecentArrival>,
    {
      prisonId: string
      fromDate: string
      toDate: string
      query?: string
    }
  >({
    path: '/prisons/:prisonId/recent-arrivals',
    queryParams: ['fromDate', 'toDate', 'query'],
    requestType: 'get',
    loggerMessage: params =>
      `welcomeApi: getRecentArrivals(prisonId=${params.prisonId}, fromDate=${params.fromDate}, toDate=${params.toDate}, query=${params.query})`,
  })

  confirmCourtReturn: (
    token: string,
    params: { id: string },
    data: { prisonId: string; prisonNumber: string },
  ) => Promise<ArrivalResponse | null> = this.apiCall<
    ArrivalResponse,
    { id: string },
    { prisonId: string; prisonNumber: string } | null
  >({
    path: '/court-returns/:id/confirm',
    requestType: 'post',
    loggerMessage: params => `welcomeApi: confirmCourtReturn(id=${params.id})`,
  })

  getTransfers: (token: string, params: { agencyId: string }) => Promise<Arrival[]> = this.apiCall<
    Arrival[],
    { agencyId: string }
  >({
    path: '/prisons/:agencyId/transfers',
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getTransfers(agencyId=${params.agencyId})`,
  })

  getTransfer: (token: string, params: { agencyId: string; prisonNumber: string }) => Promise<Transfer> = this.apiCall<
    Transfer,
    { agencyId: string; prisonNumber: string }
  >({
    path: '/prisons/:agencyId/transfers/:prisonNumber',
    requestType: 'get',
    loggerMessage: params =>
      `welcomeApi: getTransfer(agencyId=${params.agencyId}), prisonNumber=${params.prisonNumber}) `,
  })

  confirmTransfer: (
    token: string,
    params: { prisonNumber: string },
    data: { prisonId: string; arrivalId?: string },
  ) => Promise<ArrivalResponse> = this.apiCall<
    ArrivalResponse,
    { prisonNumber: string },
    { prisonId: string; arrivalId?: string }
  >({
    path: '/transfers/:prisonNumber/confirm',
    requestType: 'post',
    loggerMessage: (params, data) =>
      `welcomeApi: confirmTransfer(prisonNumber=${params.prisonNumber}, prisonId=${data.prisonId}, arrivalId=${data.arrivalId})`,
  })

  getTemporaryAbsences: (token: string, params: { agencyId: string }) => Promise<TemporaryAbsence[]> = this.apiCall<
    TemporaryAbsence[],
    { agencyId: string }
  >({
    path: '/prison/:agencyId/temporary-absences',
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getTemporaryAbsences(agencyId=${params.agencyId})`,
  })

  getTemporaryAbsence: (token: string, params: { prisonNumber: string }) => Promise<TemporaryAbsence> = this.apiCall<
    TemporaryAbsence,
    { prisonNumber: string }
  >({
    path: '/temporary-absences/:prisonNumber',
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getTemporaryAbsence(prisonNumber=${params.prisonNumber})`,
  })

  confirmTemporaryAbsence: (
    token: string,
    params: { prisonNumber: string },
    data: { prisonId: string; arrivalId?: string },
  ) => Promise<ArrivalResponse | null> = this.apiCall<
    ArrivalResponse | null,
    { prisonNumber: string },
    { prisonId: string; arrivalId?: string }
  >({
    path: '/temporary-absences/:prisonNumber/confirm',
    requestType: 'post',
    loggerMessage: (params, data) =>
      `welcomeApi: confirmTemporaryAbsence(prisonNumber=${params.prisonNumber}, prisonId=${data.prisonId}, arrivalId=${data.arrivalId})`,
  })

  getImage: (token: string, params: { prisonNumber: string }) => Promise<Readable> = this.apiCall<
    Readable,
    { prisonNumber: string }
  >({
    path: '/prisoners/:prisonNumber/image',
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getImage(${params.prisonNumber})`,
  })

  confirmExpectedArrival: (
    token: string,
    params: { id: string },
    data: ConfirmArrivalDetail,
  ) => Promise<ArrivalResponse | null> = this.apiCall<ArrivalResponse | null, { id: string }, ConfirmArrivalDetail>({
    path: '/arrivals/:id/confirm',
    requestType: 'post',
    loggerMessage: ({ id }) => `welcomeApi: confirmExpectedArrival(${id})`,
  })

  confirmUnexpectedArrival: (token: string, detail: ConfirmArrivalDetail) => Promise<ArrivalResponse | null> =
    this.apiCall<ArrivalResponse | null, ConfirmArrivalDetail>({
      path: '/unexpected-arrivals/confirm',
      requestType: 'post',
      loggerMessage: () => 'welcomeApi: confirmUnexpectedArrival()',
    })

  getImprisonmentStatuses: (token: string) => Promise<ImprisonmentStatus[]> = this.apiCall<
    ImprisonmentStatus[],
    undefined
  >({
    path: '/imprisonment-statuses',
    requestType: 'get',
    loggerMessage: () => 'welcomeApi: getImprisonmentStatuses()',
  })

  getMatchingRecords: (token: string, data: PotentialMatchCriteria) => Promise<PotentialMatch[]> = this.apiCall<
    PotentialMatch[],
    PotentialMatchCriteria
  >({
    path: '/match-prisoners',
    requestType: 'post',
    loggerMessage: data => `welcomeApi: match-prisoners ${JSON.stringify(data)}`,
  })

  getPrisonerDetails: (token: string, params: { prisonNumber: string }) => Promise<PrisonerDetails> = this.apiCall<
    PrisonerDetails,
    { prisonNumber: string }
  >({
    path: '/prisoners/:prisonNumber',
    requestType: 'get',
    loggerMessage: params => `welcomeApi: getPrisonerDetails(prisonNumber=${params.prisonNumber})`,
  })

  public getEventsCSV(stream: NodeJS.WritableStream, date: moment.Moment, days?: number): void {
    const daysQP = days ? `&days=${days}` : ''
    pipeIntoStream(stream, {
      path: `/events?start-date=${date.format('YYYY-MM-DD')}${daysQP}`,
      headers: { Accept: 'text/csv' },
    })
  }
}
