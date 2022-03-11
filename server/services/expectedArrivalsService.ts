import type {
  Arrival,
  NewOffenderBooking,
  ArrivalResponse,
  PotentialMatchCriteria,
  PotentialMatch,
  PrisonerDetails,
} from 'welcome'
import moment, { type Moment } from 'moment'
import type { Readable } from 'stream'
import { groupBy, compareByFullName } from '../utils/utils'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'
import logger from '../../logger'

export enum LocationType {
  COURT = 'COURT',
  CUSTODY_SUITE = 'CUSTODY_SUITE',
  PRISON = 'PRISON',
  OTHER = 'OTHER',
}

export default class ExpectedArrivalsService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly welcomeClientFactory: RestClientBuilder<WelcomeClient>
  ) {}

  private async getExpectedArrivals(agencyId: string, now: Moment): Promise<Arrival[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    const expectedArrivals = await welcomeClient.getExpectedArrivals(agencyId, now)
    return expectedArrivals.sort(compareByFullName)
  }

  private async getTransfers(agencyId: string): Promise<Arrival[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    const transfers = await welcomeClient.getTransfers(agencyId)
    return transfers.map(transfer => ({ ...transfer, fromLocationType: LocationType.PRISON })).sort(compareByFullName)
  }

  public async getArrivalsForToday(agencyId: string, now = () => moment()): Promise<Map<LocationType, Arrival[]>> {
    const [expectedArrivals, transfers] = await Promise.all([
      this.getExpectedArrivals(agencyId, now()),
      this.getTransfers(agencyId),
    ])
    return groupBy([...expectedArrivals, ...transfers], (arrival: Arrival) => arrival.fromLocationType)
  }

  public async getImage(prisonNumber: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getImage(prisonNumber)
  }

  public async getArrival(id: string): Promise<Arrival> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getArrival(id)
  }

  public async getPrisonerDetailsForArrival(id: string): Promise<PrisonerDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const arrival = await this.welcomeClientFactory(token).getArrival(id)
    if (arrival.potentialMatches.length > 1) {
      logger.warn(`multiple matches for move: ${id}`)
    }
    return arrival.potentialMatches[0]
  }

  public async createOffenderRecordAndBooking(
    username: string,
    id: string,
    body: NewOffenderBooking
  ): Promise<ArrivalResponse | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).createOffenderRecordAndBooking(id, body)
  }

  public async confirmCourtReturn(
    username: string,
    id: string,
    prisonId: string,
    prisonNumber: string
  ): Promise<ArrivalResponse> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmCourtReturn(id, prisonId, prisonNumber)
  }

  public async getMatchingRecords(potentialMatchCriteria: PotentialMatchCriteria): Promise<PotentialMatch[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getMatchingRecords(potentialMatchCriteria)
  }

  public async getPrisonerDetails(prisonNumber: string): Promise<PrisonerDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getPrisonerDetails(prisonNumber)
  }
}
