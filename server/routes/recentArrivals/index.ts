import { Router } from 'express'

import RecentArrivalsController from './recentArrivalsController'
import Role from '../../authentication/role'
import Routes from '../../utils/routeBuilder'

export default function routes(): Router {
  const recentArrivals = new RecentArrivalsController()

  return Routes.forAnyRole()
    .get('/recent-arrivals', recentArrivals.view())

    .forRole(Role.PRISON_RECEPTION)
    .build()
}
