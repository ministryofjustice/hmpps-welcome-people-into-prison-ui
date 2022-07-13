import { Router } from 'express'
import type { Services } from '../../services'
import BodyScanValidator from '../../middleware/validation/bodyScanValidation'
import validationMiddleware from '../../middleware/validationMiddleware'
import RecentArrivalsController from './recentArrivalsController'
import RecentArrivalsSearchController from './recentArrivalsSearchController'
import BodyScanController from './bodyScanController'
import Routes from '../../utils/routeBuilder'
import { State } from './state'

export default function routes(services: Services): Router {
  const recentArrivals = new RecentArrivalsController(services.expectedArrivalsService)
  const recentArrivalsSearch = new RecentArrivalsSearchController(services.expectedArrivalsService)
  const bodyScan = new BodyScanController(services.expectedArrivalsService)
  const checkSearchQueryPresent = State.searchQuery.ensurePresent('/recent-arrivals')

  return Routes.forAnyRole()
    .get('/recent-arrivals', recentArrivals.view())
    .post('/recent-arrivals', recentArrivals.search())

    .get('/recent-arrivals/search', checkSearchQueryPresent, recentArrivalsSearch.showSearch())
    .post('/recent-arrivals/search', checkSearchQueryPresent, recentArrivalsSearch.submitSearch())

    .get('/prisoners/:prisonNumber/record-body-scan', bodyScan.view())
    .post('/prisoners/:prisonNumber/record-body-scan', validationMiddleware(BodyScanValidator), bodyScan.submit())
    .build()
}
