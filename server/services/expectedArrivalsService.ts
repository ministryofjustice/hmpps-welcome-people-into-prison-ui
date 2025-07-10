import type {
  Arrival,
  ArrivalResponse,
  PotentialMatchCriteria,
  PotentialMatch,
  PrisonerDetails,
  RecentArrival,
  LocationType,
  Sex,
} from 'welcome'
import moment, { Moment } from 'moment'
import { Readable } from 'stream'
import { logger } from 'bs-logger'
import type { WelcomeClient } from '../data'
import { groupBy, compareByFullName, compareByDescendingDateAndTime } from '../utils/utils'
import { BodyScanInfoDecorator, WithBodyScanInfo, WithBodyScanStatus } from './bodyScanInfoDecorator'
import { MatchTypeDecorator, WithMatchType } from './matchTypeDecorator'
import OffenceInfoDecorator from './offenceInfoDecorator'
import { NewArrival } from '../routes/bookedtoday/arrivals/state'
import { RaiseAnalyticsEvent } from './raiseAnalyticsEvent'

export type DecoratedArrival = WithBodyScanStatus<Arrival> & WithMatchType<Arrival>
export type ArrivalWithSummaryDetails = { arrival: WithMatchType<Arrival>; summary: WithBodyScanInfo<PrisonerDetails> }

export default class ExpectedArrivalsService {
  constructor(
    private readonly welcomeClient: WelcomeClient,
    private readonly raiseAnalyticsEvent: RaiseAnalyticsEvent,
    private readonly bodyScanDecorator: BodyScanInfoDecorator,
    private readonly matchTypeDecorator: MatchTypeDecorator,
    private readonly offenceInfoDecorator: OffenceInfoDecorator,
  ) {}

  private async getExpectedArrivals(token: string, agencyId: string, now: moment.Moment): Promise<Arrival[]> {
    const expectedArrivals = await this.welcomeClient.getExpectedArrivals(token, {
      agencyId,
      date: now.toISOString(),
    })
    return expectedArrivals.sort(compareByFullName)
  }

  private async getRecentArrivals(
    token: string,
    agencyId: string,
    twoDaysAgo: Moment,
    today: Moment,
  ): Promise<RecentArrival[]> {
    const recentArrivals = await this.welcomeClient.getRecentArrivals(token, {
      prisonId: agencyId,
      fromDate: twoDaysAgo.toISOString(),
      toDate: today.toISOString(),
    })
    return recentArrivals.content.sort(compareByDescendingDateAndTime(a => a.movementDateTime))
  }

  private async getTransfers(token: string, agencyId: string): Promise<Arrival[]> {
    const transfers = await this.welcomeClient.getTransfers(token, { agencyId })
    return transfers.map(transfer => ({ ...transfer, fromLocationType: 'PRISON' as const })).sort(compareByFullName)
  }

  private isArrivalArrivedOnDay = (day: Moment) => (recentArrival: WithBodyScanStatus<RecentArrival>) => {
    return moment(recentArrival.movementDateTime).startOf('day').valueOf() === day.startOf('day').valueOf()
  }

  public async getRecentArrivalsGroupedByDate(
    token: string,
    agencyId: string,
  ): Promise<Map<Moment, WithBodyScanStatus<RecentArrival>[]>> {
    const today = moment().startOf('day')
    const oneDayAgo = moment().subtract(1, 'days').startOf('day')
    const twoDaysAgo = moment().subtract(2, 'days').startOf('day')

    const rawRecentArrivals = await this.getRecentArrivals(token, agencyId, twoDaysAgo, today)
    const recentArrivals = await this.bodyScanDecorator.decorate(token, rawRecentArrivals)
    const mappedArrivals = new Map<Moment, WithBodyScanStatus<RecentArrival>[]>()

    mappedArrivals.set(today, recentArrivals.filter(this.isArrivalArrivedOnDay(today)))
    mappedArrivals.set(oneDayAgo, recentArrivals.filter(this.isArrivalArrivedOnDay(oneDayAgo)))
    mappedArrivals.set(twoDaysAgo, recentArrivals.filter(this.isArrivalArrivedOnDay(twoDaysAgo)))
    return mappedArrivals
  }

  public async getRecentArrivalsSearchResults(
    token: string,
    agencyId: string,
    searchQuery: string,
  ): Promise<RecentArrival[]> {
    const today = moment().startOf('day').toISOString()
    const twoDaysAgo = moment().subtract(2, 'days').startOf('day').toISOString()
    const results = await this.welcomeClient.getRecentArrivals(token, {
      prisonId: agencyId,
      fromDate: twoDaysAgo,
      toDate: today,
      query: searchQuery,
    })
    return results.content
  }

