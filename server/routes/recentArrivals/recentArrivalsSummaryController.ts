import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'
import { newXRayBodyScansEnabled } from '../../utils/featureToggles'

export default class RecentArrivalsSummaryController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const arrival = await this.expectedArrivalsService.getPrisonerSummaryDetails(prisonNumber, activeCaseLoadId)
      const newXRayBodyScansIntegrationEnabled = newXRayBodyScansEnabled(activeCaseLoadId)
      return res.render('pages/recentArrivals/recentArrivalsSummary.njk', { arrival, newXRayBodyScansIntegrationEnabled })
    }
  }
}
