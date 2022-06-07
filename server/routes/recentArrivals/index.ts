import { Router } from 'express'
import type { Services } from '../../services'

import RecentArrivalsController from './recentArrivalsController'
import RecentArrivalsSearchController from './recentArrivalsSearchController'
import Routes from '../../utils/routeBuilder'
import { State } from './state'

export default function routes(services: Services): Router {
  const recentArrivals = new RecentArrivalsController(services.expectedArrivalsService)
  const recentArrivalsSearch = new RecentArrivalsSearchController(services.expectedArrivalsService)
  const checkSearchQueryPresent = State.searchQuery.ensurePresent('/recent-arrivals')

  return Routes.forAnyRole()
    .get('/recent-arrivals', recentArrivals.view())
    .post('/recent-arrivals', recentArrivals.search())

    .get('/recent-arrivals/search', checkSearchQueryPresent, recentArrivalsSearch.showSearch())
    .post('/recent-arrivals/search', checkSearchQueryPresent, recentArrivalsSearch.submitSearch())
    .build()
}
