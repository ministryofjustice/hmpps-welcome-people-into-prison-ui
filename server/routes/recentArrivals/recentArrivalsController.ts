import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { State } from './state'

export default class RecentArrivalsController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      State.searchQuery.clear(res)
      const { activeCaseLoadId } = res.locals.user
      const recentArrivals = await this.expectedArrivalsService.getRecentArrivalsGroupedByDate(activeCaseLoadId)
      return res.render('pages/recentArrivals/recentArrivals.njk', {
        recentArrivals,
      })
    }
  }

  public search(): RequestHandler {
    return async (req, res) => {
      const { searchQuery } = req.body
      State.searchQuery.set(res, { searchQuery })

      return res.redirect('/recent-arrivals/search')
    }
  }
}
