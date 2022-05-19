import moment from 'moment'
import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'

export default class RecentArrivalsController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const today = moment().format('dddd D MMMM')
      const oneDayAgo = moment().subtract(1, 'days').format('dddd D MMMM')
      const twoDaysAgo = moment().subtract(2, 'days').format('dddd D MMMM')
      const dates = { today, oneDayAgo, twoDaysAgo }

      const recentArrivals = await this.expectedArrivalsService.getRecentArrivalsGroupedByDate(activeCaseLoadId)
      return res.render('pages/recentArrivals/recentArrivals.njk', {
        dates,
        recentArrivals,
      })
    }
  }
}