  public async getArrivalsForToday(
    token: string,
    agencyId: string,
    now = () => moment(),
  ): Promise<Map<LocationType, DecoratedArrival[]>> {
    const [expectedArrivals, transfers] = await Promise.all([
      this.getExpectedArrivals(token, agencyId, now()),
      this.getTransfers(token, agencyId),
    ])
    const allArrivals = [...expectedArrivals, ...transfers]
    const withBodyScan = await this.bodyScanDecorator.decorate(token, allArrivals)
    const withBodyScanAndMatchType = this.matchTypeDecorator.decorate(withBodyScan)

    return groupBy(withBodyScanAndMatchType, (arrival: DecoratedArrival) => arrival.fromLocationType)
  }

  public async getImage(token: string, prisonNumber: string): Promise<Readable> {
    return this.welcomeClient.getImage(token, { prisonNumber })
  }

  public async getArrival(token: string, id: string): Promise<WithMatchType<Arrival>> {
    const arrival = await this.welcomeClient.getArrival(token, { id })
    const arrivalWithOffence = this.offenceInfoDecorator.decorateSingle(arrival)
    return this.matchTypeDecorator.decorateSingle(arrivalWithOffence)
  }

  public async getPrisonerDetailsForArrival(token: string, id: string): Promise<PotentialMatch> {
    const arrival = await this.welcomeClient.getArrival(token, { id })
    if (arrival.potentialMatches.length > 1) {
      logger.warn(`multiple matches for move: ${id}`)
    }
    return arrival.potentialMatches[0]
  }

  public async getArrivalAndSummaryDetails(token: string, id: string): Promise<ArrivalWithSummaryDetails> {
    const arrival = await this.getArrival(token, id)
    const singleMatch = arrival.potentialMatches[0]
    const summary = await this.getPrisonerSummaryDetails(token, singleMatch.prisonNumber)
    return { arrival, summary }
  }

  public async confirmArrival(
    token: string,
    prisonId: string,
    id: string,
    arrival: NewArrival,
  ): Promise<ArrivalResponse | null> {
    return arrival.expected
      ? this.confirmExpectedArrival(this.welcomeClient, token, prisonId, id, arrival)
      : this.confirmUnexpectedArrival(this.welcomeClient, token, prisonId, arrival)
  }

  private async confirmExpectedArrival(
    welcomeClient: WelcomeClient,
    token: string,
    prisonId: string,
    id: string,
    arrival: NewArrival,
  ): Promise<ArrivalResponse | null> {
    try {
      const data = await this.getArrival(token, id)

      const response = await welcomeClient.confirmExpectedArrival(
        token,
        { id },
        {
          firstName: arrival.firstName,
          lastName: arrival.lastName,
          dateOfBirth: arrival.dateOfBirth,
          sex: arrival.sex as Sex,
          prisonId,
          imprisonmentStatus: arrival.imprisonmentStatus,
          movementReasonCode: arrival.movementReasonCode,
          fromLocationId: data.fromLocationId,
          prisonNumber: arrival.prisonNumber,
        },
      )

      if (!response) {
        return null
      }

      this.raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed arrival',
        `AgencyId: ${prisonId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
      )

      return response
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  private async confirmUnexpectedArrival(
    welcomeClient: WelcomeClient,
    token: string,
    prisonId: string,
    arrival: NewArrival,
  ): Promise<ArrivalResponse | null> {
    try {
      const response = await welcomeClient.confirmUnexpectedArrival(token, {
        firstName: arrival.firstName,
        lastName: arrival.lastName,
        dateOfBirth: arrival.dateOfBirth,
        sex: arrival.sex as Sex,
        prisonId,
        imprisonmentStatus: arrival.imprisonmentStatus,
        movementReasonCode: arrival.movementReasonCode,
        fromLocationId: undefined,
        prisonNumber: arrival.prisonNumber,
      })

      if (!response) {
        return null
      }

      this.raiseAnalyticsEvent('Add to the establishment roll', 'Confirmed unexpected arrival', `AgencyId: ${prisonId}`)

      return response
    } catch (error) {
      if (error.status >= 400 && error.status < 500) {
        return null
      }
      throw error
    }
  }

  public async confirmCourtReturn(
    token: string,
    id: string,
    prisonId: string,
    prisonNumber: string,
  ): Promise<ArrivalResponse | null> {
    return this.welcomeClient.confirmCourtReturn(token, { id }, { prisonId, prisonNumber })
  }

  public async getMatchingRecords(
    token: string,
    potentialMatchCriteria: PotentialMatchCriteria,
  ): Promise<PotentialMatch[]> {
    return this.welcomeClient.getMatchingRecords(token, potentialMatchCriteria)
  }

  public async getPrisonerDetails(token: string, prisonNumber: string): Promise<PrisonerDetails> {
    return this.welcomeClient.getPrisonerDetails(token, { prisonNumber })
  }

  public async getPrisonerSummaryDetails(
    token: string,
    prisonNumber: string,
  ): Promise<WithBodyScanInfo<PrisonerDetails>> {
    const prisonerDetails = await this.welcomeClient.getPrisonerDetails(token, { prisonNumber })
    return this.bodyScanDecorator.decorateSingle(token, prisonerDetails)
  }
}
