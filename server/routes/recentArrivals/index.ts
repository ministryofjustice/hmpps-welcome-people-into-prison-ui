import { Router } from 'express'
import type { Services } from '../../services'

import RecentArrivalsController from './recentArrivalsController'
import Role from '../../authentication/role'
import Routes from '../../utils/routeBuilder'

export default function routes(services: Services): Router {
  const recentArrivals = new RecentArrivalsController(services.expectedArrivalsService)

  return Routes.forAnyRole().get('/recent-arrivals', recentArrivals.view()).forRole(Role.PRISON_RECEPTION).build()
}
