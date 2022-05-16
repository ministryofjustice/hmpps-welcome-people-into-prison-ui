import type { Router } from 'express'
import type { Services } from '../services'

import Routes from '../utils/routeBuilder'
import PrisonerController from './prisonerController'
import temporaryAbsenceRoutes from './temporaryabsences'
import bookedTodayRoutes from './bookedtoday'
import recentArrivalsRoutes from './recentArrivals'

export default function routes(services: Services): Router {
  const prisonerController = new PrisonerController(services.expectedArrivalsService)

  return Routes.forAnyRole()
    .get('/', (_, res) => res.render('pages/home'))
    .get('/prisoners/:prisonNumber/image', prisonerController.getImage())
    .get('/feature-not-available', (req, res) => res.render('pages/featureNotAvailable'))
    .use(bookedTodayRoutes(services))
    .use(temporaryAbsenceRoutes(services))
    .use(recentArrivalsRoutes())
    .build()
}
