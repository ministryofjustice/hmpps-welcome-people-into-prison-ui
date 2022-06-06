import { Router } from 'express'
import type { Services } from '../../services'

import RecentArrivalsController from './recentArrivalsController'
import RecentArrivalsSearchController from './recentArrivalsSearchController'
import Routes from '../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const recentArrivals = new RecentArrivalsController(services.expectedArrivalsService)
  const recentArrivalsSearch = new RecentArrivalsSearchController(services.expectedArrivalsService)

  return Routes.forAnyRole()
    .get('/recent-arrivals', recentArrivals.view())
    .post('/recent-arrivals', recentArrivals.search())

    .get('/recent-arrivals/search', recentArrivalsSearch.showSearch())
    .post('/recent-arrivals/search', recentArrivalsSearch.submitSearch())
    .build()
}
