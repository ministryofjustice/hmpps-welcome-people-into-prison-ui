import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { State } from './arrivals/state'
import { MatchType } from '../../services/matchTypeDecorator'

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

  public redirectToConfirm(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      State.searchDetails.clear(res)
      State.newArrival.clear(res)
      const arrival = await this.expectedArrivalsService.getArrival(id)

      switch (arrival.matchType) {
        case MatchType.INSUFFICIENT_INFO:
          return res.redirect(`/prisoners/${arrival.id}/search-for-existing-record/new`)

        case MatchType.COURT_RETURN:
          return res.redirect(`/prisoners/${arrival.id}/check-court-return`)

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
  }
}
