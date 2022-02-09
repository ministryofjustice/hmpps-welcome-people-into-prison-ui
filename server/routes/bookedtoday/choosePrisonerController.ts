import type { Arrival } from 'welcome'
import type { RequestHandler, Response } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { LocationType } from '../../services/expectedArrivalsService'

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
    return !arrival.prisonNumber && !arrival.pncNumber
      ? res.redirect(`/prisoners/${arrival.id}/search-for-existing-record/new`)
      : /**
         * TODO 3 situations to deal with, will redirect to new pages for each of:
         * - no matches         - show "This person doesn't have a record"
         * - multiple matches   - show "Possible existing records found"
         * - 1 match found      - show "This person has existing record"
         */
        res.redirect(`/prisoners/${arrival.id}/confirm-arrival`)
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
      const arrival = await this.expectedArrivalsService.getArrival(id)
      return arrival.isCurrentPrisoner //
        ? this.handleCurrentPrisoner(arrival, res) //
        : this.handleNewPrisoner(arrival, res)
    }
  }
}
