import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../services'

export default class RecentArrivalsSearchController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public showSearch(): RequestHandler {
    return async (req, res) => {
      const searchQuery = req.flash('searchQuery')[0] as string
      const { activeCaseLoadId } = res.locals.user
      if (!searchQuery) {
        return res.redirect('/recent-arrivals')
      }
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
      req.flash('searchQuery', searchQuery)

      return res.redirect('/recent-arrivals/search')
    }
  }
}
