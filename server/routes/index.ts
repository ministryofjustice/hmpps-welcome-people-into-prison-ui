import { Router } from 'express'
import type { Services } from '../services'

// import Routes from '../utils/routeBuilder'
import HomeController from './homeController'
import PrisonerController from './prisonerController'
import temporaryAbsenceRoutes from './temporaryabsences'
import addServicesToRequest from '../middleware/addServicesToRequest'
import bookedTodayRoutes from './bookedtoday'
import recentArrivalsRoutes from './recentArrivals'
// import dprRouter from './dpr'
import feedbackRoutes from './feedback'
import footerRoutes from './footer'

export default function routes(services: Services): Router {
  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  const homeController = new HomeController()
  const router = Router()

  router.get('/', homeController.view())
  router.get('/prisoners/:prisonNumber/image', prisonerController.getImage())
  router.get('/feature-not-available', (req, res) => res.render('pages/featureNotAvailable'))
  router.get('/duplicate-booking-prevention', (req, res) =>
    res.render('pages/bookedtoday/arrivals/preventDuplicateBooking'),
  )
  router.use(addServicesToRequest(services))
  // router.use(dprRouter(services))
  router.use(bookedTodayRoutes(services))
  router.use(temporaryAbsenceRoutes(services))
  router.use(recentArrivalsRoutes(services))
  router.use(feedbackRoutes(services))
  router.use(footerRoutes())

  return router
}
