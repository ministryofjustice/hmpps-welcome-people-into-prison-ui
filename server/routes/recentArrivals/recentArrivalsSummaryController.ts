import type { RequestHandler } from 'express'
import { ExpectedArrivalsService } from '../../services'

export default class RecentArrivalsSummaryController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const arrival = await this.expectedArrivalsService.getArrival(id)
      return res.render('pages/recentArrivals/recentArrivalsSummary.njk', { arrival })
    }
  }
}