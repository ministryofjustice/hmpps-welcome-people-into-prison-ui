import type { Movement, NewOffenderBooking, OffenderNumber, PrisonNumber } from 'welcome'
import moment, { Moment } from 'moment'
import type { Readable } from 'stream'
import { groupBy, compareByFullName } from '../utils/utils'
import type { RestClientBuilder, WelcomeClient, HmppsAuthClient } from '../data'

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

  private async getExpectedArrivals(agencyId: string, now: Moment): Promise<Movement[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    const expectedArrivals = await welcomeClient.getExpectedArrivals(agencyId, now)
    return expectedArrivals.sort(compareByFullName)
  }

  private async getTransfers(agencyId: string): Promise<Movement[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    const welcomeClient = this.welcomeClientFactory(token)
    const transfers = await welcomeClient.getTransfers(agencyId)
    return transfers.map(transfer => ({ ...transfer, fromLocationType: LocationType.PRISON })).sort(compareByFullName)
  }

  public async getArrivalsForToday(agencyId: string, now = () => moment()): Promise<Map<LocationType, Movement[]>> {
    const [expectedArrivals, transfers] = await Promise.all([
      this.getExpectedArrivals(agencyId, now()),
      this.getTransfers(agencyId),
    ])
    return groupBy([...expectedArrivals, ...transfers], (arrival: Movement) => arrival.fromLocationType)
  }

  public async getCourtReturn(prisonNumber: string, agencyId: string, now = () => moment()): Promise<Movement> {
    const expectedArrivals = await this.getExpectedArrivals(agencyId, now())
    return expectedArrivals.find(a => prisonNumber === a.prisonNumber)
  }

  public async getImage(prisonNumber: string): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getImage(prisonNumber)
  }

  public async getArrival(id: string): Promise<Movement> {
    const token = await this.hmppsAuthClient.getSystemClientToken()
    return this.welcomeClientFactory(token).getArrival(id)
  }

  public async createOffenderRecordAndBooking(
    username: string,
    id: string,
    body: NewOffenderBooking
  ): Promise<OffenderNumber | null> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).createOffenderRecordAndBooking(id, body)
  }

  public async confirmCourtReturn(username: string, id: string, prisonId: string): Promise<PrisonNumber> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return this.welcomeClientFactory(token).confirmCourtReturn(id, prisonId)
  }
}
