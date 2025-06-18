import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import editProfileEnabled from '../../utils/featureToggles'

export default class RecentArrivalsSummaryController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const arrival = await this.expectedArrivalsService.getPrisonerSummaryDetails(prisonNumber)
      const { activeCaseLoadId } = res.locals.user
      const editEnabled = editProfileEnabled(activeCaseLoadId)
      return res.render('pages/recentArrivals/recentArrivalsSummary.njk', { arrival, editEnabled })
    }
  }
}
