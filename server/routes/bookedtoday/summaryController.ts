import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { MatchType } from '../../services/matchTypeDecorator'

export default class SummaryController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public redirectToSummary(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { systemToken } = req.session

      const arrival = await this.expectedArrivalsService.getArrival(systemToken, id)
      switch (arrival.matchType) {
        case MatchType.COURT_RETURN:
        case MatchType.SINGLE_MATCH:
          return res.redirect(`/prisoners/${arrival.id}/summary-with-record`)

        case MatchType.MULTIPLE_POTENTIAL_MATCHES:
        case MatchType.NO_MATCH:
        case MatchType.INSUFFICIENT_INFO:
          return res.redirect(`/prisoners/${arrival.id}/summary-move-only`)

        default:
          throw new Error(`Invalid matchType: ${arrival.matchType}`)
      }
    }
  }
}
