import type { Router } from 'express'
import type { Services } from '../services'

import Routes from '../utils/routeBuilder'
import HomeController from './homeController'
import PrisonerController from './prisonerController'
import temporaryAbsenceRoutes from './temporaryabsences'
import bookedTodayRoutes from './bookedtoday'
import recentArrivalsRoutes from './recentArrivals'
import { dprRouter } from './dpr'
import feedbackRoutes from './feedback'
import footerRoutes from './footer'

export default function routes(services: Services): Router {
  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  const homeController = new HomeController()
  return Routes.forAnyRole()
    .get('/', homeController.view())
    .get('/prisoners/:prisonNumber/image', prisonerController.getImage())
    .get('/feature-not-available', (req, res) => res.render('pages/featureNotAvailable'))
    .get('/duplicate-booking-prevention', (req, res) =>
      res.render('pages/bookedtoday/arrivals/preventDuplicateBooking')
    )
    .use(bookedTodayRoutes(services))
    .use(temporaryAbsenceRoutes(services))
    .use(recentArrivalsRoutes(services))
    .use(dprRouter(services))
    .use(feedbackRoutes(services))
    .use(footerRoutes())
    .build()
}
