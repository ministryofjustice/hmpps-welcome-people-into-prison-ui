import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'
import { State } from './state'

export default class RecentArrivalsSearchController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public showSearch(): RequestHandler {
    return async (req, res) => {
      const { searchQuery } = State.searchQuery.get(req)
      const { activeCaseLoadId } = res.locals.user
      const searchResults = await this.expectedArrivalsService.getRecentArrivalsSearchResults(
        activeCaseLoadId,
        searchQuery
      )
      return res.render('pages/recentArrivals/recentArrivalsSearch.njk', {
        searchResults,
        searchQuery,
      })
    }
  }

  public submitSearch(): RequestHandler {
    return async (req, res) => {
      const { searchQuery } = req.body
      State.searchQuery.set(res, { searchQuery })

      return res.redirect('/recent-arrivals/search')
    }
  }
}
