import type { Arrival } from 'welcome'
import type { RequestHandler, Response } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { LocationType } from '../../services/expectedArrivalsService'
import { State } from './arrivals/state'

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

  private handleNewPrisoner(arrival: Arrival, res: Response): void | PromiseLike<void> {
    if (!arrival.prisonNumber && !arrival.pncNumber) {
      return res.redirect(`/prisoners/${arrival.id}/search-for-existing-record/new`)
    }
    if (arrival.potentialMatches.length > 1) {
      return res.redirect(`/prisoners/${arrival.id}/possible-records-found`)
    }
    if (arrival.potentialMatches.length === 1) {
      return res.redirect(`/prisoners/${arrival.id}/record-found`)
    }
    return res.redirect(`/prisoners/${arrival.id}/no-record-found`)
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
