import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'

export default class RecentArrivalsController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const recentArrivals = await this.expectedArrivalsService.getRecentArrivalsGroupedByDate(activeCaseLoadId)
      return res.render('pages/recentArrivals/recentArrivals.njk', {
        recentArrivals,
      })
    }
  }
}
