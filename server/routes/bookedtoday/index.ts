import express, { type Router } from 'express'
import ChoosePrisonerController from './choosePrisonerController'

import type { Services } from '../../services'

import transferRoutes from './transfers'
import arrivalRoutes from './arrivals'

export default function routes(services: Services): Router {
  const router = express.Router()

  const choosePrisonerController = new ChoosePrisonerController(services.expectedArrivalsService)
  router.get('/confirm-arrival/choose-prisoner', [choosePrisonerController.view()])

  router.use(transferRoutes(services))
  router.use(arrivalRoutes(services))

  return router
}
