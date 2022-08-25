import { type Arrival, LocationType } from 'welcome'
import type { RequestHandler, Response } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { State } from './arrivals/state'
import { MatchType, type WithMatchType } from '../../services/matchTypeDecorator'

export default class ChoosePrisonerController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const expectedArrivals = await this.expectedArrivalsService.getArrivalsForToday(activeCaseLoadId)
      return res.render('pages/bookedtoday/choosePrisoner.njk', {
        expectedArrivals,
      })
    }
  }

  private handleNewPrisoner(arrival: WithMatchType<Arrival>, res: Response): void {
    switch (arrival.matchType) {
      case MatchType.INSUFFICIENT_INFO:
        return res.redirect(`/prisoners/${arrival.id}/search-for-existing-record/new`)

      case MatchType.NO_MATCH:
        return res.redirect(`/prisoners/${arrival.id}/no-record-found`)

      case MatchType.SINGLE_MATCH:
        return res.redirect(`/prisoners/${arrival.id}/record-found`)

      case MatchType.MULTIPLE_POTENTIAL_MATCHES:
        return res.redirect(`/prisoners/${arrival.id}/possible-records-found`)

      default:
        throw new Error(`Invalid matchType: ${arrival.matchType}`)
    }
  }

  private handleCurrentPrisoner(arrival: Arrival, res: Response): void | PromiseLike<void> {
    switch (arrival.fromLocationType) {
      case LocationType.COURT:
        return res.redirect(`/prisoners/${arrival.id}/check-court-return`)
      case LocationType.CUSTODY_SUITE:
        return res.redirect(`/feature-not-available`)
      default:
        throw new Error(`Unexpected arrival type for arrival with id: ${arrival.id}`)
    }
  }

  public redirectToConfirm(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      State.newArrival.clear(res)
      const arrival = await this.expectedArrivalsService.getArrival(id)
      return arrival.isCurrentPrisoner //
        ? this.handleCurrentPrisoner(arrival, res) //
        : this.handleNewPrisoner(arrival, res)
    }
  }
}
