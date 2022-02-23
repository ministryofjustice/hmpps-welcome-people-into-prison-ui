import type { Arrival } from 'welcome'
import type { RequestHandler, Response } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { LocationType } from '../../services/expectedArrivalsService'
import { State } from './arrivals/state'
import { convertToTitleCase } from '../../utils/utils'

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
    if (!arrival.prisonNumber && !arrival.pncNumber)
      return res.redirect(`/prisoners/${arrival.id}/search-for-existing-record/new`)

    if (arrival.potentialMatches.length >= 1) {
      State.newArrival.set(res, {
        firstName: convertToTitleCase(arrival.potentialMatches[0].firstName),
        lastName: convertToTitleCase(arrival.potentialMatches[0].lastName),
        dateOfBirth: arrival.potentialMatches[0].dateOfBirth,
        // TODO: add sex to potential match object on cookie
        sex: 'MALE',
        prisonNumber: arrival?.potentialMatches[0].prisonNumber,
        pncNumber: arrival?.potentialMatches[0].pncNumber,
      })
      return res.redirect(`/prisoners/${arrival.id}/record-found`)
    }

    State.newArrival.set(res, {
      firstName: arrival.firstName,
      lastName: arrival.lastName,
      dateOfBirth: arrival.dateOfBirth,
      sex: arrival.gender,
      prisonNumber: arrival.prisonNumber,
      pncNumber: arrival.pncNumber,
    })
    return res.redirect(`/prisoners/${arrival.id}/no-record-found`)

    /**
     * TODO 3 situations to deal with, will redirect to new pages for each of:
     * - no matches         - show "This person doesn't have a record"
     * - multiple matches   - show "Possible existing records found"
     * - 1 match found      - show "This person has existing record"
     */
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
