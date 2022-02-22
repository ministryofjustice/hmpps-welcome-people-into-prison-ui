import express, { Router } from 'express'
import PrisonerController from './prisonerController'

import { Services } from '../services'
import temporaryAbsenceRoutes from './temporaryabsences'
import bookedTodayRoutes from './bookedtoday'

export default function routes(services: Services): Router {
  const router = express.Router()

  router.get('/', (req, res, next) => res.render('pages/home'))

  const prisonerController = new PrisonerController(services.expectedArrivalsService)
  router.get('/prisoners/:prisonNumber/image', [prisonerController.getImage()])

  router.get('/feature-not-available', (req, res) => res.render('pages/featureNotAvailable'))

  router.use(bookedTodayRoutes(services))
  router.use(temporaryAbsenceRoutes(services))

  return router
}
